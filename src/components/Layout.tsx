import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Package, LayoutDashboard, LogOut, Warehouse, Sun, Moon, ArrowRightLeft, History, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Products", path: "/products", icon: <Package className="w-5 h-5" /> },
    { name: "Warehouses", path: "/warehouses", icon: <Warehouse className="w-5 h-5" /> },
    { name: "Inventory", path: "/inventory", icon: <ArrowRightLeft className="w-5 h-5" /> },
    { name: "Movements", path: "/movements", icon: <History className="w-5 h-5" /> },
    { name: "Roles", path: "/roles", icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <aside className="w-64 bg-card border-r border-border flex flex-col shadow-sm">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary tracking-wider flex items-center gap-2">
            <Package className="w-6 h-6" /> WMS
          </h1>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.icon} {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="mb-4 px-4">
            <p className="text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.organization?.name || "No Organization"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background p-8">
        <Outlet />
      </main>
    </div>
  );
}
