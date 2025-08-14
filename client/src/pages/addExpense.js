// Import core React features: useEffect (lifecycle), useState (state), useRef (DOM references)
import React, { useEffect, useState, useRef } from "react";

// Import Axios for making HTTP requests to the backend
import axios from "axios";

// Import React icons
import {
  FaRupeeSign,
  FaCalendarAlt,
  FaTags,
  FaPen,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaEye,
  FaTrash,
  FaGooglePay,
  FaCreditCard,
  FaRegCreditCard
} from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { CgOptions } from "react-icons/cg";
import { SiPhonepe, SiPaytm } from "react-icons/si";

// Define API endpoints using environment variable or fallback to localhost
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
// Endpoint to add a new expense
const EXPENSE_API = `${BASE_URL}/api/expenses/add`;
// Endpoint to fetch categories (default + user-defined)
const CATEGORY_API = `${BASE_URL}/api/categories`;

//Default Categories given to user
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

  //Intialize a Form state using useState Hook
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: "",
    category: DEFAULT_CATEGORIES[0].name,
    paymentMethod: "Cash",
    cardLast4: "", // ✅ NEW
    description: "",
    invoice: null,
  });

  //Used to track the status of some process
  const [status, setStatus] = useState(null);

  //Holds the current list of categories available for selection.
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const PAYMENT_METHODS = [
    { name: "Cash", icon: <BsCashCoin /> },
    { name: "Paytm", icon: <SiPaytm /> },
    { name: "Debit Card", icon: <FaRegCreditCard /> },
    { name: "GPay", icon: <FaGooglePay /> },
    { name: "PhonePe", icon: <SiPhonepe /> },
    { name: "Credit Card", icon: <FaCreditCard /> },
  ];

  // Fetch and merge user-defined categories with defaults on component mount
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

  // Handle form submission: send expense data (with optional invoice) to backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      const formData = new FormData(); // Create a FormData object to handle file upload

      // Append form fields to FormData
      formData.append("title", form.title);
      formData.append("amount", form.amount);
      formData.append("date", form.date);
      formData.append("category", form.category);
      formData.append("paymentMethod", form.paymentMethod);

      // Only append cardLast4 if method is Card
if ((form.paymentMethod === "Credit Card" || form.paymentMethod === "Debit Card") && form.cardLast4) {
  formData.append("cardLast4", form.cardLast4);
}
      formData.append("description", form.description);

      // Append invoice file if it exists
      if (form.invoice) {
        formData.append("invoice", form.invoice);
      }

      // Send the form data to the backend API
      await axios.post(EXPENSE_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // On successful submission, show success status and reset form fields
      setStatus("success");
      setForm({
        title: "",
        amount: "",
        date: "",
        category: categories[0]?.name || "", // Reset to first available category
        paymentMethod: "Cash",
        cardLast4: "", // ✅ NEW
        description: "",
        invoice: null,
      });
    } catch (error) {
      // On error, show error status and log the error
      setStatus("error");
      console.error(error);
    }

    // Clear the status message after 3 seconds
    setTimeout(() => setStatus(null), 3000);
  };

  // Ref for accessing and triggering the hidden file input programmatically
  const fileInputRef = useRef(null);

  /*
    Add Expense Page UI:
    - Full-screen, centered layout with gradient background and card-style container.
    - Displays success or error message based on form submission status.
    - Form includes inputs for:
      - Title (text)
      - Amount (number)
      - Date (date picker)
      - Category (dropdown from available categories)
      - Description (textarea for optional notes)
    - Right section allows uploading an invoice (PDF/image):
      - If not uploaded: shows "+" button to trigger file picker.
      - If uploaded: previews image or embedded PDF.
      - Provides options to view in new tab or delete the file.
    - Uses Tailwind CSS classes for styling and animation effects.
    - Submit button sends form data to the backend via `handleSubmit`.
  */

  return (
    // Full-screen container with a gradient background and centered content
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center px-4 py-12">

      {/* Main card container */}
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-10 border border-gray-200 animate-fade-in">

        {/* Header */}
        <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center flex items-center justify-center gap-3 animate-fade-in-down">
          <FaPen className="text-indigo-600" />
          Add New Expense
        </h2>

        {/* Status messages */}
        {status === "success" && (
          <div className="mb-6 text-green-600 flex items-center justify-center gap-2 animate-bounce-in">
            <FaCheckCircle className="text-lg" />
            <span>Expense added successfully!</span>
          </div>
        )}
        {status === "error" && (
          <div className="mb-6 text-red-600 flex items-center justify-center gap-2 animate-shake">
            <FaTimesCircle className="text-lg" />
            <span>Failed to add expense.</span>
          </div>
        )}

        {/* Form starts here */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Left Column: Form Fields */}
            <div className="space-y-6 border border-indigo-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-indigo-500 h-full shadow-inner animate-fade-in-up animation-delay-500">

              {/* Map over fields to render Title, Amount, and Date */}
              {[
                { label: 'Title', icon: <FaPen />, type: 'text', key: 'title', placeholder: 'e.g., Grocery' },
                { label: 'Amount', icon: <FaRupeeSign />, type: 'number', key: 'amount', placeholder: 'e.g., 500' },
                { label: 'Date', icon: <FaCalendarAlt />, type: 'date', key: 'date' },
              ].map((field, idx) => (
                <div 
                key={field.key} 
                className={`animate-fade-in-up animation-delay-${idx * 100}`}
                >
                  <label className="text-gray-600 block mb-1 font-medium">{field.label}</label>
                  <div className="relative">

                    {/* Icon inside input field */}
                    {React.cloneElement(field.icon, { className: 'absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500' })}
                    <input
                      type={field.type}
                      placeholder={field.placeholder || ''}
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      maxLength={field.key === "title" ? 100 : undefined} // Limit title to 100 chars
                      className="w-full pl-10 pr-4 py-3 border-b-2 border-indigo-300 bg-transparent focus:outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>
              ))}

              {/* Category Dropdown*/}
              <div className="animate-fade-in-up animation-delay-300">
                <label className="text-gray-600 block mb-1 font-medium">Category</label>
                <div className="relative">
                  <FaTags className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-b-2 border-indigo-300 bg-transparent focus:outline-none focus:border-indigo-500 text-gray-800"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              {/* Payment Method Radio Button Group */}
              <div className="animate-fade-in-up animation-delay-350">
                <label className="text-gray-600 block mb-1 font-medium">Payment Method</label>
                <div className="w-full border border-b-2 border-indigo-300 px-4 py-3 bg-transparent focus-within:border-indigo-500 transition ">
                  <div className="flex flex-wrap justify-evenly gap-3">
                    {PAYMENT_METHODS.map((methodObj) => {
                      const isSelected = form.paymentMethod === methodObj.name;
                      return (
                        <label
                          key={methodObj.name}
                          className={`cursor-pointer px-4 py-2 border text-sm transition-all flex items-center gap-1 rounded-lg
                            ${isSelected
                              ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-indigo-100"
                            }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={methodObj.name}
                            checked={isSelected}
                            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                            className="hidden"
                          />
                          {/* Icon with dynamic color */}
                          {methodObj.icon &&
                            React.cloneElement(methodObj.icon, {
                              className: `inline-block mr-1 text-md ${isSelected ? "text-white" : "text-indigo-500"}`,
                            })}
                          {methodObj.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>


              {/* Show Card Last 4 Digits only if payment method is 'Card' */}
              {(form.paymentMethod === "Credit Card" || form.paymentMethod === "Debit Card") && (
                <div className="animate-fade-in-up animation-delay-400">
                  <label className="text-gray-600 block mb-1 font-medium">Last 4 Digits of Card</label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    inputMode="numeric"
                    placeholder="e.g., 1234"
                    value={form.cardLast4}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cardLast4: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    className="w-full pl-4 pr-4 py-3 border-b-2 border-indigo-300 bg-transparent focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Only numbers allowed</p>
                </div>
              )}



              {/* Description textarea*/}
              <div className="animate-fade-in-up animation-delay-400">
                <label className="text-gray-600 block mb-1 font-medium">Description</label>
                <textarea
                  placeholder="Optional notes about this expense"
                  maxLength={255}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-b-2 border-indigo-300 bg-transparent outline-none text-gray-800 placeholder-gray-500 resize-none focus:border-indigo-500 transition"
                />
                
                {/* ✅ Character counter for description */}
                <p className="text-sm text-gray-500 text-right">
                  {form.description.length}/255 characters
                </p>
              </div>
            </div>

            {/* Right Column: Invoice Upload Area*/}
            <div className="relative flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur border border-indigo-300 hover:shadow-xl hover:scale-[1.01] hover:border-indigo-500 transition-all duration-300 rounded-2xl p-8 h-full shadow-inner animate-fade-in-up animation-delay-500">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Invoice</h3>
              <p className="text-gray-500 text-sm mb-4">PDF or Image (JPEG/PNG)</p>

              {/* Upload button when no file is selected */}
              {!form.invoice && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center justify-center w-16 h-16 bg-indigo-200 rounded-full hover:bg-indigo-300 transition">
                  <FaPlus className="text-indigo-600 text-2xl" />
                </button>
              )}

              {/* Show file preview and action buttons if file is selected */}
              {form.invoice && (
                <>
                  <div className="w-full max-h-60 overflow-hidden rounded-lg border border-gray-300 mb-4">
                    {form.invoice.type.includes('image') ? (
                      // Image preview
                      <img
                        src={URL.createObjectURL(form.invoice)}
                        alt="Invoice Preview"
                        className="object-contain max-h-60 mx-auto"
                      />
                    ) : (
                      // PDF preview
                      <embed
                        src={URL.createObjectURL(form.invoice)}
                        type="application/pdf"
                        className="w-full h-60"
                      />
                    )}
                  </div>

                  {/* View and Delete buttons */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => window.open(URL.createObjectURL(form.invoice), '_blank')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                      <FaEye /> View
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, invoice: null })}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                      <FaTrash /> Delete
                    </button>
                  </div>
                </>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*,.pdf"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setForm({ ...form, invoice: file });
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-10 text-center animate-fade-in-up animation-delay-600">
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-3 px-10 rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default AddExpense;
