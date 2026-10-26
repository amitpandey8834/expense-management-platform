const express = require("express");

const authenticate = require("../middleware/auth");

const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const router = express.Router();

router.use(authenticate);

router
  .route("/")
  .post(createExpense)
  .get(getExpenses);

router
  .route("/:id")
  .get(getExpenseById)
  .patch(updateExpense)
  .delete(deleteExpense);

module.exports = router;