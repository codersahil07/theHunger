"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  Menu, X, LayoutDashboard, UtensilsCrossed,
  ShoppingBag, CalendarDays, ChefHat, Users, LogOut
} from "lucide-react";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const [pendingCounts, setPendingCounts] = useState({
    orders: 0,
    reservations: 0,
    catering: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: resCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: catCount } = await supabase
        .from('catering_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setPendingCounts({
        orders: ordersCount || 0,
        reservations: resCount || 0,
        catering: catCount || 0
      });
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [supabase]);

  const navItems = [
    { name: "Dashboard",    href: "/admin/dashboard",    icon: LayoutDashboard },
    { name: "Menu",         href: "/admin/menu",         icon: UtensilsCrossed },
    { name: "Orders",       href: "/admin/orders",       icon: ShoppingBag },
    { name: "Reservations", href: "/admin/reservations", icon: CalendarDays },
    { name: "Catering",     href: "/admin/catering",     icon: ChefHat },
    { name: "Users",        href: "/admin/users",        icon: Users },
  ];

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="admin-mobile-header">
        <div style={{ width: '40px', display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img src="/images/the-hunger-logo.png" alt="The Hunger Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span className="admin-sidebar-logo" style={{ fontSize: "1.1rem", marginBottom: 0, padding: 0 }}>
            The Hunger
          </span>
          <div style={{ fontSize: "0.55rem", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: "-3px" }}>
            Admin Portal
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: "var(--color-champagne-gold)", background: "none", border: "none", cursor: "pointer" }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">The Hunger</div>
          <div className="admin-sidebar-tagline">Admin Portal</div>
        </div>

        {/* Nav */}
        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Navigation</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            let badgeCount = 0;
            if (item.name === "Orders") badgeCount = pendingCounts.orders;
            if (item.name === "Reservations") badgeCount = pendingCounts.reservations;
            if (item.name === "Catering") badgeCount = pendingCounts.catering;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                style={{ position: 'relative' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <item.icon size={17} style={{ marginRight: '0.75rem' }} />
                  <span>{item.name}</span>
                  {badgeCount > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      background: 'var(--color-champagne-gold)',
                      color: '#120D0A',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      boxShadow: '0 0 10px rgba(217,190,114,0.4)',
                      animation: 'pulse 2s infinite'
                    }}>
                      {badgeCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={15} />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {isOpen && (
        <div className="admin-mobile-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
