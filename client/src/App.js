import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/scrollToTop";
import Dashboard from "./pages/dashboard";
import HomePage from "./pages/homePage";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import AddExpense from "./pages/addExpense";
import AllExpenses from "./pages/allExpenses";
import ALLInvoice from "./pages/allInvoices"; 
import Invoice from "./pages/singleInvoice";
import EditInvoice from "./pages/editInvoice"; 
import Analytics from "./pages/analytics";
import Categories from "./pages/categories";
import Profile from "./pages/profile";
import MainLayout from "./layouts/mainLayout";

function App() {
  return (
    <Router>
      <ScrollToTop/>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
      </MainLayout>
    </Router>
  );
}

export default App;
