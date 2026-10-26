const Category = require("../models/Category");
const AppError = require("../utils/AppError");

const createCategory = async (categoryData) => {
  return Category.create(categoryData);
};

const getCategories = async () => {
  return Category.find().sort({ name: 1 });
};

const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

const updateCategory = async (categoryId, categoryData) => {
  const category = await Category.findByIdAndUpdate(
    categoryId,
    categoryData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

const deleteCategory = async (categoryId) => {
  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};