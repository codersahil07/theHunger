"use client";

import { createClient } from '@/lib/supabase-browser';
import { ChefHat, CalendarDays, Users, MapPin, Phone, Mail, Check, PhoneCall, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const STATUS_CLS: Record<string, string> = {
  pending:   "admin-badge admin-badge-pending",
  contacted: "admin-badge admin-badge-contacted",
  confirmed: "admin-badge admin-badge-confirmed",
  cancelled: "admin-badge admin-badge-cancelled",
};

export default function AdminCatering() {
  const [catering, setCatering] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatering = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from('catering_requests')
      .select('*')
      .order('event_date', { ascending: false })
      .limit(50);

    if (err) setError(err.message);
    else setCatering(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCatering();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const supabase = createClient();
    const { error: err } = await supabase
      .from('catering_requests')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!err) {
      setCatering(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } else {
      alert("Failed to update status");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="admin-header-row">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <ChefHat size={20} style={{ color: "#4ade80" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-cream)", fontFamily: "var(--font-display)", marginBottom: 0 }}>
              Catering
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.15rem" }}>
              Event catering requests
            </p>
          </div>
        </div>
        <div className="admin-badge admin-badge-user" style={{ fontSize: "0.78rem", padding: "4px 12px" }}>
          {catering?.length ?? 0} requests
        </div>
      </div>

      {loading ? (
        <div className="admin-empty">Loading...</div>
      ) : error ? (
        <div className="admin-error">Failed to load catering requests: {error}</div>
      ) : !catering || catering.length === 0 ? (
        <div className="admin-empty">No catering requests found yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {catering.map((cat: any) => {
            const badgeCls = STATUS_CLS[cat.status?.toLowerCase()] ?? "admin-badge admin-badge-user";
            return (
              <div key={cat.id} className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-cream)", fontFamily: "var(--font-display)", marginBottom: "0.3rem" }}>
                      {cat.full_name}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
                      {cat.phone && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Phone size={12} /> {cat.phone}
                        </span>
                      )}
                      {cat.email && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Mail size={12} /> {cat.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={badgeCls}>{cat.status || 'Pending'}</span>
                </div>

                <div className="admin-card-body">
                  <div className="admin-info-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <div className="admin-info-block">
                      <div className="admin-info-label"><CalendarDays size={11} /> Event Date</div>
                      <div className="admin-info-value">{cat.event_date}</div>
                    </div>
                    <div className="admin-info-block">
                      <div className="admin-info-label"><Users size={11} /> Guests</div>
                      <div className="admin-info-value">{cat.guests} <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", fontWeight: 400 }}>people</span></div>
                    </div>
                    <div className="admin-info-block">
                      <div className="admin-info-label"><MapPin size={11} /> Venue</div>
                      <div className="admin-info-value" style={{ textTransform: "capitalize" }}>{cat.venue || '—'}</div>
                    </div>
                  </div>

                  {cat.event_details && (
                    <div className="admin-note-box">
                      <div className="admin-note-label">Event Details</div>
                      <div className="admin-note-text" style={{ fontStyle: "normal", whiteSpace: "pre-wrap" }}>{cat.event_details}</div>
                    </div>
                  )}

                  {cat.status !== 'confirmed' && cat.status !== 'cancelled' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {cat.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(cat.id, 'contacted')}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <PhoneCall size={14} /> Mark Contacted
                        </button>
                      )}
                      
                      <button 
                        onClick={() => updateStatus(cat.id, 'confirmed')}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(92, 184, 92, 0.15)', color: '#5cb85c', border: '1px solid rgba(92, 184, 92, 0.3)', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <Check size={14} /> Confirm
                      </button>

                      <button 
                        onClick={() => updateStatus(cat.id, 'cancelled')}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(220, 38, 38, 0.15)', color: '#ef4444', border: '1px solid rgba(220, 38, 38, 0.3)', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
