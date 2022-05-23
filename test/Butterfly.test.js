"use strict";

const Butterfly = require("../src/domain/Butterfly");
const shortid = require("shortid");

const butterflyAttrs = {
  id: shortid.generate(),
  commonName: "Butterfly",
  article: "https://example.com/butterfly",
  species: "Butterfly",
  ratings: {},
};

describe("Butterfly", () => {
  describe("rate(user, rating)", () => {
    it("sets the users rating of the butterfly if not previously set", () => {
      const subject = new Butterfly(butterflyAttrs);
      subject.rateButterfly("abcd1234", 3);
      expect(subject.ratings).toEqual({ abcd1234: 3 });
    });
    it(`updates the user's rating when it previously existed`, () => {
      const subject = new Butterfly({
        ...butterflyAttrs,
        ratings: { abcd1234: 5 },
      });
      subject.rateButterfly("abcd1234", 3);
      expect(subject.ratings).toEqual({ abcd1234: 3 });
    });
  });
});
