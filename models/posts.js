const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const {getCurrentYear} = require("../lib/tools");
const currentYear = getCurrentYear();


const posts = new mongoose.Schema({
  description: {
    type: String,
    min: config.get("posts.description.min"),
    max: config.get("posts.description.max"),
    required: true
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("states.tableName")),
    required: true
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("cities.tableName")),
    required: true
  },
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("makes.tableName")),
    required: true
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("models.tableName")),
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: config.get("cars.year.min"),
    max: currentYear
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("cars.tableName")),
    required: true
  },
  transmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: config.get("transmission.tableName"),
    default: null
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("images.tableName"))
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("tags.tableName"))
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: config.get("users.tableName"),
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  mileage: {
    type: Number,
    min: config.get("posts.mileage.min"),
    max: config.get("posts.mileage.max"),
    required: true
  },
  price: {
    type: Number,
    min: config.get("posts.price.min"),
    max: config.get("posts.price.max"),
    required: true
  }
});


posts.statics.create = async function (data) {
  /**
   * Create a new post
   *
   * @type {Model}
   * @return Promise:
   */

  const item = await this(data).save();

  if (item._id === undefined) return null;

  return this.findById(item._id)
    .populate("transmission", "type")
    .populate("car", "vin make model fuel type year")
    .populate("state", "name")
    .populate("city", "name")
    .populate("make", "name")
    .populate("model", "name")
    .populate("transmission", "type")
    .populate("author", "firstName lastName phone email")
};

posts.statics.getById = function (_id) {
  /**
   * Get car by id
   * @return Promise:
   */

  return this.findById(_id)
    .populate("car", "vin make model fuel type year")
    .populate("tags", "name")
    .populate("transmission", "type")
    .populate("state", "name")
    .populate("city", "name")
    .populate("make", "name")
    .populate("model", "name")
    .populate("images", "url")
    .populate("author", "firstName lastName phone email")
    .select("-__v");
};

posts.statics.addTsg = async function (_id, tag) {
  /**
   * Add a tag to the post object
   * @return Promise:
   */

  const item = await this.getById(_id);
  item.tags.push(tag);
  return item.save();
};

posts.statics.getByVIN = function (vin) {
  /**
   * Get car by id
   * @return Object:
   */

  return this.findOne({vin: vin})
    .populate("car", "vin make model fuel type")
    .populate("tags", "name")
    .populate("transmission", "type")
    .populate("state", "name")
    .populate("city", "name")
    .populate("images", "url")
    .populate("author", "firstName lastName phone email")
    .select("-__v");
};

posts.statics.getByPage = function (page, amount, city, state, make, model, yearMin, yearMax) {
  /**
   * Search posts in given state/city and return amount of post by page
   * @return Promise:
   */

  let data = {city, state, isActive: true};
  if (make) data.make = make;
  if (model) data.model = model;

  if (yearMin || yearMax) data.year = {};
  if (yearMin) data.year.$gte = yearMin;
  if (yearMax) data.year.$lte = yearMax;

  return this.find(data)
    .skip((page - 1) * amount)
    .populate("car", "-__v")
    .populate("tags", "name")
    .populate("make", "name")
    .populate("model", "-__v")
    .populate("transmission", "type")
    .populate("state", "name")
    .populate("city", "name")
    .populate("images", "url")
    .populate("author", "firstName lastName phone email")
    .select("-__v")
    .limit(amount);
};

posts.statics.update = async function (obj, _id) {
  /**
   * Update post and return post object
   * @return Promise:
   */

  const item = await this.findById(_id);

  if (obj.isActive === false || obj.isActive === true) item.isActive = obj.isActive;

  item.description = obj.description;
  item.transmission = obj.transmission;
  item.state = obj.state;
  item.city = obj.city;
  item.mileage = obj.mileage;
  item.price = obj.price;

  return item.save();
};

posts.statics.delById = async function (_id) {
  /**
   * Remove post by id
   */

  const item = await this.findById(_id);
  if (!item) return null;

  return item.remove();
};

exports.Post = mongoose.model(String(config.get("posts.tableName")), posts);

exports.validate = function (obj) {
  /**
   * Validate post object if it invalid return error message
   * @return Object:
   */

  const schema = {
    _id: Joi.objectId(),
    description: Joi.string()
      .min(config.get("posts.description.min"))
      .max(config.get("posts.description.max"))
      .required(),
    make: Joi.objectId().required(),
    model: Joi.objectId().required(),
    state: Joi.objectId().required(),
    city: Joi.objectId().required(),
    car: Joi.objectId().required(),
    transmission: Joi.objectId().required(),
    images: Joi.array().items(Joi.objectId()),
    tags: Joi.array().items(Joi.objectId()),
    author: Joi.objectId(),
    isActive: Joi.boolean(),
    date: Joi.date(),
    year: Joi.number()
      .integer()
      .min(config.get("cars.year.min"))
      .max(currentYear)
      .required(),
    mileage: Joi.number()
      .min(config.get("posts.mileage.min"))
      .max(config.get("posts.mileage.max"))
      .required(),
    price: Joi.number().integer()
      .min(config.get("posts.price.min"))
      .max(config.get("posts.price.max"))
      .required()
  };
  return Joi.validate(obj, schema);
};

exports.validatePUT = function (obj) {
  /**
   * Validate post for put query object if it invalid return error message
   * @return Object:
   */

  const schema = {
    _id: Joi.objectId(),
    description: Joi.string()
      .min(config.get("posts.description.min"))
      .max(config.get("posts.description.max"))
      .required(),
    state: Joi.objectId().required(),
    city: Joi.objectId().required(),
    transmission: Joi.objectId().required(),
    isActive: Joi.boolean(),
    mileage: Joi.number()
      .min(config.get("posts.mileage.min"))
      .max(config.get("posts.mileage.max"))
      .required(),
    price: Joi.number().integer()
      .min(config.get("posts.price.min"))
      .max(config.get("posts.price.max"))
      .required()
  };
  return Joi.validate(obj, schema);
};