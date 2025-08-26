import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Hook to access the current route location
import Sidebar from "../components/sidebar";

const MainLayout = ({ children }) => {

  const location = useLocation(); // Get the current location object from React Router

  // Define the routes where the sidebar should be hidden
  const hideSidebarRoutes = ["/", "/login", "/register"];
  const currentPath = location.pathname; // Get the current URL path

  // Determine if the sidebar should be hidden based on current path
  const shouldHideSidebar = hideSidebarRoutes.includes(currentPath);

  return (
    <div className="flex transition-all duration-300">
      {/* Conditionally render the Sidebar unless on excluded routes */}
      {!shouldHideSidebar && <Sidebar />}

      {/* Main content area; apply responsive left margin if sidebar is shown */}
      <main className={`${!shouldHideSidebar ? "ml-16 sm:ml-20 md:ml-48 lg:ml-56 xl:ml-64" : ""} w-full bg-gray-100 dark:bg-gray-900 min-h-screen transition-all duration-300`}>

        {/* Render the child components/content */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
