import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../contexts/AuthContext";
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

// Chart colors
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a1cfff", "#f87171", "#34d399"];

// Main Analytics Component
const Analytics = () => {
  const { isAuthenticated } = useAuth();

  // States for data, loading, errors, and chart type
  const [expenses, setExpenses] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch expense data on component mount
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!isAuthenticated()) return;
      
      try {
        setLoading(true);
        const res = await axiosInstance.get("/expenses"); // Fetch data from API
        setExpenses(res.data); // Store expenses in state
        setError(""); // Clear any previous error
      } catch (err) {
        setError("Failed to load expenses. Try again."); // Handle error
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchExpenses();
  }, [isAuthenticated]);

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

  // Helper to safely get category name across shapes
  const getCategoryName = (exp) => {
    const nameFromObj = exp.category?.name || exp.Category?.name;
    if (nameFromObj) return nameFromObj;
    if (typeof exp.category === "string") return exp.category;
    return "Uncategorized";
  };

  // Group expenses by category for Pie chart
  const categoryStats = expenses.reduce((acc, expense) => {
    const categoryName = getCategoryName(expense);
    acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
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
    for (let e of expenses) {
      const name = getCategoryName(e);
      freq[name] = (freq[name] || 0) + 1;
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  })();

  // Export expenses as CSV
  const handleExportCSV = () => {
    const rows = [["Title", "Amount", "Date", "Category", "Description"]];
    expenses.forEach((e) => {
      rows.push([e.title, e.amount, e.date, getCategoryName(e), e.description || ""]);
    });
    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "expenses.csv";
    a.click();
  };

  // Show loading message
  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto text-center text-gray-600">
        <p className="text-sm sm:text-base md:text-lg animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  // Show error with retry option
  if (error) {
    return (
      <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto text-center text-red-600">
        <p className="text-sm sm:text-base">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm sm:text-base"
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
    <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen animate-fade-in transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        {/* Page Title + Export Button */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">📊 Analytics</h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold rounded-md shadow hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
        >
          <FaFileExport className="text-xs sm:text-sm" /> Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <StatCard label="Total Spent" value={`₹ ${totalExpense}`} icon={<FaChartBar />} />
        <StatCard label="This vs Last Month" value={`₹ ${currentMonth} / ₹ ${previousMonth}`} icon={<FaExchangeAlt />} />
        <StatCard label="Top Category" value={topCategory.name} icon={<FaStar />} />
        <StatCard label="Avg. Monthly Spend" value={`₹ ${avgMonthly}`} icon={<FaChartPie />} />
      </div>

      {/* Chart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10">
        {/* Pie Chart by Category */}
        <ChartCard title="📊 By Category" subtitle={`Most Frequent: ${mostFrequentCategory}`}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                dataKey="value"
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
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
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
            >
              Toggle Chart
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={250}>
            {chartType === "bar" ? (
              <BarChart data={barData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={barData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
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
    className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-5 rounded-xl shadow text-center border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 transform hover:scale-[1.03]"
    whileHover={{ scale: 1.04 }}
  >
    <div className="text-blue-600 dark:text-blue-400 mb-1 sm:mb-2 text-lg sm:text-xl flex justify-center">{icon}</div>
    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</h4>
  </motion.div>
);

// Reusable Chart Card Layout
const ChartCard = ({ title, subtitle, children, rightContent }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 shadow transition-all duration-300 hover:scale-[1.01]">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {rightContent}
    </div>
    {children}
  </div>
);

export default Analytics;
