// seedCategories.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./model/seller/category.model.js";

dotenv.config();

// 1. Connect to MongoDB
await mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// 3. Seed Data
const categories = [
  // 1. Electronics
  {
    name: "Electronics",
    slug: "electronics",
    subcategories: [
      {
        name: "Phones",
        slug: "phones",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: true },
          { name: "model", key: "model", type: "text", required: true },
          {
            name: "storage",
            key: "storage",
            type: "select",
            options: ["32GB", "64GB", "128GB", "256GB", "512GB"],
            required: true,
          },
          { name: "color", key: "color", type: "text", required: false },
          {
            name: "condition",
            key: "condition",
            type: "select",
            options: ["New", "Used", "Refurbished"],
            required: true,
          },
        ],
      },
      {
        name: "Laptops",
        slug: "laptops",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: true },
          { name: "processor", key: "processor", type: "text", required: true },
          {
            name: "ram",
            key: "ram",
            type: "select",
            options: ["4GB", "8GB", "16GB", "32GB"],
            required: true,
          },
          {
            name: "storage",
            key: "storage",
            type: "select",
            options: ["128GB", "256GB", "512GB", "1TB"],
            required: true,
          },
          {
            name: "os",
            key: "os",
            type: "select",
            options: ["Windows", "MacOS", "Linux", "Other"],
            required: false,
          },
        ],
      },
      {
        name: "Accessories",
        slug: "accessories",
        supportsVariants: true,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
          {
            name: "type",
            key: "type",
            type: "select",
            options: [
              "Charger",
              "Cable",
              "Case",
              "Screen Protector",
              "Headphones",
              "Other",
            ],
            required: true,
          },
          {
            name: "color",
            key: "color",
            type: "text",
            required: false,
            variantField: true,
          },
          { name: "material", key: "material", type: "text", required: false },
        ],
      },
    ],
  },

  // 2. Vehicles
  {
    name: "Vehicles",
    slug: "vehicles",
    subcategories: [
      {
        name: "Cars",
        slug: "cars",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: true },
          { name: "model", key: "model", type: "text", required: true },
          { name: "year", key: "year", type: "number", required: true },
          {
            name: "mileage_km",
            key: "mileage_km",
            type: "number",
            required: true,
          },
          {
            name: "transmission",
            key: "transmission",
            type: "select",
            options: ["Manual", "Automatic"],
            required: true,
          },
          {
            name: "fuel_type",
            key: "fuel_type",
            type: "select",
            options: ["Petrol", "Diesel", "Electric", "Hybrid"],
            required: true,
          },
        ],
      },
      {
        name: "Motorbikes",
        slug: "motorbikes",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: true },
          {
            name: "engine_cc",
            key: "engine_cc",
            type: "number",
            required: true,
          },
          { name: "year", key: "year", type: "number", required: false },
        ],
      },
      {
        name: "Bicycles",
        slug: "bicycles",
        supportsVariants: true,
        fields: [
          {
            name: "type",
            key: "type",
            type: "select",
            options: [
              "Road",
              "Mountain",
              "Hybrid",
              "Folding",
              "Electric",
              "Kids",
            ],
            required: true,
          },
          {
            name: "frame_size",
            key: "frame_size",
            type: "text",
            required: false,
            variantField: true,
          },
          {
            name: "color",
            key: "color",
            type: "text",
            required: false,
            variantField: true,
          },
        ],
      },
    ],
  },

  // 3. Fashion
  {
    name: "Fashion",
    slug: "fashion",
    subcategories: [
      {
        name: "Clothes",
        slug: "clothes",
        supportsVariants: true,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
          {
            name: "gender",
            key: "gender",
            type: "select",
            options: ["Male", "Female", "Unisex"],
            required: true,
          },
          {
            name: "size",
            key: "size",
            type: "select",
            options: ["XS", "S", "M", "L", "XL", "XXL"],
            required: true,
            variantField: true,
          },
          {
            name: "color",
            key: "color",
            type: "text",
            required: false,
            variantField: true,
          },
          { name: "material", key: "material", type: "text", required: false },
        ],
      },
      {
        name: "Shoes",
        slug: "shoes",
        supportsVariants: true,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
          {
            name: "size",
            key: "size",
            type: "select",
            options: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
            required: true,
            variantField: true,
          },
          {
            name: "gender",
            key: "gender",
            type: "select",
            options: ["Male", "Female", "Unisex"],
            required: true,
          },
        ],
      },
      {
        name: "Bags & Accessories",
        slug: "bags-accessories",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
          { name: "material", key: "material", type: "text", required: false },
        ],
      },
    ],
  },

  // 4. Home & Living
  {
    name: "Home & Living",
    slug: "home-living",
    subcategories: [
      {
        name: "Furniture",
        slug: "furniture",
        supportsVariants: false,
        fields: [
          {
            name: "type",
            key: "type",
            type: "select",
            options: ["Sofa", "Table", "Chair", "Bed", "Wardrobe", "Other"],
            required: true,
          },
          { name: "material", key: "material", type: "text", required: false },
          {
            name: "dimensions_cm",
            key: "dimensions_cm",
            type: "text",
            required: false,
          },
        ],
      },
      {
        name: "Appliances",
        slug: "appliances",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
          { name: "model", key: "model", type: "text", required: false },
          {
            name: "power_watts",
            key: "power_watts",
            type: "number",
            required: false,
          },
          {
            name: "energy_rating",
            key: "energy_rating",
            type: "select",
            options: ["A++", "A+", "A", "B", "C", "D"],
            required: false,
          },
        ],
      },
    ],
  },

  // 5. Sports & Outdoors
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    subcategories: [
      {
        name: "Fitness Equipment",
        slug: "fitness-equipment",
        supportsVariants: false,
        fields: [
          { name: "type", key: "type", type: "text", required: true },
          {
            name: "weight_kg",
            key: "weight_kg",
            type: "number",
            required: false,
          },
        ],
      },
      {
        name: "Camping & Hiking",
        slug: "camping-hiking",
        supportsVariants: false,
        fields: [{ name: "type", key: "type", type: "text", required: true }],
      },
    ],
  },

  // 6. Beauty & Health
  {
    name: "Beauty & Health",
    slug: "beauty-health",
    subcategories: [
      {
        name: "Skincare",
        slug: "skincare",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
          { name: "size_ml", key: "size_ml", type: "number", required: false },
          {
            name: "suitable_for",
            key: "suitable_for",
            type: "text",
            required: false,
          },
        ],
      },
      {
        name: "Personal Care",
        slug: "personal-care",
        supportsVariants: false,
        fields: [{ name: "type", key: "type", type: "text", required: false }],
      },
    ],
  },

  // 7. Books & Media
  {
    name: "Books & Media",
    slug: "books-media",
    subcategories: [
      {
        name: "Books",
        slug: "books",
        supportsVariants: false,
        fields: [
          { name: "author", key: "author", type: "text", required: true },
          {
            name: "publisher",
            key: "publisher",
            type: "text",
            required: false,
          },
          { name: "language", key: "language", type: "text", required: false },
          {
            name: "format",
            key: "format",
            type: "select",
            options: ["Paperback", "Hardcover", "Ebook", "Audio"],
            required: false,
          },
        ],
      },
      {
        name: "Movies & Music",
        slug: "movies-music",
        supportsVariants: false,
        fields: [
          { name: "format", key: "format", type: "text", required: false },
        ],
      },
    ],
  },

  // 8. Baby & Kids
  {
    name: "Baby & Kids",
    slug: "baby-kids",
    subcategories: [
      {
        name: "Baby Clothes",
        slug: "baby-clothes",
        supportsVariants: true,
        fields: [
          {
            name: "size",
            key: "size",
            type: "select",
            options: ["0-3m", "3-6m", "6-12m", "12-24m"],
            required: true,
            variantField: true,
          },
          { name: "material", key: "material", type: "text", required: false },
        ],
      },
      {
        name: "Toys",
        slug: "toys",
        supportsVariants: false,
        fields: [
          {
            name: "age_range",
            key: "age_range",
            type: "text",
            required: false,
          },
        ],
      },
    ],
  },

  // 9. Tools & Machinery
  {
    name: "Tools & Machinery",
    slug: "tools-machinery",
    subcategories: [
      {
        name: "Power Tools",
        slug: "power-tools",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
          {
            name: "power_watts",
            key: "power_watts",
            type: "number",
            required: false,
          },
        ],
      },
      {
        name: "Industrial Machinery",
        slug: "industrial-machinery",
        supportsVariants: false,
        fields: [
          { name: "model", key: "model", type: "text", required: false },
        ],
      },
    ],
  },

  // 10. Pet Supplies
  {
    name: "Pet Supplies",
    slug: "pet-supplies",
    subcategories: [
      {
        name: "Pet Food",
        slug: "pet-food",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
          {
            name: "weight_kg",
            key: "weight_kg",
            type: "number",
            required: false,
          },
        ],
      },
      {
        name: "Pet Accessories",
        slug: "pet-accessories",
        supportsVariants: true,
        fields: [
          {
            name: "type",
            key: "type",
            type: "select",
            options: ["Leash", "Bowl", "Bed", "Toy", "Other"],
            required: true,
          },
          {
            name: "size",
            key: "size",
            type: "text",
            required: false,
            variantField: true,
          },
        ],
      },
    ],
  },

  // 11. Office Supplies
  {
    name: "Office Supplies",
    slug: "office-supplies",
    subcategories: [
      {
        name: "Stationery",
        slug: "stationery",
        supportsVariants: false,
        fields: [{ name: "type", key: "type", type: "text", required: false }],
      },
      {
        name: "Office Electronics",
        slug: "office-electronics",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
        ],
      },
    ],
  },

  // 12. Garden & Outdoors
  {
    name: "Garden & Outdoors",
    slug: "garden-outdoors",
    subcategories: [
      {
        name: "Garden Tools",
        slug: "garden-tools",
        supportsVariants: false,
        fields: [{ name: "type", key: "type", type: "text", required: false }],
      },
      {
        name: "Plants",
        slug: "plants",
        supportsVariants: false,
        fields: [
          {
            name: "plant_type",
            key: "plant_type",
            type: "text",
            required: false,
          },
        ],
      },
    ],
  },

  // 13. Art & Collectibles
  {
    name: "Art & Collectibles",
    slug: "art-collectibles",
    subcategories: [
      {
        name: "Art",
        slug: "art",
        supportsVariants: false,
        fields: [
          { name: "artist", key: "artist", type: "text", required: false },
          { name: "year", key: "year", type: "number", required: false },
        ],
      },
      {
        name: "Collectibles",
        slug: "collectibles",
        supportsVariants: false,
        fields: [
          {
            name: "condition",
            key: "condition",
            type: "select",
            options: ["New", "Used", "Mint"],
            required: false,
          },
        ],
      },
    ],
  },

  // 14. Automotive Parts
  {
    name: "Automotive Parts",
    slug: "automotive-parts",
    subcategories: [
      {
        name: "Engine & Drivetrain",
        slug: "engine-drivetrain",
        supportsVariants: false,
        fields: [
          { name: "fitment", key: "fitment", type: "text", required: false },
        ],
      },
      {
        name: "Tires & Wheels",
        slug: "tires-wheels",
        supportsVariants: true,
        fields: [
          {
            name: "size",
            key: "size",
            type: "text",
            required: true,
            variantField: true,
          },
          { name: "brand", key: "brand", type: "text", required: false },
        ],
      },
    ],
  },

  // 15. Musical Instruments
  {
    name: "Musical Instruments",
    slug: "musical-instruments",
    subcategories: [
      {
        name: "Guitars",
        slug: "guitars",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
        ],
      },
      {
        name: "Keyboards",
        slug: "keyboards",
        supportsVariants: false,
        fields: [
          { name: "keys", key: "keys", type: "number", required: false },
        ],
      },
    ],
  },

  // 16. Food & Grocery
  {
    name: "Food & Grocery",
    slug: "food-grocery",
    subcategories: [
      {
        name: "Pantry",
        slug: "pantry",
        supportsVariants: false,
        fields: [
          {
            name: "expiry_date",
            key: "expiry_date",
            type: "date",
            required: false,
          },
        ],
      },
      {
        name: "Fresh & Frozen",
        slug: "fresh-frozen",
        supportsVariants: false,
        fields: [
          {
            name: "weight_kg",
            key: "weight_kg",
            type: "number",
            required: false,
          },
        ],
      },
    ],
  },

  // 17. Services (optional category for bookings / listings)
  {
    name: "Services",
    slug: "services",
    subcategories: [
      {
        name: "Home Services",
        slug: "home-services",
        supportsVariants: false,
        fields: [
          {
            name: "duration_hours",
            key: "duration_hours",
            type: "number",
            required: false,
          },
          {
            name: "service_area",
            key: "service_area",
            type: "text",
            required: false,
          },
        ],
      },
      {
        name: "Vehicle Services",
        slug: "vehicle-services",
        supportsVariants: false,
        fields: [
          {
            name: "service_type",
            key: "service_type",
            type: "text",
            required: false,
          },
        ],
      },
    ],
  },

  // 18. Electronics — Smart Home (extra)
  {
    name: "Smart Home",
    slug: "smart-home",
    subcategories: [
      {
        name: "Security & Cameras",
        slug: "security-cameras",
        supportsVariants: false,
        fields: [
          { name: "brand", key: "brand", type: "text", required: false },
        ],
      },
      {
        name: "Smart Lighting",
        slug: "smart-lighting",
        supportsVariants: false,
        fields: [
          { name: "wattage", key: "wattage", type: "number", required: false },
        ],
      },
    ],
  },
];



// 4. Insert Data
const seed = async () => {
  try {
    for (const newCat of categories) {
      // Try find existing category by name
      const existingCat = await Category.findOne({ name: newCat.name });

      if (!existingCat) {
        // Insert new category if doesn't exist
        await Category.create(newCat);
        console.log(`Added new category: ${newCat.name}`);
      } else {
        // Update subcategories of existing category
        for (const newSubcat of newCat.subcategories) {
          const existingSubcat = existingCat.subcategories.find(
            (sc) => sc.name === newSubcat.name
          );

          if (!existingSubcat) {
            // Add new subcategory if not found
            existingCat.subcategories.push(newSubcat);
            console.log(
              `Added new subcategory "${newSubcat.name}" to category "${existingCat.name}"`
            );
          } else {
            // Optionally update fields in existing subcategory
            for (const newField of newSubcat.fields) {
              const hasField = existingSubcat.fields.some(
                (f) => f.name === newField.name
              );
              if (!hasField) {
                existingSubcat.fields.push(newField);
                console.log(
                  `Added new field "${newField.name}" to subcategory "${existingSubcat.name}"`
                );
              }
            }
          }
        }
        await existingCat.save();
        console.log(`Updated category: ${existingCat.name}`);
      }
    }

    console.log("✅ Categories added/updated successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding categories:", err);
    process.exit(1);
  }
};

seed();

