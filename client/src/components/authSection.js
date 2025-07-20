import { Link } from "react-router-dom";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

/*
 * AuthSection Component
 * Displays a call-to-action for user authentication:
 * - Title and description
 * - Sign Up and Log In buttons
 * - Right-side illustration
 * Used as an entry point to guide users toward creating or accessing an account.
*/

const AuthSection = () => {
  return (
    <section id="auth" className="bg-indigo-50 py-16 sm:py-20 md:py-28 lg:py-32">
      <div className="max-w-screen-xl mx-auto px-4">

        {/* Grid layout: text on left, image on right (2 columns on md+) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          
          {/* -------- Left Side: Heading, Description, Buttons -------- */}
          <div className="text-center md:text-left">

            {/* Section Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-800 mb-5 leading-tight tracking-tight">
              Ready to take control{" "}
              <br className="hidden md:inline" /> {/* Adds line break on medium+ screens */}
              of your finances?
            </h2>

            {/* Subheading Text */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-6">
              New to 
              <span className="font-semibold text-indigo-600">ExpensePro</span>
              ? Create an account and start tracking your expenses.
              <br className="hidden md:inline" /> {/* Conditional line break */}
              Already a user? Just log in and continue your journey!
            </p>

            {/* -------- Buttons (Sign Up & Log In) -------- */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">

              {/* Sign Up Button */}
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-xl text-sm lg:text-lg flex items-center gap-2 shadow-md transition duration-300"
              >
                <FaUserPlus />
                Sign Up
              </Link>

              {/* Log In Button */}
              <Link
                to="/login"
                className="border border-indigo-600 text-indigo-700 px-4 py-2 lg:px-6 lg:py-3 rounded-xl text-sm lg:text-lg flex items-center gap-2 hover:bg-indigo-100 transition duration-300"
              >
                <FaSignInAlt />
                Log In
              </Link>
            </div>
          </div>

          {/* -------- Right Side: Animated Image -------- */}
          <div className="relative flex justify-center">
            <img
              src="/images/login.svg"
              alt="Secure Login Illustration"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md animate-float" // Floating effect on the image
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthSection;
