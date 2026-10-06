"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import "../login/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      if (error.message.includes("not found")) {
        // Obscure whether email exists for security
        setSuccess("If an account exists for this email, a password reset link has been sent.");
      } else {
        setError("An error occurred while attempting to send reset instructions. Please try again later.");
      }
    } else {
      setSuccess("If an account exists for this email, a password reset link has been sent.");
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="card auth-card">
        <h1 className="text-center" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Forgot Password</h1>
        <p className="text-center text-secondary text-sm" style={{ marginBottom: 'var(--space-6)' }}>Enter your email to receive password reset instructions.</p>
        
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

        <form className="flex flex-col gap-4" onSubmit={handleReset}>
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
          
          <button type="submit" className="btn-primary w-full" style={{ marginTop: 'var(--space-2)' }} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        
        <p className="text-center text-sm text-secondary" style={{ marginTop: 'var(--space-6)' }}>
          Remember your password? <Link href="/login" className="text-primary font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
