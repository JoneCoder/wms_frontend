import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { Plus, Edit2, Trash2, Package, X } from "lucide-react";

export default function Products() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    unit: "",
    status: "active",
    low_stock_threshold: 0,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((res) => res.data.data),
  });

  const mutation = useMutation({
    mutationFn: (productData: any) => {
      if (editingProduct) {
        return api.put(`/products/${editingProduct.id}`, productData);
      }
      return api.post("/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || "",
        unit: product.unit || "",
        status: product.status,
        low_stock_threshold: product.low_stock_threshold || 0,
      });
    } else {
      setEditingProduct(null);
      setFormData({ sku: "", name: "", description: "", unit: "", status: "active", low_stock_threshold: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading products...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Failed to load products.</div>;

  const products = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products</h2>
          <p className="text-muted-foreground mt-1">Manage your warehouse inventory items</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">SKU</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Unit</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p>No products found.</p>
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{product.name}</div>
                      <div className="text-sm text-muted-foreground truncate w-48">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{product.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => openModal(product)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-5 h-5 inline" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this product?")) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
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
                {editingProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">SKU</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Product Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="pcs, kg, box"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
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
                  {mutation.isPending ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
