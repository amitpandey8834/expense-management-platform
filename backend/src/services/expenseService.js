const Expense = require("../models/Expense");
const AppError = require("../utils/AppError");

const createExpense = async (userId, expenseData) => {
  return Expense.create({
    ...expenseData,
    user: userId,
  });
};

const getExpenses = async (userId) => {
  return Expense.find({ user: userId })
    .populate("category", "name type")
    .sort({ date: -1 });
};

const getExpenseById = async (userId, expenseId) => {
  const expense = await Expense.findOne({
    _id: expenseId,
    user: userId,
  }).populate("category", "name type");

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  return expense;
};

const updateExpense = async (userId, expenseId, expenseData) => {
  const expense = await Expense.findOneAndUpdate(
    {
      _id: expenseId,
      user: userId,
    },
    expenseData,
    {
      new: true,
      runValidators: true,
    },
  ).populate("category", "name type");

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  return expense;
};

const deleteExpense = async (userId, expenseId) => {
  const expense = await Expense.findOneAndDelete({
    _id: expenseId,
    user: userId,
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  return expense;
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};