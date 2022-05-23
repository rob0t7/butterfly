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
    // TODO: Added assertions to ensure invariant is valid
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
