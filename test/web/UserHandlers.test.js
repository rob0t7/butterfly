"use strict";

const path = require("path");
const lowdb = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");
const request = require("supertest");
const shortid = require("shortid");

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

describe("GET user", () => {
  it("success", async () => {
    const response = await request(app).get("/users/abcd1234");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "abcd1234",
      username: "test-user",
    });
  });

  it("error - not found", async () => {
    const response = await request(app).get("/users/bad-id");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Not found",
    });
  });
});

describe("POST user", () => {
  it("success", async () => {
    shortid.generate = jest.fn().mockReturnValue("new-user-id");

    const postResponse = await request(app).post("/users").send({
      username: "Buster",
    });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
      id: "new-user-id",
      username: "Buster",
    });

    const getResponse = await request(app).get("/users/new-user-id");

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: "new-user-id",
      username: "Buster",
    });
  });

  it("error - empty body", async () => {
    const response = await request(app).post("/users").send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid request body",
    });
  });

  it("error - missing all attributes", async () => {
    const response = await request(app).post("/users").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid request body",
    });
  });
});
