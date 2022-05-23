"use strict";

const NotFoundError = require("./NotFoundError");
const User = require("./User");

/** A User Repository */
class UserRepository {
  #db;

  /**
   * Creates a UserRepository instance.
   * @param {Object} db - DB object
   */
  constructor(db) {
    this.#db = db;
  }

  /**
   * Returns the User by id.
   * @param {string} id - User Id
   * @returns {User} - Returns a User object
   * @throws {NotFoundError} error - Not found error if the User does not exist
   */
  async findById(id) {
    const attrs = this.#db.get("users").find({ id }).value();
    if (!attrs) {
      throw new NotFoundError();
    }
    return new User(attrs.id, attrs.username);
  }

  /**
   * Creates a new User record in the repository.
   * @param {User} user - User object.
   */
  async create(user) {
    await this.#db.get("users").push(user).write();
  }

  /**
   * Removes all the records in the repository.
   */
  async clear() {
    await this.#db.set("users", []).write();
  }
}

module.exports = UserRepository;
