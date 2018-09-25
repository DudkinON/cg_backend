const Joi = require("joi");
const config = require("config");
const {Zip} = require("../models/zips");
const {State} = require("../models/states");
const {City} = require("../models/cities");
const _ = require("lodash");
const controller = {};


controller.get = async (req, res) => {
  /**
   * Return state and city by zip code
   * @return Promise:
   */

  const zip = await Zip.findById(req.params.id);
  if (!zip) return res.status(404).send({error: "Cannot find this zip code"});

  return res.send(_.pick(zip, ["_id", "city", "state", "loc", "pop"]));
};


controller.post = async (req, res) => {
  /**
   * Create a zip object
   * @return Promise:
   */

  const { error } = validate(req.body);
  if (error) return res.status(400).send({error: error.details[0].message});

  const state = await State.getByName(req.body.state);
  if (!state) return res.status(404).send({error: "Cannot find this state"});

  const city = await City.getByName(req.body.city, state._id);
  if (!city) return res.status(404).send({error: "Cannot find this city"});

  const zip = await Zip({
    _id: req.body._id,
    city: city._id,
    state: state._id,
    loc: req.body.loc,
    pop: req.body.pop
  }).save();

  return res.send(_.pick(zip, ["_id", "state", "city", "loc", "pop"]));
};


controller.put = async (req, res) => {
  /**
   * Update and return zip info
   * @return Promise:
   */

  const state = await State.getById(req.body.state);
  if (!state) return res.status(404).send({error: "Cannot find this state"});

  const city = await City.getById(req.body.city);
  if (!city) return res.status(404).send({error: "Cannot find this city"});

  const item = await Zip.update(req.body, req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this city"});

  return res.send(_.pick(item, ["_id", "city", "state", "pop", "loc"]));
};


controller.delete = async (req, res) => {
  /**
   * Remove zip code
   * @return Promise:
   */

  const item = await Zip.findByIdAndRemove(req.params.id);

  if (!item) return res.status(404).send({error: "Cannot find this zip"});

  return res.send(_.pick(item, ["_id", "city", "state", "pop", "loc"]));
};


function validate(obj) {
  /**
   * Validate model fields
   * @return object:
   */

  return Joi.validate(obj, {
    _id: Joi.number().integer().min(config.get("zips.id.min")).max(config.get("zips.id.max")).required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    loc: Joi.array().items(Joi.number()).required(),
    pop: Joi.number().integer().required()
  });
}

module.exports = controller;