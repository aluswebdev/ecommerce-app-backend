import Joi from "joi";

export const productValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  subcategory: Joi.string().required(),
  // condition: Joi.string().required(),

  images: Joi.array().items(Joi.string()).min(1).required(), // base64 strings
  location: Joi.object().required(),
  shippings: Joi.object().required(),
  variantColor: Joi.string().optional(),
  shippingFree: Joi.boolean().required(),
  tags: Joi.array().items(Joi.string()).required(),
  attributes: Joi.object().pattern(Joi.string(), Joi.any()),
  discountPrice: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  sku: Joi.string().optional(),
  deliveryOptions: Joi.string().optional(),
  isFeatured: Joi.boolean().optional(),
  category: Joi.string().required(), // Category ID
  subcategory: Joi.string().required(),
  // contact: Joi.string().required(),
  // negotiable: Joi.boolean().default(false),
  features: Joi.array().items(Joi.string()).optional(),
});
