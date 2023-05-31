const log = require("./lib/log");

const imports = (Promise.all([
  /* List all routes here */
  import("./api/auth.js"),
  import("./api/games.js")
]));

async function use(server, error)
{
  const libs = await imports;
  await (async () => {
    libs.forEach(route => {
      try {
        server.use(route.default.basepath, route.default.route);
      } catch (err) {
        log.warning(`WARNING: Failed to import route: '${route.default.basepath}'`);
        if(err !== undefined)
          error(err);
      }
    });
  })();
}

module.exports = { use };