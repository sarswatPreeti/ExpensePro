import TopNavbar from "../components/topNavbar";
import FeatureSection from "../components/featureCard";
import AuthSection from "../components/authSection";
import WelcomeSection from "../components/welcomeSection";

// --- Feature List ---
// This array holds all the main features of the application.
// Each feature has a title, image, description, and a list of miniFeatures.

const features = [
  {
    title: "Dashboard",
    image: "/images/dashboard/dashboard.svg",
    description: "Your personal financial command center — the Dashboard brings all your key insights together in one dynamic view. Instantly track your total expenses, monitor category-wise spending, compare income vs expenses, and spot trends over time. With interactive graphs, calendar-based tracking, and weekly summaries, the Dashboard helps you understand your spending behavior and make smarter financial decisions effortlessly.",
    miniFeatures: [
      {
        title: "Total Summary Cards",
        image: "/images/dashboard/summary-card.svg",
        description: "Quickly glance at total expenses, number of transactions, and total categories.",
      },
      {
        title: "Category-Wise Expense Comparison",
        image: "/images/dashboard/pie-chart.svg",
        description: "Visualize and compare how much you spend in each category with colorful pie and bar charts.",
      },
      {
        title: "Weekly Expense Breakdown",
        image: "/images/dashboard/weekly-graph.svg",
        description: "Stay up to date with your latest transactions right on your dashboard.",
      },
      {
        title: "Calendar View of Expenses",
        image: "/images/dashboard/calendar.svg",
        description: "Track your spending on a daily basis using an interactive calendar.",
      },
      {
        title: "Trend Over Time Graphs",
        image: "/images/dashboard/trend-graph.svg",
        description: "Analyze long-term patterns and discover peak spending periods with area/time graphs.",
      },
      {
        title: "Recent Expenses Overview",
        image: "/images/dashboard/recent-expenses.svg",
        description: "Stay up to date with your latest transactions right on your dashboard.",
      },
    ],
  },

  {
    title: "Add Expense",
    image: "/images/addExpense/add-expense.svg",
    description: "Track your spending effortlessly using our Add Expense feature. Log expenses with key details like amount, category, description, and date. You can upload invoice images for future reference and ensure every transaction is properly documented. The intuitive form lets you organize expenses by category, add personal notes, and manage recurring entries, helping you maintain accurate financial records. Whether it’s a coffee purchase or a utility bill, capture it all in seconds and never miss a detail.",
    miniFeatures: [
      {
        title: "Input Details",
        image: "/images/addExpense/add-content.svg",
        description: "Enter amount, date, and purpose of your spending.",
      },
      {
        title: "Attach Invoice",
        image: "/images/addExpense/invoice-upload.svg",
        description: "Upload proof of purchase as receipt or bill.",
      },
      {
        title: "Assign Category",
        image: "/images/addExpense/category-assign.svg",
        description: "Tag expense as Food, Travel, Bills, and more.",
      },
      {
        title: "Success/Error Feedback",
        image: "/images/addExpense/feedback.svg",
        description: "Get real-time feedback when you add an expense.",
      },
      {
        title: "Instant Display",
        image: "/images/allExpense/all-expenses.svg",
        description: "Added expense shows up instantly in All Expenses.",
      },
    ],
  },

  {
    title: "All Expenses",
    image: "/images/allExpense/all-expenses.svg",
    description: "Keep a complete record of all your spending in one place. The All Expenses page displays a detailed list of your past expenses including the amount, date, description, category, and invoice (if attached). With advanced filtering, search, and sorting options, you can quickly find specific transactions and get a clear view of your spending history. It's the perfect tool for reviewing and managing your financial behavior over time.",
    miniFeatures: [
      {
        title: "View All Entries",
        image: "/images/allExpense/view-all-expense.svg",
        description: "Instantly view every expense you've recorded in a clean, tabular format.",
      },
      {
        title: "Filter by Date, Category, or Amount",
        image: "/images/allExpense/filter-option.svg",
        description: "Quickly narrow down your expenses using date ranges, categories, or amount filters.",
      },
      {
        title: "Search Functionality",
        image: "/images/allExpense/search-expense.svg",
        description: "Use keywords to find specific expenses instantly with real-time search.",
      },
      {
        title: "Edit or Delete Any Expense",
        image: "/images/allExpense/clean-up.svg",
        description: "Made a mistake? No problem. Easily update or remove expense entries.",
      },
      {
        title: "Download Invoice (if attached)",
        image: "/images/allExpense/download.svg",
        description: "View or download invoices attached to individual expenses for future reference.",
      },
    ],
  },

  {
    title: "Invoices",
    image: "/images/invoice/invoice-folder.svg",
    description: "The Invoice page offers a centralized hub to view, organize, and manage all the invoices linked to your expenses. Whether you're tracking reimbursements, storing proof of purchases, or preparing for tax filings, this section ensures your financial documents are secure, accessible, and easy to maintain. You can preview, download, edit, replace, or delete any invoice effortlessly — keeping your records clean, up-to-date, and always at your fingertips.",
    miniFeatures: [
      {
        title: "View Uploaded Invoices",
        image: "/images/invoice/view-invoices.svg",
        description: "Browse all invoice files linked to your expenses with thumbnails or file previews.",
      },
      {
        title: "Download Invoice PDFs",
        image: "/images/invoice/download-invoice.svg",
        description: "Quickly download any invoice file with a single click for offline access.",
      },
      {
        title: "Search & Filter by Expense",
        image: "/images/invoice/filter-dropdown.svg",
        description: "Easily find specific invoices by searching with expense name, category, or date.",
      },
      {
        title: "Preview Before Download",
        image: "/images/invoice/invoice-preview.svg",
        description: "Automatically highlights your top spending areas and savingsPreview your invoice file directly within the app before deciding to download.",
      },
      {
        title: "Replace Invoice File",
        image: "/images/invoice/edit-invoice.svg",
        description: "Need to update a document? Replace the existing invoice file without deleting the expense.",
      },
      {
        title: "Delete Invoice",
        image: "/images/invoice/delete-invoice.svg",
        description: "Remove outdated or incorrect invoices permanently from your records.",
      },
    ],
  },

  {
    title: "Analytics",
    image: "/images/analytics/analytics.svg",
    description: "Dive deeper into your financial habits with powerful visual insights. The Analytics section helps you understand where your money goes, identify patterns, and make smarter budgeting decisions. Whether you want to break down expenses by category, track changes over time, or compare your monthly habits—Analytics brings your spending to life through interactive graphs and charts.",
    miniFeatures: [
      {
        title: "Category-wise Spending Chart",
        image: "/images/analytics/category-chart.svg",
        description: "Visual representation of your expenses across different categories.",
      },
      {
        title: "Monthly Expense Trend",
        image: "/images/analytics/monthly-trend.svg",
        description: "Track how your spending changes month over month.",
      },
      {
        title: "Comparative Analytics",
        image: "/images/analytics/compare-expenses.svg",
        description: "Compare current expenses with previous periods to evaluate your progress.",
      },
      {
        title: "Highest & Lowest Expense Insights",
        image: "/images/analytics/expense-insights.svg",
        description: "Automatically highlights your top spending areas and savings.",
      },
      {
        title: "Export Expenses as CSV",
        image: "/images/analytics/export-csv.svg",
        description: "Download all your expense data in CSV format for offline use, Excel analysis, or sharing with others.",
      },
    ],
  },

  {
    title: "Categories",
    image: "/images/categories/categories.svg",
    description: "Take control of your finances by grouping your expenses into custom categories. The Categories page lets you create, manage, and personalize how your spending is organized — from essentials like groceries and rent to leisure and travel. With a clean overview and intuitive controls, you can quickly spot where your money flows, track spending trends, and make smarter budgeting decisions. It’s your money, organized your way.",
    miniFeatures: [
      {
        title: "Create New Category",
        image: "/images/categories/add-category.svg",
        description: "Add personalized categories like 'Groceries', 'Travel', or 'Subscriptions' to tailor your expense tracking.",
      },
      {
        title: "Edit Category Name",
        image: "/images/categories/input-field.svg",
        description: "Easily rename your categories to better reflect your evolving budget or habits.",
      },
      {
        title: "Delete Unused Categories",
        image: "/images/categories/delete-category.svg",
        description: "Remove categories you no longer use to keep your list clean and relevant.",
      },
      {
        title: "View Expense Totals by Category",
        image: "/images/dashboard/pie-chart.svg",
        description: "See how much you’ve spent in each category to better understand your spending habits.",
      },
      {
        title: "View Expenses by Category",
        image: "/images/categories/attached-file.svg",
        description: "Click on any category card to instantly see all expenses tagged under that specific category.",
      },
      {
        title: "Real-Time Updates",
        image: "/images/categories/cloud-sync.svg",
        description: "Changes in categories instantly reflect across your entire dashboard and analytics.",
      },
    ],
  },

  {
    title: "Profile",
    image: "/images/profile/user-account.svg",
    description: "The Profile page is your personal hub, offering a centralized view of your account settings and preferences. Whether you're updating your name, changing your password, or customizing your app experience, everything is designed for simplicity and security. Stay in control of your account with intuitive options that make managing your profile effortless.",
    miniFeatures: [
      {
        title: "Edit Personal Details",
        image: "/images/profile/personal-information.svg",
        description: "Update your name, email, or profile picture to keep your account info current.",
      },
      {
        title: "Change Password",
        image: "/images/profile/security.svg",
        description: "Secure your account by easily updating your login credentials.",
      },
      {
        title: "Upload or Change Profile Picture",
        image: "/images/profile/add-profile-photo.svg",
        description: "Add a personal touch by uploading a profile photo.",
      },
      {
        title: "Theme Preferences (Light/Dark Mode)",
        image: "/images/profile/theme-toogle.svg",
        description: "Switch between light and dark themes for a comfortable viewing experience.",
      },
      {
        title: "Export Your Data",
        image: "/images/analytics/export-csv.svg",
        description: "Download your account data securely for personal backup.",
      },
      {
        title: "Logout Securely",
        image: "/images/profile/logout.svg",
        description: "One-click logout ensures your data stays protected when you're done.",
      },
    ],
  },

]

// Extract just the feature titles to be passed into the top navbar for navigation links
const featureLinks = features.map(f => f.title);

const HomePage = () => {

  return (
    <div className="bg-white min-h-screen text-gray-800 px-0 m-0">
      {/* Top Navigation Bar */}
      <TopNavbar featureLinks={featureLinks} />

      {/* Welcome Section */}
      <WelcomeSection/>

      {/* Dynamically Render Each Feature Section */}
      {/* `reverse` prop alternates layout left/right */}
      {/* `id` is generated from the feature title to use for anchor navigation */}
      <div className="space-y-16 sm:space-y-20 md:space-y-24">
        {features.map((feature, index) => {
          const id = feature.title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-") // replace spaces with dashes
          .replace(/[^a-z0-9-]/g, ""); // remove special characters
          return(
            <FeatureSection
              key={index}
              id={id}
              title={feature.title}
              image={feature.image}
              description={feature.description}
              miniFeatures={feature.miniFeatures}
              reverse={index % 2 !== 0} // alternate layout direction
              isFirst={index === 0} // flag for possible special styling
            />
          );
        })}
      </div>

      {/* Auth Buttons Section (Login, Register) */}
      <AuthSection/>

      {/* Footer Section */}
      <footer className="text-center text-sm py-8 text-gray-500">
        © {new Date().getFullYear()} ExpensePro. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
