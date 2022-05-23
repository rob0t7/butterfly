"use strict";

const low = require("lowdb");
const Memory = require("lowdb/adapters/Memory");
const shortid = require("shortid");
const Butterfly = require("../src/domain/Butterfly");
const ButterflyRepository = require("../src/domain/ButterflyRepository");
const NotFoundError = require("../src/domain/NotFoundError");

const db = low(new Memory());
const butterfly1 = new Butterfly({
  id: shortid.generate(),
  commonName: "Butterfly1",
  species: "Butterfly-1",
  article: "https://example.com/butterfly-1",
  ratings: {},
});
db.setState({ butterflies: [] }).write();

const subject = new ButterflyRepository(db);

describe("ButterflyRepository", () => {
  beforeEach(async () => {
    await subject.clear();
    await subject.create(butterfly1);
  });

  describe(".findAll()", () => {
    it("returns a list of all the Butterflies in the repository", async () => {
      expect(await subject.findAll()).toEqual([butterfly1]);
    });
  });

  describe(".create(Butterfly)", () => {
    it("inserts a new Butterfly record", async () => {
      const expectedButterflyCount = (await subject.findAll()).length + 1;
      const newButterfly = new Butterfly({
        id: shortid.generate(),
        commonName: "new-butterfly",
        species: "new-butterfly",
        article: "https://example.com/new-butterfly",
      });
      await subject.create(newButterfly);
      const butterflies = await subject.findAll();
      expect(butterflies.length).toEqual(expectedButterflyCount);
      expect(butterflies).toContainEqual(newButterfly);
    });
  });

  describe(".findById", () => {
    it("returns null if the butterfly does not exist", async () => {
      await expect(async () => {
        await subject.findById("some-id-that-does-not-exist");
      }).rejects.toThrow(new NotFoundError());
    });
    it("returns the butterfly with the corresponding id", async () => {
      expect(await subject.findById(butterfly1.id)).toEqual(butterfly1);
    });
  });

  describe(".findAllByUserId(userId)", () => {
    it("returns all the butterflies for the specific user ordered by desc rating", async () => {
      const userId = "abcd";
      const butterfly2 = new Butterfly({
        id: shortid.generate(),
        commonName: "butterfly-2",
        species: "butterfly-2",
        article: "https://example.com/butterfly-2",
        ratings: { [userId]: 3 },
      });
      await subject.create(butterfly2);
      const butterfly3 = new Butterfly({
        id: shortid.generate(),
        commonName: "butterfly-3",
        species: "butterfly-3",
        article: "https://example.com/butterfly-3",
        ratings: { [userId]: 5 },
      });
      await subject.create(butterfly3);
      expect(await subject.findAllByUserId(userId)).toEqual([
        butterfly3,
        butterfly2,
      ]);
    });
  });
});
