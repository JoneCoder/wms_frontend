import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { Shield, Plus, Edit2, X } from "lucide-react";

export default function Roles() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState<{ name: string; permissions: number[] }>({
    name: "",
    permissions: [],
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["roles"],
    queryFn: () => api.get("/roles").then((res) => res.data.data),
  });

  const { data: permissionsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => api.get("/permissions").then((res) => res.data.data),
  });

  const mutation = useMutation({
    mutationFn: (roleData: any) => {
      if (editingRole) {
        return api.put(`/roles/${editingRole.id}`, roleData);
      }
      return api.post("/roles", roleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      closeModal();
    },
  });

  const openModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        permissions: role.permissions?.map((p: any) => p.id) || [],
      });
    } else {
      setEditingRole(null);
      setFormData({ name: "", permissions: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const togglePermission = (permId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(id => id !== permId)
        : [...prev.permissions, permId]
    }));
  };

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading roles...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Failed to load roles.</div>;

  const roles = data?.data || [];
  const allPermissions = permissionsData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Roles & Permissions</h2>
          <p className="text-muted-foreground mt-1">Manage organizational roles and access control</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" /> Add Role
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Role Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Permissions Count</th>
                <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p>No roles found.</p>
                  </td>
                </tr>
              ) : (
                roles.map((role: any) => (
                  <tr key={role.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground capitalize">{role.name.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {role.permissions?.length || 0} permissions
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => openModal(role)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-5 h-5 inline" />
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
                {editingRole ? "Edit Role" : "Add Role"}
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
                <label className="block text-sm font-medium text-foreground mb-1">Role Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Permissions</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg bg-background">
                  {allPermissions.map((perm: any) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted rounded">
                      <input 
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground capitalize">{perm.name.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
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
                  {mutation.isPending ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
