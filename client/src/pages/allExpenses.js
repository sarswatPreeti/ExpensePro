import { useEffect, useState, useMemo, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";
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
  FaFileInvoice, 
  FaPlus,
  FaCreditCard
} from "react-icons/fa";
import { Link } from "react-router-dom"; 

const AllExpenses = () => {
  const { isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("All");
  const [loading, setLoading] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const debouncedUpdate = useMemo(
    () => debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  const expensesContainerRef = useRef(null);

  const fetchExpenses = async () => {
    if (!isAuthenticated()) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [isAuthenticated]);

  useEffect(() => {
    debouncedUpdate(search);
  }, [search, debouncedUpdate]);

  const filteredExpenses = useMemo(() => {
    const searchTerm = debouncedSearch.toLowerCase();

    return expenses.filter((expense) => {
      const dateObj = new Date(expense.date);

      const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString("default", {
        month: "long",
      })} ${dateObj.getFullYear()}`.toLowerCase();

      const content = `${expense.title} ${expense.category?.name || ""} ${expense.description || ""} ${formattedDate}`.toLowerCase();
      const matchesSearch = content.includes(searchTerm);

      const matchesCategory = selectedCategory === "All" || expense.category?.name === selectedCategory;

      const matchesStartDate = !startDate || new Date(expense.date) >= new Date(startDate);
      const matchesEndDate = !endDate || new Date(expense.date) <= new Date(endDate);
      const matchesMinAmount = !minAmount || expense.amount >= parseFloat(minAmount);

      const matchesPaymentMethod =
        selectedPaymentMethod === "All" || expense.paymentMethod === selectedPaymentMethod;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStartDate &&
        matchesEndDate &&
        matchesMinAmount &&
        matchesPaymentMethod
      );
    });
  }, [debouncedSearch, expenses, selectedCategory, startDate, endDate, minAmount, selectedPaymentMethod]);

  useEffect(() => {
    const checkScrollable = () => {
      if (expensesContainerRef.current) {
        const containerHeight = expensesContainerRef.current.scrollHeight;
        const viewportHeight = window.innerHeight;
        setIsScrollable(containerHeight > viewportHeight);
      }
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [filteredExpenses]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (!isScrollable) {
        setShowFilterBar(true);
      } else if (currentY < lastScrollY) {
        setShowFilterBar(true);
      } else if (currentY > lastScrollY + 30) {
        setShowFilterBar(false);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isScrollable]);

  const handleDelete = async (id) => {
    console.log("Delete button clicked for expense ID:", id, "Type:", typeof id);
    const confirmed = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmed) return;
    
    try {
      setDeletingId(Number(id));
      console.log("Making DELETE request to:", `/expenses/${id}`);
      const res = await axiosInstance.delete(`/expenses/${id}`);
      
      console.log("Delete response:", res);
      if (res.status >= 200 && res.status < 300) {
        console.log("Expense deleted successfully, updating state");
        setExpenses((prev) => {
          const filtered = prev.filter((exp) => String(exp.id) !== String(id));
          console.log("Filtered expenses:", filtered.length, "Original:", prev.length);
          return filtered;
        });
        console.log("Expense deleted successfully");
      } else {
        console.error("Delete failed with status:", res.status);
        alert("Failed to delete expense. Please try again.");
      }
    } catch (err) {
      console.error("Failed to delete expense:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
        console.error("Error headers:", err.response.headers);
      }
      alert("Failed to delete expense. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({ ...expense, category: expense.category?.name || "" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
      const res = await axiosInstance.put(`/expenses/${editingId}`, editForm);
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
    setSelectedPaymentMethod("All");
    setMinAmount("");
  };

  const uniqueCategories = Array.from(new Set(expenses.map((e) => e.category?.name)));

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen transition-all duration-300">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 transition-transform hover:scale-105 mb-6 sm:mb-8 md:mb-10">📊 All Expenses</h2>

      {loading && (
        <div className="mb-4 text-blue-500 font-medium animate-pulse text-center text-sm sm:text-base">
          Loading expenses...
        </div>
      )}

      <div className="sticky top-4 z-50 mb-4">
        <div
          className={`transition-all duration-300 ease-in-out ${
            showFilterBar
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-3 pointer-events-none"
          }`}
        >
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 sm:mb-4">🔍 Filter Expenses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex flex-col transition-all duration-300">
                <label htmlFor="search" className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Search by title, description, category, or date
                </label>
                <div className="flex items-center gap-2">
                  <FaSearch className="text-gray-500 dark:text-gray-400 group-hover:scale-110 transition duration-200 text-sm sm:text-base" />
                  <input
                    id="search"
                    type="text"
                    placeholder="e.g. groceries, rent, travel..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-blue-400 dark:focus:border-blue-300 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm text-sm sm:text-base"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    title="Search expenses by keyword"
                  />
                </div>
              </div>

              <div className="flex flex-col transition-all duration-300">
                <label htmlFor="category" className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Filter by Category
                </label>
                <select
                  id="category"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-blue-400 dark:focus:border-blue-300 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm text-sm sm:text-base"
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

              <div className="flex flex-col transition-all duration-300">
                <label htmlFor="paymentMethod" className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-blue-400 dark:focus:border-blue-300 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm text-sm sm:text-base"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  title="Filter by payment method"
                >
                  <option value="All">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Paytm">Paytm</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="GPay">GPay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div className="flex flex-col transition-all duration-300">
                <label htmlFor="minAmount" className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Minimum Amount (₹)
                </label>
                <input
                  id="minAmount"
                  type="number"
                  placeholder="e.g. 500"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-blue-400 dark:focus:border-blue-300 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm text-sm sm:text-base"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  title="Show expenses greater than or equal to this amount"
                />
              </div>

              <div className="flex flex-col transition-all duration-300">
                <label htmlFor="startDate" className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-blue-400 dark:focus:border-blue-300 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm text-sm sm:text-base"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  title="Show expenses from this date onward"
                />
              </div>

              <div className="flex flex-col transition-all duration-300">
                <label htmlFor="endDate" className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-blue-400 dark:focus:border-blue-300 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm text-sm sm:text-base"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  title="Show expenses up to this date"
                />
              </div>

              <div className="flex items-end transition-all duration-300">
                <button
                  onClick={clearFilters}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-[1.02] transition-all duration-300"
                  title="Reset all filters"
                >
                  🔄 Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!showFilterBar && <div style={{ height: "132px" }} aria-hidden="true" />}

      <div ref={expensesContainerRef} className="space-y-3 sm:space-y-4 md:space-y-5">
        {filteredExpenses.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6 sm:py-8">
            <p className="text-xl sm:text-2xl mb-2">😕</p>
            <p className="text-sm sm:text-base">No expenses found matching your filters.</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-400 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 animate-fade-in"
            >
              {editingId === expense.id ? (
                <>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded transition-all duration-300 text-sm sm:text-base"
                  />
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded transition-all duration-300 text-sm sm:text-base"
                  />
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded transition-all duration-300 text-sm sm:text-base"
                  />
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded transition-all duration-300 text-sm sm:text-base"
                  />
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded transition-all duration-300 text-sm sm:text-base"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Payment Method</label>
                      <select
                        className="w-full px-2 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded transition-all duration-300 text-sm sm:text-base"
                        value={editForm.paymentMethod || "Cash"}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditForm((prev) => ({
                            ...prev,
                            paymentMethod: value,
                            cardLast4: value.includes("Card") ? (prev.cardLast4 || "") : null,
                          }));
                        }}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Paytm">Paytm</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="GPay">GPay</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="Credit Card">Credit Card</option>
                      </select>
                    </div>

                    {(editForm.paymentMethod === "Credit Card" || editForm.paymentMethod === "Debit Card") && (
                      <div className="flex flex-col">
                        <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Card Last 4</label>
                        <input
                          type="text"
                          maxLength={4}
                          inputMode="numeric"
                          className="w-full px-2 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded transition-all duration-300 text-sm sm:text-base"
                          value={editForm.cardLast4 || ""}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setEditForm((prev) => ({ ...prev, cardLast4: digits }));
                          }}
                          placeholder="1234"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSave}
                      className="px-2 sm:px-3 py-1 sm:py-1 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 transition-all duration-300 text-xs sm:text-sm flex items-center gap-1"
                    >
                      <FaSave className="text-xs sm:text-sm" /> Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-2 sm:px-3 py-1 sm:py-1 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 text-xs sm:text-sm flex items-center gap-1"
                    >
                      <FaTimes className="text-xs sm:text-sm" /> Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-lg sm:text-xl font-semibold mb-2 flex items-center justify-between text-gray-800 dark:text-gray-100">
                    <span className="truncate">{expense.title}</span>
                    {expense.invoice ? (
                      <Link
                        to={`/invoice/${expense.id}`}
                        className="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-xs flex items-center gap-1 transition-all duration-300 whitespace-nowrap"
                        title="See Invoice"
                      >
                        <FaFileInvoice className="text-xs" /> <span className="hidden sm:inline">See Invoice</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/edit-invoice/${expense.id}`}
                        className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 text-xs flex items-center gap-1 transition-all duration-300 whitespace-nowrap"
                        title="Add Invoice"
                      >
                        <FaPlus className="text-xs" /> <span className="hidden sm:inline">Add Invoice</span>
                      </Link>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <p className="flex items-center gap-2 text-base sm:text-lg font-medium text-green-700 dark:text-green-400">
                      <FaRupeeSign className="text-gray-400 dark:text-gray-300 text-sm sm:text-base" /> {expense.amount}
                    </p>
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                      <FaCalendarAlt className="text-gray-400 dark:text-gray-300 text-sm sm:text-base" /> {new Date(expense.date).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">
                      <FaTags className="text-gray-400 dark:text-gray-300 text-sm sm:text-base" /> {expense.category?.name || "No Category"}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Payment:</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {expense.paymentMethod}
                      </span>
                      {(expense.paymentMethod === "Credit Card" || expense.paymentMethod === "Debit Card") && expense.cardLast4 && (
                        <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm flex items-center gap-1">
                          <FaCreditCard className="text-gray-400 dark:text-gray-300 text-xs sm:text-sm" /> **** {expense.cardLast4}
                        </span>
                      )}
                    </div>
                    {expense.description && (
                      <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base col-span-1 sm:col-span-2">
                        <FaStickyNote className="text-gray-400 dark:text-gray-300 text-sm sm:text-base flex-shrink-0" /> 
                        <span className="truncate">{expense.description}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="px-2 sm:px-3 py-1 sm:py-1 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-1 shadow-sm transition-all duration-300 text-xs sm:text-sm"
                    >
                      <FaEdit className="text-xs sm:text-sm" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === Number(expense.id)}
                      className={`px-2 sm:px-3 py-1 sm:py-1 rounded flex items-center gap-1 shadow-sm text-white transition-all duration-300 text-xs sm:text-sm ${
                        deletingId === Number(expense.id) 
                          ? "bg-red-300 dark:bg-red-600 cursor-not-allowed" 
                          : "bg-red-500 dark:bg-red-700 hover:bg-red-600 dark:hover:bg-red-800"
                      }`}
                    >
                      <FaTrash className="text-xs sm:text-sm" /> {deletingId === Number(expense.id) ? "Deleting..." : "Delete"}
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