import { Link, useLocation } from "react-router-dom";
import {
  FaChartPie,
  FaPlusCircle,
  FaListUl,
  FaHome,
  FaTags,
  FaUserCircle,
} from "react-icons/fa";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
  { name: "Add Expense", path: "/add", icon: <FaPlusCircle /> },
  { name: "All Expenses", path: "/expenses", icon: <FaListUl /> },
  { name: "Analytics", path: "/analytics", icon: <FaChartPie /> },
  { name: "Categories", path: "/categories", icon: <FaTags /> },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col justify-between fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-8 text-yellow-400">💰 ExpensePro</h1>
        <nav className="space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition ${
                location.pathname === item.path ? "bg-gray-800" : ""
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-gray-700">
        <Link
          to="/profile"
          className="flex items-center gap-3 text-sm hover:text-yellow-300"
        >
          <FaUserCircle className="text-xl" />
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
