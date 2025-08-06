import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Hook to access the current route location
import Sidebar from "../components/sidebar";
import DarkModeToggle from "../components/darkModeToggle";

const MainLayout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const location = useLocation(); // Get the current location object from React Router

  // Define the routes where the sidebar should be hidden
  const hideSidebarRoutes = ["/", "/login", "/register"];
  const currentPath = location.pathname; // Get the current URL path

  // Determine if the sidebar should be hidden based on current path
  const shouldHideSidebar = hideSidebarRoutes.includes(currentPath);

  return (
    <div className="flex">
      {/* Conditionally render the Sidebar unless on excluded routes */}
      {!shouldHideSidebar && <Sidebar />}

      {/* Main content area; apply left margin if sidebar is shown */}
      <main className={`${!shouldHideSidebar ? "ml-64" : ""} w-full bg-gray-100 min-h-screen`}>

        <div className="flex justify-end">
          <DarkModeToggle isDark={darkMode} toggle={() => setDarkMode(!darkMode)} />
        </div>

        {/* Render the child components/content */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
