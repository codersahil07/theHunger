"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, DollarSign } from "lucide-react";

interface RevenueStats {
  today: number;
  week: number;
  month: number;
  year: number;
}

export default function RevenueWidget({ stats }: { stats: RevenueStats }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: "2rem" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "linear-gradient(135deg, rgba(33, 23, 18, 0.8) 0%, rgba(18, 13, 10, 0.9) 100%)",
          color: "var(--color-champagne-gold)",
          border: "1px solid rgba(198,162,74,0.3)",
          borderRadius: "12px",
          padding: "0.75rem 1.25rem",
          fontWeight: 600,
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
          transition: "all 0.2s",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <DollarSign size={16} />
        {isOpen ? "Hide Revenue Stats" : "View Revenue Stats"}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="admin-grid animate-fade-in" style={{ marginTop: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {[
            { label: "Today's Revenue", value: stats.today },
            { label: "This Week", value: stats.week },
            { label: "This Month", value: stats.month },
            { label: "This Year", value: stats.year },
          ].map((stat, idx) => (
            <div key={idx} className="admin-stat-card" style={{ padding: "1.25rem" }}>
              <div className="admin-stat-label" style={{ color: "var(--color-text-secondary)" }}>{stat.label}</div>
              <div className="admin-stat-value" style={{ fontSize: "1.8rem" }}>₹{stat.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
