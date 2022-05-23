"use strict";

const lowdb = require("lowdb");
const Memory = require("lowdb/adapters/Memory");
const shortid = require("shortid");
const User = require("../src/domain/User");
const UserRepository = require("../src/domain/UserRepository");

const db = lowdb(new Memory());
const user1 = new User(shortid.generate(), "bob");
db.setState({ users: [] }).write();

const repository = new UserRepository(db);

describe("UserRepository", () => {
  beforeEach(async () => {
    await repository.clear();
  });

  describe(".create(User)", () => {
    it("creates a new user in the repository", async () => {
      await repository.create(user1);
    });
  });

  describe(".findById(id)", () => {
    it("returns a new User", async () => {
      await repository.create(user1);
      expect(await repository.findById(user1.id)).toEqual(user1);
    });

    it("throws an NotFound error if the User does not exist", async () => {
      await expect(async () => {
        await repository.findById("does-not-exist");
      }).rejects.toThrow("Not found");
    });
  });
});
