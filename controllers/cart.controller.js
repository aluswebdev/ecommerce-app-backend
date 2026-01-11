// controllers/cartController.js
import mongoose from "mongoose";
import Cart from "../model/general/cart.model.js";
import Product from "../model/general/product.model.js";
import logger from "../libs/logger.js";
import { NotFoundError, UnauthorizedError } from "../libs/error.js";
import {
  addToCartSchema,
  updateQuantitySchema,
  removeFromCartSchema,
} from "../middleware/cartModelValidator.js";

export const addToCart = async (req, res, next) => {
  try {
    const { error, value } = addToCartSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { productId, quantity } = value;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.inStock < quantity) {
      return res
        .status(400)
        .json({ message: `Only ${product.inStock} item(s) in stock` });
    }

    let cart = await Cart.findOne({ buyer: req.user._id });

    // if(cart) return res.status(400).json({message: "Product already in cart"})

  if (!cart) {
    cart = new Cart({
      buyer: req.user._id,
      items: [{ product: productId, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // ❌ Don't allow duplicate
      return res.status(400).json({ message: "Product already in cart" });
    } else {
      // ✅ Safe to add new product
      cart.items.push({ product: productId, quantity });
    }
  }


    await cart.save();
    await cart.populate({
      path: "items.product",
      populate: {
        path: "seller",
        model: "User", // or whatever your user model is called
      },
    });
    

    res.status(200).json({
      message: "Item added to cart",
      items: cart.items,
    });
  } catch (error) {
    logger.error("🛑 addToCart Error", {
      error: error.stack || error.message,
      userId: req.user?._id,
    });
    next(error);
  }
};



export const getCart = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) throw new UnauthorizedError("Unauthorized");

    const cart = await Cart.findOne({ buyer: req.user._id }).populate({
      path: "items.product",
      populate: {
        path: "seller",
        model: "User", // or whatever your user model is called
      },
    });
    
    res.status(200).json(cart);
  } catch (error) {
    logger.error("getCart Error", { error, userId: req.user?._id });
    next(error);
  }
};

export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { error, value } = updateQuantitySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { productId, quantity } = value;

    if (!req.user || !req.user._id) throw new UnauthorizedError("Unauthorized");

    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError("Product not found");
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ message: `Only ${product.stock} item(s) in stock` });
    }

    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) throw new NotFoundError("Cart not found");

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) throw new NotFoundError("Item not found in cart");

    item.quantity = quantity;
    await cart.save();
    await cart.populate({
      path: "items.product",
      populate: {
        path: "seller",
        model: "User", // or whatever your user model is called
      },
    });
    

    res.status(200).json(cart);
  } catch (error) {
    logger.error("updateCartItemQuantity Error", {
      error,
      userId: req.user?._id,
    });
    next(error);
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const userId = new mongoose.Types.ObjectId(req.user._id);
  
  try {
    const cart = await Cart.findOne({ buyer: userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Product not in cart" });
    }

    cart.items.splice(itemIndex, 1); // remove from array
    await cart.save();
    res.status(200).json({ message: "Item removed", items: cart.items });
  } catch (err) {
    console.error("[ERROR]: removeFromCart Error", err);
    res.status(500).json({ error: "Server error" });
  }
};




export const clearCart = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) throw new UnauthorizedError("Unauthorized");

    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) throw new NotFoundError("Cart not found");

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    logger.error("clearCart Error", { error, userId: req.user?._id });
    next(error);
  }
};
