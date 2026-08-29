import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { Plus, Edit2, Trash2, Warehouse, X, ChevronDown, ChevronRight, MapPin } from "lucide-react";

const WarehouseLocations = ({ warehouseId }: { warehouseId: number }) => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["locations", warehouseId],
    queryFn: () => api.get(`/warehouses/${warehouseId}/locations`).then((res) => res.data.data),
  });

  const mutation = useMutation({
    mutationFn: (locationData: any) => api.post(`/warehouses/${warehouseId}/locations`, locationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", warehouseId] });
      setIsAdding(false);
      setNewCode("");
      setNewName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/warehouses/${warehouseId}/locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", warehouseId] });
    },
  });

  const locations = data?.data || [];

  return (
    <div className="bg-muted/30 p-4 border-b border-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Storage Locations
        </h4>
        <button
          onClick={() => setIsAdding(true)}
          className="text-xs font-medium text-primary hover:underline"
        >
          + Add Location
        </button>
      </div>

      <div className="grid gap-2">
        {locations.map((loc: any) => (
          <div key={loc.id} className="flex items-center justify-between bg-card border border-border p-3 rounded-lg">
            <div>
              <div className="font-medium text-sm text-foreground">{loc.code}</div>
              {loc.name && <div className="text-xs text-muted-foreground">{loc.name}</div>}
            </div>
            <button
              onClick={() => {
                if (confirm("Delete this location?")) {
                  deleteMutation.mutate(loc.id);
                }
              }}
              className="text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {locations.length === 0 && !isAdding && (
          <div className="text-sm text-muted-foreground italic text-center py-4">No locations added yet.</div>
        )}

        {isAdding && (
          <div className="flex items-center gap-2 mt-2 bg-card border border-primary/20 p-3 rounded-lg">
            <input
              type="text"
              placeholder="Loc Code"
              className="w-1/3 px-2 py-1 text-sm rounded border border-border bg-background focus:ring-1 focus:ring-primary outline-none"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <input
              type="text"
              placeholder="Loc Name"
              className="flex-1 px-2 py-1 text-sm rounded border border-border bg-background focus:ring-1 focus:ring-primary outline-none"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              onClick={() => mutation.mutate({ code: newCode, name: newName })}
              disabled={mutation.isPending || !newCode}
              className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded font-medium hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
            <button onClick={() => setIsAdding(false)} className="text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Warehouses() {
  const queryClient = useQueryClient();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    status: "active",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/warehouses").then((res) => res.data.data),
  });

  const mutation = useMutation({
    mutationFn: (warehouseData: any) => {
      if (editingWarehouse) {
        return api.put(`/warehouses/${editingWarehouse.id}`, warehouseData);
      }
      return api.post("/warehouses", warehouseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/warehouses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });

  const openModal = (warehouse = null) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address || "",
        status: warehouse.status,
      });
    } else {
      setEditingWarehouse(null);
      setFormData({ code: "", name: "", address: "", status: "active" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading warehouses...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Failed to load warehouses.</div>;

  const warehouses = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Warehouses</h2>
          <p className="text-muted-foreground mt-1">Manage warehouse facilities and storage locations</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" /> Add Warehouse
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-4 w-12"></th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Warehouse Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Code</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {warehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Warehouse className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p>No warehouses found.</p>
                  </td>
                </tr>
              ) : (
                warehouses.map((warehouse: any) => (
                  <React.Fragment key={warehouse.id}>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setExpandedRow(expandedRow === warehouse.id ? null : warehouse.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {expandedRow === warehouse.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{warehouse.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{warehouse.address}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{warehouse.code}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${warehouse.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                          {warehouse.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button 
                          onClick={() => openModal(warehouse)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-5 h-5 inline" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this warehouse?")) {
                              deleteMutation.mutate(warehouse.id);
                            }
                          }}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                    {expandedRow === warehouse.id && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <WarehouseLocations warehouseId={warehouse.id} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">
                {editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
              </h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Code</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {mutation.isPending ? "Saving..." : "Save Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
