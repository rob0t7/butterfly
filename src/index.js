"use strict";

const express = require("express");
const lowdb = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");

const constants = require("./constants");
const ButterflyRepository = require("./domain/ButterflyRepository");
const UserRepository = require("./domain/UserRepository");
const butterflyHandlers = require("./web/ButterflyController");
const userHandlers = require("./web/UserHandlers");

async function createApp(dbPath) {
  const app = express();
  app.use(express.json());

  const db = await lowdb(new FileAsync(dbPath));
  await db.read();

  const butterflyRepository = new ButterflyRepository(db);
  const userRepository = new UserRepository(db);

  app.get("/", (req, res) => {
    res.json({ message: "Server is running!" });
  });

  // Register web handlers
  butterflyHandlers(app, butterflyRepository, userRepository);
  userHandlers(app, userRepository);

  return app;
}

/* istanbul ignore if */
if (require.main === module) {
  (async () => {
    const app = await createApp(constants.DB_PATH);
    const port = process.env.PORT || 8000;

    app.listen(port, () => {
      console.log(`Butterfly API started at http://localhost:${port}`);
    });
  })();
}

module.exports = createApp;
