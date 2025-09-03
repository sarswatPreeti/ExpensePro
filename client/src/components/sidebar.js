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
      w-16 sm:w-20 md:w-48 lg:w-56 xl:w-64 z-40 shadow-lg`}>
      
      <div className="p-2 sm:p-3 md:p-4 lg:p-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-bold mb-4 sm:mb-6 md:mb-8 text-yellow-600 dark:text-yellow-400 truncate">
          <Link to="/dashboard" className="hidden md:inline font-bold text-lg">
            💰 ExpensePro
          </Link>
          <Link to="/dashboard" className="md:hidden">💰</Link>
        </h1>
        <nav className="space-y-2 sm:space-y-3 md:space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-2 sm:gap-2 md:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg 
                hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group
                ${location.pathname === item.path 
                  ? "bg-gray-300 dark:bg-gray-800 shadow-md" : ""}`}
              title={item.name}
            >
              <div className={`text-base sm:text-lg md:text-lg lg:text-xl transition-all duration-300 ${
                location.pathname === item.path 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
              }`}>
                {item.icon}
              </div>
              <span className="hidden md:inline text-sm sm:text-sm md:text-base lg:text-base font-medium truncate">
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-2 sm:p-3 md:p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Link
          to="/profile"
          className="flex items-center gap-2 sm:gap-2 md:gap-3 text-xs sm:text-sm hover:text-yellow-500 transition-all duration-300 group"
          title={user?.displayName || 'Profile'}
        >
          <FaUserCircle className="text-lg sm:text-xl md:text-xl lg:text-xl transition-all duration-300 text-gray-600 dark:text-gray-400 group-hover:text-yellow-500" />
          <span className="hidden md:inline text-sm sm:text-sm md:text-sm lg:text-sm font-medium truncate">
            {user?.displayName || 'Profile'}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
