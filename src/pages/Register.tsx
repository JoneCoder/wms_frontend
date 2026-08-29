import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Package } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", { 
        name, 
        organization_name: organization, 
        email, 
        password,
        password_confirmation: passwordConfirmation
      });
      if (res.data.success) {
        login(res.data.data.access_token, res.data.data.user);
        navigate("/");
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "An error occurred";
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0] as string[];
        setError(firstError[0] || errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Create an Account</h2>
          <p className="text-muted-foreground mt-2">Sign up to get started with WMS</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 text-sm border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Organization Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@acme.com"
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity focus:ring-4 focus:ring-primary/20 disabled:opacity-70 flex justify-center items-center mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
