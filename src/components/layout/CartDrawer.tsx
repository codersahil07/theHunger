"use client";

import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import Link from "next/link";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) return null;

  return (
    <>
      <div className={`cart-overlay ${isOpen ? "open" : ""}`} onClick={onClose}></div>
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="cart-content">
          {items.length === 0 ? (
            <div className="cart-empty">
              <p className="text-secondary mb-4">Your cart is empty.</p>
              <button className="btn-primary" onClick={onClose}>Continue Browsing</button>
            </div>
          ) : (
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img-wrapper">
                    <img src={item.img} alt={item.name} className="cart-item-img" referrerPolicy="no-referrer" />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-header">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <h4>{item.name}</h4>
                        {item.portion && (
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--color-champagne-gold)', borderRadius: '12px', width: 'fit-content', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                            {item.portion} Portion
                          </span>
                        )}
                      </div>
                      <button className="remove-btn" onClick={() => removeItem(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="cart-item-bottom">
                      <p className="cart-item-price">₹{item.price}</p>
                      <div className="quantity-controls">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total</span>
              <span className="text-primary font-bold" style={{ fontSize: '1.25rem' }}>₹{totalPrice().toFixed(2)}</span>
            </div>
            
            {totalPrice() < 399 ? (
              <div style={{ marginBottom: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--color-champagne-gold)', textAlign: 'center', background: 'rgba(217, 190, 114, 0.1)', padding: '8px', borderRadius: '8px' }}>
                Add items worth ₹{(399 - totalPrice()).toFixed(2)} more to reach the minimum order amount of ₹399.
              </div>
            ) : (
              <div style={{ marginBottom: 'var(--space-4)', fontSize: '0.85rem', color: totalPrice() > 599 ? 'var(--color-success)' : 'var(--color-champagne-gold)', textAlign: 'center' }}>
                {totalPrice() > 599 ? '🎉 Free Delivery Applied!' : `Add ₹${(599 - totalPrice()).toFixed(2)} more for Free Delivery`}
              </div>
            )}
            
            {totalPrice() < 399 ? (
              <button className="btn-primary w-full" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Minimum order is ₹399
              </button>
            ) : (
              <Link href="/checkout" className="btn-primary w-full" onClick={onClose}>
                Proceed to Delivery Form
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
