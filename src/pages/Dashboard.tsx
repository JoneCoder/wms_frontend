import { useAuth } from "../context/AuthContext";
import { Package, Warehouse, Users, ArrowRightLeft } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: "Total Products", value: "1,204", icon: Package, color: "bg-blue-500 text-white" },
    { label: "Warehouses", value: "4", icon: Warehouse, color: "bg-indigo-500 text-white" },
    { label: "Stock Movements", value: "85", icon: ArrowRightLeft, color: "bg-emerald-500 text-white" },
    { label: "Users", value: "12", icon: Users, color: "bg-amber-500 text-white" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}. Here is what is happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border p-6 flex items-center gap-4 hover:shadow-md hover:border-primary/50 transition-all duration-300">
            <div className={`p-4 rounded-xl shadow-inner ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-sm border border-border p-12 text-center mt-12 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">More Features Coming Soon</h3>
        <p className="text-muted-foreground max-w-md">Products, Warehouses and Inventory tracking are being implemented as part of the next phase.</p>
      </div>
    </div>
  );
}
