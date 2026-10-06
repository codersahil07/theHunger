export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase-server';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import Image from 'next/image';
import OrderActions from '@/components/admin/OrderActions';
import RevenueWidget from '@/components/admin/RevenueWidget';

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  portion?: string;
  subtotal?: number;
  menu_items?: { image_url?: string } | { image_url?: string }[];
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  profiles?: { email: string }[] | { email: string };
  delivery_details?: { phone: string; full_name: string; address: string; city: string; state: string; pincode: string }[];
  order_items?: OrderItem[];
}

const STATUS_STYLES: Record<string, { cls: string; icon: React.ReactNode }> = {
  pending:          { cls: "admin-badge admin-badge-pending",   icon: <Clock size={11} /> },
  preparing:        { cls: "admin-badge admin-badge-preparing", icon: <Package size={11} /> },
  out_for_delivery: { cls: "admin-badge admin-badge-delivery",  icon: <Truck size={11} /> },
  delivered:        { cls: "admin-badge admin-badge-delivered", icon: <CheckCircle size={11} /> },
  cancelled:        { cls: "admin-badge admin-badge-cancelled", icon: <XCircle size={11} /> },
};

function getStatus(status: string) {
  return STATUS_STYLES[status?.toLowerCase()] ?? { cls: "admin-badge admin-badge-user", icon: null };
}

export default async function AdminOrders() {
  const supabase = await createClient();

  // Fetch all orders for revenue calculation
  const { data: allOrders } = await supabase
    .from('orders')
    .select('total_amount, created_at, status');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let revToday = 0;
  let revWeek = 0;
  let revMonth = 0;
  let revYear = 0;

  if (allOrders) {
    allOrders.forEach(o => {
      if (o.status === 'cancelled' || o.status === 'pending') return; // only count confirmed/delivering/delivered
      
      const d = new Date(o.created_at);
      const amt = o.total_amount || 0;
      
      if (d >= today) revToday += amt;
      if (d >= startOfWeek) revWeek += amt;
      if (d >= startOfMonth) revMonth += amt;
      if (d >= startOfYear) revYear += amt;
    });
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id, status, total_amount, created_at,
      profiles ( email ),
      delivery_details ( full_name, phone, address, city, state, pincode ),
      order_items ( id, item_name, quantity, portion, subtotal, menu_items(image_url) )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="admin-header-row">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <ShoppingBag size={20} style={{ color: "#60a5fa" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-cream)", fontFamily: "var(--font-display)", marginBottom: 0 }}>
              Orders
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.15rem" }}>
              Recent customer orders
            </p>
          </div>
        </div>
        <div className="admin-badge admin-badge-user" style={{ fontSize: "0.78rem", padding: "4px 12px" }}>
          {orders?.length ?? 0} orders
        </div>
      </div>

      {/* Revenue Stats */}
      <RevenueWidget stats={{ today: revToday, week: revWeek, month: revMonth, year: revYear }} />

      {error ? (
        <div className="admin-error">Failed to load orders: {error.message}</div>
      ) : !orders || orders.length === 0 ? (
        <div className="admin-empty">No orders found yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((order: Order) => {
            const { cls, icon } = getStatus(order.status);
            const email = Array.isArray(order.profiles) ? order.profiles[0]?.email : order.profiles?.email;
            const delivery = order.delivery_details?.[0];
            return (
              <div key={order.id} className="admin-card">
                {/* Card Header */}
                <div className="admin-card-header">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(175,162,148,0.5)", fontWeight: 600 }}>Order</span>
                      <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-cream)", fontFamily: "var(--font-display)" }}>
                        #{order.id.split('-')[0].toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                      {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <OrderActions orderId={order.id} currentStatus={order.status} />
                    <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-champagne-gold)" }}>
                      ₹{order.total_amount}
                    </span>
                  </div>
                </div>

                <div className="admin-card-body">
                  {/* Customer + Address */}
                  <div className="admin-info-grid">
                    <div className="admin-info-block">
                      <div className="admin-info-label">Customer</div>
                      <div className="admin-info-value">{email || 'Guest'}</div>
                      {delivery?.phone && <div className="admin-info-sub">{delivery.phone}</div>}
                    </div>
                    <div className="admin-info-block">
                      <div className="admin-info-label">Delivery Address</div>
                      {delivery ? (
                        <>
                          <div className="admin-info-value">{delivery.full_name}</div>
                          <div className="admin-info-sub">
                            {delivery.address}, {delivery.city}, {delivery.state} {delivery.pincode}
                          </div>
                        </>
                      ) : (
                        <div className="admin-info-sub" style={{ fontStyle: "italic" }}>No address provided</div>
                      )}
                    </div>
                  </div>

                  <hr className="admin-divider" />

                  {/* Order Items */}
                  <div>
                    <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(175,162,148,0.5)", fontWeight: 700, marginBottom: "0.75rem" }}>
                      Items
                    </div>
                    {order.order_items?.map((item: OrderItem) => {
                      const imgUrl = Array.isArray(item.menu_items) ? item.menu_items[0]?.image_url : item.menu_items?.image_url;
                      return (
                        <div key={item.id} className="admin-order-item-row">
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "#1A1310", border: "1px solid rgba(198,162,74,0.15)", flexShrink: 0 }}>
                              {imgUrl ? (
                                <Image src={imgUrl} alt={item.item_name} width={40} height={40} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                              ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)" }}>N/A</div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--color-cream)", fontSize: "0.9rem" }}>
                                {item.quantity}× {item.item_name}
                              </div>
                              {item.portion && (
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Portion: {item.portion}</div>
                              )}
                            </div>
                          </div>
                          <span style={{ fontWeight: 600, color: "var(--color-antique-gold)", fontSize: "0.9rem" }}>
                            ₹{item.subtotal}
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
  );
}
