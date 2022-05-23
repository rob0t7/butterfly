"use strict";

const path = require("path");
const lowdb = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");
const request = require("supertest");

const createApp = require("../../src/index");

let app;

const butterflyJSON = {
  id: "wxyz9876",
  commonName: "test-butterfly",
  species: "Testium butterflius",
  article: "https://example.com/testium_butterflius",
  ratings: { abcd1234: 3 },
};

const butterfly2 = {
  id: "butterfly2",
  commonName: "test-butterfly2",
  species: "Butterfly2",
  article: "https://example.com/butterfly2",
  ratings: { abcd1234: 5 },
};
beforeAll(async () => {
  // Create a test database
  const testDbPath = path.join(__dirname, "test.db.json");
  const db = await lowdb(new FileAsync(testDbPath));

  // Fill the test database with data
  await db
    .setState({
      butterflies: [butterflyJSON, butterfly2],
      users: [
        {
          id: "abcd1234",
          username: "test-user",
        },
      ],
    })
    .write();

  // Create an app instance
  app = await createApp(testDbPath);
});

describe("GET root", () => {
  it("success", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Server is running!",
    });
  });
});
