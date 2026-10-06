"use client";

import { useState, useEffect } from "react";
import { Calendar, Package, Users, X, Info } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function Services() {
  const [activeModal, setActiveModal] = useState<'booking' | 'catering' | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState({ reservationsEnabled: true, disabledMessage: 'Bookings are paused.' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  const services = [
    { 
      title: "Dine-In Experience", 
      desc: "Enjoy an elevated dining experience with premium table service, refined ambience, and freshly prepared cuisine.", 
      icon: Users,
      ctaText: "Book a Table",
      onClick: () => setActiveModal('booking')
    },
    { 
      title: "Gourmet Delivery", 
      desc: "Order your favourite dishes and enjoy The Hunger experience, freshly prepared and delivered to your doorstep.", 
      icon: Package,
      ctaText: "Order for Delivery",
      isLink: true,
      href: "/menu"
    },
    { 
      title: "Event Catering", 
      desc: "Make your special occasions memorable with curated menus and premium catering tailored to your event.", 
      icon: Calendar,
      ctaText: "Plan Your Event",
      onClick: () => setActiveModal('catering')
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('reservations').insert({
        user_id: user?.id || null,
        full_name: formData.fullName,
        phone: formData.phone,
        reservation_date: formData.bookingDate,
        reservation_time: formData.bookingTime,
        guests: parseInt(formData.guests, 10),
        special_request: formData.specialRequest || null,
        status: 'pending'
      });

      if (error) {
        console.error("Booking failed", error);
        alert("Failed to submit reservation. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Booking error", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCateringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('catering_requests').insert({
        user_id: user?.id || null,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        event_date: formData.eventDate,
        guests: parseInt(formData.guests, 10),
        venue: `${formData.venueName}, ${formData.venueAddress}, ${formData.city}`,
        event_details: `Event Type: ${formData.eventType}\nStart Time: ${formData.startTime || 'Not specified'}\nCatering Requirements: ${formData.cateringRequirements || 'None'}\nDietary Requirements: ${formData.dietaryRequirements || 'None'}\nNotes: ${formData.notes || 'None'}`,
        status: 'pending'
      });

      if (error) {
        console.error("Catering request failed", error);
        alert("Failed to submit catering request. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Catering error", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setActiveModal(null);
    setSuccess(false);
    setFormData({});
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <h1 className="page-title text-center">Our Services</h1>
      <p className="page-subtitle text-center" style={{ marginBottom: 'var(--space-8)' }}>
        Experience luxury dining tailored to your lifestyle.
      </p>
      
      <div className="flex flex-col gap-6" style={{ maxWidth: '800px', margin: '0 auto', marginBottom: 'var(--space-16)' }}>
        {services.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <div key={idx} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: 'var(--space-4)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)', flexShrink: 0 }}>
                  <Icon size={32} />
                </div>
                <div>
                  <h3 style={{ marginBottom: 'var(--space-2)' }}>{srv.title}</h3>
                  <p className="text-secondary">{srv.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                {srv.isLink ? (
                  <Link href={srv.href || "#"} className="btn-primary">
                    {srv.ctaText}
                  </Link>
                ) : (
                  <button onClick={srv.onClick} className="btn-primary">
                    {srv.ctaText}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals Overlay */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: 'var(--space-4)'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 'var(--space-6)',
            position: 'relative',
            backgroundColor: 'var(--color-bg-surface)'
          }}>
            <button 
              onClick={closeModals} 
              style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', color: 'var(--color-text-secondary)' }}
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {success ? (
              <div className="text-center" style={{ padding: 'var(--space-8) 0' }}>
                <h2 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                  {activeModal === 'booking' ? "Your table request has been received." : "Your catering enquiry has been received."}
                </h2>
                {activeModal === 'booking' ? (
                  <p className="text-secondary" style={{ marginBottom: 'var(--space-6)' }}>
                    We look forward to hosting you on {formData.bookingDate} at {formData.bookingTime} for {formData.guests} guests.
                  </p>
                ) : (
                  <p className="text-secondary" style={{ marginBottom: 'var(--space-6)' }}>
                    Thank you for your enquiry. We will contact you soon regarding your {formData.eventType} on {formData.eventDate}.
                  </p>
                )}
                <button onClick={closeModals} className="btn-secondary">Close</button>
              </div>
            ) : (
              <>
                <h2 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
                  {activeModal === 'booking' ? "Book a Table" : "Plan Your Event"}
                </h2>
                <p className="text-secondary" style={{ marginBottom: 'var(--space-6)' }}>
                  {activeModal === 'booking' 
                    ? "Reserve your spot for an exquisite dining experience." 
                    : "Provide the details of your upcoming event and we will tailor a premium culinary experience."}
                </p>

                {activeModal === 'booking' && (
                  !settings.reservationsEnabled ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(220, 38, 38, 0.05)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '12px' }}>
                      <div style={{ color: 'var(--color-error)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <Info size={40} />
                      </div>
                      <h3 style={{ color: 'var(--color-cream)', fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                        Reservations Currently Paused
                      </h3>
                      <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                        {settings.disabledMessage}
                      </p>
                    </div>
                  ) : (
                  <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input required type="text" name="fullName" className="input-field" onChange={handleInputChange} />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Phone Number *</label>
                        <input required type="tel" name="phone" className="input-field" onChange={handleInputChange} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Email Address</label>
                        <input type="email" name="email" className="input-field" onChange={handleInputChange} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Date *</label>
                        <input required type="date" name="bookingDate" className="input-field" min={new Date().toISOString().split('T')[0]} onChange={handleInputChange} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Preferred Time *</label>
                        <input required type="time" name="bookingTime" className="input-field" onChange={handleInputChange} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Number of Guests *</label>
                        <input required type="number" name="guests" min="1" className="input-field" onChange={handleInputChange} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Seating Preference</label>
                        <select name="seatingPreference" className="input-field" onChange={handleInputChange} defaultValue="No Preference">
                          <option value="No Preference">No Preference</option>
                          <option value="Indoor">Indoor</option>
                          <option value="Outdoor">Outdoor</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Special Request / Notes</label>
                      <textarea name="specialRequest" className="input-field" rows={3} onChange={handleInputChange}></textarea>
                    </div>
                    <div style={{ marginTop: 'var(--space-4)', borderTop: 'var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                      <h3 style={{ marginBottom: '1rem', color: 'var(--color-cream)', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>Payment Method (₹199)</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: `1px solid ${paymentMethod === 'upi' ? 'var(--color-champagne-gold)' : 'rgba(198,162,74,0.1)'}`, borderRadius: '12px', background: paymentMethod === 'upi' ? 'rgba(198,162,74,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value as 'upi' | 'card')} style={{ accentColor: 'var(--color-champagne-gold)' }} />
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
                            <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value as 'upi' | 'card')} style={{ accentColor: 'var(--color-champagne-gold)' }} />
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
                      </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-2)' }}>
                      <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '8px', color: 'var(--color-champagne-gold)', fontSize: '0.85rem', textAlign: 'center', lineHeight: '1.5' }}>
                        <strong>Note:</strong> A reservation fee of <strong>₹199</strong> is required to secure your table. This amount will be fully deducted from your final food bill. 
                        <br/>
                        <span style={{ color: 'var(--color-error)' }}>Non-refundable.</span> If you need to reschedule, please contact us directly on our support number.
                      </div>
                      <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? "Processing..." : "Pay ₹199 & Confirm Booking"}
                      </button>
                    </div>
                  </form>
                  )
                )}

                {activeModal === 'catering' && (
                  <form onSubmit={handleCateringSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'var(--space-2)', margin: 'var(--space-2) 0' }}>Contact Details</h3>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input required type="text" name="fullName" className="input-field" onChange={handleInputChange} />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Phone Number *</label>
                        <input required type="tel" name="phone" className="input-field" onChange={handleInputChange} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Email Address *</label>
                        <input required type="email" name="email" className="input-field" onChange={handleInputChange} />
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'var(--space-2)', margin: 'var(--space-2) 0' }}>Event Details</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Event Type *</label>
                        <select required name="eventType" className="input-field" onChange={handleInputChange} defaultValue="">
                          <option value="" disabled>Select Event Type</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Birthday">Birthday</option>
                          <option value="Corporate Event">Corporate Event</option>
                          <option value="Anniversary">Anniversary</option>
                          <option value="Private Party">Private Party</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Number of Guests *</label>
                        <input required type="number" name="guests" min="1" className="input-field" onChange={handleInputChange} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Event Date *</label>
                        <input required type="date" name="eventDate" className="input-field" min={new Date().toISOString().split('T')[0]} onChange={handleInputChange} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Preferred Start Time</label>
                        <input type="time" name="startTime" className="input-field" onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Venue Name *</label>
                      <input required type="text" name="venueName" className="input-field" onChange={handleInputChange} />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                      <div className="form-group" style={{ flex: 2 }}>
                        <label className="form-label">Full Venue Address *</label>
                        <input required type="text" name="venueAddress" className="input-field" onChange={handleInputChange} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">City *</label>
                        <input required type="text" name="city" className="input-field" onChange={handleInputChange} />
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'var(--space-2)', margin: 'var(--space-2) 0' }}>Catering Details</h3>
                    <div className="form-group">
                      <label className="form-label">Catering Preference / Menu Requirements</label>
                      <textarea name="cateringRequirements" className="input-field" rows={2} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dietary Requirements / Special Requests</label>
                      <textarea name="dietaryRequirements" className="input-field" rows={2} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Additional Notes</label>
                      <textarea name="notes" className="input-field" rows={2} onChange={handleInputChange}></textarea>
                    </div>

                    <div style={{ marginTop: 'var(--space-2)' }}>
                      <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Catering Request"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
