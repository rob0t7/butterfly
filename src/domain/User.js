"use strict";
/**
 * A User class.
 */
class User {
  #id;
  #username;

  /**
   * Creates a User instance.
   * @param {string} id - User id.
   * @param {username} username - Username.
   */
  constructor(id, username) {
    this.#id = id;
    this.#username = username;
  }

  get id() {
    return this.#id;
  }

  get username() {
    return this.#username;
  }

  toJSON() {
    const { id, username } = this;
    return {
      id,
      username,
    };
  }
}

module.exports = User;
