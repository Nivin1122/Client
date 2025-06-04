// models/product/categoryModel.js

const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    isDeleted: { type: Boolean, default: false },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }, // <-- added
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
