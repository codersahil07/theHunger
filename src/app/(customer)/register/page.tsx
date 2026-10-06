"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import "../login/auth.css";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError("An error occurred during registration. Please try again.");
      }
    } else {
      setSuccess("Registration successful! Please sign in.");
      // In a real app we might redirect to a verification page or login directly
      setTimeout(() => router.push("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="card auth-card">
        <h1 className="text-center" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Create Account</h1>
        <p className="text-center text-secondary text-sm" style={{ marginBottom: 'var(--space-6)' }}>Join us to experience ultra-premium dining.</p>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(255, 77, 79, 0.1)', color: 'var(--color-error)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontSize: '0.9rem', border: '1px solid var(--color-error)' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ backgroundColor: 'rgba(82, 196, 26, 0.1)', color: 'var(--color-success)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontSize: '0.9rem', border: '1px solid var(--color-success)' }}>
            {success}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="john@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                placeholder="Create a password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn-primary w-full" style={{ marginTop: 'var(--space-4)' }} disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <p className="text-center text-sm text-secondary" style={{ marginTop: 'var(--space-6)' }}>
          Already have an account? <Link href="/login" className="text-primary font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
