// models/OrderEvent.js  (audit trail + replay for reliability)
import mongoose from "mongoose";

const OrderEventSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "STATUS_CHANGED",
        "LOCATION_UPDATED",
        "NOTE",
        "REFUND",
        "ITEM_EDIT",
      ],
      required: true,
    },
    payload: {}, // free-form snapshot e.g., { from:"PLACED", to:"SHIPPED" }
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const OrderEvent = mongoose.model("OrderEvent", OrderEventSchema);

export default OrderEvent;
