"use strict";

const shortid = require("shortid");
const { validateUser } = require("./validators");
const NotFoundError = require("../domain/NotFoundError");

module.exports = (app, userRepository) => {
  /**
   * Get an existing user
   * GET
   */
  app.get("/users/:id", async (req, res) => {
    let user;
    try {
      user = await userRepository.findById(req.params.id);
    } catch (error) {
      /* istanbul ignore else */
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: "Not found" });
      }
      /* istanbul ignore next */
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
};
