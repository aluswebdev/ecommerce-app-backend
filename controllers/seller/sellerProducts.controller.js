import Product from "../../model/general/product.model.js";
import logger from "../../libs/logger.js";
import cloudinary from "../../utils/cloudinary.js";
/**
 * @desc    Get all products for a seller
 * @route   GET /api/seller/products
 * @access  Private (seller)
 */
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id; // assume req.user is set by auth middleware
    const products = await Product.find({ seller: sellerId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// =============================
// EDIT / UPDATE PRODUCT
// =============================

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user._id;
    const { title, description, price, stock, images, discountPrice } = req.body;


    // find product
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // check ownership
    if (product.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only edit your own products",
      });
    }

      const newImages = req.body.images;

      const removedImages = product.images.filter(
        (oldImg) => !newImages.includes(oldImg)
      );

     if (images && images.length > 0) {
       // delete old from Cloudinary
       await Promise.all(
         removedImages.map(async (img) => {
           if (img.public_id) {
             await cloudinary.uploader.destroy(img.public_id);
           }
         })
       );

       // upload new ones
       const uploadedImages = await Promise.all(
         images.map(async (img, idx) => {
           if (!/^data:image\/[a-zA-Z]+;base64,/.test(img)) {
             throw new Error(`Invalid image format at index ${idx}`);
           }

           const result = await cloudinary.uploader.upload(img, {
             folder: "marketplaceProducts",
           });

           return {
             url: result.secure_url,
             public_id: result.public_id,
           };
         })
       );

       product.images = uploadedImages;
     }

    // const updatedProduct = await product.save();
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.discountPrice = discountPrice || product.discountPrice;

    await product.save();

    logger.info(
      `Product updated: ${product._id} by Seller: ${sellerId}`
    );
    res.status(200).json({ success: true, product });
  } catch (error) {
    logger.error("Error updating product:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while updating product" });
  }
};


// =============================
// DELETE PRODUCT
// =============================
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // check ownership
    if (product.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only delete your own products",
      });
    }

    // ✅ delete all product images from cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
            logger.info(`Deleted Cloudinary image: ${img.public_id}`);
          } catch (err) {
            logger.error(`Failed to delete image ${img.public_id}:`, err);
          }
        }
      }
    }

    // delete product document from MongoDB
    await product.deleteOne();

    logger.info(`Product deleted: ${product._id} by Seller: ${sellerId}`);
    res.status(200).json({
      success: true,
      message: "Product and images deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};

export const toggleProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Only toggle between active/inactive (not pending or blocked)
    product.status = product.status === "active" ? "inactive" : "active";
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product is now ${product.status}`,
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};