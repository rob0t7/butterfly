"use strict";

class Butterfly {
  #id;
  #commonName;
  #species;
  #article;
  #ratings;

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

  rateButterfly(userId, rating) {
    if (!Number.isInteger(rating)) {
      throw new RangeError("The rating must be an integer between 0 and 5.");
    }
    if (rating < 0 || rating > 5) {
      throw new RangeError("The rating must be an integer between 0 and 5.");
    }
    this.#ratings[userId] = rating;
  }

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
