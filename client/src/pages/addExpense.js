import React, { useEffect, useState, useRef } from "react";
import { getCategories, createExpense } from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import {
  FaRupeeSign, FaCalendarAlt, FaTags, FaPen, FaCheckCircle, FaTimesCircle, FaPlus, FaEye, FaTrash,
  FaGooglePay, FaCreditCard, FaRegCreditCard
} from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { SiPhonepe, SiPaytm } from "react-icons/si";

// Default Categories
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
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: "",
    category: DEFAULT_CATEGORIES[0].name,
    paymentMethod: "Cash",
    cardLast4: "",
    description: "",
    invoice: null,
  });

  const [status, setStatus] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const PAYMENT_METHODS = [
    { name: "Cash", icon: <BsCashCoin /> },
    { name: "Paytm", icon: <SiPaytm /> },
    { name: "Debit Card", icon: <FaRegCreditCard /> },
    { name: "GPay", icon: <FaGooglePay /> },
    { name: "PhonePe", icon: <SiPhonepe /> },
    { name: "Credit Card", icon: <FaCreditCard /> },
  ];

  const fileInputRef = useRef(null);

  // Fetch user categories and merge with defaults
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isAuthenticated()) return;
      
      try {
        const response = await getCategories();
        const userCategories = response.data;
        const merged = [...DEFAULT_CATEGORIES];
        userCategories.forEach((cat) => {
          if (!merged.find((c) => c.name.toLowerCase() === cat.name.toLowerCase())) {
            merged.push(cat);
          }
        });
        setCategories(merged);
        setForm((prev) => ({ ...prev, category: merged[0]?.name || "" }));
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setCategories(DEFAULT_CATEGORIES);
      }
    };
    fetchCategories();
  }, [isAuthenticated]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setStatus("error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("amount", form.amount);
      formData.append("date", form.date);
      formData.append("category", form.category); // sending name
      formData.append("paymentMethod", form.paymentMethod);
      if ((form.paymentMethod === "Credit Card" || form.paymentMethod === "Debit Card") && form.cardLast4) {
        formData.append("cardLast4", form.cardLast4);
      }
      formData.append("description", form.description);
      if (form.invoice) formData.append("invoice", form.invoice);

      await createExpense(formData);

      setStatus("success");
      setForm({
        title: "",
        amount: "",
        date: "",
        category: categories[0]?.name || "",
        paymentMethod: "Cash",
        cardLast4: "",
        description: "",
        invoice: null,
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      setStatus("error");
    }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12 transition-all duration-300">
      <div className="w-full max-w-5xl bg-white/90 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl rounded-3xl p-10 border border-gray-200 dark:border-gray-800 transition-all duration-300 animate-fade-in">

        <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-10 text-center flex items-center justify-center gap-3 transition-all duration-300 animate-fade-in-down">
          <FaPen className="text-indigo-600 dark:text-indigo-400 transition-all duration-300" />
          Add New Expense
        </h2>

        {status === "success" && (
          <div className="mb-6 text-green-600 dark:text-green-400 flex items-center justify-center gap-2 transition-all duration-300 animate-bounce-in">
            <FaCheckCircle className="text-lg" />
            <span>Expense added successfully!</span>
          </div>
        )}
        {status === "error" && (
          <div className="mb-6 text-red-600 dark:text-red-400 flex items-center justify-center gap-2 transition-all duration-300 animate-shake">
            <FaTimesCircle className="text-lg" />
            <span>Failed to add expense.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 transition-all duration-300">
            {/* Left Column */}
            <div className="space-y-6 border border-indigo-300 dark:border-indigo-400 rounded-2xl p-6 bg-white/50 dark:bg-gray-800/95 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-indigo-500 dark:hover:border-indigo-300 h-full shadow-inner animate-fade-in-up animation-delay-500">

              {/* Title, Amount, Date */}
              {[
                { label: 'Title', icon: <FaPen />, type: 'text', key: 'title', placeholder: 'Grocery' },
                { label: 'Amount', icon: <FaRupeeSign />, type: 'number', key: 'amount', placeholder: '500' },
                { label: 'Date', icon: <FaCalendarAlt />, type: 'date', key: 'date' },
              ].map((field, idx) => (
                <div key={field.key} className={`animate-fade-in-up animation-delay-${idx * 100}`}>
                  <label className="text-gray-600 dark:text-gray-300 block mb-1 transition-all duration-300">{field.label}</label>
                  <div className="relative">
                    {React.cloneElement(field.icon, { className: 'absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 transition-all duration-300' })}
                    <input
                      type={field.type}
                      placeholder={field.placeholder || ''}
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-b-2 border-indigo-300 dark:border-indigo-400 bg-transparent focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-300 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 rounded-xl"
                      required
                    />
                  </div>
                </div>
              ))}

              {/* Category */}
              <div className="animate-fade-in-up animation-delay-300">
                <label className="text-gray-600 dark:text-gray-300 block mb-1 transition-all duration-300">Category</label>
                <div className="relative">
                  <FaTags className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 transition-all duration-300" />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-b-2 border-indigo-300 dark:border-indigo-400 bg-transparent focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-300 text-gray-800 dark:text-gray-100 transition-all duration-300 rounded-xl"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name} className="text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div className="animate-fade-in-up animation-delay-300">
                <label className="text-gray-600 dark:text-gray-300 block mb-1 transition-all duration-300">Payment Method</label>
                <div className="w-full border border-b-2 border-indigo-300 dark:border-indigo-400 px-4 py-3 bg-transparent focus-within:border-indigo-500 dark:focus-within:border-indigo-300 transition rounded-xl">
                  <div className="flex flex-wrap gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = form.paymentMethod === method.name;
                      return (
                        <label
                          key={method.name}
                          className={`cursor-pointer px-4 py-2 border rounded-lg transition-all duration-300 hover:scale-105 ${
                            isSelected
                              ? 'bg-indigo-500 dark:bg-indigo-400 text-white border-indigo-500 dark:border-indigo-300 shadow-md'
                              : 'bg-white dark:bg-gray-800/95 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.name}
                            checked={isSelected}
                            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                            className="hidden"
                          />
                          {method.icon &&
                            React.cloneElement(method.icon, {
                              className: `inline-block mr-1 transition-all duration-300 ${
                                isSelected ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'
                              }`,
                            })}
                          {method.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Last 4 Digits */}
              {(form.paymentMethod === "Credit Card" || form.paymentMethod === "Debit Card") && (
                <div className="animate-fade-in-up animation-delay-400">
                  <label className="text-gray-600 dark:text-gray-300 block mb-1 transition-all duration-300">Last 4 Digits of Card</label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    inputMode="numeric"
                    placeholder="1234"
                    value={form.cardLast4}
                    onChange={(e) => setForm({ ...form, cardLast4: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    className="w-full pl-4 pr-4 py-3 border-b-2 border-indigo-300 dark:border-indigo-400 bg-transparent focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-300 text-gray-800 dark:text-gray-100 transition-all duration-300 rounded-xl"
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-all duration-300">Only numbers allowed</p>
                </div>
              )}

              {/* Description */}
              <div className="animate-fade-in-up animation-delay-400">
                <label className="text-gray-600 dark:text-gray-300 block mb-1 transition-all duration-300">Description</label>
                <textarea
                  placeholder="Optional notes"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-b-2 border-indigo-300 dark:border-indigo-400 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:border-indigo-600 dark:focus:border-indigo-300 transition-all duration-300 rounded-xl"
                />
              </div>
            </div>

            {/* Right Column - Invoice */}
            <div className="relative flex flex-col items-center justify-center text-center border border-indigo-300 dark:border-indigo-400 rounded-2xl p-8 bg-white/50 dark:bg-gray-800/95 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-indigo-500 dark:hover:border-indigo-300 h-full shadow-inner animate-fade-in-up animation-delay-500">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 transition-all duration-300">Invoice</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 transition-all duration-300">PDF or Image</p>

              {!form.invoice ? (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()} 
                  className="w-16 h-16 bg-indigo-200 dark:bg-indigo-400 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-indigo-300 dark:hover:bg-indigo-500">
                  <FaPlus className="text-indigo-600 dark:text-indigo-100 text-2xl transition-all duration-300" />
                </button>
              ) : (
                <>
                  <div className="w-full max-h-60 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 mb-4 transition-all duration-300 shadow-md">
                    {form.invoice.type.includes("image") ? (
                      <img src={URL.createObjectURL(form.invoice)} alt="Invoice Preview" className="object-contain max-h-60 mx-auto transition-all duration-300" />
                    ) : (
                      <embed src={URL.createObjectURL(form.invoice)} type="application/pdf" className="w-full h-60 transition-all duration-300" />
                    )}
                  </div>

                  <div className="flex justify-center gap-4 mb-2">
                    <button
                      type="button"
                      onClick={() => window.open(URL.createObjectURL(form.invoice))}
                      className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-all duration-300 hover:scale-105 shadow-md"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, invoice: null })}
                      className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}

              <input type="file" ref={fileInputRef} accept="image/*,.pdf" onChange={(e) => setForm({ ...form, invoice: e.target.files[0] })} className="hidden" />
            </div>
          </div>

          <div className="pt-10 text-center">
            <button type="submit" className="bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400 text-white font-bold py-3 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;