"use strict";

class NotFoundError extends Error {
  constructor() {
    super("Not found");
    this.message = "Not found";
  }
}

module.exports = NotFoundError;
