"use client";

import { createClient } from '@/lib/supabase-browser';
import { CalendarDays, Users, Clock, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

interface Reservation {
  id: string;
  full_name: string;
  phone: string;
  status: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  special_request?: string;
}

const STATUS_CLS: Record<string, string> = {
  pending:   "admin-badge admin-badge-pending",
  confirmed: "admin-badge admin-badge-confirmed",
  cancelled: "admin-badge admin-badge-cancelled",
};

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({ reservationsEnabled: true, disabledMessage: 'Bookings are paused.' });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from('reservations')
      .select('*')
      .order('reservation_date', { ascending: false })
      .limit(50);

    if (err) setError(err.message);
    else setReservations(data || []);
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch(err) {
      console.error("Failed to fetch settings", err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchSettings();
  }, []);

  const toggleReservations = async () => {
    setSettingsLoading(true);
    const newSettings = { ...settings, reservationsEnabled: !settings.reservationsEnabled };
    setSettings(newSettings);
    
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch(err) {
      console.error("Failed to update settings", err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const supabase = createClient();
    const { error: err } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!err) {
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
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
            background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <CalendarDays size={20} style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-cream)", fontFamily: "var(--font-display)", marginBottom: 0 }}>
              Reservations
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.15rem" }}>
              Table booking requests
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.85rem', color: settings.reservationsEnabled ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
              {settings.reservationsEnabled ? 'Bookings Open' : 'Bookings Paused'}
            </span>
            <button 
              onClick={toggleReservations}
              disabled={settingsLoading}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                background: settings.reservationsEnabled ? 'var(--color-success)' : 'rgba(255,255,255,0.2)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '2px',
                left: settings.reservationsEnabled ? '22px' : '2px',
                transition: 'all 0.3s'
              }} />
            </button>
          </div>
          <div className="admin-badge admin-badge-user" style={{ fontSize: "0.78rem", padding: "4px 12px" }}>
            {reservations?.length ?? 0} reservations
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty">Loading...</div>
      ) : error ? (
        <div className="admin-error">Failed to load reservations: {error}</div>
      ) : !reservations || reservations.length === 0 ? (
        <div className="admin-empty">No reservations found yet.</div>
      ) : (
        <div className="admin-grid">
          {reservations.map((res: Reservation) => {
            const badgeCls = STATUS_CLS[res.status?.toLowerCase()] ?? "admin-badge admin-badge-user";
            return (
              <div key={res.id} className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-cream)", fontFamily: "var(--font-display)" }}>
                      {res.full_name}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginTop: "0.2rem" }}>
                      {res.phone}
                    </div>
                  </div>
                  <span className={badgeCls}>{res.status || 'Pending'}</span>
                </div>

                <div className="admin-card-body">
                  <div className="admin-info-grid">
                    <div className="admin-info-block">
                      <div className="admin-info-label"><CalendarDays size={11} /> Date</div>
                      <div className="admin-info-value">{res.reservation_date}</div>
                    </div>
                    <div className="admin-info-block">
                      <div className="admin-info-label"><Clock size={11} /> Time</div>
                      <div className="admin-info-value" style={{ color: "var(--color-champagne-gold)" }}>{res.reservation_time}</div>
                    </div>
                    <div className="admin-info-block">
                      <div className="admin-info-label"><Users size={11} /> Guests</div>
                      <div className="admin-info-value">{res.guests} <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", fontWeight: 400 }}>people</span></div>
                    </div>
                  </div>

                  {res.special_request && (
                    <div className="admin-note-box">
                      <div className="admin-note-label">Special Request</div>
                      <div className="admin-note-text">&ldquo;{res.special_request}&rdquo;</div>
                    </div>
                  )}

                  {res.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <button 
                        onClick={() => updateStatus(res.id, 'confirmed')}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(92, 184, 92, 0.15)', color: '#5cb85c', border: '1px solid rgba(92, 184, 92, 0.3)', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <Check size={14} /> Confirm
                      </button>
                      <button 
                        onClick={() => updateStatus(res.id, 'cancelled')}
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
