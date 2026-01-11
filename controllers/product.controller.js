import Product from "../model/general/product.model.js";
import cloudinary from "../utils/cloudinary.js";

import logger from "../libs/logger.js";
import { productValidationSchema } from "../validator/product.validator.js";
import User from "../model/general/user.model.js";


function isValidBase64(str) {
  const base64Str = str.replace(/^data:image\/[a-z]+;base64,/, "");
  return /^([0-9a-zA-Z+/=]{4})*$/.test(base64Str);
}

export const createProduct = async (req, res) => {
  try {
    // ✅ 1. Only allow trusted sellers
    if (!req.user?.isVerifiedSeller) {
      return res.status(403).json({ message: "You are not a trusted seller" });
    }

    // ✅ 2. Joi validation
    const { error } = productValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // ✅ 3. Extract only whitelisted fields
    const {
      title,
      description,
      price,
      category,
      subcategory,
      condition,
      images,
      location,
      tags,
      shippingFree,
      shippings,
      attributes, // add this
      discountPrice,
      stock,
      sku,
    } = req.body;

    const sellerId = req.user._id;
    
    const seller = await User.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // ✅ Hybrid logic for product status
    let productStatus = "pending";
    if (seller.isVerifiedSeller) {
      productStatus = "active";
    }

    // ✅ 4. Validate and upload images
    if (!Array.isArray(images) || images.length > 4) {
      return res
        .status(400)
        .json({ message: "You must upload between 1 to 4 images" });
    }

    const imageUrls = await Promise.all(
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

    // ✅ 5. Validate location
    if (typeof location !== "object" || !location.city || !location.region) {
      return res.status(400).json({ message: "Invalid location data" });
    }

    // ✅ 6. Create product
    const newProduct = await Product.create({
      title,
      description,
      price,
      category,
       subcategory, // include subcategory
      condition,
      images: imageUrls,
      location,
      shippingFree,
      shippings,
      attributes, // save dynamic fields
      tags,
      seller: sellerId,
      status: productStatus,
      sku,
      discountPrice,
      stock,
    });

    await newProduct.populate("seller", "fullName phoneNumber email");

    logger.info("Product created", { productId: newProduct._id, seller });

    return res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    logger.error("Error in createProduct", {
      error: err instanceof Error ? err.message : err,
      stack: err instanceof Error ? err.stack : "No stack available",
    });
    return res.status(500).json({ message: "Server error" });
  }
};

// controllers/productController.js
export const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({})
        .skip(skip)
        .limit(limit)
        .populate({
          path: "seller",
          select:
            "fullName profilePhoto phoneNumber location feedback joinedAt rating",
        }),
      Product.countDocuments(),
    ]);

    // Transform attributes for frontend
    // const formattedProducts = products.map((product) => {
    //   const attributes = product.attributes || {};
    //   const attributeList = Object.entries(attributes).map(([key, value]) => ({
    //     label: key.replace(/_/g, " "), // e.g., fuel_type → Fuel Type
    //     value,
    //   }));

    //   return {
    //     ...product,
    //     categoryName: product.category?.name || null,
    //     subcategoryName: product.subcategory?.name || null,
    //     attributeList, // ready to render
    //   };
    // });

    return res.status(200).json({
      success: true,
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    logger.error("Get all products failed", { error: err.message });
    return next(err);
  }
};



// In-memory cache (optional, fast for repeated calls)
const cache = new Map();

export const getAllProducts1 = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const key = `page:${page}-limit:${limit}`;

    // ✅ 1️⃣ Check in-memory cache first
    if (cache.has(key)) {
      const cachedData = cache.get(key);
      return res.status(200).json({
        success: true,
        cached: true,
        ...cachedData,
      });
    }

    // ✅ 2️⃣ Run queries in parallel for performance
    const [products, total] = await Promise.all([
      Product.find({})
        .select(
          "title price category condition images location createdAt seller" // select only lightweight fields
        )
        .populate({
          path: "seller",
          select: "fullName profilePhoto location rating", // minimal seller fields
        })
        .skip(skip)
        .limit(limit)
        .lean(), // ⚡ speeds up by 30–50%
      Product.countDocuments(),
    ]);

    // ✅ 3️⃣ Create response data
    const totalPages = Math.ceil(total / limit);
    const response = {
      success: true,
      page,
      totalPages,
       total,
      count: products.length,
      products,
    };

    // ✅ 4️⃣ Store in cache for quick next load (e.g. 5 min)
    cache.set(key, response);
    setTimeout(() => cache.delete(key), 5 * 60 * 1000); // cache expires in 5 min

    // ✅ 5️⃣ Send response
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching products",
    });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.seller.equals(userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this product" });
    }

    const alowsFields = [
      "title",
      "description",
      "price",
      "category",
      "condition",
      "images",
      "location",
      "tags",
    ];

    const updates = {};
    alowsFields.forEach((fields) => {
      if (req.body[fields] !== "undefined") {
        updates[fields] = req.body[fields];
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    return res.status(201).json({
      message: "product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.log("Error in update product controller", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!product.seller.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this product" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        const publicId = extractCloudinaryPublicId(imageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          logger.info(`Deleted Cloudinary image: ${publicId}`);
        }
      }
    }

    await Product.findByIdAndDelete(productId);
    logger.info(`Product ${productId} deleted by seller ${userId}`);

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    logger.error("Delete product failed", { error: err.message });
    return next(err);
  }
};



export const browseProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      priceMin,
      priceMax,
      condition,
      city,
      region,
      sort = "newest",
      isFeatured,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {
      isActive: true,
    };

    if (search) filters.title = { $regex: search, $options: "i" };
    if (category) filters.category = { $regex: category, $options: "i" };
    if (condition) filters.condition = { $regex: condition, $options: "i" };
    if (city) filters["location.city"] = { $regex: city, $options: "i" };
    if (region) filters["location.region"] = { $regex: region, $options: "i" };
    if (isFeatured) filters.isFeatured = isFeatured === true;

    if (priceMin || priceMax) {
      filters.price = {};
      if (priceMin) filters.price.$gte = Number(priceMin);
      if (priceMax) filters.price.$lte = Number(priceMax);
    }

    let sortOption = { postedAt: -1 };
    if (sort === "priceLow") sortOption = { price: 1 };
    if (sort === "priceHigh") sortOption = { price: -1 };
    if (sort === "popular") sortOption = { views: -1 };

    const products = await Product.find(filters)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filters);
    res.status(200).json({
      data: products,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    console.log("Error in browse products controller", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const autoComplete = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) return res.json([]);

    const suggestion = await Product.find({
      title: { $regex: query, $options: "i" },
    })
      .limit(10)
      .select("title");

    const titles = suggestion.map((p) => p.title);
    res.json(titles);
  } catch (err) {
    console.error("Autocomplete error:", err.message);
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
};

// controllers/productController.js
// GET /api/products/suggest?q=searchTerm
export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({ message: "Query string is required" });
    }

    const suggestions = await Product.find({
      title: { $regex: q, $options: "i" },
    })
      .limit(10)
      .select("title");

    const titles = suggestions.map((s) => s.title);

    return res.status(200).json(titles);
  } catch (err) {
    console.error("Autocomplete API error:", err);
    return res
      .status(500)
      .json({ message: "Server error while getting suggestions" });
  }
};


// ⭐ Featured Products (for banners / campaigns)
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(10);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🌟 Recommended Products (manually marked)
export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.find({ recommended: true }).limit(10);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔥 Popular Products (based on views or sales)
export const getPopularProducts = async (req, res) => {
  try {
    // sort by most viewed first
    const products = await Product.find()
      .sort({ views: -1, sales: -1 }) // combine both metrics
      .limit(10);

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🆕 New Arrivals (recently added products)
export const getNewArrivalsProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ postedAt: -1 })
      .limit(10);

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 Get Single Product + Auto-Increment Views
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, // increment views by 1
      { new: true } // return updated product
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};





