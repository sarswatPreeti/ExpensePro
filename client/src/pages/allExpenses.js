import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import {
  FaRupeeSign,
  FaCalendarAlt,
  FaTags,
  FaStickyNote,
  FaSearch,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

const API = "http://localhost:4000/api/expenses";

const AllExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const debouncedUpdate = useMemo(
    () => debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < lastScrollY) {
        setShowFilterBar(true); // scrolling up
      } else if (currentY > lastScrollY + 30) {
        setShowFilterBar(false); // scrolling down
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    const searchTerm = debouncedSearch.toLowerCase();

    return expenses.filter((expense) => {
      const dateObj = new Date(expense.date);
      const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString("default", {
        month: "long",
      })} ${dateObj.getFullYear()}`.toLowerCase();

      const content = `${expense.title} ${expense.category} ${expense.description || ""} ${formattedDate}`.toLowerCase();

      const matchesSearch = content.includes(searchTerm);
      const matchesCategory = selectedCategory === "All" || expense.category === selectedCategory;
      const matchesStartDate = !startDate || new Date(expense.date) >= new Date(startDate);
      const matchesEndDate = !endDate || new Date(expense.date) <= new Date(endDate);
      const matchesMinAmount = !minAmount || expense.amount >= parseFloat(minAmount);

      return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate && matchesMinAmount;
    });
  }, [debouncedSearch, expenses, selectedCategory, startDate, endDate, minAmount]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      setExpenses(expenses.filter((exp) => exp.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({ ...expense });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`${API}/${editingId}`, editForm);
      setExpenses(expenses.map((exp) => (exp.id === editingId ? res.data : exp)));
      window.scrollTo({ top: 0, behavior: "smooth" });
      handleCancel();
    } catch (err) {
      console.error("Failed to update", err);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setSelectedCategory("All");
    setMinAmount("");
  };

  const uniqueCategories = Array.from(new Set(expenses.map((e) => e.category)));

 return (
  <div className="p-6 max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold text-gray-800 transition-transform hover:scale-105 mb-10">📊 All Expenses</h2>

    {loading && (
      <div className="mb-4 text-blue-500 font-medium animate-pulse text-center">
        Loading expenses...
      </div>
    )}

    {/* Filters Card */}
    <div className="h overflow-hidden">
      <div
        className={`bg-white p-6 rounded-xl shadow-md mb-8 border transition-all duration-500 delay-75 ease-in-out sticky top-4 z-50 transform ${
          showFilterBar
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-5 pointer-events-none"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">🔍 Filter Expenses</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="flex flex-col transition-all duration-300">
            <label htmlFor="search" className="text-sm font-medium text-gray-600 mb-1">
              Search by title, description, category, or date
            </label>
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-500 group-hover:scale-110 transition duration-200" />
              <input
                id="search"
                type="text"
                placeholder="e.g. groceries, rent, travel..."
                className="w-full px-3 py-2 border rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                title="Search expenses by keyword"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col transition-all duration-300">
            <label htmlFor="category" className="text-sm font-medium text-gray-600 mb-1">
              Filter by Category
            </label>
            <select
              id="category"
              className="w-full px-3 py-2 border rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              title="Select a specific category to filter"
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Min Amount */}
          <div className="flex flex-col transition-all duration-300">
            <label htmlFor="minAmount" className="text-sm font-medium text-gray-600 mb-1">
              Minimum Amount (₹)
            </label>
            <input
              id="minAmount"
              type="number"
              placeholder="e.g. 500"
              className="w-full px-3 py-2 border rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              title="Show expenses greater than or equal to this amount"
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col transition-all duration-300">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              className="w-full px-3 py-2 border rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Show expenses from this date onward"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col transition-all duration-300">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-600 mb-1">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              className="w-full px-3 py-2 border rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Show expenses up to this date"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end transition-all duration-300">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm font-medium bg-gray-100 border rounded-md hover:bg-gray-200 hover:scale-[1.02] transition-transform duration-200 "
              title="Reset all filters"
            >
              🔄 Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Expenses List */}
    <div className="space-y-5">
      {filteredExpenses.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="text-2xl mb-2">😕</p>
          <p>No expenses found matching your filters.</p>
        </div>
      ) : (
        filteredExpenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white border-l-4 border-blue-500 shadow-sm hover:shadow-md transition rounded-xl p-6 animate-fade-in"
          >
            {editingId === expense.id ? (
              <>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full mb-2 border px-2 py-1 rounded"
                />
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full mb-2 border px-2 py-1 rounded"
                />
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full mb-2 border px-2 py-1 rounded"
                />
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full mb-2 border px-2 py-1 rounded"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full mb-2 border px-2 py-1 rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    title="Save changes"
                  >
                    <FaSave /> Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-600 flex items-center gap-1"
                    title="Cancel editing"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{expense.title}</h3>
                  <p className="text-blue-600 font-bold flex items-center gap-1">
                    <FaRupeeSign />
                    {expense.amount}
                  </p>
                </div>
                <div className="text-sm text-gray-600 flex gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <FaTags className="text-gray-400" />
                    {expense.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="text-gray-400" />
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
                {expense.description && (
                  <div className="mt-3 text-gray-700 text-sm flex items-start gap-2 group relative">
                    <FaStickyNote className="mt-0.5 text-gray-400" />
                    <p className="truncate max-w-md group-hover:whitespace-normal">
                      {expense.description}
                    </p>
                  </div>
                )}
                <div className="mt-4 flex gap-4 text-sm">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-yellow-500 hover:text-yellow-600 flex items-center gap-1"
                      title="Edit this expense"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-600 flex items-center gap-1"
                      title="Delete this expense"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

};

export default AllExpenses;
