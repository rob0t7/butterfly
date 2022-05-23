"use strict";

const NotFoundError = require("./NotFoundError");
const Butterfly = require("./Butterfly");

class ButterflyRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll() {
    return this.db
      .get("butterflies")
      .map((butterflyAttrs) => new Butterfly(butterflyAttrs))
      .value();
  }

  async findAllByUserId(userId) {
    return this.db
      .get("butterflies")
      .filter((butterfly) => userId in butterfly.ratings)
      .orderBy((butterfly) => butterfly.ratings[userId], "desc")
      .map((attrs) => new Butterfly(attrs))
      .value();
  }

  /**
   * Retrieves a butteryfly by id.
   * @param {string} id - Butterfly id
   * @returns {Butterfly} butterfly - A Butterfly Object
   */
  async findById(id) {
    const attrs = await this.db.get("butterflies").find({ id }).value();
    if (!attrs) {
      throw new NotFoundError();
    }
    return new Butterfly(attrs);
  }

  async create(butterfly) {
    await this.db.get("butterflies").push(butterfly).write();
  }

  /**
   * Saves a butterfly to the repository
   * @param {Butterfly} butterfly
   */
  async save(butterfly) {
    await this.db.get("butterflies").remove({ id: butterfly.id }).write();
    await this.db.get("butterflies").push(butterfly).write();
  }

  async clear() {
    await this.db.setState({ butterflies: [] }).write();
  }
}

module.exports = ButterflyRepository;
