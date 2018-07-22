const _ = require("lodash");
const {validate, getByEmail, create, getById, update, remove} = require("../models/users");
const express = require("express");
const router = express.Router();
const config = require("config");
const auth = require("../middleware/authentication");
const idValidator = require("../middleware/idValidator");


router.get("/me", auth, async (req, res) => {
  /**
   * Returns user info to a client if auth token is valid
   *
   * @return Object:
   */
  return res.send(await getById(req.user._id));
});

router.post("/", async (req, res) => {
  /**
   * Create a new user and send user object to the client
   *
   * @return object:
   */

  // Make sure that password is a valid format
  if (!req.body.password || typeof req.body.password !== "string") {
    return res.status(400).send({error: "Invalid password"})
  }

  // Make sure  that data is valid
  const { error } = validate(req.body);
  if (error) return res.status(400).send({error: error.details[0].message});

  // Make sure that user with given email is not already registered
  if (await getByEmail(req.body.email)) return res.status(400).send({error: "User already registered"});

  // Return user object to a client
  return res.status(201).send(_.pick(await create(req.body), config.get("users.returns")));
});

router.put("/:id", auth, async (req, res) => {

  // Make sure that password is a valid format
  if (!req.body.password || typeof req.body.password !== "string") {
    return res.status(400).send({error: "Invalid password"})
  }

  // Make sure  that data is valid
  const { error } = validate(req.body);
  if (error) return res.status(400).send({error: error.details[0].message});

  const user = await update(req.params.id, req.body);

  if (!user) return res.status(404).send({error: "Cannot find this user"});

  return res.send(_.pick(user, config.get("users.returns")));
});

module.exports = router;