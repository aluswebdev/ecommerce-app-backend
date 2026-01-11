// middlewares/errorHandler.js
import logger from "../libs/logger.js";

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error("Unhandled error", {
    message,
    status,
    route: req.originalUrl,
    stack: err.stack,
  });

  res.status(status).json({ message });
};

export default errorHandler;
