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

const API = "http://localhost:4000/api/expenses";
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a1cfff", "#f87171", "#34d399"];

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    axios.get(API).then((res) => {
      setExpenses(res.data);
    });
  }, []);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const monthlyStats = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {});

  const categoryStats = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieData = Object.entries(categoryStats).map(([key, value]) => ({
    name: key,
    value,
    percent: ((value / totalExpense) * 100).toFixed(1),
  }));

  const barData = Object.entries(monthlyStats).map(([key, value]) => ({
    month: key,
    amount: value,
  }));

  const monthsSorted = Object.keys(monthlyStats)
    .map((m) => ({ name: m, value: monthlyStats[m] }))
    .sort((a, b) => new Date("1 " + a.name) - new Date("1 " + b.name));

  const currentMonth = monthsSorted.at(-1)?.value || 0;
  const previousMonth = monthsSorted.at(-2)?.value || 0;
  const avgMonthly = (totalExpense / monthsSorted.length).toFixed(2);

  const topCategory = pieData.reduce(
    (prev, curr) => (curr.value > prev.value ? curr : prev),
    { name: "-", value: 0 }
  );

  const mostFrequentCategory = (() => {
    const freq = {};
    for (let e of expenses) freq[e.category] = (freq[e.category] || 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  })();

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
    a.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 transition-transform hover:scale-105 mb-10">
          📊 Analytics
        </h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-md shadow hover:bg-blue-200 transition duration-300 hover:scale-105"
        >
          <FaFileExport /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Spent" value={`₹ ${totalExpense}`} icon={<FaChartBar />} />
        <StatCard label="This vs Last Month" value={`₹ ${currentMonth} / ₹ ${previousMonth}`} icon={<FaExchangeAlt />} />
        <StatCard label="Top Category" value={topCategory.name} icon={<FaStar />} />
        <StatCard label="Avg. Monthly Spend" value={`₹ ${avgMonthly}`} icon={<FaChartPie />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-xl p-6 shadow transition-transform hover:scale-[1.01]">
          <div className="flex justify-between mb-4 items-center">
            <h3 className="text-lg font-semibold">📊 By Category</h3>
            <p className="text-sm text-gray-500">Most Frequent: {mostFrequentCategory}</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="value"
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${percent}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow transition-transform hover:scale-[1.01]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">📅 Monthly Trend</h3>
            <button
              onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
              className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              Toggle Chart
            </button>
          </div>

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
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-5 rounded-xl shadow text-center border border-gray-100 hover:shadow-md transition duration-300 transform hover:scale-[1.03]">
    <div className="text-blue-600 mb-2 text-xl flex justify-center animate-fade-in-slow">{icon}</div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
  </div>
);

export default Analytics;
