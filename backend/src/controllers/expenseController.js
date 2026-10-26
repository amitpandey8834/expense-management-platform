const expenseService = require("../services/expenseService");

const createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(
      req.user.userId,
      req.body,
    );

    res.status(201).json({
      status: "success",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

const getExpenses = async (req, res, next) => {
  try {
    const expenses = await expenseService.getExpenses(req.user.userId);

    res.status(200).json({
      status: "success",
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(
      req.user.userId,
      req.params.id,
    );

    res.status(200).json({
      status: "success",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(
      req.user.userId,
      req.params.id,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.deleteExpense(
      req.user.userId,
      req.params.id,
    );

    res.status(200).json({
      status: "success",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};