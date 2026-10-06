export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase-server';
import { Users, Shield, User, Mail, Phone, Calendar } from 'lucide-react';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

export default async function AdminUsers() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="admin-header-row">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Users size={20} style={{ color: "#f472b6" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-cream)", fontFamily: "var(--font-display)", marginBottom: 0 }}>
              Users
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.15rem" }}>
              Registered accounts
            </p>
          </div>
        </div>
        <div className="admin-badge admin-badge-user" style={{ fontSize: "0.78rem", padding: "4px 12px" }}>
          {users?.length ?? 0} users
        </div>
      </div>

      {error ? (
        <div className="admin-error">Failed to load users: {error.message}</div>
      ) : !users || users.length === 0 ? (
        <div className="admin-empty">No users found.</div>
      ) : (
        <div className="admin-list">
          {/* Table Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr",
            padding: "0.75rem 1.5rem",
            borderBottom: "1px solid rgba(198,162,74,0.15)",
            background: "rgba(0,0,0,0.3)"
          }}>
            {["User", "Contact", "Role", "Joined"].map((h) => (
              <div key={h} style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(175,162,148,0.5)", fontWeight: 700 }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {users.map((user: UserProfile, index: number) => {
            const name = user.first_name || user.last_name
              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
              : 'Unnamed User';
            const isAdmin = user.role === 'admin';
            const initial = name[0]?.toUpperCase() || '?';

            return (
              <div
                key={user.id}
                className="admin-list-item"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr 1fr",
                  alignItems: "center",
                  background: index % 2 === 0 ? "rgba(0,0,0,0.12)" : "transparent"
                }}
              >
                {/* User */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    className={`admin-avatar ${isAdmin ? "admin-avatar-admin" : "admin-avatar-user"}`}
                    style={{ width: 36, height: 36, fontSize: "0.82rem" }}
                  >
                    {isAdmin ? <Shield size={16} /> : initial}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--color-cream)", fontSize: "0.9rem" }}>{name}</div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--color-text-secondary)", marginBottom: "0.2rem" }}>
                    <Mail size={12} style={{ opacity: 0.5 }} /> {user.email}
                  </div>
                  {user.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                      <Phone size={12} style={{ opacity: 0.5 }} /> {user.phone}
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <span className={isAdmin ? "admin-badge admin-badge-admin" : "admin-badge admin-badge-user"}>
                    {isAdmin ? <Shield size={10} /> : <User size={10} />}
                    {user.role}
                  </span>
                </div>

                {/* Joined */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
                  <Calendar size={13} style={{ opacity: 0.5 }} />
                  {new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
