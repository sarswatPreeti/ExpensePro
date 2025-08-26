import { useEffect, useState, useMemo, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";
import { FaTags, FaRupeeSign, FaSearch, FaPlus, FaTrash } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Pie chart colors
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF",
  "#FF4F81", "#3DFF92", "#FF6361", "#6B5B95", "#D65076"
];

const CategoriesPage = () => {
  const { isAuthenticated } = useAuth();

  // State variables
  const [categoryStats, setCategoryStats] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("amount-desc");
  const [newCategory, setNewCategory] = useState("");
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch expenses and categories
  const fetchCategoryData = useCallback(async () => {
  if (!isAuthenticated()) return;

  try {
    setLoading(true);
    const [expensesRes, categoriesRes] = await Promise.all([
      axiosInstance.get("/expenses"),
      axiosInstance.get("/categories"),
    ]);

    const expenses = expensesRes.data;
    const dbCategories = categoriesRes.data;

    const categoryMap = {};
    expenses.forEach((expense) => {
      let categoryValue = null;
      // Handle both alias cases from backend and legacy data shapes
      if (expense.category && typeof expense.category === "object" && typeof expense.category.name === "string") {
        categoryValue = expense.category.name;
      } else if (expense.Category && typeof expense.Category.name === "string") {
        categoryValue = expense.Category.name;
      } else if (typeof expense.category === "string") {
        categoryValue = expense.category;
      }

      if (!categoryValue) return;

      const key = String(categoryValue);
      if (!categoryMap[key]) categoryMap[key] = { total: 0, count: 0 };
      categoryMap[key].total += Number(expense.amount);
      categoryMap[key].count += 1;
    });

    const stats = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
    }));

    setCategoryStats(stats);

    // Only keep categories not in stats (case-insensitive match)
    const userCategories = dbCategories.filter((cat) => {
      const catName = String(cat.name).toLowerCase();
      return !stats.find((s) => String(s.category).toLowerCase() === catName);
    });
    setCustomCategories(userCategories);

  } catch (error) {
    console.error("Failed to load categories", error);
  } finally {
    setLoading(false);
  }
}, [isAuthenticated]);


  useEffect(() => {
    fetchCategoryData();
  }, [isAuthenticated, fetchCategoryData]);

  // Add new category
  const handleAddCategory = async () => {
    if (!isAuthenticated()) return;

    const trimmed = newCategory.trim();
    const allCategories = [
      ...categoryStats.map(c => c.category),
      ...customCategories.map(c => c.name)
    ];

    if (!trimmed) return alert("Category name cannot be empty.");
    const exists = allCategories.some((n) => String(n).toLowerCase() === trimmed.toLowerCase());
    if (exists) return alert("Category already exists.");

    try {
      await axiosInstance.post("/categories/add", { name: trimmed });
      setNewCategory("");
      fetchCategoryData();
    } catch (error) {
      console.error("Failed to add category:", error);
      alert("Failed to add category.");
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    try {
      await axiosInstance.delete(`/categories/${id}`);
      fetchCategoryData();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category. Make sure it's not used in any expense.");
    }
  };

  // Show expenses by category
  const handleCategoryClick = async (category) => {
    try {
      const res = await axiosInstance.get("/expenses");
      const filtered = res.data.filter((exp) => {
        const nameFromObj = exp.category?.name || exp.Category?.name;
        if (nameFromObj) return nameFromObj === category;
        if (typeof exp.category === "string") return exp.category === category;
        return false;
      });
      setSelectedCategory(category);
      setCategoryExpenses(filtered);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch expenses for category", err);
      alert("Something went wrong!");
    }
  };

  // Merge stats and custom categories & apply search/sort
  const filteredStats = useMemo(() => {
    const allStats = [
      ...categoryStats.map(stat => ({
        category: stat.category,
        total: stat.total,
        count: stat.count,
      })),
      ...customCategories.map(cat => ({
        category: cat.name,
        total: 0,
        count: 0,
        id: cat.id,
        isCustom: true,
      }))
    ];

    let filtered = [...allStats];
    if (search.trim()) {
      filtered = filtered.filter((cat) =>
        cat.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sortBy) {
      case "amount-desc": filtered.sort((a, b) => b.total - a.total); break;
      case "amount-asc": filtered.sort((a, b) => a.total - b.total); break;
      case "count-desc": filtered.sort((a, b) => b.count - a.count); break;
      case "count-asc": filtered.sort((a, b) => a.count - b.count); break;
      default: break;
    }

    return filtered;
  }, [categoryStats, customCategories, search, sortBy]);

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen transition-all duration-300">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 transition-transform hover:scale-105 mb-6 sm:mb-8 md:mb-10">
        🗂️ Expense Categories Overview
      </h2>

      {/* Add Category */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg mb-4 sm:mb-6 flex flex-col sm:flex-row items-center gap-3 transition-all duration-300">
        <input
          type="text"
          placeholder="New category name..."
          className="w-full sm:w-64 px-3 sm:px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 text-sm sm:text-base"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg shadow transition-all text-sm sm:text-base"
        >
          <FaPlus className="text-sm sm:text-base" /> Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl shadow border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8 md:mb-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 transition-all duration-300">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FaSearch className="text-gray-400 dark:text-gray-500 text-sm sm:text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category..."
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 sm:px-4 py-2 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 transition-all duration-300 text-sm sm:text-base"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 transition-all duration-300 text-sm sm:text-base"
        >
          <option value="amount-desc">Sort by Amount ↓</option>
          <option value="amount-asc">Sort by Amount ↑</option>
          <option value="count-desc">Sort by Count ↓</option>
          <option value="count-asc">Sort by Count ↑</option>
        </select>
      </div>

      {/* Pie Chart */}
      {filteredStats.length > 0 && (
        <div className="mb-8 sm:mb-10 md:mb-12 bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg transition-all duration-300">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-center text-gray-800 dark:text-gray-100">💹 Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={300} className="sm:h-[350px] md:h-[400px]">
            <PieChart>
              <Pie
                data={filteredStats}
                dataKey="total"
                nameKey="category"
                outerRadius={80}
                className="sm:outerRadius-[100px] md:outerRadius-[140px]"
                labelLine={false}
                label={(entry) => `${entry.category} (${(entry.percent * 100).toFixed(0)}%)`}
              >
                {filteredStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filteredStats.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 col-span-full text-sm sm:text-base text-center">No categories found.</p>
        ) : (
          filteredStats.map((item, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(item.category)}
              className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 group relative cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaTags className="text-blue-500 dark:text-blue-400 text-base sm:text-lg group-hover:scale-110 transition-transform" />
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{item.category}</h4>
                </div>
                {item.isCustom && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(item.id); }}
                    className="text-red-500 hover:text-red-700 transition text-sm sm:text-base"
                    title="Delete category"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Transactions: <span className="font-medium">{item.count}</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1 mt-1">
                <FaRupeeSign className="text-green-600 dark:text-green-400 text-xs sm:text-sm" />
                <span className="font-bold">{item.total.toFixed(2)}</span>
              </p>
            </div>
          ))
        )}
      </div>

      {/* Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl sm:max-w-3xl max-h-[80vh] overflow-y-auto rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 md:p-6 relative transition-all duration-300">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 sm:right-4 text-xl sm:text-2xl text-red-500 hover:text-red-700"
            >
              &times;
            </button>

            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center text-gray-800 dark:text-gray-100">
              Expenses in: <span className="text-indigo-600 dark:text-indigo-400">{selectedCategory}</span>
            </h2>

            {categoryExpenses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic text-center text-sm sm:text-base">No expenses found for this category.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 dark:border-gray-600 text-xs sm:text-sm text-left text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 uppercase">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Date</th>
                      <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Amount</th>
                      <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryExpenses.map((exp, i) => (
                      <tr key={i} className="border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300">
                        <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="px-2 sm:px-4 py-2 font-medium text-green-600 dark:text-green-400 text-xs sm:text-sm">₹{exp.amount}</td>
                        <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm truncate">{exp.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
