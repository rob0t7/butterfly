"use strict";
const NotFoundError = require("../domain/NotFoundError");
const shortid = require("shortid");
const { validateButterfly, validateRatingReq } = require("./validators");

module.exports = (app, butterflyRepository, userRepository) => {
  /**
   * Get Butterfly collection resource
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
      /* istanbul ignore else */
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: "Not found" });
      }
      /* istanbul ignore next */
      throw error;
    }
  });

  /**
   * User rates a butterfly
   */
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
      /* istanbul ignore else */
      if (error instanceof NotFoundError) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      /* istanbul ignore next */
      throw error;
    }
    try {
      const butterfly = await butterflyRepository.findById(req.params.id);
      butterfly.rateButterfly(user.id, req.body.rating);
      await butterflyRepository.save(butterfly);
      return res.json(butterfly);
    } catch (error) {
      /* istanbul ignore else */
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: "Not found" });
      }
      /* istanbul ignore next */
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
};
