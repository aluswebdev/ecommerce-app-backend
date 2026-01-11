// validators/cartValidators.js
import Joi from "joi";
import mongoose from "mongoose";

const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const addToCartSchema = Joi.object({
  productId: Joi.string().custom(isValidObjectId).required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const updateQuantitySchema = Joi.object({
  productId: Joi.string().custom(isValidObjectId).required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const removeFromCartSchema = Joi.object({
  productId: Joi.string().custom(isValidObjectId).required(),
});