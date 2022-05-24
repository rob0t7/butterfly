"use strict";

const shortid = require("shortid");
const Butterfly = require("./Butterfly");

module.exports = (butterflyRepository, userRepository) => {
  async function registerNewButterfly(attributes) {
    const newButterfly = new Butterfly({
      ...attributes,
      id: shortid.generate(),
    });
    await butterflyRepository.create(newButterfly);
    return newButterfly;
  }

  async function fetchAll() {
    return butterflyRepository.findAll();
  }

  async function fetchAllForUserId(userId) {
    return butterflyRepository.findAllByUserId(userId);
  }

  async function findButterflyById(id) {
    return butterflyRepository.findById(id);
  }

  async function rateButterfly(butterflyId, userId, rating) {
    const user = await userRepository.findById(userId);
    const butterfly = await butterflyRepository.findById(butterflyId);
    butterfly.rateButterfly(user.id, rating);
    await butterflyRepository.save(butterfly);
    return butterfly;
  }

  return {
    registerNewButterfly,
    fetchAll,
    fetchAllForUserId,
    findButterflyById,
    rateButterfly,
  };
};
