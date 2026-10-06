"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import "./auth.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Login Error details:", {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name,
        });
      }
      
      if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An error occurred during sign in. Please try again later.");
      }
      setLoading(false);
    } else if (authData.user) {
      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();
        
      if (profile?.role === 'admin') {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="card auth-card">
        <h1 className="text-center" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Welcome Back</h1>
        <p className="text-center text-secondary text-sm" style={{ marginBottom: 'var(--space-6)' }}>Sign in to continue your premium experience.</p>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(255, 77, 79, 0.1)', color: 'var(--color-error)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontSize: '0.9rem', border: '1px solid var(--color-error)' }}>
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="Enter your email" 
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
                placeholder="Enter your password" 
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
          
          <div className="flex justify-between items-center text-sm" style={{ marginBottom: 'var(--space-2)' }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" />
              <span className="text-secondary">Remember Me</span>
            </label>
            <Link href="/forgot-password" className="text-primary">Forgot Password?</Link>
          </div>
          
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        
        <p className="text-center text-sm text-secondary" style={{ marginTop: 'var(--space-6)' }}>
          Don&apos;t have an account? <Link href="/register" className="text-primary font-bold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
