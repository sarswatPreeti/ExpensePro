import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaFileInvoice,
  FaListUl,
  FaTrash,
  FaEdit,
  FaExpand,
} from "react-icons/fa";

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [showFullInvoice, setShowFullInvoice] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  // Fetches invoice data by ID when component mounts or ID changes
  useEffect(() => {
    const fetchExpense = async () => {
    try {
        const res = await axios.get(`http://localhost:4000/api/expenses/expenses/${id}`);

        // Store the fetched data in state
        setExpense(res.data);
    } catch (err) {
        console.error("Error fetching invoice:", err);
    }
    };

    fetchExpense();
  }, [id]); // Re-run effect whenever ID changes

  /* Handles invoice deletion by updating the backend and clearing the invoice in state */
  const handleDeleteInvoice = async () => {
    try {
      await axios.put(`http://localhost:4000/api/expenses/${id}/remove-invoice`);

      // Update local state to remove invoice reference
      setExpense({ ...expense, invoice: null });

      // Close the delete confirmation UI
      setShowDeleteWarning(false);
    } catch (err) {

      // Log any errors during deletion
      console.error("Error deleting invoice:", err);
    }
  };

  // Toggles the full-screen view state of the invoice
  const toggleFullScreen = () => {
    setShowFullInvoice(!showFullInvoice); // Switch between full and normal view
  };

  // Show loading message while invoice data is being fetched
  if (!expense)
    return (
      <div className="p-6 text-gray-500 text-center">
        <p className="animate-pulse">Loading invoice...</p>
      </div>
    );

  /* 
    Main UI for displaying invoice details:
    - Navigation buttons
    - Expense information (title, amount, date, etc.)
    - Invoice preview (PDF or image with full-screen and delete/edit options)
    - Confirmation box for invoice deletion
  */

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-6 relative">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Link to all invoices */}
        <Link
          to="/invoices"
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
        >
          <FaListUl /> See All Invoices
        </Link>
      </div>

      {/*  Invoice Heading  */}
      <h2 className="text-3xl font-bold mb-4 text-blue-600 flex items-center gap-2">
        <FaFileInvoice /> Invoice Details
      </h2>

      {/* Expense Info */}
      <div className="text-gray-800 space-y-2 mb-6">
        <p><strong>Title:</strong> {expense.title}</p>
        <p><strong>Amount:</strong> ₹{expense.amount}</p>
        <p><strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}</p>
        <p><strong>Category:</strong> {expense.category}</p>
        {/* Only show description if it exists */}
        {expense.description && (
          <p className="break-words whitespace-pre-line">
            <strong>Description:</strong> {expense.description}
          </p>
        )}
      </div>

      {/* Invoice Preview Section */}
      {expense.invoice ? (
        <div className="mt-6 space-y-2 relative">

          {/* Invoice Top Bar with Actions */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-indigo-600">Attached Invoice</h3>
            <div className="flex gap-4">
              {/* Toggle full-screen view */}
              <button
                onClick={toggleFullScreen}
                className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm"
              >
                <FaExpand /> {showFullInvoice ? "Exit Full View" : "Full View"}
              </button>

              {/* Edit Invoice Link */}
              <Link
                to={`/edit-invoice/${expense.id}`}
                className="text-yellow-500 hover:text-yellow-600 flex items-center gap-1 text-sm"
              >
                <FaEdit /> Edit Invoice
              </Link>

              {/* Delete Invoice Trigger */}
              <button
                onClick={() => setShowDeleteWarning(true)}
                className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm"
                >
                <FaTrash /> Delete Invoice
              </button>
            </div>
          </div>

          {/* Button to Exit Full View Mode */}
          {showFullInvoice && (
            <button
              onClick={toggleFullScreen}
              className="fixed top-4 right-4 z-[9999] px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 shadow-md"
            >
              Exit Full View
            </button>
          )}

          {/* Invoice File Preview - PDF or Image */}
          {expense.invoice.toLowerCase().endsWith(".pdf") ? (
            <embed
              src={`http://localhost:4000/${expense.invoice}`}
              type="application/pdf"
              className={`${showFullInvoice ? "w-screen h-screen fixed inset-0 bg-white z-50" : "w-full h-96 border rounded"}`}
            />
          ) : (
            <img
              src={`http://localhost:4000/${expense.invoice}`}
              alt="Invoice"
              className={`${showFullInvoice
                ? "w-screen h-screen fixed inset-0 object-contain bg-black z-50"
                : "w-full max-h-[500px] object-contain border rounded"
              }`}
            />
          )}

          {/* Delete Confirmation Box */}
          {showDeleteWarning && (
            <div className="mt-6 p-4 border border-red-400 bg-red-50 text-red-700 rounded-md shadow">
              <p className="font-semibold mb-2">⚠️ Are you sure you want to delete this invoice?</p>
              <div className="flex gap-4 justify-end">
                {/* Cancel delete */}
                <button
                  onClick={() => setShowDeleteWarning(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>

                {/* Confirm delete */}
                <button
                  onClick={handleDeleteInvoice}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Fallback when no invoice is uploaded
        <div className="text-gray-500 italic mt-4">No invoice file attached.</div>
      )}
    </div>
  );
};

export default Invoice;
