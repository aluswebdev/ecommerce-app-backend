import Product from "../model/general/product.model.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("seller", "name email");
    res.json(products);
  } catch (err) {
    logger.error("Admin getAllProducts error", { message: err.message });
    next(err);
  }
};

export const verifyProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.verified = true;
    await product.save();

    res.json({ message: "Product verified" });
  } catch (err) {
    logger.error("Admin verifyProduct error", { message: err.message });
    next(err);
  }
};

export const markProductFeatured = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.featured = true;
    await product.save();

    res.json({ message: "Product marked as featured" });
  } catch (err) {
    logger.error("Admin markProductFeatured error", { message: err.message });
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.productId);
    res.json({ message: "Product deleted" });
  } catch (err) {
    logger.error("Admin deleteProduct error", { message: err.message });
    next(err);
  }
};
