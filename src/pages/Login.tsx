import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Package } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        login(res.data.data.access_token, res.data.data.user);
        navigate("/");
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Welcome to WMS</h2>
          <p className="text-muted-foreground mt-2">Sign in to manage your warehouse</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 text-sm border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@acme.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity focus:ring-4 focus:ring-primary/20 disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
