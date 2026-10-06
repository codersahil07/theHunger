"use client";

import { User, MapPin, Edit2, Save, ShoppingBag, Truck, CreditCard, LogOut, ChevronRight, HelpCircle, XCircle, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import "./profile.css";

type Tab = "personal" | "orders" | "track" | "address" | "payment" | "help" | "reservations";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [reservations, setReservations] = useState<Record<string, unknown>[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error loading profile", profileError);
        setError("Failed to load profile data.");
      } else if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          city: profileData.city || "",
          state: profileData.state || "",
          pincode: profileData.pincode || ""
        });
      }

      // Fetch Orders 
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error("Error loading orders", ordersError);
      } else if (ordersData) {
        setOrders(ordersData);
      }
      
      // Fetch Reservations
      const { data: resData, error: resError } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('reservation_date', { ascending: false });
        
      if (resError) {
        console.error("Error loading reservations", resError);
      } else if (resData) {
        setReservations(resData);
      }
      
      setLoading(false);
    }

    loadData();
  }, [supabase, router]);

  const handleEdit = () => {
    setIsEditing(true);
    setSuccess("");
    setError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      full_name: (profile?.full_name as string) || "",
      phone: (profile?.phone as string) || "",
      address: (profile?.address as string) || "",
      city: (profile?.city as string) || "",
      state: (profile?.state as string) || "",
      pincode: (profile?.pincode as string) || ""
    });
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(updateError);
      setError("Failed to update profile. Please try again.");
    } else {
      setSuccess("Profile updated successfully!");
      setProfile({
        ...profile,
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      });
      setIsEditing(false);
    }
    
    setSaving(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="profile-page-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <p style={{color: 'var(--color-secondary)'}}>Loading your account...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <p style={{color: 'var(--color-error)'}}>Unable to load profile. Please try refreshing.</p>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="profile-page-container">
      
      {/* FULL-WIDTH HEADER */}
      <div className="profile-header-banner">
        <div className="profile-header-accent"></div>
        <div className="profile-header-inner">
          <div>
            <h1 className="profile-name">
              {profile.full_name as string || "My Account"}
            </h1>
            <p className="profile-contact">
              {profile.phone ? `${profile.phone} · ` : ''}{profile.email as string}
            </p>
          </div>
          
          <button 
            onClick={() => { setActiveTab("personal"); setIsEditing(true); }}
            className="profile-edit-btn"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT */}
      <div className="profile-main-content">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="profile-sidebar">
          <button 
            onClick={() => { setActiveTab("orders"); setSuccess(""); setError(""); }} 
            className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <ShoppingBag size={20} />
            <span>Orders</span>
          </button>

          <button 
            onClick={() => { setActiveTab("personal"); setIsEditing(false); setSuccess(""); setError(""); }} 
            className={`profile-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
          >
            <User size={20} />
            <span>Personal Details</span>
          </button>

          <button 
            onClick={() => { setActiveTab("reservations"); setSuccess(""); setError(""); }} 
            className={`profile-nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
          >
            <CalendarDays size={20} />
            <span>Table Reservations</span>
          </button>

          <button 
            onClick={() => { setActiveTab("track"); setSuccess(""); setError(""); }} 
            className={`profile-nav-item ${activeTab === 'track' ? 'active' : ''}`}
          >
            <Truck size={20} />
            <span>Track Order</span>
          </button>

          <button 
            onClick={() => { setActiveTab("address"); setIsEditing(false); setSuccess(""); setError(""); }} 
            className={`profile-nav-item ${activeTab === 'address' ? 'active' : ''}`}
          >
            <MapPin size={20} />
            <span>Address</span>
          </button>

          <button 
            onClick={() => { setActiveTab("payment"); setSuccess(""); setError(""); }} 
            className={`profile-nav-item ${activeTab === 'payment' ? 'active' : ''}`}
          >
            <CreditCard size={20} />
            <span>Card Details</span>
          </button>

          <button 
            onClick={() => { setActiveTab("help"); setSuccess(""); setError(""); }} 
            className={`profile-nav-item ${activeTab === 'help' ? 'active' : ''}`}
          >
            <HelpCircle size={20} />
            <span>Help & Support</span>
          </button>

          <div className="profile-sidebar-divider"></div>
          
          <button 
            onClick={handleLogout} 
            className="profile-nav-item profile-nav-logout"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="profile-content-pane">
          
          {error && <div className="profile-alert error">{error}</div>}
          {success && <div className="profile-alert success">{success}</div>}

          {/* ORDERS SECTION */}
          {activeTab === "orders" && (
            <div>
              <h2 className="profile-section-title">Order History</h2>
              
              {orders.length === 0 ? (
                <div className="profile-empty-state">
                  <ShoppingBag size={48} className="profile-empty-icon" />
                  <p style={{color: 'var(--color-secondary)', fontSize: '18px', marginBottom: '24px'}}>You haven't placed any orders yet.</p>
                  <button onClick={() => router.push('/menu')} className="btn-primary">Explore Menu</button>
                </div>
              ) : (
                <div className="order-list">
                  {orders.map((order) => {
                    const st = String(order.status).toLowerCase();
                    const statusColor = st === 'delivered' ? 'var(--color-success)' : st === 'cancelled' ? 'var(--color-error)' : 'var(--color-primary)';
                    const statusBg = st === 'delivered' ? 'rgba(82, 196, 26, 0.1)' : st === 'cancelled' ? 'rgba(255, 77, 79, 0.1)' : 'rgba(212, 175, 55, 0.1)';
                    
                    return (
                      <div key={order.id as string} className="order-card">
                        <div className="order-header">
                          <div>
                            <div className="order-id-group">
                              <h3 className="order-id">Order #{String(order.id).split('-')[0].toUpperCase()}</h3>
                              <span className="order-status" style={{ backgroundColor: statusBg, color: statusColor }}>
                                {order.status as string}
                              </span>
                            </div>
                            <p className="order-date">
                              Placed {new Date(order.created_at as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(order.created_at as string).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          <div>
                            <p className="order-total">₹{order.total_amount as number}</p>
                          </div>
                        </div>

                        <div className="order-items-list">
                          {(order.order_items as Record<string, unknown>[])?.map((item) => (
                            <div key={item.id as string} className="order-item-row">
                              <div>
                                <span className="order-item-qty">{item.quantity as number} x</span> 
                                <span className="order-item-name">{item.item_name as string}</span>
                                {item.portion ? <span style={{opacity: 0.7, marginLeft: '4px'}}>({item.portion as string})</span> : null}
                              </div>
                              <span className="order-item-price">₹{item.subtotal as number}</span>
                            </div>
                          ))}
                        </div>

                        {order.order_type === 'train' && (
                          <div className="order-train-data">
                            <div className="train-data-field"><span>PNR</span> {order.pnr as string || 'N/A'}</div>
                            <div className="train-data-field"><span>Train Number</span> {order.train_number as string || 'N/A'}</div>
                            <div className="train-data-field"><span>Coach / Seat</span> {order.coach as string || '-'} / {order.seat as string || '-'}</div>
                            <div className="train-data-field"><span>Station</span> {order.delivery_station as string || 'N/A'}</div>
                          </div>
                        )}

                        <div className="order-actions">
                          {st === 'delivered' && (
                            <button className="order-action-btn" onClick={() => {
                              setReviewOrderId(String(order.id));
                              setRating(0);
                              setReviewText("");
                              setShowReview(true);
                            }}>
                              Review Food
                            </button>
                          )}
                          {st !== 'delivered' && st !== 'cancelled' && (
                            <button onClick={() => setActiveTab('track')} className="order-action-btn">
                              Track Order
                            </button>
                          )}
                          <button className="order-action-btn" onClick={() => { setActiveTab('help'); }}>
                            Need Help?
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* RESERVATIONS SECTION */}
          {activeTab === "reservations" && (
            <div className="animate-fade-in">
              <h2 className="profile-section-title">Table Reservations</h2>
              
              {reservations.length === 0 ? (
                <div className="profile-empty-state">
                  <CalendarDays size={48} className="profile-empty-icon" />
                  <p style={{color: 'var(--color-secondary)', fontSize: '18px', marginBottom: '24px'}}>You don't have any table reservations.</p>
                  <button onClick={() => router.push('/services')} className="btn-primary">Book a Table</button>
                </div>
              ) : (
                <div className="order-list">
                  {reservations.map((res) => {
                    const statusText = (res.status as string) || 'Pending';
                    const st = statusText.toLowerCase();
                    const statusColor = st === 'confirmed' ? 'var(--color-success)' : st === 'cancelled' ? 'var(--color-error)' : 'var(--color-champagne-gold)';
                    const statusBg = st === 'confirmed' ? 'rgba(82, 196, 26, 0.15)' : st === 'cancelled' ? 'rgba(255, 77, 79, 0.15)' : 'rgba(212, 175, 55, 0.15)';
                    
                    return (
                      <div key={res.id as string} className="order-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-cream)', marginBottom: '4px' }}>Table for {res.guests as number}</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{res.full_name as string} • {res.phone as string}</p>
                          </div>
                          <span style={{ backgroundColor: statusBg, color: statusColor, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            {statusText}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '24px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                          <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Date</p>
                            <p style={{ color: 'var(--color-cream)', fontWeight: 500 }}>{res.reservation_date as string}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Time</p>
                            <p style={{ color: 'var(--color-champagne-gold)', fontWeight: 600 }}>{res.reservation_time as string}</p>
                          </div>
                        </div>
                        
                        {Boolean(res.special_request) && (
                          <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            <strong>Note:</strong> {res.special_request as string}
                          </div>
                        )}
                        
                        {st === 'confirmed' && (
                          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(82, 196, 26, 0.1)', border: '1px solid rgba(82, 196, 26, 0.2)', borderRadius: '8px', color: 'var(--color-success)', fontSize: '0.9rem' }}>
                            Your table is confirmed! We look forward to hosting you.
                          </div>
                        )}
                        
                        {st === 'pending' && (
                          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '8px', color: 'var(--color-champagne-gold)', fontSize: '0.9rem' }}>
                            Your request is pending confirmation from the restaurant.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TRACK ORDER TAB */}
          {activeTab === "track" && (
            <div>
              <h2 className="profile-section-title">Track Active Orders</h2>
              
              {activeOrders.length === 0 ? (
                <div className="profile-empty-state">
                  <Truck size={48} className="profile-empty-icon" />
                  <p style={{color: 'var(--color-secondary)', fontSize: '18px'}}>No active orders to track.</p>
                </div>
              ) : (
                <div className="order-list">
                  {activeOrders.map(order => {
                    const statuses = ['pending', 'confirmed', 'preparing', 'out for delivery', 'delivered'];
                    const currentStatus = String(order.status).toLowerCase();
                    const currentIndex = statuses.indexOf(currentStatus);
                    
                    return (
                      <div key={order.id as string} className="order-card">
                        <div className="order-header">
                          <div>
                            <span style={{fontSize: '11px', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Order ID</span>
                            <div style={{fontFamily: 'monospace', fontSize: '18px', marginTop: '4px'}}>{String(order.id).split('-')[0].toUpperCase()}</div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <span style={{fontSize: '11px', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Amount</span>
                            <div style={{fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px'}}>₹{order.total_amount as number}</div>
                          </div>
                        </div>
                        
                        <div className="tracker-container">
                          <div className="tracker-bg-line"></div>
                          <div 
                            className="tracker-fill-line"
                            style={{ width: `${Math.max(0, currentIndex) * 25}%` }}
                          ></div>
                          
                          <div className="tracker-nodes">
                            {statuses.map((step, index) => {
                              const isActive = index <= currentIndex;
                              const isCurrent = index === currentIndex;
                              
                              return (
                                <div key={step} className="tracker-node-wrapper">
                                  <div className={`tracker-dot ${isActive ? 'active' : 'inactive'}`}>
                                    {isActive && <div className="tracker-dot-inner"></div>}
                                  </div>
                                  <span className={`tracker-label ${isCurrent ? 'current' : isActive ? 'active' : 'inactive'}`}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PERSONAL DETAILS TAB */}
          {activeTab === "personal" && (
            <div className="details-panel">
              <div className="details-header">
                <h2>Personal Details</h2>
                {!isEditing && (
                  <button onClick={handleEdit} className="order-action-btn">
                    <Edit2 size={16} /> Edit
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSave} style={{maxWidth: '500px'}}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="input-field" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" className="input-field" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  
                  <div className="form-group">
                    <label>Email (Read Only)</label>
                    <input type="email" className="input-field" style={{opacity: 0.5}} value={profile.email as string} disabled />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" onClick={handleCancel} className="btn-secondary" style={{background: 'transparent'}} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="details-grid">
                  <div className="details-field">
                    <span>Full Name</span>
                    <p>{profile.full_name as string || "Not set"}</p>
                  </div>
                  <div className="details-field">
                    <span>Phone Number</span>
                    <p>{profile.phone as string || "Not set"}</p>
                  </div>
                  <div className="details-field details-full-width">
                    <span>Email Address</span>
                    <p>{profile.email as string}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADDRESS TAB */}
          {activeTab === "address" && (
            <div className="details-panel">
              <div className="details-header">
                <h2>Saved Address</h2>
                {!isEditing && (
                  <button onClick={handleEdit} className="order-action-btn">
                    <Edit2 size={16} /> Edit
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSave} style={{maxWidth: '500px'}}>
                  <div className="form-group">
                    <label>Street Address / Delivery Instructions</label>
                    <textarea className="input-field" style={{minHeight: '100px', resize: 'vertical'}} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="House/Flat No., Street, Landmark"></textarea>
                  </div>
                  <div style={{display: 'flex', gap: '24px'}}>
                    <div className="form-group" style={{flex: 1}}>
                      <label>City</label>
                      <input type="text" className="input-field" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div className="form-group" style={{flex: 1}}>
                      <label>State</label>
                      <input type="text" className="input-field" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input type="text" className="input-field" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Address"}
                    </button>
                    <button type="button" onClick={handleCancel} className="btn-secondary" style={{background: 'transparent'}} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {profile.address ? (
                    <div className="address-box">
                      <MapPin size={24} className="address-icon" />
                      <div className="details-field">
                        <span>Default Delivery Location</span>
                        <p style={{marginBottom: '8px', whiteSpace: 'pre-line', lineHeight: 1.5}}>{profile.address as string}</p>
                        <p style={{fontSize: '15px', color: 'var(--color-secondary)'}}>
                          {(profile.city || profile.state || profile.pincode) ? 
                           `${profile.city as string || ''}${profile.city && profile.state ? ', ' : ''}${profile.state as string || ''} - ${profile.pincode as string || ''}`
                           : null
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-empty-state" style={{maxWidth: '600px', margin: '0', backgroundColor: 'transparent', borderStyle: 'dashed'}}>
                      <MapPin size={32} className="profile-empty-icon" />
                      <p style={{color: 'var(--color-secondary)', marginBottom: '24px'}}>No default delivery address saved.</p>
                      <button onClick={handleEdit} className="profile-edit-btn">
                        Add Address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PAYMENT TAB */}
          {activeTab === "payment" && (
            <div className="details-panel">
              <div className="details-header" style={{marginBottom: 0, borderBottom: 'none'}}>
                <h2>Payment Methods</h2>
              </div>
              <div style={{height: '1px', backgroundColor: 'var(--color-border)', margin: '0 -32px 32px'}}></div>
              
              <div className="profile-empty-state" style={{backgroundColor: 'rgba(255,255,255,0.02)', borderStyle: 'dashed'}}>
                <CreditCard size={48} className="profile-empty-icon" />
                <p style={{color: 'var(--color-text)', fontSize: '20px', fontWeight: 500, marginBottom: '12px'}}>No payment method saved</p>
                <p style={{color: 'var(--color-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6}}>
                  For your ultimate security, we do not store raw card credentials or CVV numbers on our servers. You can add secure tokenized payment methods during your next checkout once our certified gateway is integrated.
                </p>
              </div>
            </div>
          )}

          {/* HELP TAB */}
          {activeTab === "help" && (
            <div className="details-panel">
              <div className="details-header" style={{marginBottom: 0, borderBottom: 'none'}}>
                <h2>Help & Support</h2>
              </div>
              <div style={{height: '1px', backgroundColor: 'var(--color-border)', margin: '0 -32px 32px'}}></div>
              
              <div className="profile-empty-state" style={{backgroundColor: 'rgba(255,255,255,0.02)', borderStyle: 'dashed', padding: '2rem'}}>
                <HelpCircle size={48} className="profile-empty-icon" style={{marginBottom: '1rem', color: 'var(--color-champagne-gold)'}} />
                <p style={{color: 'var(--color-text)', fontSize: '18px', fontWeight: 500, marginBottom: '24px'}}>Facing an issue? We're here to help.</p>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px', margin: '0 auto'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(198,162,74,0.1)', borderRadius: '8px', border: '1px solid rgba(198,162,74,0.2)'}}>
                    <div style={{fontSize: '1.5rem'}}>📞</div>
                    <div style={{textAlign: 'left'}}>
                      <div style={{fontSize: '0.8rem', color: 'var(--color-secondary)'}}>Call Us</div>
                      <div style={{fontWeight: 600, color: 'var(--color-cream)'}}>+91 98765 43210</div>
                    </div>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(198,162,74,0.1)', borderRadius: '8px', border: '1px solid rgba(198,162,74,0.2)'}}>
                    <div style={{fontSize: '1.5rem'}}>✉️</div>
                    <div style={{textAlign: 'left'}}>
                      <div style={{fontSize: '0.8rem', color: 'var(--color-secondary)'}}>Email Us</div>
                      <div style={{fontWeight: 600, color: 'var(--color-cream)'}}>support@thehunger.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
    </div>
  );
}
