"use strict";
const NotFoundError = require("../domain/NotFoundError");
const { validateButterfly, validateRatingReq } = require("./validators");

module.exports = (app, butterflyRepository, userRepository) => {
  const usecases = require("../domain/usecases")(
    butterflyRepository,
    userRepository
  );
  /**
   * Get Butterfly collection resource
   */
  app.get("/butterflies", async (req, res) => {
    const userId = req.query["userId"];
    const butterflies = userId
      ? await usecases.fetchAllForUserId(userId)
      : await usecases.fetchAll();
    return res.json(butterflies);
  });

  /**
   * Get an existing butterfly
   * GET
   */
  app.get("/butterflies/:id", async (req, res) => {
    try {
      const butterfly = await usecases.findButterflyById(req.params.id);
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
      const butterfly = await usecases.rateButterfly(
        req.params.id,
        req.body.userId,
        req.body.rating
      );
      res.status(200).json(butterfly);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: "Not found" });
      }
      return res.status(400).json({ error: "Invalid request body" });
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
    const newButterfly = await usecases.registerNewButterfly(req.body);
    res.status(201).json(newButterfly);
  });
};
