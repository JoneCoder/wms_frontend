import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, PackageSearch, X } from "lucide-react";

const LocationSelect = ({ 
  label, 
  value, 
  onChange, 
  warehouses 
}: { 
  label: string; 
  value: number; 
  onChange: (id: number) => void; 
  warehouses: any[] 
}) => {
  const [warehouseId, setWarehouseId] = useState<number | "">("");

  const { data: locations } = useQuery({
    queryKey: ["locations", warehouseId],
    queryFn: () => api.get(`/warehouses/${warehouseId}/locations`).then(res => res.data.data),
    enabled: !!warehouseId,
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label} Warehouse</label>
      <select
        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
        value={warehouseId}
        onChange={(e) => {
          setWarehouseId(Number(e.target.value));
          onChange(0); // Reset location when warehouse changes
        }}
      >
        <option value="">Select Warehouse</option>
        {warehouses.map((w: any) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
      
      {warehouseId !== "" && (
        <>
          <label className="block text-sm font-medium text-foreground">{label} Location</label>
          <select
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
          >
            <option value="">Select Location</option>
            {locations?.data?.map((l: any) => (
              <option key={l.id} value={l.id}>{l.code} - {l.name}</option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default function Inventory() {
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<"receive" | "transfer" | "dispatch" | null>(null);
  const [formData, setFormData] = useState({
    productId: 0,
    locationId: 0,
    sourceLocationId: 0,
    destinationLocationId: 0,
    quantity: 0,
    referenceNumber: "",
  });

  const { data: inventoryData, isLoading, error } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.get("/inventory").then((res) => res.data.data),
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((res) => res.data.data),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/warehouses").then((res) => res.data.data),
  });

  const inventoryItems = inventoryData?.data || [];
  const products = productsData?.data || [];
  const warehouses = warehousesData?.data || [];

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (activeModal === "receive") return api.post("/inventory/receive", data);
      if (activeModal === "dispatch") return api.post("/inventory/dispatch", data);
      if (activeModal === "transfer") return api.post("/inventory/transfer", data);
      return Promise.reject("Invalid operation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      closeModal();
    },
  });

  const closeModal = () => {
    setActiveModal(null);
    setFormData({ productId: 0, locationId: 0, sourceLocationId: 0, destinationLocationId: 0, quantity: 0, referenceNumber: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      product_id: formData.productId,
      quantity: formData.quantity,
      reference_number: formData.referenceNumber,
    };

    if (activeModal === "receive" || activeModal === "dispatch") {
      payload.location_id = formData.locationId;
    } else if (activeModal === "transfer") {
      payload.source_location_id = formData.sourceLocationId;
      payload.destination_location_id = formData.destinationLocationId;
    }

    mutation.mutate(payload);
  };

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading inventory...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Failed to load inventory.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Operations</h2>
          <p className="text-muted-foreground mt-1">Manage stock levels, receive, dispatch, and transfer stock</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveModal("receive")}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            <ArrowDownToLine className="w-5 h-5" /> Receive
          </button>
          <button 
            onClick={() => setActiveModal("transfer")}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5" /> Transfer
          </button>
          <button 
            onClick={() => setActiveModal("dispatch")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowUpFromLine className="w-5 h-5" /> Dispatch
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Warehouse / Location</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Available Quantity</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Reserved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inventoryItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <PackageSearch className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p>No inventory records found.</p>
                  </td>
                </tr>
              ) : (
                inventoryItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{item.product?.name}</div>
                      <div className="text-sm text-muted-foreground">{item.product?.sku}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="font-medium">{item.location?.warehouse?.name || "Unknown Warehouse"}</div>
                      <div className="text-muted-foreground">{item.location?.code || "Default Area"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        {item.quantity} {item.product?.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {item.quantity_reserved || 0} {item.product?.unit}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground capitalize">
                {activeModal} Stock
              </h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {mutation.isError && (
                <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm border border-red-500/20 mb-4">
                  <p className="font-semibold">{((mutation.error as any)?.response?.data?.message) || "An error occurred"}</p>
                  {((mutation.error as any)?.response?.data?.errors) && (
                    <ul className="list-disc list-inside mt-1">
                      {Object.values(((mutation.error as any).response.data.errors)).map((errs: any, i) => (
                        <li key={i}>{errs[0]}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Product</label>
                <select
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.productId || ""}
                  onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })}
                >
                  <option value="">Select Product</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              {activeModal === "transfer" ? (
                <>
                  <LocationSelect
                    label="Source"
                    value={formData.sourceLocationId}
                    onChange={(id) => setFormData({ ...formData, sourceLocationId: id })}
                    warehouses={warehouses}
                  />
                  <LocationSelect
                    label="Destination"
                    value={formData.destinationLocationId}
                    onChange={(id) => setFormData({ ...formData, destinationLocationId: id })}
                    warehouses={warehouses}
                  />
                </>
              ) : (
                <LocationSelect
                  label="Target"
                  value={formData.locationId}
                  onChange={(id) => setFormData({ ...formData, locationId: id })}
                  warehouses={warehouses}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
                <input
                  required
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Reference Number (Optional)</label>
                <input
                  type="text"
                  placeholder="PO-12345"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className={`px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 ${
                    activeModal === "receive" ? "bg-emerald-500" :
                    activeModal === "transfer" ? "bg-amber-500" :
                    "bg-blue-600"
                  }`}
                >
                  {mutation.isPending ? "Processing..." : `Confirm ${activeModal}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
