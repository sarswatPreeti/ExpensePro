import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

/*
 * Navbar Component
 * Displays a responsive navigation bar with:
 * - Logo
 * - Navigation links (from `featureLinks`)
 * - A sticky top bar
 * - Hamburger menu for mobile and small screens
 * - Sliding sidebar for mobile navigation
*/

const Navbar = ({ featureLinks = [] }) => {
  const [isOpen, setIsOpen] = useState(false); // Controls visibility of mobile sidebar

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 flex items-center justify-between">
        {/* -------- Logo Section -------- */}
        <a
          href="#"
          className="text-2xl sm:text-3xl lg:text-[1.75rem] xl:text-4xl font-extrabold text-indigo-600 tracking-tight whitespace-nowrap pr-6"
        >
          💰 ExpensePro
        </a>

        {/* -------- Desktop Navigation Links -------- */}
        <div className="hidden lg:flex items-center justify-end gap-4 xl:gap-6 flex-nowrap min-w-0 overflow-hidden flex-grow">
          {featureLinks.map((feature) => (
            <a
              key={feature}
              href={`#${feature.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "")}`} // Creates anchor link ID
              className="text-sm lg:text-base xl:text-lg text-gray-700 font-medium hover:text-indigo-600 transition duration-300 whitespace-nowrap"
            >
              {feature}
            </a>
          ))}

          {/* Call-to-action button */}
          <a
            href="#auth"
            className="text-sm xl:text-base bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-semibold shadow whitespace-nowrap"
          >
            Get Started
          </a>
        </div>

        {/* -------- Hamburger Icon (Mobile only) -------- */}
        <button
          onClick={() => setIsOpen(true)} // Open sidebar
          className="lg:hidden text-2xl text-gray-600 hover:text-indigo-600 transition"
          aria-label="Open menu"
        >
          <FaBars />
        </button>
      </div>

      {/* -------- Overlay Background (only when sidebar is open) -------- */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)} // Click on background closes sidebar
        />
      )}

      {/* -------- Sliding Sidebar (Mobile) -------- */}
      <div
        className={`fixed top-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } right-0 lg:hidden h-full w-[75%] sm:w-[60%] md:w-[50%] bg-white shadow-xl transition-transform duration-300 ease-in-out z-50 px-6 py-6`}
      >
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold text-indigo-600">Menu</span>
          <button
            onClick={() => setIsOpen(false)} // Close sidebar
            className="text-2xl text-gray-600 hover:text-red-600 transition"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* -------- Sidebar Navigation Links -------- */}
        <ul className="flex flex-col gap-5">
          {featureLinks.map((feature) => (
            <li key={feature}>
              <a
                href={`#${feature.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "")}`}
                className="block text-lg sm:text-xl text-gray-700 font-medium hover:text-indigo-600 transition whitespace-nowrap"
                onClick={() => setIsOpen(false)} // Auto close sidebar on link click
              >
                {feature}
              </a>
            </li>
          ))}

          {/* CTA Button in Sidebar */}
          <li>
            <a
              href="#auth"
              className="inline-block mt-2 text-white bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded-xl font-semibold shadow whitespace-nowrap"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
