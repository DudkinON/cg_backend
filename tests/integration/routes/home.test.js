const request = require("supertest");
const server = require("../../../loader");


describe("home page: GET /", () => {

  it("should return status code 200 and HTML of the home page", async(done) => {
    const res = await request(server).get("/");

    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty("content-type", "text/html; charset=utf-8");
    expect(res.text.length > 0).toBeTruthy();
    done();
  });

  it("should return status code 404 if route does not exist", async(done) => {
    const res = await request(server).get("/test/route/that/not/exist");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    done();
  });
});