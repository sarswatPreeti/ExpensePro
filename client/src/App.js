import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Dashboard from "./pages/dashboard";
import HomePage from "./pages/homePage";
import AddExpense from "./pages/addExpense";
import AllExpenses from "./pages/allExpenses";
import ALLInvoice from "./pages/allInvoices"; 
import Invoice from "./pages/singleInvoice";
import EditInvoice from "./pages/editInvoice"; 
import Analytics from "./pages/analytics";
import Categories from "./pages/categories";
import Profile from "./pages/profile";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <main className="ml-64 w-full bg-gray-100 min-h-screen p-6">
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/add" element={<AddExpense />} />
            <Route path="/expenses" element={<AllExpenses />} />
            <Route path="/invoices" element={<ALLInvoice />} />
            <Route path="/invoice/:id" element={<Invoice />} />
            <Route path="/edit-invoice/:id" element={<EditInvoice />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/profile" element={<Profile/>}/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
