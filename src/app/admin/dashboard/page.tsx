export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase-server';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, CalendarDays, ChefHat, Users } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: menuCount },
    { count: ordersCount },
    { count: reservationsCount },
    { count: cateringCount },
    { count: usersCount },
  ] = await Promise.all([
    supabase.from('menu_items').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('reservations').select('*', { count: 'exact', head: true }),
    supabase.from('catering_requests').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    { label: "Menu Items",       value: menuCount        || 0, icon: UtensilsCrossed, color: "#C6A24A" },
    { label: "Total Orders",     value: ordersCount      || 0, icon: ShoppingBag,     color: "#60a5fa" },
    { label: "Reservations",     value: reservationsCount || 0, icon: CalendarDays,   color: "#a78bfa" },
    { label: "Catering Requests",value: cateringCount    || 0, icon: ChefHat,         color: "#4ade80" },
    { label: "Registered Users", value: usersCount       || 0, icon: Users,           color: "#f472b6" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="admin-header-row">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(198,162,74,0.1)", border: "1px solid rgba(198,162,74,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <LayoutDashboard size={20} style={{ color: "var(--color-antique-gold)" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-cream)", fontFamily: "var(--font-display)", marginBottom: 0 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.15rem" }}>
              Overview of your restaurant operations
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: `${stat.color}18`, borderColor: `${stat.color}30`, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div className="admin-stat-label">{stat.label}</div>
            <div className="admin-stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ marginTop: "2.5rem", padding: "1.5rem", background: "rgba(198,162,74,0.04)", border: "1px solid rgba(198,162,74,0.1)", borderRadius: 16 }}>
        <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(175,162,148,0.5)", fontWeight: 700, marginBottom: "1rem" }}>
          Quick Access
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {[
            { label: "View Orders",       href: "/admin/orders" },
            { label: "Manage Menu",       href: "/admin/menu" },
            { label: "Reservations",      href: "/admin/reservations" },
            { label: "Catering Requests", href: "/admin/catering" },
          ].map((l) => (
            <a key={l.href} href={l.href} style={{
              padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.83rem", fontWeight: 500,
              border: "1px solid rgba(198,162,74,0.2)", color: "var(--color-antique-gold)",
              background: "rgba(198,162,74,0.06)", transition: "all 0.2s", textDecoration: "none"
            }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
