const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const makeSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("makes.name.min"),
    maxlength: config.get("makes.name.max"),
    required: true,
    unique: true,
    trim: true
  }
});

// Create Make model
const Make = mongoose.model(String(config.get("makes.tableName")), makeSchema);

async function getById(itemId) {
  /**
   * Returns a car make by id
   * @return Promise:
   */
  return await Make.findById(itemId).select("-__v");
}

async function getByPage(page, amount) {
  /**
   * Get list of makes by page/amount (pagination)
   * @return Promise:
   */
  return await Make.find()
    .skip((page - 1) * amount).limit(amount).sort({name: 1})
    .select("-__v");
}

async function create(name) {
  /**
   * Create a new make of cars
   * @return Promise:
   */
  const type = new Make(name);
  return await type.save();
}
