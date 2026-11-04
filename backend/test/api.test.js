const {
  before,
  after,
  beforeEach,
  describe,
  it,
} = require("node:test");

const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");

const app = require("../src/app");

const api = request(app);

async function registerUser(email = "user@example.com") {
  return api.post("/api/v1/auth/register").send({
    name: "Test User",
    email,
    password: "StrongPass123",
  });
}

async function createCategory(name = "Food", type = "expense") {
  return api.post("/api/v1/categories").send({
    name,
    type,
  });
}

describe("Expense Management API", () => {
  before(async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI must be set before running API tests");
    }

    const databaseName = new URL(mongoUri).pathname.slice(1);

    if (databaseName !== "expense_management_test") {
      throw new Error(
        "Tests must use the dedicated expense_management_test database",
      );
    }

    await mongoose.connect(mongoUri);
  });

  after(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  });

  beforeEach(async () => {
    const collections = Object.values(mongoose.connection.collections);

    await Promise.all(
      collections.map((collection) => collection.deleteMany({})),
    );
  });

  describe("Health endpoints", () => {
    it("should return 200 from the health endpoint", async () => {
      const response = await api.get("/health");

      assert.equal(response.status, 200);
      assert.equal(response.body.status, "ok");
    });

    it("should return ready when MongoDB is connected", async () => {
      const response = await api.get("/readiness");

      assert.equal(response.status, 200);
      assert.equal(response.body.status, "ready");
      assert.equal(response.body.database, "connected");
    });
  });

  describe("Authentication", () => {
    it("should register a new user", async () => {
      const response = await registerUser();

      assert.equal(response.status, 201);
      assert.equal(response.body.status, "success");
      assert.ok(response.body.data.token);
      assert.equal(
        response.body.data.user.email,
        "user@example.com",
      );
    });

    it("should reject duplicate email registration", async () => {
      await registerUser();

      const response = await registerUser();

      assert.equal(response.status, 409);
    });

    it("should log in an existing user", async () => {
      await registerUser();

      const response = await api.post("/api/v1/auth/login").send({
        email: "user@example.com",
        password: "StrongPass123",
      });

      assert.equal(response.status, 200);
      assert.ok(response.body.data.token);
    });

    it("should reject incorrect login credentials", async () => {
      await registerUser();

      const response = await api.post("/api/v1/auth/login").send({
        email: "user@example.com",
        password: "WrongPassword123",
      });

      assert.equal(response.status, 401);
    });
  });

  describe("Categories", () => {
    it("should create, retrieve, update and delete a category", async () => {
      const createResponse = await createCategory();

      assert.equal(createResponse.status, 201);

      const categoryId = createResponse.body.data._id;

      assert.ok(categoryId);

      const listResponse = await api.get("/api/v1/categories");

      assert.equal(listResponse.status, 200);
      assert.ok(Array.isArray(listResponse.body.data));
      assert.equal(listResponse.body.data.length, 1);

      const getResponse = await api.get(
        `/api/v1/categories/${categoryId}`,
      );

      assert.equal(getResponse.status, 200);
      assert.equal(getResponse.body.data.name, "Food");

      const updateResponse = await api
        .patch(`/api/v1/categories/${categoryId}`)
        .send({ name: "Groceries" });

      assert.equal(updateResponse.status, 200);
      assert.equal(updateResponse.body.data.name, "Groceries");

      const deleteResponse = await api.delete(
        `/api/v1/categories/${categoryId}`,
      );

      assert.equal(deleteResponse.status, 200);

      const missingResponse = await api.get(
        `/api/v1/categories/${categoryId}`,
      );

      assert.equal(missingResponse.status, 404);
    });

    it("should reject duplicate category names", async () => {
      await createCategory("Food");
      const response = await createCategory("Food");

      assert.equal(response.status, 409);
    });

    it("should reject an invalid category type", async () => {
      const response = await createCategory("Invalid", "other");

      assert.equal(response.status, 400);
    });
  });

  describe("Expense authentication and authorization", () => {
    it("should reject expense requests without a token", async () => {
      const response = await api.get("/api/v1/expenses");

      assert.equal(response.status, 401);
    });

    it("should reject invalid JWT tokens", async () => {
      const response = await api
        .get("/api/v1/expenses")
        .set("Authorization", "Bearer invalid-token");

      assert.equal(response.status, 401);
    });
  });

  describe("Expense operations", () => {
    it("should create, retrieve, update and delete an expense", async () => {
      const userResponse = await registerUser();
      const token = userResponse.body.data.token;

      const categoryResponse = await createCategory();
      const categoryId = categoryResponse.body.data._id;

      const createResponse = await api
        .post("/api/v1/expenses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Groceries",
          amount: 1250,
          category: categoryId,
          notes: "Weekly shopping",
        });

      assert.equal(createResponse.status, 201);

      const expenseId = createResponse.body.data._id;

      assert.ok(expenseId);

      const listResponse = await api
        .get("/api/v1/expenses")
        .set("Authorization", `Bearer ${token}`);

      assert.equal(listResponse.status, 200);
      assert.equal(listResponse.body.data.length, 1);

      const getResponse = await api
        .get(`/api/v1/expenses/${expenseId}`)
        .set("Authorization", `Bearer ${token}`);

      assert.equal(getResponse.status, 200);
      assert.equal(getResponse.body.data.title, "Groceries");

      const updateResponse = await api
        .patch(`/api/v1/expenses/${expenseId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 1500 });

      assert.equal(updateResponse.status, 200);
      assert.equal(updateResponse.body.data.amount, 1500);

      const deleteResponse = await api
        .delete(`/api/v1/expenses/${expenseId}`)
        .set("Authorization", `Bearer ${token}`);

      assert.equal(deleteResponse.status, 200);
    });

    it("should prevent one user from accessing another user's expenses", async () => {
      const firstUserResponse = await registerUser("first@example.com");
      const secondUserResponse = await registerUser("second@example.com");

      const firstUserToken = firstUserResponse.body.data.token;
      const secondUserToken = secondUserResponse.body.data.token;

      const categoryResponse = await createCategory();
      const categoryId = categoryResponse.body.data._id;

      const expenseResponse = await api
        .post("/api/v1/expenses")
        .set("Authorization", `Bearer ${firstUserToken}`)
        .send({
          title: "Private expense",
          amount: 500,
          category: categoryId,
        });

      assert.equal(expenseResponse.status, 201);

      const expenseId = expenseResponse.body.data._id;

      const secondUserList = await api
        .get("/api/v1/expenses")
        .set("Authorization", `Bearer ${secondUserToken}`);

      assert.equal(secondUserList.status, 200);
      assert.equal(secondUserList.body.data.length, 0);

      const secondUserGet = await api
        .get(`/api/v1/expenses/${expenseId}`)
        .set("Authorization", `Bearer ${secondUserToken}`);

      assert.equal(secondUserGet.status, 404);
    });
  });
});
