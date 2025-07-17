import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaSave, FaTimes } from "react-icons/fa";

const EditInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expense, setExpense] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchExpense = async () => {
        try {
            const res = await axios.get(`http://localhost:4000/api/expenses/expenses/${id}`);

            // Update state with the fetched expense
            setExpense(res.data);

            // If the invoice exists, set the preview URL to display (image or PDF)
            setPreview(res.data.invoice ? `http://localhost:4000/${res.data.invoice}` : null);
        } catch (err) {
            console.error("Error fetching invoice:", err);
        }
        };

        // Call the function when component mounts or when `id` changes
        fetchExpense();
    }, [id]); // Dependency: re-run this effect when `id` changes

    const handleFileChange = (e) => {

        // Get the selected file from the input
        const file = e.target.files[0];

        // Store the selected file in state
        setSelectedFile(file);
        // If the file is not a PDF, create a preview URL for it (e.g., image)
        if (file && !file.name.endsWith(".pdf")) {
            setPreview(URL.createObjectURL(file));
        } else {
            // For PDFs or if no file is selected, do not set a preview
            setPreview(null);
        }
    };

    const handleCancel = () => {
        navigate(-1); // Go back without saving
    };

    {/* Uploads selected invoice file to the server and navigates to the invoice detail page */}
    const handleUpload = async () => {
        if (!selectedFile) return alert("Please select a file to upload.");

        // Create a new FormData object and append the selected file
        const formData = new FormData();
        formData.append("invoice", selectedFile);

        try {
        await axios.put(`http://localhost:4000/api/expenses/${id}/upload-invoice`, formData);

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
    if (!expense) return <div className="p-6 text-gray-500">Loading invoice...</div>;

    /* 
        Renders the Edit Invoice UI:
        - Shows current invoice (PDF/image)
        - Allows user to upload a new invoice file
        - Previews the selected file before upload
        - Includes Cancel and Save buttons
    */

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">
            {/* Heading */}
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Edit Invoice File</h2>

            {/* Show current invoice only if it exists and no new file is selected */}
            {expense.invoice && !selectedFile && (
                <div className="mb-4">
                    <p className="text-gray-600 mb-1 font-medium">Current Invoice:</p>

                    {/* Render PDF using <embed>, otherwise render image */}
                    {expense.invoice.endsWith(".pdf") ? (
                        <embed
                            src={`http://localhost:4000/${expense.invoice}`}
                            type="application/pdf"
                            className="w-full h-72 border rounded"
                        />
                    ) : (
                        <img
                            src={`http://localhost:4000/${expense.invoice}`}
                            alt="Current Invoice"
                            className="w-full max-h-[400px] object-contain border rounded"
                        />
                    )}
                </div>
            )}

            {/* File Picker Section */}
            <div className="mb-6">
                <label className="block font-medium mb-2">Upload New Invoice:</label>
                <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="border px-4 py-2 rounded-md w-full"
                />

                {/* Preview the newly selected file */}
                {selectedFile && (
                    <div className="mt-4">
                        <p className="text-gray-600 mb-2 font-medium">New Invoice Preview:</p>
                        {selectedFile.type === "application/pdf" ? (
                            <embed
                                src={URL.createObjectURL(selectedFile)}
                                type="application/pdf"
                                className="w-full h-72 border rounded"
                            />
                        ) : (
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="New Invoice"
                                className="w-full max-h-[400px] object-contain border rounded"
                                />
                        )}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-4">

                {/* Cancel button */}
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    <FaTimes /> Cancel
                </button>

                {/* Save/upload button */}
                <button
                    onClick={handleUpload}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    <FaSave /> Save Invoice
                </button>
            </div>
        </div>
    );
};

export default EditInvoice;
