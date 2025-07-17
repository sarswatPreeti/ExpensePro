import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaTags,
  FaRupeeSign,
  FaSearch,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";

const EXPENSE_API = "http://localhost:4000/api/expenses";
const CATEGORY_API = "http://localhost:4000/api/categories";

// Pie chart colors
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF",
  "#FF4F81", "#3DFF92", "#FF6361", "#6B5B95", "#D65076"
];

const CategoriesPage = () => {
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

  // Fetch expenses and categories from API and process them
  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const [expensesRes, categoriesRes] = await Promise.all([
        axios.get(EXPENSE_API),
        axios.get(CATEGORY_API),
      ]);

      const expenses = expensesRes.data;
      const dbCategories = categoriesRes.data;

      // Aggregate total amount and count per category
      const categoryMap = {};

      expenses.forEach((expense) => {
        const category = expense.category || "Uncategorized";
        if (!categoryMap[category]) {
          categoryMap[category] = { total: 0, count: 0 };
        }
        categoryMap[category].total += Number(expense.amount);
        categoryMap[category].count += 1;
      });

      // Convert aggregated object to array
      const stats = Object.entries(categoryMap).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
      }));

      setCategoryStats(stats);

      // Filter custom (unused) categories
      const userCategories = dbCategories.filter(
        (cat) => !stats.find((s) => s.category === cat.name)
      );
      setCustomCategories(userCategories);
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setLoading(false);
    }
  };

  // Call once on component mount
  useEffect(() => {
    fetchCategoryData();
  }, []);

  //Adding a New Category
  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    const allCategories = [...categoryStats.map(c => c.category), ...customCategories.map(c => c.name)];

    if (!trimmed) return alert("Category name cannot be empty.");
    if (allCategories.includes(trimmed)) return alert("Category already exists.");

    try {
      const res = await axios.post(CATEGORY_API, { name: trimmed });
      setCustomCategories((prev) => [...prev, res.data]);
      setNewCategory("");
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Failed to add category.");
    }
  };

  //Deleting a Custom Category
  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`${CATEGORY_API}/${id}`);
      setCustomCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category. Make sure it's not used in any expense.");
    }
  };

  //Viewing Expenses by Category
  const handleCategoryClick = async (category) => {
    try {
      const res = await axios.get(EXPENSE_API);
      const filtered = res.data.filter((exp) => exp.category === category);
      setSelectedCategory(category);
      setCategoryExpenses(filtered);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch expenses for category", err);
      alert("Something went wrong!");
    }
  };

  // Merge stats and custom categories for rendering
  const allStats = [
    ...categoryStats,
    ...customCategories.map(cat => ({
      category: cat.name,
      total: 0,
      count: 0,
      id: cat.id,
      isCustom: true,
    }))
  ];

  // Apply search and sort
  const filteredStats = useMemo(() => {
    let filtered = [...allStats];

    if (search.trim()) {
      filtered = filtered.filter((cat) =>
        cat.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sorting logic
    switch (sortBy) {
      case "amount-desc":
        filtered.sort((a, b) => b.total - a.total);
        break;
      case "amount-asc":
        filtered.sort((a, b) => a.total - b.total);
        break;
      case "count-desc":
        filtered.sort((a, b) => b.count - a.count);
        break;
      case "count-asc":
        filtered.sort((a, b) => a.count - b.count);
        break;
      default:
        break;
    }

    return filtered;
  }, [allStats, search, sortBy]);

  // Format pie chart labels as "Category (xx%)"
  const renderCustomLabel = ({ name, percent }) => {
    return `${name} (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 transition-transform hover:scale-105 mb-10">
        🗂️ Expense Categories Overview
      </h2>

      {/* Add Category Section - Add Category Input and Button */}
      <div className="bg-white p-5 rounded-2xl shadow-lg mb-6 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          placeholder="New category name..."
          className="w-full sm:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg shadow transition-all"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      {/* Filters Section - Search input and Sort dropdown */}
      <div className="bg-white p-5 rounded-2xl shadow border mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category..."
            className="border px-4 py-2 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="amount-desc">Sort by Amount ↓</option>
          <option value="amount-asc">Sort by Amount ↑</option>
          <option value="count-desc">Sort by Count ↓</option>
          <option value="count-asc">Sort by Count ↑</option>
        </select>
      </div>

      {/* Pie Chart Section - Category distribution pie chart */}
      {filteredStats.length > 0 && (
        <div className="mb-12 bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 text-center">💹 Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={filteredStats}
                dataKey="total"
                nameKey="category"
                outerRadius={140}
                labelLine={false}
                label={renderCustomLabel}
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

      {/* Category Cards - Card grid showing each category's stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStats.length === 0 ? (
          <p className="text-gray-500 col-span-full">No categories found.</p>
        ) : (
          filteredStats.map((item, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(item.category)}
              className="bg-white p-6 rounded-2xl border shadow-md hover:shadow-xl transition-all group relative cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <FaTags className="text-blue-500 text-lg group-hover:scale-110 transition-transform" />
                  <h4 className="text-lg font-semibold text-gray-800">{item.category}</h4>
                </div>
                {item.isCustom && (
                  <button
                    onClick={(e) => {e.stopPropagation(); handleDeleteCategory(item.id);}}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Delete category"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Transactions: <span className="font-medium">{item.count}</span>
              </p>
              <p className="text-sm text-gray-700 flex items-center gap-1 mt-1">
                <FaRupeeSign className="text-green-600" />
                <span className="font-bold">{item.total.toFixed(2)}</span>
              </p>
            </div>
          ))
        )}
      </div>

      {/* Expense Modal - Modal showing expenses for a selected category */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl shadow-xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-4 text-2xl text-red-500 hover:text-red-700"
            >
              &times;
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Expenses in: <span className="text-indigo-600">{selectedCategory}</span>
            </h2>

            {/* Expense Table */}
            {categoryExpenses.length === 0 ? (
              <p className="text-gray-500 italic text-center">No expenses found for this category.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm text-left text-gray-700">
                  <thead className="bg-gray-100 text-gray-800 uppercase">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryExpenses.map((exp, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2 font-medium text-green-600">₹{exp.amount}</td>
                        <td className="px-4 py-2">{exp.description || "—"}</td>
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
