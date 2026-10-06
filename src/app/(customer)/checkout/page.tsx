"use client";

import { useCartStore } from "@/lib/store";
import { useState, useEffect, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

const emptySubscribe = () => () => {};

export default function Checkout() {
  const { items, totalPrice, clearCart, updateQuantity, removeItem } = useCartStore();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [savedAddress, setSavedAddress] = useState<any>(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    instructions: ""
  });

  useEffect(() => {
    const fetchSavedAddress = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('orders')
          .select(`
            id,
            delivery_details ( full_name, phone, address, city, state, pincode, instructions )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0 && data[0].delivery_details && data[0].delivery_details.length > 0) {
          const details = data[0].delivery_details[0];
          setSavedAddress(details);
          setUseSavedAddress(true);
        }
      }
    };
    fetchSavedAddress();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to place an order.");
      setLoading(false);
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      setLoading(false);
      return;
    }

    if (totalPrice() < 399) {
      setError("Minimum order amount is ₹399. Please add more items to proceed.");
      setLoading(false);
      return;
    }

    try {
      const subtotal = totalPrice();
      const discount = couponApplied ? subtotal * 0.2 : 0;
      const deliveryFee = subtotal > 599 ? 0 : 49;
      const codFee = paymentMethod === 'cod' ? 19 : 0;
      const finalTotalAmount = subtotal - discount + deliveryFee + codFee;

      // 1. Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_amount: Number(finalTotalAmount.toFixed(2))
        })
        .select()
        .single();

      if (orderError || !orderData) {
        console.error("Order creation failed", orderError);
        setError("Failed to create order. Please try again later.");
        setLoading(false);
        return;
      }

      const orderId = orderData.id;

      // 2. Create order items
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      const orderItemsToInsert = [];
      
      for (const item of items) {
        const baseId = String(item.id).split('_')[0];
        if (!uuidRegex.test(baseId)) {
          console.error("Invalid UUID in cart item:", item);
          await supabase.from('orders').delete().eq('id', orderId);
          clearCart();
          setError("Your cart contains outdated items. It has been cleared. Please add items again.");
          setLoading(false);
          return;
        }
        
        orderItemsToInsert.push({
          order_id: orderId,
          menu_item_id: baseId,
          item_name: item.name,
          quantity: item.quantity,
          portion: item.portion?.toLowerCase() || null,
          unit_price: item.price,
          subtotal: item.price * item.quantity
        });
      }

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error("Order items creation failed", {
          message: itemsError?.message ?? null,
          code: itemsError?.code ?? null,
          details: itemsError?.details ?? null,
          hint: itemsError?.hint ?? null,
          error: String(itemsError)
        });
        // Attempt compensation
        await supabase.from('orders').delete().eq('id', orderId);
        setError("Failed to process order items. Please try again.");
        setLoading(false);
        return;
      }

      // 3. Create delivery details
      const deliveryPayload = useSavedAddress && savedAddress ? {
        order_id: orderId,
        full_name: savedAddress.full_name,
        phone: savedAddress.phone,
        address: savedAddress.address,
        city: savedAddress.city,
        state: savedAddress.state,
        pincode: savedAddress.pincode,
        instructions: savedAddress.instructions
      } : {
        order_id: orderId,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.postalCode,
        instructions: formData.instructions || null
      };

      const { error: deliveryError } = await supabase
        .from('delivery_details')
        .insert(deliveryPayload);

      if (deliveryError) {
        console.error("Delivery details creation failed", deliveryError);
        // Attempt compensation
        await supabase.from('orders').delete().eq('id', orderId);
        setError("Failed to save delivery details. Please try again.");
        setLoading(false);
        return;
      }

      // Success flow
      clearCart();
      setSuccess(true);
      setLoading(false);

    } catch (err) {
      console.error("Checkout error", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!mounted) return null;

  if (success) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-16)', textAlign: 'center' }}>
        <h1 className="page-title text-success">Order Placed Successfully!</h1>
        <p className="page-subtitle" style={{ marginBottom: 'var(--space-8)' }}>
          Your premium meal is being prepared and will be delivered shortly.
        </p>
        <Link href="/menu" className="btn-primary">Return to Menu</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-16)', textAlign: 'center' }}>
        <h1 className="page-title">Your Cart is Empty</h1>
        <p className="page-subtitle" style={{ marginBottom: 'var(--space-8)' }}>
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link href="/menu" className="btn-primary">Explore Menu</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <h1 className="page-title text-center">Delivery Information</h1>
      <p className="page-subtitle text-center" style={{ marginBottom: 'var(--space-8)' }}>
        Provide your details to complete the order.
      </p>

      {error && (
        <div style={{ backgroundColor: 'rgba(255, 77, 79, 0.1)', color: 'var(--color-error)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-8)', fontSize: '0.9rem', border: '1px solid var(--color-error)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)' }}>
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            
            {savedAddress && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                  <input type="radio" name="addressType" checked={useSavedAddress} onChange={() => setUseSavedAddress(true)} style={{ accentColor: 'var(--color-champagne-gold)', width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-cream)' }}>Use Saved Address</span>
                </label>
                
                {useSavedAddress && (
                  <div style={{
                    background: 'rgba(198,162,74,0.05)',
                    border: '1px solid rgba(198,162,74,0.3)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6'
                  }}>
                    <div style={{ color: 'var(--color-champagne-gold)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{savedAddress.full_name}</div>
                    <div>{savedAddress.phone}</div>
                    <div>{savedAddress.address}</div>
                    <div>{savedAddress.city}, {savedAddress.state} {savedAddress.pincode}</div>
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="addressType" checked={!useSavedAddress} onChange={() => setUseSavedAddress(false)} style={{ accentColor: 'var(--color-champagne-gold)', width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-cream)' }}>Add New Address</span>
                </label>
              </div>
            )}

            {!useSavedAddress && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" name="firstName" className="input-field" placeholder="John" value={formData.firstName} onChange={handleInput} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" name="lastName" className="input-field" placeholder="Doe" value={formData.lastName} onChange={handleInput} required />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" name="phone" className="input-field" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleInput} required />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address</label>
              <input type="text" name="address" className="input-field" placeholder="123 Luxury Avenue" value={formData.address} onChange={handleInput} required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" name="city" className="input-field" placeholder="Foodville" value={formData.city} onChange={handleInput} required />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" name="state" className="input-field" placeholder="State" value={formData.state} onChange={handleInput} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Postal Code (Pincode)</label>
              <input type="text" name="postalCode" className="input-field" placeholder="12345" value={formData.postalCode} onChange={handleInput} required />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Instructions (Optional)</label>
              <textarea name="instructions" className="input-field" rows={3} placeholder="Leave at the door, etc." value={formData.instructions} onChange={handleInput}></textarea>
            </div>
            </>
            )}

            <div style={{ marginTop: 'var(--space-4)', borderTop: 'var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-cream)', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: `1px solid ${paymentMethod === 'upi' ? 'var(--color-champagne-gold)' : 'rgba(198,162,74,0.1)'}`, borderRadius: '12px', background: paymentMethod === 'upi' ? 'rgba(198,162,74,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ accentColor: 'var(--color-champagne-gold)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-cream)' }}>UPI (GPay, PhonePe, Paytm)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Instant</span>
                </label>
                
                {paymentMethod === 'upi' && (
                  <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem', padding: '0 1rem' }} className="animate-fade-in">
                    <input type="text" className="input-field" placeholder="Enter your UPI ID (e.g. username@okhdfcbank)" required />
                  </div>
                )}
                
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: `1px solid ${paymentMethod === 'card' ? 'var(--color-champagne-gold)' : 'rgba(198,162,74,0.1)'}`, borderRadius: '12px', background: paymentMethod === 'card' ? 'rgba(198,162,74,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ accentColor: 'var(--color-champagne-gold)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-cream)' }}>Credit / Debit Card</span>
                  </div>
                </label>

                {paymentMethod === 'card' && (
                  <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="animate-fade-in">
                    <input type="text" className="input-field" placeholder="Card Number (0000 0000 0000 0000)" required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input type="text" className="input-field" placeholder="MM/YY" required />
                      <input type="text" className="input-field" placeholder="CVV" required />
                    </div>
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: `1px solid ${paymentMethod === 'cod' ? 'var(--color-champagne-gold)' : 'rgba(198,162,74,0.1)'}`, borderRadius: '12px', background: paymentMethod === 'cod' ? 'rgba(198,162,74,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ accentColor: 'var(--color-champagne-gold)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-cream)' }}>Cash on Delivery (COD)</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-champagne-gold)', fontWeight: 600 }}>+₹19</span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-4)', borderTop: 'var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              {totalPrice() < 399 ? (
                <button type="button" className="btn-primary w-full" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  Minimum order is ₹399
                </button>
              ) : (
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? "Processing Order..." : "Confirm Order"}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card" style={{ padding: 'var(--space-8)', height: 'fit-content' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Order Summary</h3>
          
          {/* Free Delivery Notification */}
          <div style={{
            background: totalPrice() > 599 ? 'rgba(92, 184, 92, 0.1)' : 'rgba(217, 190, 114, 0.1)',
            border: `1px solid ${totalPrice() > 599 ? 'rgba(92, 184, 92, 0.3)' : 'rgba(217, 190, 114, 0.3)'}`,
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ flex: 1, fontSize: '0.95rem' }}>
              {totalPrice() > 599 ? (
                <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>🎉 Yay! Free Delivery unlocked!</span>
              ) : (
                <span style={{ color: 'var(--color-champagne-gold)' }}>Add ₹{(599 - totalPrice()).toFixed(2)} more for <strong>Free Delivery</strong></span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex justify-between items-start text-secondary" style={{ paddingBottom: '16px', borderBottom: index < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={item.img} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} referrerPolicy="no-referrer" />
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-cream)' }}>{item.name}</span>
                      {item.portion && (
                        <div style={{ fontSize: '0.75rem', padding: '1px 6px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--color-champagne-gold)', borderRadius: '8px', width: 'fit-content', marginTop: '4px' }}>
                          {item.portion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-champagne-gold)' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="quantity-controls" style={{ background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '30px', display: 'flex', alignItems: 'center' }}>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--color-cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                      <span style={{ width: '20px', textAlign: 'center', fontSize: '0.85rem' }}>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--color-cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', border: 'none', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: 'var(--border-subtle)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
            
            {/* Coupon Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Have a coupon code?</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Enter code (e.g. HUNGER20)"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  disabled={couponApplied}
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  onClick={() => {
                    if (couponCode === "HUNGER20" || couponCode === "WELCOME") {
                      setCouponApplied(true);
                      setCouponError("");
                    } else if (couponCode.trim() !== "") {
                      setCouponError("Invalid coupon code");
                    }
                  }}
                  disabled={couponApplied || !couponCode.trim()}
                >
                  {couponApplied ? "Applied" : "Apply"}
                </button>
              </div>
              {couponError && <p style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginTop: '4px' }}>{couponError}</p>}
              {couponApplied && <p style={{ color: 'var(--color-success)', fontSize: '0.85rem', marginTop: '4px' }}>20% discount applied successfully!</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
              <span>Subtotal</span>
              <span>₹{totalPrice().toFixed(2)}</span>
            </div>
            {couponApplied && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--color-success)' }}>
                <span>Discount (20%)</span>
                <span>-₹{(totalPrice() * 0.2).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
              <span>Delivery Fee</span>
              <span>{totalPrice() > 599 ? 'Free' : '₹49.00'}</span>
            </div>
            {paymentMethod === 'cod' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                <span>COD Handling Fee</span>
                <span>₹19.00</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(198, 162, 74, 0.1)', paddingTop: '16px' }}>
              <strong style={{ fontSize: '1.1rem' }}>Total Amount</strong>
              <span className="text-primary" style={{ fontSize: '1.35rem', fontWeight: 'bold' }}>
                ₹{((totalPrice() * (couponApplied ? 0.8 : 1)) + (totalPrice() > 599 ? 0 : 49) + (paymentMethod === 'cod' ? 19 : 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
