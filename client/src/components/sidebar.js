import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaChartPie,
  FaPlusCircle,
  FaListUl,
  FaHome,
  FaUserCircle,
  FaFileInvoice,
  FaSignOutAlt
} from "react-icons/fa";
import { BiSolidCategory } from "react-icons/bi";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
  { name: "Add Expense", path: "/add", icon: <FaPlusCircle /> },
  { name: "All Expenses", path: "/expenses", icon: <FaListUl /> },
  { name: "All Invoices", path: "/invoices", icon: <FaFileInvoice /> },
  { name: "Analytics", path: "/analytics", icon: <FaChartPie /> },
  { name: "Categories", path: "/categories", icon: <BiSolidCategory /> },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
  <div className={`fixed h-screen flex flex-col justify-between transition-all duration-300 
    bg-white dark:bg-gray-900 text-gray-900 dark:text-white 
    w-64`}>
    
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8 text-yellow-600 dark:text-yellow-400">💰 ExpensePro</h1>
      <nav className="space-y-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg 
              hover:bg-gray-200 dark:hover:bg-gray-700 transition 
              ${location.pathname === item.path 
                ? "bg-gray-300 dark:bg-gray-800" : ""}`}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>

    <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
      <Link
        to="/profile"
        className="flex items-center gap-3 text-sm hover:text-yellow-500 transition"
      >
        <FaUserCircle className="text-xl" />
        <span className="hidden sm:inline">{user?.displayName || 'Profile'}</span>
      </Link>
    </div>
  </div>
);

};

export default Sidebar;
