import Product from "../../model/general/product.model.js";
// import asyncHandler from "../../services/asyncHandler.js";
// import CustomError from "../../utils/customError.js";

export const fetchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    // find distinct product titles that matches query {case insensitive}

    const suggestions = await Product.find(
      { title: { $regex: query, $options: "i" } },
      { title: 1 }
    )
      .limit(10)
      .lean();

    const suggestionTitles = suggestions.map((p) => p.title);

    res.json(suggestionTitles);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ message: "Server error fetching suggestions" });
  }
};

export const fetchSearchResults = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, condition, location } =
      req.query;

    let filters = {};
    if (query) filters.title = { $regex: query, $options: "i" };
    if (category) filters.category = category;
    if (condition) filters.condition = condition;
    if (location) filters.location = location;

    if (minPrice || maxPrice)
      filters.price = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };

    const products = await Product.find(filters).lean();

    res.json(products);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ message: "Server error fetching search results" });
  }
};
