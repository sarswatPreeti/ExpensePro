import React from "react";
import jsPDF from "jspdf";

const InvoicePage = () => {
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("All Uploaded Invoices", 20, 20);
    doc.save("invoices.pdf");
  };

  return (
    <div>
      <h1>All Uploaded Invoices</h1>
      <button onClick={exportPDF}>Export PDF</button>
    </div>
  );
};

export default InvoicePage;
