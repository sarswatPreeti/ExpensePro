import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFileDownload,
  FaEye,
  FaFilePdf,
  FaImage,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const Invoices = () => {
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
        try {
            
            // Send GET request to fetch all expenses
            const res = await axios.get("http://localhost:4000/api/expenses");

            // Filter out expenses that have an invoice attached
            const withInvoices = res.data.filter((expense) => expense.invoice);

            // Set the invoices state with filtered results
            setInvoices(withInvoices);

            // Set the filtered state (used for searching/filtering UI)
            setFiltered(withInvoices);

            // Extract unique categories from the expenses with invoices
            const allCategories = [...new Set(withInvoices.map((e) => e.category))];

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
    }, []);

    useEffect(() => {
        //Filters the invoices list based on search term, selected category, and date range, and updates the filtered state.

        let result = invoices; // Start with all invoices

        // Filter by search term (title, category, or amount)
        if (search) {
            const term = search.toLowerCase();
            result = result.filter(
                (e) =>
                e.title.toLowerCase().includes(term) ||
                e.category.toLowerCase().includes(term) ||
                e.amount.toString().includes(term)
            );
        }

        // Filter by selected category
        if (selectedCategory) {
            result = result.filter((e) => e.category === selectedCategory);
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
            className="max-w-7xl mx-auto p-6 mt-10"
        >

            {/* Page heading */}
            <h2 className="text-4xl font-bold text-blue-700 mb-4">📑 All Uploaded Invoices</h2>

            {/* Summary panel showing total invoices and total amount */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm flex flex-wrap justify-between gap-4 text-sm text-gray-700"
            >
                <span><strong>Total Invoices:</strong> {filtered.length}</span>
                <span><strong>Total Amount:</strong> ₹{totalAmount}</span>
            </motion.div>

        {/* Filters: search, category dropdown, date range */}
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-3 sm:grid-cols-2 gap-4 mb-2"
        >
            {/* Search input */}
            <input
                type="text"
                placeholder="🔍 Search title, category, amount"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Category filter dropdown */}
            <select
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            <div className="flex gap-2">
                <input
                    type="date"
                    className="border rounded-lg px-3 py-2 w-full"
                    value={dateRange.from}
                    onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, from: e.target.value }))
                    }
                />
                <input
                    type="date"
                    className="border rounded-lg px-3 py-2 w-full"
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
            className="flex justify-end mb-6"
        >
            <button
                onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                    setDateRange({ from: "", to: "" });
                }}
                className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded-lg hover:bg-red-200 transition"
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
                    className="text-center text-gray-500 mt-12"
                >
                    🚫 No invoices match your filters.
                </motion.div>
            ) : (
                // Grid of invoice cards
                <motion.div
                    layout
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {filtered.map((expense, index) => {
                        const isPDF = expense.invoice.toLowerCase().endsWith(".pdf");
                        return (
                            // Individual invoice card with animation and link
                            <Link to={`/invoice/${expense.id}`} className="hover:scale-[1.015] transition-transform duration-200">
                                <motion.div
                                    key={expense.id}
                                    layout
                                    initial={{ opacity: 0, y: 60 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl border shadow p-4 flex flex-col justify-between"
                                >
                                    {/* Invoice card header */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {expense.title}
                                            </h3>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full
                                                    ${ 
                                                        isPDF
                                                        ? "bg-red-100 text-red-600"
                                                        : "bg-green-100 text-green-600"
                                                    }
                                                `}
                                            >
                                                {isPDF ? (
                                                    <><FaFilePdf className="inline mr-1" /> PDF</>
                                                ) : (
                                                    <><FaImage className="inline mr-1" /> Image</>
                                                )}
                                            </span>
                                        </div>

                                        {/* Expense details */}
                                        <p className="text-sm text-green-600 mb-1">₹{expense.amount}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(expense.date).toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                        <p className="text-sm text-indigo-500">{expense.category}</p>
                                    </div>

                                    {/* Preview section: PDF or Image */}
                                    <div className="mt-4">
                                        {isPDF ? (
                                            <embed
                                                src={`http://localhost:4000/${expense.invoice}`}
                                                type="application/pdf"
                                                className="w-full h-48 border rounded"
                                            />
                                        ) : (
                                            <img
                                                src={`http://localhost:4000/${expense.invoice}`}
                                                alt="Invoice"
                                                className="w-full h-48 object-contain rounded border"
                                            />
                                        )}
                                    </div>

                                    {/* Action links: Download and View */}
                                    <div className="mt-4 flex justify-between items-center text-sm">
                                        <a
                                            href={`http://localhost:4000/api/download/${expense.invoice.split("/").pop()}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 text-blue-600 hover:underline"
                                        >
                                            <FaFileDownload /> Download
                                        </a>
                                        <a
                                            href={`http://localhost:4000/${expense.invoice}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 text-indigo-600 hover:underline"
                                        >
                                            <FaEye /> View
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
