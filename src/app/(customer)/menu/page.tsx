"use client";

import { useState, Suspense, useEffect, useMemo, useCallback } from "react";
import { useCartStore } from "@/lib/store";
import "./menu.css";
import { Plus, X, ArrowLeft, Search, ShoppingBag, Menu as MenuIcon } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";

// MOCK_ITEMS replaced with dynamic fetching

const CATEGORIES = ["All", "Starters", "Main Course", "Biryani", "Breads", "South Indian", "Desserts", "Beverages"];

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  img: string;
  desc: string;
  diet: string;
  half_price: number | null;
  full_price: number | null;
  is_available?: boolean;
}

function MenuContent() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [prevSearchStr, setPrevSearchStr] = useState("");
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isNonVegOnly, setIsNonVegOnly] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  
  const [selectedItemForPortion, setSelectedItemForPortion] = useState<MenuItem | null>(null);
  
  const addItem = useCartStore(state => state.addItem);
  const cartItems = useCartStore(state => state.items);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = searchParams.get('search')?.toLowerCase() || "";
  
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchItems = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('menu_items')
        .select('*, menu_categories(name)')
        .order('display_order');
        
      if (data) {
        setItems(data.map(d => ({
          id: String(d.id),
          name: d.name,
          category: d.menu_categories?.name || 'Uncategorized',
          price: d.price,
          img: d.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80',
          desc: d.description || '',
          diet: d.diet?.toLowerCase() || 'veg',
          half_price: d.half_price,
          full_price: d.full_price,
          is_available: d.is_available !== false
        })));
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedItemForPortion) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedItemForPortion]);

  const currentSearchStr = searchParams.toString();
  if (currentSearchStr !== prevSearchStr) {
    setPrevSearchStr(currentSearchStr);
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat)) {
      setActiveCategory(cat);
    }
  }

  const { filteredItems, vegItems, nonVegItems, showHeadings } = useMemo(() => {
    const filtered = items.filter(item => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery) || item.desc.toLowerCase().includes(searchQuery);
      
      let matchesDiet = true;
      if (isVegOnly && !isNonVegOnly) {
        matchesDiet = item.diet === 'veg';
      } else if (isNonVegOnly && !isVegOnly) {
        matchesDiet = item.diet === 'non-veg';
      }
      
      return matchesCategory && matchesSearch && matchesDiet;
    });

    return {
      filteredItems: filtered,
      vegItems: filtered.filter(item => item.diet === 'veg'),
      nonVegItems: filtered.filter(item => item.diet === 'non-veg'),
      showHeadings: (!isVegOnly && !isNonVegOnly) || (isVegOnly && isNonVegOnly)
    };
  }, [items, activeCategory, searchQuery, isVegOnly, isNonVegOnly]);

  const renderItemCard = useCallback((item: MenuItem) => (
    <div key={item.id} className="card menu-card" style={{ position: 'relative', opacity: item.is_available === false ? 0.85 : 1 }}>
      <div className="menu-img-wrapper" style={{ position: 'relative', filter: item.is_available === false ? 'grayscale(80%) blur(2px)' : 'none' }}>
        <img src={item.img} alt={item.name} className="menu-img" referrerPolicy="no-referrer" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
      </div>
      {item.is_available === false && (
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255, 60, 60, 0.95)', color: '#fff', padding: '0.4rem 1.2rem', borderRadius: '30px', fontWeight: 700, zIndex: 10, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          Out of Stock
        </div>
      )}
      <div className="menu-content" style={{ filter: item.is_available === false ? 'grayscale(30%)' : 'none' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
          <h3 style={{ margin: 0 }}>{item.name}</h3>
          <span className="text-primary font-bold">
            {item.category === "Main Course" ? `₹${item.half_price || 0}` : `₹${item.price}`}
          </span>
        </div>
        <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-4)' }}>{item.desc}</p>
        
        <button 
          className="btn-secondary w-full" 
          style={{ padding: 'var(--space-2)', opacity: item.is_available === false ? 0.5 : 1, cursor: item.is_available === false ? 'not-allowed' : 'pointer' }}
          disabled={item.is_available === false}
          onClick={() => {
            if (item.is_available === false) return;
            if (item.category === "Main Course") {
              setSelectedItemForPortion(item);
            } else {
              addItem({ ...item, id: String(item.id) });
            }
          }}
        >
          <Plus size={16} style={{ marginRight: '8px' }} />
          {item.is_available === false ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  ), [addItem]);

return (
    <>
      <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)' }}>
        <h1 className="page-title text-center">Our Menu</h1>
      <p className="page-subtitle text-center" style={{ marginBottom: 'var(--space-8)' }}>
        Explore the finest culinary creations.
      </p>

      {/* Filters */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <div className="text-secondary">Loading Menu...</div>
        </div>
      ) : (
        <>
      <div className="flex flex-col items-center" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="menu-filters" style={{ marginBottom: 'var(--space-4)' }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="dietary-segmented-control" role="group" aria-label="Dietary preferences">
          <button 
            type="button"
            className={`dietary-segment veg-segment ${isVegOnly ? 'active' : ''}`}
            onClick={() => setIsVegOnly(!isVegOnly)}
            aria-pressed={isVegOnly}
          >
            <span className="diet-icon veg-icon" aria-hidden="true"></span>
            Veg
          </button>
          
          <div className="segment-divider" aria-hidden="true" />
          
          <button 
            type="button"
            className={`dietary-segment non-veg-segment ${isNonVegOnly ? 'active' : ''}`}
            onClick={() => setIsNonVegOnly(!isNonVegOnly)}
            aria-pressed={isNonVegOnly}
          >
            <span className="diet-icon non-veg-icon" aria-hidden="true"></span>
            Non-Veg
          </button>
        </div>
      </div>

      {/* Menu Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <h3 className="text-secondary">No items found for &quot;{searchQuery}&quot;</h3>
            <button className="btn-secondary" style={{ marginTop: 'var(--space-4)' }} onClick={() => {
              setActiveCategory('All');
            }}>Clear Filters</button>
          </div>
        )}

        {vegItems.length > 0 && (
          <section>
            {showHeadings && (
              <h2 className="text-primary font-bold" style={{ marginBottom: 'var(--space-6)', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: 'var(--space-2)' }}>VEG</h2>
            )}
            <div className="menu-grid" style={{ paddingBottom: 0 }}>
              {vegItems.map(renderItemCard)}
            </div>
          </section>
        )}

        {nonVegItems.length > 0 && (
          <section>
            {showHeadings && (
              <h2 className="text-primary font-bold" style={{ marginBottom: 'var(--space-6)', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: 'var(--space-2)' }}>NON-VEG</h2>
            )}
            <div className="menu-grid" style={{ paddingBottom: 0 }}>
              {nonVegItems.map(renderItemCard)}
            </div>
          </section>
        )}
      </div>
      </>
      )}

      {/* Floating Menu Button */}
      <div className="floating-menu-btn-container">
        <button 
          className="floating-menu-btn mobile-only" 
          onClick={() => setShowCategoryPopup(true)}
        >
          <MenuIcon size={18} style={{ marginRight: '6px' }} />
          MENU
        </button>
      </div>
    </div>
    {selectedItemForPortion && (
        <div className="portion-modal-overlay open" onClick={() => setSelectedItemForPortion(null)}>
          <div className="portion-modal" onClick={e => e.stopPropagation()}>
            <div className="portion-modal-header">
              <h2>Select Portion</h2>
              <button className="portion-close" onClick={() => setSelectedItemForPortion(null)}><X size={24} /></button>
            </div>
            <div className="portion-options">
              <p className="text-secondary" style={{ marginBottom: '8px' }}>{selectedItemForPortion.name}</p>
              <button className="portion-btn" onClick={() => {
                addItem({ ...selectedItemForPortion, id: `${selectedItemForPortion.id}_half`, price: selectedItemForPortion.half_price || 0, portion: 'Half' });
                setSelectedItemForPortion(null);
              }}>
                <span>Half Portion</span>
                <span className="portion-price">₹{selectedItemForPortion.half_price || 0}</span>
              </button>
              <button className="portion-btn" onClick={() => {
                addItem({ ...selectedItemForPortion, id: `${selectedItemForPortion.id}_full`, price: selectedItemForPortion.full_price || 0, portion: 'Full' });
                setSelectedItemForPortion(null);
              }}>
                <span>Full Portion</span>
                <span className="portion-price">₹{selectedItemForPortion.full_price || 0}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Popup Modal */}
      {showCategoryPopup && (
        <div className="category-popup-overlay" onClick={() => setShowCategoryPopup(false)}>
          <div className="category-popup" onClick={e => e.stopPropagation()}>
            <div className="category-popup-header">
              <h3>Menu Categories</h3>
              <button className="portion-close" onClick={() => setShowCategoryPopup(false)}><X size={24} /></button>
            </div>
            <div className="category-popup-list">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`category-popup-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat);
                    setShowCategoryPopup(false);
                    // scroll to top smoothly
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Menu() {
  return (
    <Suspense fallback={<div className="container" style={{padding: 'var(--space-8)', textAlign: 'center'}}>Loading Menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
