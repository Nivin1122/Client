const asyncHandler = require("express-async-handler");
const Category = require("../../../models/product/categoryModel");

// admin/controllers/product/CategoryController.js

const addCategory = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = await Category.create({
    name,
    parent: parent || null,
  });

  res.status(201).json({ message: "Category created", category });
});


const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
    .populate("parent", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({ categories });
});


const editCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body; 

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (!name) {
      return res.status(200).json({ category });
    }

    category.name = name;
    await category.save();

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
});

const blockCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isDeleted = true;
    await category.save();

    res
      .status(200)
      .json({ message: "Category blocked successfully", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error blocking category", error: error.message });
  }
});

const unblockCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isDeleted = false;
    await category.save();

    res
      .status(200)
      .json({ message: "Category unblocked successfully", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error unblocking category", error: error.message });
  }
});

module.exports = {
  addCategory,
  editCategory,
  blockCategory,
  unblockCategory,
  getAllCategoriesAdmin
};
