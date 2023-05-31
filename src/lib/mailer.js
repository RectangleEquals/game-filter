"use strict";
const log = require("../lib/log");
const nodemailer = require('nodemailer');
const fs = require('fs');
const { readFile } = require('fs/promises');

class Mailer
{
  constructor(host, port, username, password, recipient, subject, html)
  {
    // Create a transporter object using the SMTP transport
    this.transporter = nodemailer.createTransport({
      host: host,
      transportMethod: "SMTP",
      port: port,
      auth: {
        user: username,
        pass: password
      }
    });

    // Set up email data with unicode symbols
    this.mailOptions = {
      from: username,
      to: recipient,
      subject: subject,
      html: html
    };

    this.info = null;
    this.error = null;
  }

  send = async() => {
    // Send email
    return await this.transporter.sendMail(this.mailOptions).then(info => {
      this.info = info;
      this.error = null;
      log.info('Email sent: ' + info.response);
      return info;
    }).catch(err => {
      this.info = null;
      this.error = err;
      log.error(err);
      return false;
    });
  }

  static async createFromHtmlFile(host, port, username, password, recipient, subject, htmlFile, modifierCallback) {
    if(!fs.existsSync(htmlFile)) {
      log.error('[Mailer]: Invalid file path!');
      return null;
    }

    let htmlData = await readFile(htmlFile, {encoding: "utf-8"})
    .then(data => {
      return data.toString();
    }).catch(err => {
      log.error(`[Mailer]: ${err}`);
      return null;
    });

    if(htmlData === null)
      return null;

    if(modifierCallback)
      htmlData = modifierCallback(htmlData);
    
    return new Mailer(host, port, username, password, recipient, subject, htmlData);
  }
}

module.exports = Mailer;