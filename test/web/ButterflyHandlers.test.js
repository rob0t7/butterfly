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

describe("GET root", () => {
  it("success", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Server is running!",
    });
  });
});

describe("GET /butterflies", () => {
  it("retrieves all the butterflies", async () => {
    const response = await request(app).get("/butterflies").send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([butterflyJSON, butterfly2]);
  });
});

describe("GET /butterflies?userID=<userID>", () => {
  it("retrieves all the user's butterflies sorted by rank", async () => {
    const userID = "abcd1234";
    const response = await request(app)
      .get(`/butterflies?userId=${userID}`)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([butterfly2, butterflyJSON]);
  });
});

describe("GET butterfly", () => {
  it("success", async () => {
    const response = await request(app).get("/butterflies/wxyz9876");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "wxyz9876",
      commonName: "test-butterfly",
      species: "Testium butterflius",
      article: "https://example.com/testium_butterflius",
      ratings: { abcd1234: 3 },
    });
  });

  it("error - not found", async () => {
    const response = await request(app).get("/butterflies/bad-id");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Not found",
    });
  });
});

describe("POST butterfly", () => {
  it("success", async () => {
    shortid.generate = jest.fn().mockReturnValue("new-butterfly-id");

    const postResponse = await request(app).post("/butterflies").send({
      commonName: "Boop",
      species: "Boopi beepi",
      article: "https://example.com/boopi_beepi",
    });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
      id: "new-butterfly-id",
      commonName: "Boop",
      species: "Boopi beepi",
      article: "https://example.com/boopi_beepi",
    });

    const getResponse = await request(app).get("/butterflies/new-butterfly-id");

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: "new-butterfly-id",
      commonName: "Boop",
      species: "Boopi beepi",
      article: "https://example.com/boopi_beepi",
      ratings: {},
    });
  });

  it("error - empty body", async () => {
    const response = await request(app).post("/butterflies").send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid request body",
    });
  });

  it("error - missing all attributes", async () => {
    const response = await request(app).post("/butterflies").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid request body",
    });
  });

  it("error - missing some attributes", async () => {
    const response = await request(app)
      .post("/butterflies")
      .send({ commonName: "boop" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid request body",
    });
  });
});

describe("PUT /butterflies/:id/rating", () => {
  it("successfully returns the modified Butterfly resource", async () => {
    const userId = "abcd1234";
    const ratingURL = `/butterflies/${butterflyJSON.id}/rating`;
    const reqBody = { userId, rating: 1 };
    let response = await request(app).put(ratingURL).send(reqBody);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...butterflyJSON,
      ratings: { [userId]: 1 },
    });

    response = await request(app).get(`/butterflies/${butterflyJSON.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...butterflyJSON,
      ratings: { [userId]: 1 },
    });
  });

  it("returns a 404 response if the Butterfly does not exist", async () => {
    const ratingURL = "/butterflies/does-not-exist/rating";
    const response = await request(app)
      .put(ratingURL)
      .send({ userId: "abcd1234", rating: 3 });
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Not found" });
  });

  it("returns a bad request if the input is not valid", async () => {
    const ratingURL = `/butterflies/${butterflyJSON.id}/rating`;
    const reqBody = { userId: "abcd1234", rating: -1 };
    const response = await request(app).put(ratingURL).send(reqBody);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid request body" });
  });

  it("returns a bad request without a userId", async () => {
    const ratingURL = `/butterflies/${butterflyJSON.id}/rating`;
    const reqBody = { rating: 3 };
    const response = await request(app).put(ratingURL).send(reqBody);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid request body" });
  });

  it("returns a bad request if the user does not exist", async () => {
    const ratingURL = `/butterflies/${butterflyJSON.id}/rating`;
    const reqBody = { userId: "does-not-exist", rating: 3 };
    const response = await request(app).put(ratingURL).send(reqBody);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid request body" });
  });
});
