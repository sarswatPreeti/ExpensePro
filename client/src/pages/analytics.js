import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  FaFileExport,
  FaExchangeAlt,
  FaStar,
  FaChartBar,
  FaChartPie,
} from "react-icons/fa";
import { motion } from "framer-motion"; // For animation effects

// API endpoint and chart colors
const API = "http://localhost:4000/api/expenses";
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a1cfff", "#f87171", "#34d399"];

// Main Analytics Component
const Analytics = () => {

  // States for data, loading, errors, and chart type
  const [expenses, setExpenses] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch expense data on component mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API); // Fetch data from API
        setExpenses(res.data); // Store expenses in state
        setError(""); // Clear any previous error
      } catch (err) {
        setError("Failed to load expenses. Try again."); // Handle error
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchExpenses();
  }, []);

  // Calculate total expense
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Generate last 12 months for bar chart
  const getLast12Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.toLocaleString("default", { month: "short", year: "numeric" });
      const key = `${date.getFullYear()}-${date.getMonth()}`; // used for matching
      months.push({ key, label, date, amount: 0 });
    }
    return months;
  };

  const monthlyTemplate = getLast12Months();

  // Group expenses by month
  expenses.forEach((exp) => {
    const date = new Date(exp.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const found = monthlyTemplate.find((m) => m.key === key);
    if (found) found.amount += exp.amount;
  });

  // Data for Bar/Line chart
  const barData = monthlyTemplate.map(({ label, amount }) => ({
    month: label,
    amount,
  }));

  // Group expenses by category for Pie chart
  const categoryStats = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Format category data for Pie chart
  const pieData = Object.entries(categoryStats).map(([key, value]) => ({
    name: key,
    value,
    percent: ((value / totalExpense) * 100).toFixed(1),
  }));

  // Monthly expense stats
  const monthsSorted = [...barData];
  const currentMonth = monthsSorted.at(-1)?.amount || 0;
  const previousMonth = monthsSorted.at(-2)?.amount || 0;
  const avgMonthly = (totalExpense / monthsSorted.length).toFixed(2);

  // Get category with highest total spend
  const topCategory = pieData.reduce(
    (prev, curr) => (curr.value > prev.value ? curr : prev),
    { name: "-", value: 0 }
  );

  // Get most frequently used category
  const mostFrequentCategory = (() => {
    const freq = {};
    for (let e of expenses) freq[e.category] = (freq[e.category] || 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  })();

  // Export expenses as CSV
  const handleExportCSV = () => {
    const rows = [["Title", "Amount", "Date", "Category", "Description"]];
    expenses.forEach((e) => {
      rows.push([e.title, e.amount, e.date, e.category, e.description || ""]);
    });
    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "expenses.csv";
    a.click(); // triggers download
  };

  // Show loading message
  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center text-gray-600">
        <p className="text-lg animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  // Show error with retry option
  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  /*
    Renders the Analytics page:
    - Page title with "Export CSV" button
    - Stat cards showing total, monthly comparison, top category, and average spend
    - Pie chart of expenses by category
    - Toggleable bar/line chart showing monthly expense trends
  */

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        {/* Page Title + Export Button */}
        <h2 className="text-3xl font-bold text-gray-800">📊 Analytics</h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-md shadow hover:bg-blue-200 transition duration-300 hover:scale-105"
        >
          <FaFileExport /> Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Spent" value={`₹ ${totalExpense}`} icon={<FaChartBar />} />
        <StatCard label="This vs Last Month" value={`₹ ${currentMonth} / ₹ ${previousMonth}`} icon={<FaExchangeAlt />} />
        <StatCard label="Top Category" value={topCategory.name} icon={<FaStar />} />
        <StatCard label="Avg. Monthly Spend" value={`₹ ${avgMonthly}`} icon={<FaChartPie />} />
      </div>

      {/* Chart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Pie Chart by Category */}
        <ChartCard title="📊 By Category" subtitle={`Most Frequent: ${mostFrequentCategory}`}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="value"
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${percent}%`} // shows label as "Food: 24.5%"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Trend (Bar/Line) */}
        <ChartCard
          title="📅 Monthly Trend"
          rightContent={
            <button
              onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
              className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              Toggle Chart
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "bar" ? (
              <BarChart data={barData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={barData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ label, value, icon }) => (
  <motion.div
    className="bg-white p-5 rounded-xl shadow text-center border border-gray-100 hover:shadow-md transition duration-300 transform hover:scale-[1.03]"
    whileHover={{ scale: 1.04 }}
  >
    <div className="text-blue-600 mb-2 text-xl flex justify-center">{icon}</div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
  </motion.div>
);

// Reusable Chart Card Layout
const ChartCard = ({ title, subtitle, children, rightContent }) => (
  <div className="bg-white rounded-xl p-6 shadow transition-transform hover:scale-[1.01]">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {rightContent}
    </div>
    {children}
  </div>
);

export default Analytics;
