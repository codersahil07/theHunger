"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  UtensilsCrossed, 
  Info, 
  Briefcase, 
  LayoutGrid, 
  Phone, 
  User,
  LogOut,
  LogIn
} from "lucide-react";
import "./layout.css";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function Sidebar({ isOpen, closeSidebar, isFullWidthPage = false }: { isOpen: boolean, closeSidebar: () => void, isFullWidthPage?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    closeSidebar();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className={`app-sidebar ${isOpen ? "open" : ""} ${isFullWidthPage ? "mobile-only-sidebar" : ""}`}>
      <nav className="sidebar-nav">
        <Link href="/" className={`sidebar-link ${pathname === '/' ? 'active' : ''}`} onClick={closeSidebar}>
          <Home size={22} strokeWidth={1.5} />
          <span>Home</span>
        </Link>
        <Link href="/menu" className={`sidebar-link ${pathname === '/menu' ? 'active' : ''}`} onClick={closeSidebar}>
          <LayoutGrid size={22} strokeWidth={1.5} />
          <span>Menu</span>
        </Link>
        <Link href="/about" className={`sidebar-link ${pathname === '/about' ? 'active' : ''}`} onClick={closeSidebar}>
          <Info size={22} strokeWidth={1.5} />
          <span>About</span>
        </Link>
        <Link href="/services" className={`sidebar-link ${pathname === '/services' ? 'active' : ''}`} onClick={closeSidebar}>
          <Briefcase size={22} strokeWidth={1.5} />
          <span>Services</span>
        </Link>
        <Link href="/categories" className={`sidebar-link ${pathname === '/categories' ? 'active' : ''}`} onClick={closeSidebar}>
          <UtensilsCrossed size={22} strokeWidth={1.5} />
          <span>Categories</span>
        </Link>
        <Link href="/contact" className={`sidebar-link ${pathname === '/contact' ? 'active' : ''}`} onClick={closeSidebar}>
          <Phone size={22} strokeWidth={1.5} />
          <span>Contact</span>
        </Link>
        {user ? (
          <>
            <Link href="/profile" className={`sidebar-link ${pathname === '/profile' ? 'active' : ''}`} onClick={closeSidebar}>
              <User size={22} strokeWidth={1.5} />
              <span>Profile</span>
            </Link>
            <button className="sidebar-link" onClick={handleLogout} style={{ width: '100%', textAlign: 'left' }}>
              <LogOut size={22} strokeWidth={1.5} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link href="/login" className={`sidebar-link ${pathname === '/login' ? 'active' : ''}`} onClick={closeSidebar}>
            <LogIn size={22} strokeWidth={1.5} />
            <span>Login</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
