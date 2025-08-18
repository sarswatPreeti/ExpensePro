// client/src/api/api.js
import axiosInstance from "./axiosInstance";

// -------- AUTH --------
export const signupUser = (data) => axiosInstance.post("/auth/signup", data);
export const loginUser = (data) => axiosInstance.post("/auth/login", data);
export const getProfile = () => axiosInstance.get("/auth/profile");

// -------- EXPENSES --------
export const getExpenses = () => axiosInstance.get("/expenses");
export const getExpenseById = (id) => axiosInstance.get(`/expenses/${id}`);

// ✅ handle FormData uploads (auto sets multipart/form-data)
export const createExpense = (data) =>
  axiosInstance.post("/expenses", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateExpense = (id, data) =>
  axiosInstance.put(`/expenses/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteExpense = (id) =>
  axiosInstance.delete(`/expenses/${id}`);

// -------- CATEGORIES --------
export const getCategories = () => axiosInstance.get("/categories");
export const createCategory = (data) =>
  axiosInstance.post("/categories", data);
export const deleteCategory = (id) =>
  axiosInstance.delete(`/categories/${id}`);
