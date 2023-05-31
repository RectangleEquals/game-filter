const express = require("express");
const { isAuthorized, hasRole, validateRole } = require("./auth");
const Log = require("../models/Log");
const database = require("../database");
const User = require("../models/User");
const multer = require("multer");
const upload = multer();
const router = express.Router();

router.post("/api/debug", upload.none(), isAuthorized, hasRole({any: 'Member'}), async (req, res) =>
{
  if(req.error) {
    let status;
    switch(req.error.message) {
      case "bad_role":
        status = 403;
        break;
      default:
        status = 500;
    }
    console.error(`> ${req.error.message}`);
    return res.status(status).send(req.error.message);
  }

  if(!req.userSession || !req.userSession.userId)
    return res.status(400).send('bad_session');
    
  if(!req.body || !req.body.method || !(req.body.method === "PUSH" || req.body.method === "PULL"))
    return res.status(400).send('bad_method');

  if(req.body.method === "PUSH")
  {
    // Adds a new log to the collection
    try {
      if(!req.body.category || !(req.body.category === "INFO" || req.body.category === "WARNING" || req.body.category === "ERROR"))
        return res.status(400).send('bad_category');
      
      if(!req.body.message)
        return res.status(400).send('bad_message');
      
      await database.validateSessionsForUserId(req.userSession.userId);
      const user = await User.findById(req.userSession.userId);

      const log = new Log({
        user: user.email,
        category: req.body.category,
        message: req.body.message
      });
      log.save();
      
      return res.status(200).send('ok');
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }
  else if(req.body.method === "PULL")
  {
    try {
      // Restrict this functionality to Designers, Developers and Admins
      const { isValid, error } = validateRole({any: ['Designer', 'Developer', 'Admin']}, req.user);
      if(!isValid) {
        if(error) {
          let status;
          switch(error.message) {
            case "bad_role":
              status = 403;
              break;
            default:
              status = 500;
          }
          console.error(`> ${error.message}`);
          return res.status(status).send(error.message);
        }
      }
      
      let userEmails = req.body.email || [];
      userEmails = Array.isArray(userEmails) ? userEmails.filter(email => email.trim() !== "") : [userEmails];

      if (userEmails.length < 1 || userEmails[0].length < 1) {
        const allUsers = await User.find({}, "email");
        userEmails = allUsers.map(user => user.email);
      }

      const validCategories = new Set(["INFO", "WARNING", "ERROR"]);
      const categories = Array.isArray(req.body.categories) ? req.body.categories : [...validCategories];
      const filteredCategories = categories && categories.length > 0 && categories[0] === 'ALL' ?
        Array.from(validCategories) : categories.filter(category => validCategories.has(category));

      const logsQuery = {
        category: { $in: filteredCategories }
      };

      if (userEmails.length > 0) {
        logsQuery.user = { $in: userEmails };
      }

      const logs = await Log.find(logsQuery)
        .sort({ date: 1 })
        .exec();

      const result = {};

      for (const log of logs) {
        const user = log.user;
        if (!result[user]) {
          result[user] = {
            user: user,
            logs: []
          };
        }
        result[user].logs.push({
          category: log.category,
          date: log.date,
          message: log.message
        });
      }

      const sortedResult = Object.values(result).sort((a, b) => {
        if (a.user < b.user) return -1;
        if (a.user > b.user) return 1;
        return 0;
      });

      return res.status(200).json(sortedResult);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  }

  return res.status(400).send('bad_request');
});

module.exports = { router };