import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      // select: false, // Do not return password by default
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    profilePhoto: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    location: {
      city: { type: String, default: "" },
      region: { type: String, default: "" },
      country: { type: String, default: "Sierra Leone" },
    },

    deliveryAddresses: [
      {
        label: { type: String, required: true }, // Home, Office
        details: { type: String, required: true }, // full address
        isDefault: { type: Boolean, default: false },
      },
    ],

    isVerifiedSeller: {
      type: Boolean,
      default: false, // Admin approval required
    },
    feedback: {
      positive: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
