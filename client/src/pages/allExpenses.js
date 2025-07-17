import { useEffect, useState, useMemo, useRef } from "react";
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
  FaFileInvoice, 
  FaPlus
} from "react-icons/fa";
import { Link } from "react-router-dom"; 

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
  const [isScrollable, setIsScrollable] = useState(false);

  // Debounce the search input to limit updates — delays setting debouncedSearch by 300ms after typing stops
  const debouncedUpdate = useMemo(
    () => debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  // Ref to access the DOM element that contains the list of expenses (used for scrolling or measurements)
  const expensesContainerRef = useRef(null);

  // Async function to fetch all expenses from the API and update state
  const fetchExpenses = async () => {
    try {
      setLoading(true); // Show loading spinner while fetching
      const res = await axios.get(API);
      setExpenses(res.data); // Update state with fetched expenses
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch expenses once when the component mounts
  useEffect(() => {
    fetchExpenses();
  }, []);

  //useMemo to efficiently compute filtered expenses based on search input, category, date range, and minimum amount
  const filteredExpenses = useMemo(() => {
    const searchTerm = debouncedSearch.toLowerCase(); // Convert search term to lowercase for case-insensitive matching

    return expenses.filter((expense) => {
      const dateObj = new Date(expense.date);

      // Format date as "Day Month Year", e.g., "15 July 2025"
      const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString("default", {
        month: "long",
      })} ${dateObj.getFullYear()}`.toLowerCase();

      // Combine searchable fields (title, category, description, formatted date)
      const content = `${expense.title} ${expense.category} ${expense.description || ""} ${formattedDate}`.toLowerCase();

      // Check if search term exists in any field
      const matchesSearch = content.includes(searchTerm); 

      // Filter by selected category (or show all)
      const matchesCategory = selectedCategory === "All" || expense.category === selectedCategory;

      // Filter by start date or end date (if any)
      const matchesStartDate = !startDate || new Date(expense.date) >= new Date(startDate);
      const matchesEndDate = !endDate || new Date(expense.date) <= new Date(endDate);

      // Filter by minimum amount (if any)
      const matchesMinAmount = !minAmount || expense.amount >= parseFloat(minAmount);

      // Return true only if all conditions match
      return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate && matchesMinAmount;
    });
  }, [debouncedSearch, expenses, selectedCategory, startDate, endDate, minAmount]);

  useEffect(() => {
    // Define a function to check if the container content is scrollable
    const checkScrollable = () => {
      if (expensesContainerRef.current) {
        // Total height of content inside the container
        const containerHeight = expensesContainerRef.current.scrollHeight;

        // Height of the visible part of the browser window
        const viewportHeight = window.innerHeight;

        // If container content is taller than viewport, mark it scrollable
        setIsScrollable(containerHeight > viewportHeight);
      }
    };

    checkScrollable(); // Initial check on mount

    // Re-check scrollability when the window is resized
    window.addEventListener("resize", checkScrollable);

    // Clean up the event listener when the component unmounts or dependencies change
    return () => window.removeEventListener("resize", checkScrollable);
  }, [filteredExpenses]); // Re-run when filtered list changes

  useEffect(() => {
    // Function to handle scroll behavior
    const handleScroll = () => {
      const currentY = window.scrollY; // Get current vertical scroll position

      if (!isScrollable) {
        setShowFilterBar(true); // Always show filter bar if content is not scrollable
      } else if (currentY < lastScrollY) {
        setShowFilterBar(true); // Show filter bar when scrolling up
      } else if (currentY > lastScrollY + 30) {
        setShowFilterBar(false); // Hide filter bar if scrolled down more than 30px
      }

      setLastScrollY(currentY); // Update last scroll position
    };

    window.addEventListener("scroll", handleScroll); // Attach scroll listener on mount
    return () => window.removeEventListener("scroll", handleScroll); // Clean up listener on unmount
  }, [lastScrollY, isScrollable]); // Run effect when scrollability or scroll position changes

  // Deletes an expense by ID from the server and updates the local state
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);

      // Update local state to remove the deleted expense from the list
      setExpenses(expenses.filter((exp) => exp.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  // Initiates editing mode for a selected expense
  const handleEdit = (expense) => {
    setEditingId(expense.id); // Set the ID of the expense being edited
    setEditForm({ ...expense }); // Populate the form with the selected expense's current data
  };

  // Cancels the edit mode and resets the form
  const handleCancel = () => {
    setEditingId(null); // Clear the ID of the currently edited expense
    setEditForm({}); // Reset the edit form to an empty object
  };

  // Saves the edited expense to the backend and updates the UI
  const handleSave = async () => {
    try {
      const res = await axios.put(`${API}/${editingId}`, editForm);

      // Update the local expenses state with the edited expense
      setExpenses(expenses.map((exp) => (exp.id === editingId ? res.data : exp)));

      window.scrollTo({ top: 0, behavior: "smooth" }); // Smoothly scroll to the top of the page
      handleCancel(); // Exit edit mode and reset form
    } catch (err) {
      console.error("Failed to update", err);
    }
  };

  // Clears all filter values and resets to default
  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setSelectedCategory("All");
    setMinAmount("");
  };

  // Extracts unique category names from the list of expenses
  const uniqueCategories = Array.from(new Set(expenses.map((e) => e.category)));

  /* 
    Main “All Expenses” page UI
    - Shows heading, loading indicator, and filter panel (search, category, amount, dates, clear)
    - Keeps filter bar sticky / auto‑hiding on scroll
    - Lists filtered expenses with edit / delete / invoice actions
    - Supports in‑place editing of an expense
  */

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Title - Displays the page title with animation on hover */}
      <h2 className="text-3xl font-bold text-gray-800 transition-transform hover:scale-105 mb-10">📊 All Expenses</h2>

      {/* Loading Indicator - Shown while expenses data is being fetched */}
      {loading && (
        <div className="mb-4 text-blue-500 font-medium animate-pulse text-center">
          Loading expenses...
        </div>
      )}

      {/* Filters Card - This entire block appears as a sticky filter bar that can be toggled */}
      <div className="sticky top-4 z-50 mb-4">
         {/* Toggle animation for showing/hiding the filter bar */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            showFilterBar
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-3 pointer-events-none"
          }`}
        >
          {/* Filter Card Container */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            {/* Filters Title */}
            <h3 className="text-lg font-semibold text-gray-700 mb-4">🔍 Filter Expenses</h3>

            {/* Filters Grid - Responsive grid of filter inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Search field allows filtering based on title, description, category, or date */}
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
                    onChange={(e) => setSearch(e.target.value)} // update search state on input
                    title="Search expenses by keyword"
                  />
                </div>
              </div>

              {/* Category Dropdown - Filters expenses by selected category */}
              <div className="flex flex-col transition-all duration-300">
                <label htmlFor="category" className="text-sm font-medium text-gray-600 mb-1">
                  Filter by Category
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)} // update category filter
                  title="Select a specific category to filter"
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat}>{cat}</option> // render each unique category
                  ))}
                </select>
              </div>

              {/* Min Amount - Filter to show only expenses above a certain amount */}
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
                  onChange={(e) => setMinAmount(e.target.value)} // update minAmount filter
                  title="Show expenses greater than or equal to this amount"
                />
              </div>

              {/* Start Date - Filters expenses from a given starting date */}
              <div className="flex flex-col transition-all duration-300">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="w-full px-3 py-2 border rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} // update start date filter
                  title="Show expenses from this date onward"
                />
              </div>

              {/* End Date - Filters expenses up to a specific end date */}
              <div className="flex flex-col transition-all duration-300">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="w-full px-3 py-2 border rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} // update end date filter
                  title="Show expenses up to this date"
                />
              </div>

              {/* Clear Filters Button - Resets all filter inputs and shows full list */}
              <div className="flex items-end transition-all duration-300">
                <button
                  onClick={clearFilters} // Clear all filters
                  className="w-full px-4 py-2 text-sm font-medium bg-gray-100 border rounded-md hover:bg-gray-200 hover:scale-[1.02] transition-transform duration-200"
                  title="Reset all filters"
                >
                  🔄 Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer Element - Adds space when filter bar is hidden to maintain layout */}
      {!showFilterBar && (
        <div style={{ height: "132px" }} aria-hidden="true" />
      )}

      {/* Expenses List */}
      <div ref={expensesContainerRef} className="space-y-5">
        {filteredExpenses.length === 0 ? (
          // Empty State
          <div className="text-center text-gray-500 py-8">
            <p className="text-2xl mb-2">😕</p>
            <p>No expenses found matching your filters.</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            // List of Filtered Expenses
            <div
              key={expense.id}
              className="bg-white border-l-4 border-blue-500 shadow-sm hover:shadow-md transition rounded-xl p-6 animate-fade-in"
            >
              {editingId === expense.id ? (
                // If in Edit Mode
                <>
                  {/* Editable Fields for title, amount, etc. */}
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
                    {/* Save Button */}
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                      title="Save changes"
                    >
                      <FaSave /> Save
                    </button>

                    {/* Cancel Button */}
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
                  {/*  Expense Display View */}
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{expense.title}</h3>
                    <p className="text-blue-600 font-bold flex items-center gap-1">
                      <FaRupeeSign />
                      {expense.amount}
                    </p>
                  </div>

                  {/* Category and Date Info */}
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

                  {/* Optional Description */}
                  {expense.description && (
                    <div className="mt-3 text-gray-700 text-sm flex items-start gap-2 group relative">
                      <FaStickyNote className="mt-0.5 text-gray-400" />
                      <p className="truncate max-w-md group-hover:whitespace-normal">
                        {expense.description}
                      </p>
                    </div>
                  )}

                  {/* Actions: Edit / Delete / Invoice */}
                  <div className="mt-4 flex gap-4 text-sm">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-yellow-500 hover:text-yellow-600 flex items-center gap-1"
                      title="Edit this expense"
                    >
                      <FaEdit /> Edit
                    </button>
                    
                    {/* Delete Button*/}
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-600 flex items-center gap-1"
                      title="Delete this expense"
                    >
                      <FaTrash /> Delete
                    </button>

                    {/* Conditionally show invoice link or add-invoice */}
                    {expense.invoice && expense.invoice !== "null" && expense.invoice !== "undefined" && expense.invoice.trim() !== "" ? (
                      <Link
                        to={`/invoice/${expense.id}`}
                        className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                        title="View Invoice"
                      >
                        <FaFileInvoice /> See Invoice
                      </Link>
                    ) : (
                      <Link
                        to={`/edit-invoice/${expense.id}`}
                        className="text-green-600 hover:text-green-700 flex items-center gap-1"
                        title="Add Invoice"
                      >
                        <FaPlus /> Add Invoice
                      </Link>
                    )}
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
