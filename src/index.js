"use strict";

const express = require("express");
const lowdb = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");
const shortid = require("shortid");

const constants = require("./constants");
const {
  validateButterfly,
  validateUser,
  validateRatingReq,
} = require("./validators");
const ButterflyRepository = require("./domain/ButterflyRepository");
const UserRepository = require("./domain/UserRepository");
const NotFoundError = require("./domain/NotFoundError");

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

  /* ----- BUTTERFLIES ----- */

  /**
   * Get all butterflies
   * GET
   */
  app.get("/butterflies", async (req, res) => {
    const userId = req.query["userId"];
    const butterflies = userId
      ? await butterflyRepository.findAllByUserId(userId)
      : await butterflyRepository.findAll();
    return res.json(butterflies);
  });

  /**
   * Get an existing butterfly
   * GET
   */
  app.get("/butterflies/:id", async (req, res) => {
    try {
      const butterfly = await butterflyRepository.findById(req.params.id);
      return res.json(butterfly);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: "Not found" });
      }
      throw error;
    }
  });

  app.put("/butterflies/:id/rating", async (req, res) => {
    try {
      validateRatingReq(req.body);
    } catch {
      return res.status(400).json({ error: "Invalid request body" });
    }
    let user;
    try {
      user = await userRepository.findById(req.body.userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ error: "Invalid request body" });
      }
    }
    try {
      const butterfly = await butterflyRepository.findById(req.params.id);
      butterfly.rateButterfly(user.id, req.body.rating);
      await butterflyRepository.save(butterfly);
      return res.json(butterfly);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: "Not found" });
      }
      throw error;
    }
  });
  /**
   * Create a new butterfly
   * POST
   */
  app.post("/butterflies", async (req, res) => {
    try {
      validateButterfly(req.body);
    } catch (error) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const newButterfly = {
      id: shortid.generate(),
      ...req.body,
    };

    await butterflyRepository.create(newButterfly);

    res.json(newButterfly);
  });

  /* ----- USERS ----- */

  /**
   * Get an existing user
   * GET
   */
  app.get("/users/:id", async (req, res) => {
    let user;
    try {
      user = await userRepository.findById(req.params.id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: "Not found" });
      }
      throw error;
    }
    res.json(user);
  });

  /**
   * Create a new user
   * POST
   */
  app.post("/users", async (req, res) => {
    try {
      validateUser(req.body);
    } catch (error) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const newUser = {
      id: shortid.generate(),
      ...req.body,
    };

    await userRepository.create(newUser);

    res.json(newUser);
  });

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
