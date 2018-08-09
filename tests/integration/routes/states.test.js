const {State} = require("../../../models/states");
const request = require("supertest");
const mongoose = require("mongoose");
const config = require("config");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/states", () => {
  /**
   * Tests for /api/states
   */
  let user;
  let token;
  let states;
  let state;
  let name;
  let abbreviation;
  let url;
  const dataTypes = [0, null, false, undefined, ""];

  beforeEach(async (done) => {
    /**
     * Before each test create user and generate a new token
     */
    user = await utils.createUser("john.doe@states.test", true);
    token = await user.generateAuthToken();
    done();
  });

  afterEach(async (done) => {
    /**
     * After each test remove the user
     */
    await user.remove();
    done();
  });

  describe("GET /", () => {
    /**
     * Test cases for GET on /api/states
     */

    beforeEach(async (done) => {
      /**
       * Before each test create states
       * @type {*[]}
       */
      states = [
        {name: "state1", abbreviation: "SO"},
        {name: "state2", abbreviation: "ST"},
        {name: "state3", abbreviation: "SR"}
      ];
      await State.collection.insertMany(states);
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove the states
       */
      await State.deleteMany({name: {$in: ["state1", "state2", "state3"]}});
      done();
    });

    it("should return status code 200 and list of states if GET parameters isn't given", async (done) => {

      const res = await request(server).get("/api/states");

      expect(res.status).toBe(200);
      expect(res.body.length >= states.length).toBeTruthy();
      done();
    });

    it("should return only 2 states when GET parameter amount is 2", async (done) => {

      const amount = 2;
      const res = await request(server).get(`/api/states?page=1&amount=${amount}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(amount);
      done();
    });
  });

});
