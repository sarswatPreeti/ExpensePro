import { useEffect, useState, useMemo } from "react";
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

const getDateOnly = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const DashboardPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [dayWiseData, setDayWiseData] = useState([]);
  const [today, setToday] = useState(getDateOnly(new Date()));
  const [loading, setLoading] = useState(false);
  const [filterDays, setFilterDays] = useState(null);
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  const getLast7DaysData = () => {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const label = date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }); // Example: Mon, 8 Jul

      result.push({
        label,
        date: date.toDateString(),
        total: 0,
      });
    }

    expenses.forEach((expense) => {
      const expDate = new Date(expense.date).toDateString();
      const match = result.find((r) => r.date === expDate);
      if (match) {
        match.total += Number(expense.amount);
      }
    });

    return result.map(({ label, total }) => ({
      day: label,
      total,
    }));
  };

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
          if (!categoryMap[category]) categoryMap[category] = 0;
          categoryMap[category] += Number(expense.amount);
        });

        const stats = Object.entries(categoryMap).map(([category, total]) => ({
          category,
          total,
        }));

        setCategoryStats(stats);
        setDayWiseData(getLast7DaysData());
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effect for updating `dayWiseData` daily (or when expenses change)
  useEffect(() => {
    const update = () => setDayWiseData(getLast7DaysData());

    update(); // Run on mount/expenses change

    const interval = setInterval(() => {
      const now = getDateOnly(new Date());
      if (now.getTime() !== today.getTime()) {
        update();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [expenses, today]);

  // Effect for updating `today`
  useEffect(() => {
    const interval = setInterval(() => {
      const now = getDateOnly(new Date());
      setToday(prev => {
        if (prev.getTime() !== now.getTime()) return now;
        return prev;
      });
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalTransactions = expenses.length;
  const categoryCount = new Set(expenses.map(e => e.category)).size;

  // const today = getDateOnly(new Date());

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Start of this week (Monday)
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  // Start of last week
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  // Start and end of this/last month
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // last day of previous month

  // Helper function to get total expenses for a date range
  const getTotalForRange = (startDate, endDate) =>
    expenses
      .filter((exp) => {
        const expDate = getDateOnly(exp.date);
        return expDate >= getDateOnly(startDate) && expDate <= getDateOnly(endDate);
      })
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Totals
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

  const recentExpenses = selectedDate
  ? expenses
      .filter(exp =>
        new Date(exp.date).toDateString() ===
        new Date(selectedDate).toDateString()
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // sort by latest
  : [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // sort by latest
      .slice(0, 5);

  const getTrendData = () => {
  const today = new Date();
  let startDate;

  if (filterDays) {
    startDate = new Date();
    startDate.setDate(today.getDate() - filterDays);
  } else {
    const allDates = expenses.map((exp) => new Date(exp.date));
    if (allDates.length === 0) return [];
    startDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  }

  const dateMap = new Map();

  // Ensure dates include day + month + year
  const formatDateLabel = (date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Initialize date map with ₹0 for each date in range
  const current = new Date(startDate);
  while (current <= today) {
    const label = formatDateLabel(current);
    dateMap.set(label, 0);
    current.setDate(current.getDate() + 1);
  }

  // Sum expenses into map
  expenses.forEach((expense) => {
    const expDate = new Date(expense.date);
    if (expDate >= startDate && expDate <= today) {
      const label = formatDateLabel(expDate);
      dateMap.set(label, (dateMap.get(label) || 0) + Number(expense.amount));
    }
  });

  // Convert to array for chart
  let trendArray = Array.from(dateMap.entries()).map(([date, total]) => ({
    date,
    total,
  }));

  // For all-time, filter out ₹0
  if (!filterDays) {
    trendArray = trendArray.filter((item) => item.total > 0);
  }

  return trendArray;
  };

  const trendData = getTrendData();

  const tileContent = ({ date, view }) => {
    let hasExpense = false;
    let total = 0;

    if (view === "month") {
      const matching = expenses.filter(
        (exp) => new Date(exp.date).toDateString() === date.toDateString()
      );
      total = matching.reduce((sum, exp) => sum + Number(exp.amount), 0);
      hasExpense = matching.length > 0;
    } else if (view === "year") {
      const matching = expenses.filter((exp) => {
        const d = new Date(exp.date);
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth()
        );
      });
      total = matching.reduce((sum, exp) => sum + Number(exp.amount), 0);
      hasExpense = matching.length > 0;
    } else if (view === "decade") {
      const matching = expenses.filter(
        (exp) => new Date(exp.date).getFullYear() === date.getFullYear()
      );
      total = matching.reduce((sum, exp) => sum + Number(exp.amount), 0);
      hasExpense = matching.length > 0;
    }

    // Return red dot and set title on the wrapper element
    return (
      <div title={hasExpense ? `₹${total.toFixed(2)} spent` : ""}>
        {hasExpense && (
          <div className="h-2 w-2 rounded-full bg-red-500 mx-auto mt-1" />
        )}
      </div>
    );
  };

  const computedDayWiseData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const formatted = date.toLocaleDateString("en-GB");

      const total = expenses
        .filter(exp => new Date(exp.date).toLocaleDateString("en-GB") === formatted)
        .reduce((sum, exp) => sum + exp.amount, 0);

      return {
        day: date.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
        }),
        total,
      };
    });

    return last7Days;
  }, [expenses, today]);

  useEffect(() => {
    setDayWiseData(computedDayWiseData);
  }, [computedDayWiseData]);

  const SummaryCard = ({ icon, label, value }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const ComparisonCard = ({ label, amount, change, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold text-${color}-700`}>
        ₹{amount.toFixed(2)} <span className="text-sm">{change}</span>
      </p>
    </div>
  );

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

  const CategoryPieChart = ({ data }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-12">
      <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        💹 Spending Distribution by Category
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            outerRadius={140}
            label={({ percent, category }) => `${category} ${(percent * 100).toFixed(1)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const ExpenseTrendChart = ({ data }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-12">
      <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        📈 Expense Trend Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => date.slice(0, 6)}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, (dataMax) => Math.ceil(dataMax * 1.2)]}
          />
          <Tooltip
            formatter={(value) => `₹${value.toFixed(2)}`}
            labelStyle={{ fontWeight: "bold" }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6, fill: "#1e40af" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen space-y-12">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-10 animate-fade-in">
        📊 Expense Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Summary Cards */}
        <SummaryCard icon={<FaWallet className="text-3xl text-blue-600" />} label="Total Spent" value={`₹${totalSpent.toFixed(2)}`} />
        <SummaryCard icon={<FaListUl className="text-3xl text-indigo-600" />} label="Transactions" value={totalTransactions} />
        <SummaryCard icon={<FaTags className="text-3xl text-green-600" />} label="Categories Used" value={categoryCount} />

        {/* Comparison Cards */}
        <ComparisonCard label="Today vs Yesterday" amount={todayTotal} change={todayTrend.change} color="blue" />
        <ComparisonCard label="This Week vs Last Week" amount={weekTotal} change={weekTrend.change} color="indigo" />
        <ComparisonCard label="This Month vs Last Month" amount={monthTotal} change={monthTrend.change} color="green" />
      </div>

      {/* Calendar + Weekly Chart + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Calendar Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 w-full col-span-1">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-lg font-semibold text-gray-800">📅 Select Date</h3>
            {!selectedDate &&
              (activeStartDate.getMonth() !== new Date().getMonth() ||
                activeStartDate.getFullYear() !== new Date().getFullYear()) && (
                <button
                  className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-md transition"
                  onClick={() => setActiveStartDate(new Date())}
                >
                  🔄 Return to{" "}
                  {new Date().toLocaleString("default", { month: "long" })}{" "}
                  {new Date().getFullYear()}
                </button>
              )}
          </div>
          <Calendar
            onChange={(date) => {
              setCalendarDate(date);
              setSelectedDate(date);
              setActiveStartDate(date);
            }}
            value={calendarDate}
            tileContent={tileContent}
            activeStartDate={activeStartDate}
            onActiveStartDateChange={({ activeStartDate }) =>
              setActiveStartDate(activeStartDate)
            }
            className="rounded shadow border hover:shadow-lg transition duration-300"
          />
          {selectedDate && (
            <button
              className="mt-4 w-full py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
              onClick={() => {
                const now = new Date();
                setCalendarDate(now);
                setSelectedDate(null);
                setActiveStartDate(now);
              }}
            >
              Clear Date Filter
            </button>
          )}
        </div>

        {/* Weekly Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg col-span-2">
          <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            📅 Last 7 Days Spending
          </h3>

          {loading ? (
            <p className="text-center text-gray-500">Loading chart...</p>
          ): dayWiseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dayWiseData}
                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
                barCategoryGap={16}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(value) => value.slice(0, 3)}
                  tick={{ fontSize: 13, fill: "#374151" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "#374151" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: "#f9fafb", borderColor: "#d1d5db" }}
                  labelStyle={{ fontWeight: "bold", color: "#111827" }}
                />
                <Bar
                  dataKey="total"
                  fill="#34d399"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  isAnimationActive={false} // ✅ disables initial animation for faster render
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 italic col-span-2">
              No expense data for the last 7 days.
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses - full width below */}
      <div className="mb-12 bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">🕒 Recent Expenses</h3>
        <p className="text-sm text-gray-500 mb-6">
          Showing expenses for:{" "}
          <span className="text-gray-800 font-medium">
            {selectedDate
              ? new Date(selectedDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "All Dates"}
          </span>
        </p>
        <ul className="divide-y divide-gray-200">
          {recentExpenses.map((exp, index) => (
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
        <CategoryPieChart data={categoryStats} />
      )}

      {/* Trend Filter */}
      <div className="mb-4 flex items-center gap-4 justify-end">
        <label className="text-sm font-medium text-gray-700">Trend Period:</label>
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

      {/* Line Chart */}
      {trendData.length > 0 ? (
        <ExpenseTrendChart data={trendData} />
      ) : (
        <div className="text-center text-gray-500 mb-12">
          No data to display in this period.
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
