"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, User, LogOut, Menu, ShoppingCart, LogIn } from "lucide-react";
import { useCartStore, useCartUIStore } from "@/lib/store";
import { useState, useEffect, useSyncExternalStore } from "react";
import CartDrawer from "./CartDrawer";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, usePathname } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";

const emptySubscribe = () => () => {};

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { isOpen: cartOpen, setIsOpen: setCartOpen } = useCartUIStore();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = useCartStore((state) => state.totalItems());
  const router = useRouter();
  const pathname = usePathname();
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    const client = createClient();
    setSupabase(client);

    client.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-brand-text desktop-only">
          The Hunger
        </div>
        <div className="header-pill desktop-only">
          
          <div className="header-left">
             <Link href="/" className={`header-link ${pathname === '/' ? 'active' : ''}`}>Home</Link>
             <Link href="/menu" className={`header-link ${pathname === '/menu' ? 'active' : ''}`}>Menu</Link>
             <Link href="/services" className={`header-link ${pathname === '/services' ? 'active' : ''}`}>Services</Link>
             <Link href="/categories" className={`header-link ${pathname === '/categories' ? 'active' : ''}`}>Categories</Link>
          </div>

          <div className="header-center">
            <Link href="/" aria-label="The Hunger Home">
              <Image 
                src="/images/the-hunger-logo.png" 
                alt="The Hunger" 
                width={76} 
                height={76} 
                className="brand-logo-img" 
                priority
              />
            </Link>
          </div>

          <div className="header-right">
            <Link href="/about" className={`header-link ${pathname === '/about' ? 'active' : ''}`}>About</Link>
            <Link href="/contact" className={`header-link ${pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
            {user ? (
              <>
                <Link href="/profile" className="header-icon-btn" aria-label="User Profile">
                  <User size={22} />
                </Link>
                <button className="header-icon-btn" aria-label="Logout" onClick={handleLogout}>
                  <LogOut size={22} />
                </button>
              </>
            ) : (
              <Link href="/login" className="header-icon-btn" aria-label="Login">
                <LogIn size={22} />
              </Link>
            )}
          </div>
          
        </div>

        {pathname === '/menu' ? (
          <div className="mobile-header-bar mobile-only">
            <div className="mobile-header-search" style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: '24px', padding: '8px 16px', border: '1px solid rgba(198,162,74,0.3)', width: '100%' }}>
              <Search size={18} color="var(--color-champagne-gold)" />
              <input 
                type="text" 
                placeholder="Search dishes..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  router.replace(`/menu?search=${encodeURIComponent(e.target.value)}`);
                }}
                style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '12px', flex: 1, outline: 'none', fontSize: '15px' }}
              />
            </div>
          </div>
        ) : (
          <div className="mobile-header-bar mobile-only">
            <Link href="/" className="mobile-brand">
              <Image src="/images/the-hunger-logo.png" alt="Logo" width={44} height={44} className="brand-logo-img" />
              <span className="mobile-brand-text">The Hunger</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button className="mobile-hamburger-btn" onClick={toggleSidebar}>
                <Menu size={28} />
              </button>
            </div>
          </div>
        )}
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />


    </>
  );
}
