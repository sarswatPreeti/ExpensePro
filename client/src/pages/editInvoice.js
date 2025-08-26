import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";
import { FaSave, FaTimes } from "react-icons/fa";

const EditInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [expense, setExpense] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    // const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchExpense = async () => {
          if (!isAuthenticated()) return;
          
        try {
            const res = await axiosInstance.get(`/expenses/${id}`);

            // Update state with the fetched expense
            setExpense(res.data);

            // If the invoice exists, set the preview URL to display (image or PDF)
            // setPreview(res.data.invoice ? `http://localhost:4000/${res.data.invoice}` : null);
        } catch (err) {
            console.error("Error fetching invoice:", err);
        }
        };

        // Call the function when component mounts or when `id` changes
        fetchExpense();
    }, [id, isAuthenticated]); // Dependency: re-run this effect when `id` changes

    const handleFileChange = (e) => {

        // Get the selected file from the input
        const file = e.target.files[0];

        // Store the selected file in state
        setSelectedFile(file);
        // If the file is not a PDF, create a preview URL for it (e.g., image)
        if (file && !file.name.endsWith(".pdf")) {
            // setPreview(URL.createObjectURL(file));
        } else {
            // For PDFs or if no file is selected, do not set a preview
            // setPreview(null);
        }
    };

    const handleCancel = () => {
        navigate(-1); // Go back without saving
    };

    /* Uploads selected invoice file to the server and navigates to the invoice detail page */
    const handleUpload = async () => {
        if (!selectedFile) return alert("Please select a file to upload.");

        // Create a new FormData object and append the selected file
        const formData = new FormData();
        formData.append("invoice", selectedFile);

        try {
        await axiosInstance.put(`/expenses/${id}`, formData);

        // On success, alert the user and navigate back to the invoice page
        alert("Invoice uploaded successfully!");
        navigate(`/invoice/${id}`);
        } catch (err) {

        // If an error occurs, log it and alert the user
        console.error("Upload failed:", err);
        alert("Failed to upload invoice");
        }
    };

    // Display loading message while invoice data is being fetched
    if (!expense) return <div className="p-3 sm:p-4 md:p-6 text-gray-500 text-sm sm:text-base">Loading invoice...</div>;

    /* 
        Renders the Edit Invoice UI:
        - Shows current invoice (PDF/image)
        - Allows user to upload a new invoice file
        - Previews the selected file before upload
        - Includes Cancel and Save buttons
    */

    return (
        <div className="max-w-xl mx-auto mt-4 sm:mt-6 md:mt-8 lg:mt-10 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-3 sm:p-4 md:p-6 transition-all duration-300">
            {/* Heading */}
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-600 dark:text-blue-400 transition-all duration-300">Edit Invoice File</h2>

            {/* Show current invoice only if it exists and no new file is selected */}
            {expense.invoice && !selectedFile && (
                <div className="mb-3 sm:mb-4">
                    <p className="text-gray-600 dark:text-gray-300 mb-1 sm:mb-2 font-medium text-sm sm:text-base transition-all duration-300">Current Invoice:</p>

                    {/* Render PDF using <embed>, otherwise render image */}
                    {expense.invoice.endsWith(".pdf") ? (
                        <embed
                            src={`http://localhost:4000/${expense.invoice}`}
                            type="application/pdf"
                            className="w-full h-48 sm:h-56 md:h-64 lg:h-72 border border-gray-200 dark:border-gray-600 rounded transition-all duration-300"
                        />
                    ) : (
                        <img
                            src={`http://localhost:4000/${expense.invoice}`}
                            alt="Current Invoice"
                            className="w-full max-h-[250px] sm:max-h-[300px] md:max-h-[350px] lg:max-h-[400px] object-contain border border-gray-200 dark:border-gray-600 rounded transition-all duration-300"
                        />
                    )}
                </div>
            )}

            {/* File Picker Section */}
            <div className="mb-4 sm:mb-6">
                <label className="block font-medium mb-1 sm:mb-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-all duration-300">Upload New Invoice:</label>
                <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md w-full transition-all duration-300"
                />

                {/* Preview the newly selected file */}
                {selectedFile && (
                    <div className="mt-3 sm:mt-4">
                        <p className="text-gray-600 dark:text-gray-300 mb-1 sm:mb-2 font-medium text-sm sm:text-base transition-all duration-300">New Invoice Preview:</p>
                        {selectedFile.type === "application/pdf" ? (
                            <embed
                                src={URL.createObjectURL(selectedFile)}
                                type="application/pdf"
                                className="w-full h-48 sm:h-56 md:h-64 lg:h-72 border border-gray-200 dark:border-gray-600 rounded transition-all duration-300"
                            />
                        ) : (
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="New Invoice"
                                className="w-full max-h-[250px] sm:max-h-[300px] md:max-h-[350px] lg:max-h-[400px] object-contain border border-gray-200 dark:border-gray-600 rounded transition-all duration-300"
                                />
                        )}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">

                {/* Cancel button */}
                <button
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-300 text-sm sm:text-base"
                >
                    <FaTimes className="text-xs sm:text-sm" /> Cancel
                </button>

                {/* Save/upload button */}
                <button
                    onClick={handleUpload}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 text-sm sm:text-base"
                >
                    <FaSave className="text-xs sm:text-sm" /> Save Invoice
                </button>
            </div>
        </div>
    );
};

export default EditInvoice;
