import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { History, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Filter } from "lucide-react";

export default function Movements() {
  const [filters, setFilters] = useState({
    type: "",
    productId: "",
    warehouseId: "",
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((res) => res.data.data),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/warehouses").then((res) => res.data.data),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["movements", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.productId) params.append("product_id", filters.productId);
      if (filters.warehouseId) params.append("warehouse_id", filters.warehouseId);
      return api.get(`/stock-movements?${params.toString()}`).then((res) => res.data.data);
    },
  });

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading movement history...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Failed to load movement history.</div>;

  const movements = data?.data || [];
  const products = productsData?.data || [];
  const warehouses = warehousesData?.data || [];

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "receive":
        return <ArrowDownToLine className="w-4 h-4 text-emerald-500" />;
      case "dispatch":
        return <ArrowUpFromLine className="w-4 h-4 text-blue-500" />;
      case "transfer":
        return <ArrowRightLeft className="w-4 h-4 text-amber-500" />;
      default:
        return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "receive":
        return "bg-emerald-500/10 text-emerald-500";
      case "dispatch":
        return "bg-blue-500/10 text-blue-500";
      case "transfer":
        return "bg-amber-500/10 text-amber-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Stock Movement History</h2>
          <p className="text-muted-foreground mt-1">Track all inbound, outbound, and internal stock transfers</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
          <select 
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="receive">Receive</option>
            <option value="dispatch">Dispatch</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Product</label>
          <select 
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
            value={filters.productId}
            onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
          >
            <option value="">All Products</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Warehouse</label>
          <select 
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
            value={filters.warehouseId}
            onChange={(e) => setFilters({ ...filters, warehouseId: e.target.value })}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => setFilters({ type: "", productId: "", warehouseId: "" })}
          className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 flex items-center gap-2"
        >
          <Filter className="w-4 h-4" /> Clear
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Quantity</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Source / Destination</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p>No stock movements recorded yet.</p>
                  </td>
                </tr>
              ) : (
                movements.map((movement: any) => (
                  <tr key={movement.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getMovementColor(movement.type)}`}>
                        {getMovementIcon(movement.type)} {movement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{movement.product?.name}</div>
                      <div className="text-xs text-muted-foreground">{movement.product?.sku}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {movement.quantity} {movement.product?.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {movement.type === "transfer" ? (
                        <>
                          <div className="text-muted-foreground">From: <span className="text-foreground">{movement.source_location?.name || movement.source_location?.code}</span></div>
                          <div className="text-muted-foreground">To: <span className="text-foreground">{movement.destination_location?.name || movement.destination_location?.code}</span></div>
                        </>
                      ) : (
                        <div className="text-muted-foreground">
                          {movement.type === "receive" ? (
                            <>To: <span className="text-foreground">{movement.destination_location?.name || movement.destination_location?.code}</span></>
                          ) : (
                            <>From: <span className="text-foreground">{movement.source_location?.name || movement.source_location?.code}</span></>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {movement.user?.name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
