import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaRupeeSign,
  FaCalendarAlt,
  FaTags,
  FaPen,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const EXPENSE_API = "http://localhost:4000/api/expenses";
const CATEGORY_API = "http://localhost:4000/api/categories";

const DEFAULT_CATEGORIES = [
  { id: "default-1", name: "Food" },
  { id: "default-2", name: "Transport" },
  { id: "default-3", name: "Shopping" },
  { id: "default-4", name: "Health" },
  { id: "default-5", name: "Entertainment" },
  { id: "default-6", name: "Utilities" },
  { id: "default-7", name: "Others" },
];

const AddExpense = () => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: "",
    category: DEFAULT_CATEGORIES[0].name,
    description: "",
  });

  const [status, setStatus] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(CATEGORY_API);
        const userCategories = res.data;

        // Merge default and user-defined categories
        const merged = [...DEFAULT_CATEGORIES];

        userCategories.forEach((cat) => {
          if (!merged.find((c) => c.name.toLowerCase() === cat.name.toLowerCase())) {
            merged.push(cat);
          }
        });

        setCategories(merged);

        // Set default selected category
        setForm((prev) => ({ ...prev, category: merged[0]?.name || "" }));
      } catch (err) {
        console.error("Failed to fetch user categories", err);
        // Fallback to default categories if fetch fails
        setCategories(DEFAULT_CATEGORIES);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(EXPENSE_API, {
        ...form,
        amount: parseFloat(form.amount),
      });
      setStatus("success");
      setForm({
        title: "",
        amount: "",
        date: "",
        category: categories[0]?.name || "",
        description: "",
      });
    } catch (error) {
      setStatus("error");
      console.error(error);
    }

    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-6">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl p-8 rounded-2xl animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaPen className="text-blue-500" /> Add New Expense
        </h2>

        {status === "success" && (
          <div className="mb-4 text-green-600 flex items-center gap-2">
            <FaCheckCircle />
            Expense added successfully!
          </div>
        )}
        {status === "error" && (
          <div className="mb-4 text-red-600 flex items-center gap-2">
            <FaTimesCircle />
            Failed to add expense.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Title</label>
            <div className="flex items-center border rounded px-4 py-2 focus-within:ring-2 focus-within:ring-blue-300">
              <FaPen className="text-gray-500 mr-3" />
              <input
                type="text"
                placeholder="e.g., Grocery shopping"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full outline-none text-gray-800"
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Amount</label>
            <div className="flex items-center border rounded px-4 py-2 focus-within:ring-2 focus-within:ring-blue-300">
              <FaRupeeSign className="text-gray-500 mr-3" />
              <input
                type="number"
                placeholder="e.g., 500"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full outline-none text-gray-800"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Date</label>
            <div className="flex items-center border rounded px-4 py-2 focus-within:ring-2 focus-within:ring-blue-300">
              <FaCalendarAlt className="text-gray-500 mr-3" />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full outline-none text-gray-800"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Category</label>
            <div className="flex items-center border rounded px-4 py-2 focus-within:ring-2 focus-within:ring-blue-300">
              <FaTags className="text-gray-500 mr-3" />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full outline-none bg-transparent text-gray-800"
              >
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Description</label>
            <textarea
              placeholder="Optional notes about this expense"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border rounded px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 resize-none"
            />
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
