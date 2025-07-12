import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaWallet,
  FaListUl,
  FaTags,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";

const EXPENSE_API = "http://localhost:4000/api/expenses";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF",
  "#FF4F81", "#3DFF92", "#FF6361", "#6B5B95", "#D65076"
];

const DashboardPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendFilter, setTrendFilter] = useState("7");
  const [filterDays, setFilterDays] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(EXPENSE_API);
        const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sorted);

        const categoryMap = {};
        sorted.forEach((expense) => {
          const category = expense.category || "Uncategorized";
          if (!categoryMap[category]) {
            categoryMap[category] = 0;
          }
          categoryMap[category] += Number(expense.amount);
        });

        const stats = Object.entries(categoryMap).map(([category, total]) => ({
          category,
          total,
        }));

        setCategoryStats(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalTransactions = expenses.length;
  const categoryCount = new Set(expenses.map(e => e.category)).size;

  const getTotalForRange = (startDate, endDate) =>
    expenses
      .filter(exp => new Date(exp.date) >= startDate && new Date(exp.date) <= endDate)
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const thisWeekStart = new Date();
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const todayTotal = getTotalForRange(today, today);
  const yesterdayTotal = getTotalForRange(yesterday, yesterday);
  const weekTotal = getTotalForRange(thisWeekStart, today);
  const lastWeekTotal = getTotalForRange(lastWeekStart, thisWeekStart);
  const monthTotal = getTotalForRange(thisMonthStart, today);
  const lastMonthTotal = getTotalForRange(lastMonthStart, lastMonthEnd);

  const getTrend = (current, previous) => {
    if (previous === 0) return { change: "N/A", direction: "" };
    const percent = ((current - previous) / previous) * 100;
    return {
      change: `${percent > 0 ? "🔼" : "🔽"}${Math.abs(percent).toFixed(1)}%`,
      direction: percent > 0 ? "up" : "down",
    };
  };

  const todayTrend = getTrend(todayTotal, yesterdayTotal);
  const weekTrend = getTrend(weekTotal, lastWeekTotal);
  const monthTrend = getTrend(monthTotal, lastMonthTotal);

  const filteredExpenses = filterDays
    ? expenses.filter(exp =>
        new Date(exp.date).toDateString() ===
        new Date(new Date().setDate(new Date().getDate() - filterDays)).toDateString()
      )
    : calendarDate
    ? expenses.filter(exp =>
        new Date(exp.date).toDateString() === new Date(calendarDate).toDateString()
      )
    : expenses;

  const recentExpenses = selectedDate
  ? expenses.filter(exp =>
      new Date(exp.date).toDateString() === new Date(selectedDate).toDateString()
    ).slice(0, 5)
  : expenses.slice(0, 5);

  const trendExpenses = filterDays
    ? expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const filterStart = new Date();
        filterStart.setDate(filterStart.getDate() - filterDays);
        return expDate >= filterStart && expDate <= new Date();
      })
    : expenses;

  const trendData = trendExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date).toLocaleDateString();
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.total += Number(expense.amount);
    } else {
      acc.push({ date, total: Number(expense.amount) });
    }
    return acc;
  }, []);

  const dayWiseData = Array.from(
    expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      acc.set(day, (acc.get(day) || 0) + Number(expense.amount));
      return acc;
    }, new Map())
  ).map(([day, total]) => ({ day, total }));

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasExpense = expenses.some(
        exp => new Date(exp.date).toDateString() === date.toDateString()
      );
      return hasExpense ? <div className="h-1 w-1 rounded-full bg-red-500 mx-auto mt-1" /> : null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10 animate-fade-in">
        📊 Expense Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="rounded-xl shadow bg-white p-4">
          <Calendar
            onChange={(date) => {
              setCalendarDate(date);
              setSelectedDate(date);
            }}
            value={calendarDate}
            tileContent={tileContent}
            className="rounded shadow border hover:shadow-lg transition duration-300"
          />
          {calendarDate && (
            <button
              className="mt-4 w-full py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
              onClick={() => {
                const now = new Date();
                setCalendarDate(now);
                setSelectedDate(null); // Clear selection
              }}
            >
              Clear Date Filter
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
            <FaWallet className="text-3xl text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-xl font-semibold text-gray-800">₹{totalSpent.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
            <FaListUl className="text-3xl text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="text-xl font-semibold text-gray-800">{totalTransactions}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
            <FaTags className="text-3xl text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Categories Used</p>
              <p className="text-xl font-semibold text-gray-800">{categoryCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500 mb-1">Today vs Yesterday</p>
          <p className="text-2xl font-bold text-blue-700">
            ₹{todayTotal.toFixed(2)} <span className="text-sm">{todayTrend.change}</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500 mb-1">This Week vs Last Week</p>
          <p className="text-2xl font-bold text-indigo-700">
            ₹{weekTotal.toFixed(2)} <span className="text-sm">{weekTrend.change}</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-sm text-gray-500 mb-1">This Month vs Last Month</p>
          <p className="text-2xl font-bold text-green-700">
            ₹{monthTotal.toFixed(2)} <span className="text-sm">{monthTrend.change}</span>
          </p>
        </div>
      </div>

      <h4 className="text-md text-gray-500 mb-2">
        Showing expenses for: <span className="font-semibold text-gray-800">
          {calendarDate ? new Date(calendarDate).toDateString() : "All Dates"}
        </span>
      </h4>

      {/* Recent Expenses */}
      <div className="mb-12 bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">🕒 Recent Expenses</h3>
        <ul className="divide-y divide-gray-200">
          {recentExpenses.slice(0, 5).map((exp, index) => (
            <li key={index} className="py-3 flex justify-between items-center">
              <div>
                <p className="text-gray-700 font-medium">{exp.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(exp.date).toLocaleDateString()} — {exp.category}
                </p>
              </div>
              <p className="text-blue-600 font-bold">₹{exp.amount.toFixed(2)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-right">
          <button
            onClick={() => navigate("/expenses")}
            className="text-sm px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 transition"
          >
            View All Expenses
          </button>
        </div>
      </div>

      {/* Pie Chart */}
      {categoryStats.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            💹 Spending Distribution by Category
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryStats}
                dataKey="total"
                nameKey="category"
                outerRadius={140}
                label={({ percent, category }) =>
                  `${category} ${(percent * 100).toFixed(1)}%`
                }
              >
                {categoryStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <LabelList
                  dataKey="category"
                  position="outside"
                  style={{ fill: "#333", fontSize: 12 }}
                />
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filter for Line Chart */}
      <div className="mb-4 flex items-center gap-4 justify-end">
        <label className="text-sm font-medium text-gray-700">Filter Trend:</label>
        <select
          className="border rounded px-3 py-1 text-sm"
          value={filterDays || ""}
          onChange={(e) => setFilterDays(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
        {filterDays && (
          <button
            onClick={() => setFilterDays(null)}
            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Line Chart - Expense Trend */}
       {trendData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            📈 Expense Trend Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" interval={0} height={60} />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bar Chart - Weekly Breakdown */}
      {dayWiseData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            📅 Weekly Spending Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayWiseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Bar dataKey="total" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
