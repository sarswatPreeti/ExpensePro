import { FaChevronDown } from "react-icons/fa";

/*
 * WelcomeSection Component
 * Displays the landing introduction with a welcoming message,
 * a headline for the app, a brief description, and a scroll-down indicator.
*/

const WelcomeSection = () => {
  return (
    <section className="bg-gradient-to-r from-indigo-100 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 text-center transition-all duration-300">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

          {/* -------- Headline -------- */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-indigo-800 dark:text-indigo-200 leading-tight tracking-tight">
            Welcome to{" "}
            <span className="inline-block animate-pop text-indigo-700 dark:text-indigo-300">
              ExpensePro 💰
            </span>
          </h1>

          {/* -------- Description / Subheading -------- */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Empower your financial decisions with ExpensePro — a smart, user-friendly
            platform designed to help you track expenses, visualize trends, and
            achieve lasting control over your budget.
          </p>

          {/* -------- Scroll-down Icon (Navigates to Dashboard section) -------- */}
          <div className="pt-4 flex justify-center">
            <a href="#dashboard" aria-label="Scroll to dashboard">
              <FaChevronDown className="text-indigo-500 dark:text-indigo-400 text-2xl sm:text-3xl animate-bounce hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
