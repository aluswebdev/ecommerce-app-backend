import logger from "../../libs/logger.js";
import Product from "../../model/general/product.model.js";

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate MongoDB ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn(`Invalid product ID: ${id}`);
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // ✅ Fetch product
    const product = await Product.findById(id);

    if (!product) {
      logger.warn(`Product not found: ${id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info(`Fetched product ${id}`);
    return res.status(200).json(product);
  } catch (error) {
    logger.error("Error fetching product by ID", { error: error.message });
    return res.status(500).json({ message: "Server error" });
  }
};
