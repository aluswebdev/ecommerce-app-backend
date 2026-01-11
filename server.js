// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { Server as IOServer } from "socket.io";
import { initSocket } from "./socketIo/socket.js";

import { connectDB } from "./connectDB/connectDB.js";

// Routers
import authRouter from "./router/auth.route.js";
import chatRoutes from "./router/chat.route.js";
import wishlistRoutes from "./router/wishlist.route.js";
import messageRoutes from "./router/message.route.js";
import productRouter from "./router/product.route.js";
import buyerRoutes from "./router/buyer.router.js";
import sellerRouter from "./router/seller/sellerProduct.router.js";
import cartRoutes from "./router/cart.route.js";
import categoryRouter from "./router/seller/seller.category.js";
import productIdRouter from "./router/publicRouter/productId.router.js";
import searchRouter from "./router/searchRouter/search.router.js";
import orderRouter from "./router/order/order.router.js";
import sellerAnalyticsRouter from "./router/seller/analytics.router.js";
import sellerFollowerRouter from "./router/seller/sellerFollower.router.js";
import sellerProfileRouter from "./router/seller/sellerProfile.router.js";

// Carousels
import campaignRouter from "./router/carosel/campaign.router.js";
import categoryCaroselRouter from "./router/carosel/category.router.js";
import bannerRouter from "./router/carosel/banners.router.js";

// Error handler
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// 🛡 Security
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

// Create Server
const server = http.createServer(app);

initSocket(server);

// ===================== ROUTES ======================== //
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/wishlists", wishlistRoutes);
app.use("/api/v1/buyer-profile", buyerRoutes);
app.use("/api/v1/seller", sellerRouter);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/public", productIdRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/campaigns", campaignRouter);
app.use("/api/v1/carosel/categories", categoryCaroselRouter);
app.use("/api/v1/banners", bannerRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1", sellerAnalyticsRouter);
app.use("/api/v1/seller-followers", sellerFollowerRouter);
app.use("/api/v1/seller-profile", sellerProfileRouter);

// ❗ ERROR HANDLER MUST BE LAST
app.use(errorHandler);

// ===================== LISTEN ======================== //
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});
