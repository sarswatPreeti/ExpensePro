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
import EditProfile from "./pages/editProfile";
import MainLayout from "./layouts/mainLayout";
import AuthProvider from "./contexts/AuthContext";
import AuthGuard from "./components/authGuard";

// Authentication is now handled by AuthContext

// Protects private routes
const PrivateRoute = ({ children }) => {
  return <AuthGuard requireAuth={true}>{children}</AuthGuard>;
};

const AuthRedirect = ({ children }) => {
  return <AuthGuard requireAuth={false}>{children}</AuthGuard>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop/>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage/>} />

            <Route path="/login" element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            } />

            <Route path="/register" element={
              <AuthRedirect>
                <RegisterPage />
              </AuthRedirect>
            } />

            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/add" element={
              <PrivateRoute>
                <AddExpense />
              </PrivateRoute>
            } />

            <Route path="/expenses" element={
              <PrivateRoute>
                <AllExpenses />
              </PrivateRoute>
            } />

            <Route path="/invoices" element={
              <PrivateRoute>
                <ALLInvoice />
              </PrivateRoute>
            } />

            <Route path="/invoice/:id" element={
              <PrivateRoute>
                <Invoice />
              </PrivateRoute>
            } />

            <Route path="/edit-invoice/:id" element={
              <PrivateRoute>
                <EditInvoice />
              </PrivateRoute>
            } />

            <Route path="/analytics" element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } />

            <Route path="/categories" element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="/edit-profile" element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            } />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
