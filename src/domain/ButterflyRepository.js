"use strict";

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

  async findById(id) {
    const attrs = await this.db.get("butterflies").find({ id }).value();
    return attrs ? new Butterfly(attrs) : null;
  }

  async create(butterfly) {
    await this.db.get("butterflies").push(butterfly).write();
  }

  async clear() {
    await this.db.setState({ butterflies: [] }).write();
  }
}

module.exports = ButterflyRepository;
