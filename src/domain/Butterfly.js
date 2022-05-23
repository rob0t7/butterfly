"use strict";

/** Class representing a Butterfly. */
class Butterfly {
  #id;
  #commonName;
  #species;
  #article;
  #ratings;

  /**
   * Create a butterfly.
   * @param {string} obj.id - Id of the Butterfly
   * @param {string} obj.commonName - Common Butterfly name.
   * @param {string} obj.species - Butterfly species.
   * @param {string} obj.article - Article about the Butterfly
   * @param {rating} obj.ratings - Key/value pairs of ratings.
   */
  constructor({ id, commonName, species, article, ratings = {} }) {
    this.#id = id;
    this.#commonName = commonName;
    this.#species = species;
    this.#article = article;
    this.#ratings = ratings;
  }

  get id() {
    return this.#id;
  }

  get commonName() {
    return this.#commonName;
  }

  get species() {
    return this.#species;
  }

  get article() {
    return this.#article;
  }

  get ratings() {
    return this.#ratings;
  }

  /**
   * Updates the main attributes about the butterfly.
   *
   * @param {string} commonName - Common Butterfly name
   * @param {string} species - Butterfly species
   * @param {string} article - Article URL
   */
  update(commonName, species, article) {
    this.#commonName = commonName;
    this.#species = species;
    this.#article = article;
  }

  /**
   * Submit a User rating of this particular butterfly.
   * @param {string} userId - The id of the user who is submitting the rating.
   * @param {number} rating - A number between 0 and 5 inclusive.
   */
  rateButterfly(userId, rating) {
    if (!Number.isInteger(rating)) {
      throw new RangeError("The rating must be an integer between 0 and 5.");
    }
    if (rating < 0 || rating > 5) {
      throw new RangeError("The rating must be an integer between 0 and 5.");
    }
    this.#ratings[userId] = rating;
  }

  /**
   *
   * @typedef {Object} ButterflyJSON
   * @property {string} id - Butterfly ID
   * @property {string} commonName - Common butterfly name.
   * @property {string} species - Butterfly species
   * @property {string} article - Butterfly article URL
   * @property {object} ratings - Butterfly ratings
   */

  /**
   * Returns the JSON representation.
   * @returns {ButterflyJSON}
   */
  toJSON() {
    const { id, commonName, species, article, ratings } = this;
    return {
      id,
      commonName,
      species,
      article,
      ratings,
    };
  }
}

module.exports = Butterfly;
