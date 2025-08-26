import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";
import {
  FaFileDownload,
  FaEye,
  FaFilePdf,
  FaImage,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const Invoices = () => {
    const { isAuthenticated } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });

    useEffect(() => {
        // Fetch and filter expenses with invoices on component mount
        const fetchInvoices = async () => {
        if (!isAuthenticated()) return;
        
        try {
            
            // Send GET request to fetch all expenses
            const res = await axiosInstance.get("/expenses");

            // Filter out expenses that have an invoice attached
            const withInvoices = res.data.filter((expense) => expense.invoice);

            // Set the invoices state with filtered results
            setInvoices(withInvoices);

            // Set the filtered state (used for searching/filtering UI)
            setFiltered(withInvoices);

            // Extract unique categories from the expenses with invoices
            const getCategoryName = (e) => e.category?.name || e.Category?.name || (typeof e.category === "string" ? e.category : "Uncategorized");
            const allCategories = [...new Set(withInvoices.map((e) => getCategoryName(e)))];

            // Update categories state with the unique list
            setCategories(allCategories);
        } catch (err) {
            console.error("Failed to fetch invoices:", err);
        } finally {
            // Regardless of success or failure, stop the loading spinner
            setLoading(false);
        }
        };

        fetchInvoices();
    }, [isAuthenticated]);

    useEffect(() => {
        //Filters the invoices list based on search term, selected category, and date range, and updates the filtered state.

        let result = invoices; // Start with all invoices

        // Filter by search term (title, category, or amount)
        if (search) {
            const term = search.toLowerCase();
            result = result.filter(
                (e) =>
                e.title.toLowerCase().includes(term) ||
                (e.category?.name || e.Category?.name || (typeof e.category === "string" ? e.category : "")).toLowerCase().includes(term) ||
                e.amount.toString().includes(term)
            );
        }

        // Filter by selected category
        if (selectedCategory) {
            result = result.filter((e) => (e.category?.name || e.Category?.name || (typeof e.category === "string" ? e.category : "")) === selectedCategory);
        }

        // Filter by date range (from - to)
        if (dateRange.from && dateRange.to) {
            const fromDate = new Date(dateRange.from);
            const toDate = new Date(dateRange.to);
            result = result.filter((e) => {
                const expDate = new Date(e.date);
                return expDate >= fromDate && expDate <= toDate;
            });
        }

        // Update filtered state with final result
        setFiltered(result);
    }, [search, selectedCategory, dateRange, invoices]);

    //Calculates the total amount from all filtered expenses
    const totalAmount = filtered.reduce((sum, exp) => sum + Number(exp.amount), 0);

    /*
        This return block renders the complete UI for the "Uploaded Invoices" page.

        It includes:
        - A main heading ("All Uploaded Invoices")
        - A summary section showing the total number of invoices and total amount
        - Filter controls for searching, filtering by category, and selecting a date range
        - A "Clear Filters" button to reset all filters
        - Conditional rendering:
            • If no invoices match the filters, a "no results" message is displayed
            • If invoices are present, a grid of animated invoice cards is shown
        Each invoice card shows:
        - Title, amount, date, and category
        - A preview of the uploaded invoice (PDF or image)
        - Download and View buttons for the file
        Framer Motion is used for smooth animations throughout the layout.
    */

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 mt-4 sm:mt-6 md:mt-8 lg:mt-10 bg-gray-50 dark:bg-gray-900 min-h-screen transition-all duration-300"
        >

            {/* Page heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400 mb-3 sm:mb-4 transition-all duration-300">📑 All Uploaded Invoices</h2>

            {/* Summary panel showing total invoices and total amount */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm flex flex-col sm:flex-row flex-wrap justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 transition-all duration-300"
            >
                <span><strong>Total Invoices:</strong> {filtered.length}</span>
                <span><strong>Total Amount:</strong> ₹{totalAmount}</span>
            </motion.div>

        {/* Filters: search, category dropdown, date range */}
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-2 sm:mb-4"
        >
            {/* Search input */}
            <input
                type="text"
                placeholder="🔍 Search title, category, amount"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 transition-all duration-300"
            />

            {/* Category filter dropdown */}
            <select
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-300 transition-all duration-300"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value="">Filter by category</option>
                {categories.map((cat, i) => (
                    <option key={i} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

            {/* Date range inputs */}
            <div className="flex gap-2 sm:gap-3">
                <input
                    type="date"
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm w-full transition-all duration-300"
                    value={dateRange.from}
                    onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, from: e.target.value }))
                    }
                />
                <input
                    type="date"
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm w-full transition-all duration-300"
                    value={dateRange.to}
                    onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, to: e.target.value }))
                    }
                />
            </div>
        </motion.div>

        {/* Button to clear all filters */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end mb-4 sm:mb-6"
        >
            <button
                onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                    setDateRange({ from: "", to: "" });
                }}
                className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300"
                >
                Clear Filters
            </button>
        </motion.div>

        {/* Show message if no invoices match filters or display cards */}
        <AnimatePresence>
            {filtered.length === 0 ? (
                // No results message
                <motion.div
                    key="no-result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center text-gray-500 dark:text-gray-400 mt-8 sm:mt-12 text-sm sm:text-base transition-all duration-300"
                >
                    🚫 No invoices match your filters.
                </motion.div>
            ) : (
                // Grid of invoice cards
                <motion.div
                    layout
                    className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {filtered.map((expense, index) => {
                        const isPDF = String(expense.invoice).toLowerCase().endsWith(".pdf");
                        const categoryName = expense.category?.name || expense.Category?.name || (typeof expense.category === "string" ? expense.category : "");
                        return (
                            // Individual invoice card with animation and link
                            <Link to={`/invoice/${expense.id}`} className="hover:scale-[1.015] transition-transform duration-200">
                                <motion.div
                                    key={expense.id}
                                    layout
                                    initial={{ opacity: 0, y: 60 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow p-3 sm:p-4 flex flex-col justify-between transition-all duration-300"
                                >
                                    {/* Invoice card header */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                                                {expense.title}
                                            </h3>
                                            <span
                                                className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1
                                                    ${ 
                                                        isPDF
                                                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300"
                                                        : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300"
                                                    }
                                                `}
                                            >
                                                {isPDF ? (
                                                    <><FaFilePdf className="text-xs" /> <span className="hidden sm:inline">PDF</span></>
                                                ) : (
                                                    <><FaImage className="text-xs" /> <span className="hidden sm:inline">Image</span></>
                                                )}
                                            </span>
                                        </div>

                                        {/* Expense details */}
                                        <p className="text-sm sm:text-base text-green-600 dark:text-green-400 mb-1 font-medium">₹{expense.amount}</p>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(expense.date).toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                        <p className="text-xs sm:text-sm text-indigo-500 dark:text-indigo-400">{categoryName}</p>
                                    </div>

                                    {/* Preview section: PDF or Image */}
                                    <div className="mt-3 sm:mt-4">
                                        {isPDF ? (
                                            <embed
                                                src={`http://localhost:4000/uploads/invoices/${expense.invoice}`}
                                                type="application/pdf"
                                                className="w-full h-32 sm:h-40 md:h-48 border border-gray-200 dark:border-gray-600 rounded transition-all duration-300"
                                            />
                                        ) : (
                                            <img
                                                src={`http://localhost:4000/uploads/invoices/${expense.invoice}`}
                                                alt="Invoice"
                                                className="w-full h-32 sm:h-40 md:h-48 object-contain rounded border border-gray-200 dark:border-gray-600 transition-all duration-300"
                                            />
                                        )}
                                    </div>

                                    {/* Action links: Download and View */}
                                    <div className="mt-3 sm:mt-4 flex justify-between items-center text-xs sm:text-sm">
                                        <a
                                            href={`http://localhost:4000/api/expenses/download/${expense.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 sm:gap-2 text-blue-600 dark:text-blue-400 hover:underline transition-all duration-300"
                                        >
                                            <FaFileDownload className="text-xs sm:text-sm" /> <span className="hidden sm:inline">Download</span>
                                        </a>
                                        <a
                                            href={`http://localhost:4000/uploads/invoices/${expense.invoice}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 sm:gap-2 text-indigo-600 dark:text-indigo-400 hover:underline transition-all duration-300"
                                        >
                                            <FaEye className="text-xs sm:text-sm" /> <span className="hidden sm:inline">View</span>
                                        </a>
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}
                </motion.div>
            )}
        </AnimatePresence>
        </motion.div>
    );
};

export default Invoices;
