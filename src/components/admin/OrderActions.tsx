"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Check, Clock, Package, Truck, XCircle, MoreVertical } from "lucide-react";

export default function OrderActions({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus || 'pending');
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupabase(createClient());
  }, []);

  const handleUpdate = async (newStatus: string) => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (!error) {
      setStatus(newStatus);
    }
    setLoading(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (status === 'confirmed') {
      timer = setTimeout(() => handleUpdate('preparing'), 5000);
    } else if (status === 'preparing') {
      timer = setTimeout(() => handleUpdate('out_for_delivery'), 5000);
    } else if (status === 'out_for_delivery') {
      timer = setTimeout(() => handleUpdate('delivered'), 5000);
    }

    return () => clearTimeout(timer);
  }, [status]);

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'confirmed', label: 'Confirm Order', icon: Check },
    { value: 'preparing', label: 'Preparing', icon: Package },
    { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { value: 'delivered', label: 'Delivered', icon: Check },
    { value: 'cancelled', label: 'Cancel', icon: XCircle }
  ];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <select 
        value={status}
        onChange={(e) => handleUpdate(e.target.value)}
        disabled={loading}
        style={{
          appearance: "none",
          background: "rgba(198,162,74,0.1)",
          border: "1px solid rgba(198,162,74,0.3)",
          color: "var(--color-champagne-gold)",
          padding: "0.3rem 2rem 0.3rem 0.75rem",
          borderRadius: "8px",
          fontSize: "0.75rem",
          fontWeight: 600,
          cursor: "pointer",
          outline: "none"
        }}
      >
        {statusOptions.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: "#120D0A", color: "#F2E8D5" }}>
            {opt.label}
          </option>
        ))}
      </select>
      <div style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <MoreVertical size={12} color="var(--color-champagne-gold)" />
      </div>
    </div>
  );
}
