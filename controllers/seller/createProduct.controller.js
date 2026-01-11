import Product from "../../model/seller/product.model.js";
import cloudinary from "../../utils/cloudinary.js";
import logger from "../../libs/logger.js";
import { productValidationSchema } from "../../validator/product.validator.js";

const isValidBase64 = (str) => {
     return /^([0-9a-zA-Z+/=]{4})*$/.test(str);
}

// Fields sellers are allowed to set/update
const SELLER_ALLOWED_FIELDS = [
  "title",
  "slug",
  "description",
  "shortDescription",
  "category",
  "subcategory",
  "dynamic",
  "media",
  "basePrice",
  "baseComparePrice",
  "supportsVariants",
  "variants",
  "shipping",
  "location",
  "tags",
];

// Filter object to only allowed fields
function filterFields(body, allowedFields) {
  const filtered = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      filtered[key] = body[key];
    }
  }
  return filtered;
}

// CREATE product
export const createProduct = async (req, res) => {
  try {
// only allow trusted user
if(!req.user?.isVerifiedSeller){
    return res.status(403).json({message: "you are not a trusted sellel"})
}

    let productData;

    if (req.user.role === "admin") {
      // Admin can set all fields directly
      productData = { ...req.body };
    } else {
      // Seller can only set allowed fields
      productData = filterFields(req.body, SELLER_ALLOWED_FIELDS);
      productData.seller = req.user._id; // Always from logged-in user
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Sellers can only update their own products
    if (
      req.user.role !== "admin" &&
      product.seller.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    let updateData;

    if (req.user.role === "admin") {
      // Admin can update any field
      updateData = { ...req.body };
    } else {
      // Seller can only update allowed fields
      updateData = filterFields(req.body, SELLER_ALLOWED_FIELDS);
    }

    updateData.updatedAt = new Date();

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
