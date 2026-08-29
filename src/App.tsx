import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Warehouses from "./pages/Warehouses";
import Inventory from "./pages/Inventory";
import Movements from "./pages/Movements";
import Roles from "./pages/Roles";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="movements" element={<Movements />} />
          <Route path="roles" element={<Roles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
