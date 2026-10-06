"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Clock, CheckCircle, Package, Truck, XCircle, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { useCartStore, useCartUIStore } from "@/lib/store";
import { usePathname } from 'next/navigation';

export default function TrackOrderWidget() {
  const [order, setOrder] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  
  const totalItems = useCartStore((state) => state.totalItems());
  const setCartOpen = useCartUIStore((state) => state.setIsOpen);
  const pathname = usePathname();
  const [notification, setNotification] = useState<{message: string, show: boolean}>({ message: '', show: false });
  const [prevStatus, setPrevStatus] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchActiveOrder();

    const interval = setInterval(fetchActiveOrder, 2000); // Poll every 2s for fast demo
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id, status, total_amount')
      .eq('user_id', user.id)
      .not('status', 'in', '("delivered","cancelled")')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      if (prevStatus && prevStatus !== data.status) {
        if (data.status === 'preparing') showNotification('Your order is now being prepared! 🍳');
        if (data.status === 'out_for_delivery') showNotification('Your order is out for delivery! 🚚');
        if (data.status === 'delivered') {
          showNotification('Your order has been delivered! 🎉');
          setTimeout(() => setShowReview(true), 2000);
        }
      }
      setPrevStatus(data.status);
      setOrder(data);
    } else {
      setOrder(null);
    }
    setLoading(false);
  };

  const showNotification = (msg: string) => {
    setNotification({ message: msg, show: true });
    setTimeout(() => setNotification({ message: '', show: false }), 4000);
  };

  const handleStatusAdvance = async (newStatus: string) => {
    if (!order) return;
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id);
    
    if (!error) {
      setOrder({ ...order, status: newStatus });
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (order && order.status) {
      if (order.status === 'confirmed') {
        timer = setTimeout(() => handleStatusAdvance('preparing'), 5000);
      } else if (order.status === 'preparing') {
        timer = setTimeout(() => handleStatusAdvance('out_for_delivery'), 5000);
      } else if (order.status === 'out_for_delivery') {
        timer = setTimeout(() => handleStatusAdvance('delivered'), 5000);
      }
    }
    return () => clearTimeout(timer);
  }, [order?.status]);

  if (loading || (!order && totalItems === 0)) return null;
  if (!order && pathname === '/checkout') return null; // don't show cart on checkout

  const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentIndex = order && STATUS_STEPS.indexOf(order.status) >= 0 ? STATUS_STEPS.indexOf(order.status) : 0;
  const isCancelled = order?.status === 'cancelled';

  return (
    <>
    <div style={{
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "0.5rem"
    }}>
      {isOpen && (
        <div style={{
          background: "linear-gradient(135deg, rgba(33, 23, 18, 0.95) 0%, rgba(18, 13, 10, 0.98) 100%)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(198,162,74,0.3)",
          borderRadius: "16px",
          padding: "1.25rem",
          width: "280px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          animation: "fadeIn 0.3s ease"
        }}>
          {order && (
            <>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                Order #{order.id.split('-')[0].toUpperCase()}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-cream)", marginBottom: "1rem" }}>
                {isCancelled ? "Order Cancelled" : "Tracking Order"}
              </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>
            {!isCancelled && <div style={{ position: "absolute", left: "11px", top: "10px", bottom: "10px", width: "2px", background: "rgba(255,255,255,0.1)", zIndex: 0 }} />}
            
            {isCancelled ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                  <XCircle size={14} color="#fff" />
                </div>
                <div style={{ fontSize: "0.9rem", color: "#f87171", fontWeight: 600 }}>Cancelled</div>
              </div>
            ) : (
              [
                { id: 'pending', label: 'Order Placed', icon: Clock },
                { id: 'confirmed', label: 'Confirmed', icon: CheckCircle },
                { id: 'preparing', label: 'Preparing', icon: Package },
                { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
                { id: 'delivered', label: 'Delivered', icon: CheckCircle }
              ].map((step, idx) => {
                const isActive = idx === currentIndex;
                const isPassed = idx < currentIndex;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} style={{ display: "flex", alignItems: "center", gap: "1rem", opacity: isActive || isPassed ? 1 : 0.4 }}>
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      background: isActive ? "var(--color-champagne-gold)" : isPassed ? "var(--color-antique-gold)" : "rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
                      boxShadow: isActive ? "0 0 10px rgba(217,190,114,0.5)" : "none"
                    }}>
                      <StepIcon size={12} color={isActive || isPassed ? "#120D0A" : "#fff"} />
                    </div>
                    <div style={{
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--color-champagne-gold)" : "var(--color-cream)"
                    }}>
                      {step.label}
                    </div>
                  </div>
                );
              })
            )}
          </div>
            </>
          )}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        background: 'rgba(18, 13, 10, 0.85)',
        padding: '6px',
        borderRadius: '999px',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.1)',
      }}>
        {totalItems > 0 && pathname !== '/checkout' && (
          <button 
            onClick={() => setCartOpen(true)}
            style={{
              background: "transparent",
              color: "var(--color-cream)",
              border: "none",
              borderRadius: "999px",
              padding: "0.5rem 1rem",
              fontWeight: 700,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <ShoppingCart size={18} style={{ color: 'var(--color-primary)' }} />
            {totalItems} Item{totalItems > 1 ? 's' : ''} added
            <span style={{ color: 'var(--color-primary)', marginLeft: '0.5rem' }}>View Cart</span>
          </button>
        )}

        {order && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: "linear-gradient(135deg, var(--color-champagne-gold) 0%, var(--color-antique-gold) 100%)",
              color: "#120D0A",
              border: "none",
              borderRadius: "999px",
              padding: "0.6rem 1.25rem",
              fontWeight: 700,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
          >
            <Package size={18} />
            {isOpen ? "Hide Tracker" : "Track Order"}
            {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        )}
      </div>
    </div>

      {showReview && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ padding: '2rem', width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowReview(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              <XCircle size={20} />
            </button>
            <h2 style={{ color: 'var(--color-cream)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.5rem', textAlign: 'center' }}>Rate your meal</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>How was the food and delivery?</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                    color: rating >= star ? 'var(--color-champagne-gold)' : 'rgba(255,255,255,0.1)',
                    transition: 'color 0.2s'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill={rating >= star ? 'var(--color-champagne-gold)' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
              ))}
            </div>

            <textarea 
              className="input-field" 
              rows={4} 
              placeholder="Write your review here (optional)..." 
              style={{ marginBottom: '1.5rem' }}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            ></textarea>
            
            <button className="btn-primary w-full" onClick={() => {
              if (rating === 0) {
                alert("Please select a star rating first.");
                return;
              }
              alert('Review submitted successfully! Thank you.');
              setShowReview(false);
              setRating(0);
              setReviewText("");
            }}>Submit Review</button>
          </div>
        </div>
      )}

      {notification.show && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-champagne-gold)', color: '#000', padding: '12px 24px',
          borderRadius: '30px', fontWeight: 600, zIndex: 100001, boxShadow: '0 4px 12px rgba(198,162,74,0.3)',
          animation: 'fadeInDown 0.3s ease-out', maxWidth: '90%', textAlign: 'center'
        }}>
          {notification.message}
        </div>
      )}
    </>
  );
}
