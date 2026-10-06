"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

export default function AdminMenu() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDiet, setFilterDiet] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    half_price: "",
    full_price: "",
    category_id: "",
    diet: "veg",
    is_available: true,
    display_order: 0,
    image_url: ""
  });

  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [supabase] = useState(() => createClient());

  const fetchData = async () => {
    setLoading(true);
    const { data: catData } = await supabase.from("menu_categories").select("id, name").order("display_order");
    if (catData) {
      setCategories(catData);
      const cmap: Record<string, string> = {};
      catData.forEach((c) => (cmap[c.name] = c.id));
      setCategoryMap(cmap);
      if (catData.length > 0) {
        setFormData((f) => ({ ...f, category_id: catData[0].id }));
      }
    }
    const { data: menuData } = await supabase
      .from("menu_items")
      .select("id, name, description, category_id, diet, price, half_price, full_price, image_url, is_available, display_order, menu_categories(name)")
      .order("display_order");
    if (menuData) setItems(menuData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price?.toString() || "",
      half_price: item.half_price?.toString() || "",
      full_price: item.full_price?.toString() || "",
      category_id: item.category_id,
      diet: item.diet,
      is_available: item.is_available,
      display_order: item.display_order,
      image_url: item.image_url || ""
    });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    const minOrder = items.length > 0 ? Math.min(...items.map(i => i.display_order)) : 0;
    setFormData({
      name: "",
      description: "",
      price: "",
      half_price: "",
      full_price: "",
      category_id: categories.length > 0 ? categories[0].id : "",
      diet: "veg",
      is_available: true,
      display_order: minOrder - 1,
      image_url: ""
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `menu-items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      if (data) {
        setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again or use a URL.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const isMainCourse = Object.keys(categoryMap).find((key) => categoryMap[key] === formData.category_id) === "Main Course";
    const payload = {
      name: formData.name,
      description: formData.description,
      category_id: formData.category_id,
      diet: formData.diet,
      is_available: formData.is_available,
      display_order: parseInt(formData.display_order.toString()),
      image_url: formData.image_url,
      price: isMainCourse ? 0 : parseFloat(formData.price || "0"),
      half_price: isMainCourse ? parseFloat(formData.half_price || "0") : null,
      full_price: isMainCourse ? parseFloat(formData.full_price || "0") : null,
    };
    if (editingItem) {
      const { error, data } = await supabase.from("menu_items").update(payload).eq("id", editingItem.id).select("id, name, description, category_id, diet, price, half_price, full_price, image_url, is_available, display_order, menu_categories(name)").single();
      if (error) alert("Error saving item: " + error.message);
      else if (data) setItems(items.map((item) => (item.id === editingItem.id ? data : item)).sort((a, b) => a.display_order - b.display_order));
    } else {
      const { error, data } = await supabase.from("menu_items").insert(payload).select("id, name, description, category_id, diet, price, half_price, full_price, image_url, is_available, display_order, menu_categories(name)").single();
      if (error) alert("Error creating item: " + error.message);
      else if (data) setItems([data, ...items].sort((a, b) => a.display_order - b.display_order));
    }
    setIsSubmitting(false);
    setShowModal(false);
  };

  const confirmDelete = (item: any) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete || isSubmitting) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("menu_items").delete().eq("id", itemToDelete.id);
    if (!error) setItems(items.filter((item) => item.id !== itemToDelete.id));
    setIsSubmitting(false);
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    setItems(items.map((item) => (item.id === id ? { ...item, is_available: !current } : item)));
    const { error } = await supabase.from("menu_items").update({ is_available: !current }).eq("id", id);
    if (error) setItems(items.map((item) => (item.id === id ? { ...item, is_available: current } : item)));
  };

  if (loading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
        <Loader2 style={{ width: 40, height: 40, color: "var(--color-antique-gold)", animation: "spin 1s linear infinite" }} />
      </div>
    );

  // Filter and Search items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || item.category_id === filterCategory;
    const matchesDiet = filterDiet === "all" || item.diet === filterDiet;
    return matchesSearch && matchesCategory && matchesDiet;
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const catName = item.menu_categories?.name || "Uncategorized";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        {/* Page Header */}
      <div className="admin-header-row">
        <div>
          <h1 className="text-primary font-display" style={{ fontSize: "2rem", fontWeight: 700 }}>Menu Management</h1>
          <p className="text-secondary" style={{ marginTop: "var(--space-1)", fontSize: "0.95rem" }}>
            Manage offerings, pricing, and availability.
          </p>
        </div>
        <button className="btn-primary" onClick={handleNew} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Plus size={18} />
          <span>New Item</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        background: "rgba(18, 13, 10, 0.4)",
        padding: "1rem",
        borderRadius: "12px",
        border: "1px solid rgba(198,162,74,0.1)",
        alignItems: "center"
      }}>
        <input 
          type="text" 
          placeholder="Search items..." 
          className="input-field" 
          style={{ flex: "1 1 200px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="input-field" 
          style={{ width: "auto", flex: "0 1 auto" }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select 
          className="input-field" 
          style={{ width: "auto", flex: "0 1 auto" }}
          value={filterDiet}
          onChange={(e) => setFilterDiet(e.target.value)}
        >
          <option value="all">All Diet (Veg/Non-Veg)</option>
          <option value="veg">Vegetarian</option>
          <option value="non-veg">Non-Vegetarian</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-list" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(198,162,74,0.2)", background: "rgba(0,0,0,0.4)" }}>
              {["Item", "Diet", "Price", "Status", "Actions"].map((h, i) => (
                <th key={h} style={{ padding: "var(--space-4)", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-antique-gold)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i >= 3 ? "center" : "left" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-text-secondary)" }}>
                  No menu items found. Click &quot;New Item&quot; to create one.
                </td>
              </tr>
            ) : (
              Object.keys(groupedItems).map((categoryName) => (
                <React.Fragment key={categoryName}>
                  {/* Category Header Row */}
                  <tr>
                    <td colSpan={5} style={{ padding: "0.85rem 1rem", background: "rgba(198,162,74,0.08)", color: "var(--color-champagne-gold)", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.05em", borderBottom: "1px solid rgba(198,162,74,0.2)" }}>
                      {categoryName}
                    </td>
                  </tr>
                  
                  {groupedItems[categoryName].map((item: any, index: number) => (
                    <tr
                      key={item.id}
                  style={{
                    borderBottom: "1px solid rgba(198,162,74,0.08)",
                    background: index % 2 === 0 ? "rgba(0,0,0,0.15)" : "transparent",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = index % 2 === 0 ? "rgba(0,0,0,0.15)" : "transparent")}
                >
                  {/* Item */}
                  <td style={{ padding: "var(--space-4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                      {/* Thumbnail — strictly 48×48, no fill overflow */}
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          minWidth: 48,
                          minHeight: 48,
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "1px solid rgba(198,162,74,0.3)",
                          background: "#1A1310",
                          position: "relative",
                          flexShrink: 0,
                        }}
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            width={48}
                            height={48}
                            referrerPolicy="no-referrer"
                            style={{ objectFit: "contain", width: "100%", height: "100%", borderRadius: "8px" }}
                          />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "rgba(255,255,255,0.3)" }}>
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--color-cream)", fontSize: "1rem" }}>{item.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                          {item.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category Removed */}

                  {/* Diet */}
                  <td style={{ padding: "var(--space-4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <span style={{
                        display: "inline-block", width: 10, height: 10, borderRadius: "50%",
                        background: item.diet === "veg" ? "#16a34a" : "#dc2626",
                        border: `2px solid ${item.diet === "veg" ? "#16a34a" : "#dc2626"}`,
                        flexShrink: 0
                      }} />
                      <span style={{ fontSize: "0.85rem", color: "var(--color-text-primary)", textTransform: "capitalize" }}>{item.diet}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td style={{ padding: "var(--space-4)", color: "var(--color-antique-gold)", fontWeight: 600 }}>
                    {item.menu_categories?.name === "Main Course" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "0.85rem" }}>
                        <span>Half: ₹{item.half_price}</span>
                        <span>Full: ₹{item.full_price}</span>
                      </div>
                    ) : (
                      <span>₹{item.price}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "var(--space-4)", textAlign: "center" }}>
                    <button
                      onClick={() => toggleAvailability(item.id, item.is_available)}
                      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}
                      title="Toggle availability"
                    >
                      {item.is_available ? (
                        <CheckCircle size={20} style={{ color: "#22c55e" }} />
                      ) : (
                        <XCircle size={20} style={{ color: "#6b7280" }} />
                      )}
                      <span style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {item.is_available ? "Available" : "Sold Out"}
                      </span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "var(--space-4)", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-2)" }}>
                      <button
                        onClick={() => handleEdit(item)}
                        className="admin-icon-btn"
                        title="Edit"
                        style={{ padding: 8 }}
                      >
                        <Edit2 size={17} />
                      </button>
                      <button
                        onClick={() => confirmDelete(item)}
                        className="admin-icon-btn danger"
                        title="Delete"
                        style={{ padding: 8 }}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2 className="text-primary font-display" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                {editingItem ? "Edit Menu Item" : "New Menu Item"}
              </h2>
              <button onClick={() => !isSubmitting && setShowModal(false)} style={{ color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer" }}>
                <X size={24} />
              </button>
            </div>

            <form id="menu-form" onSubmit={handleSubmit} className="admin-modal-body">
              <div className="form-group">
                <label className="form-label" style={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--color-antique-gold)" }}>Name</label>
                <input type="text" required className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--color-antique-gold)" }}>Description</label>
                <textarea rows={3} className="input-field" style={{ resize: "none" }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div className="form-group">
                  <label className="form-label" style={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--color-antique-gold)" }}>Category</label>
                  <select required className="input-field" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}>
                    <option value="" disabled>Select…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--color-antique-gold)" }}>Diet</label>
                  <select required className="input-field" value={formData.diet} onChange={(e) => setFormData({ ...formData, diet: e.target.value })}>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              {Object.keys(categoryMap).find((key) => categoryMap[key] === formData.category_id) === "Main Course" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--color-antique-gold)" }}>Half Price (₹)</label>
                    <input type="number" required min="0" className="input-field" value={formData.half_price} onChange={(e) => setFormData({ ...formData, half_price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--color-antique-gold)" }}>Full Price (₹)</label>
                    <input type="number" required min="0" className="input-field" value={formData.full_price} onChange={(e) => setFormData({ ...formData, full_price: e.target.value })} />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label" style={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--color-antique-gold)" }}>Price (₹)</label>
                  <input type="number" required min="0" className="input-field" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                <div className="form-group">
                  <label className="form-label" style={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--color-antique-gold)" }}>Display Order</label>
                  <input type="number" min="0" className="input-field" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", cursor: "pointer", paddingBottom: "var(--space-3)" }}>
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: "var(--color-antique-gold)" }}
                    />
                    <span className="text-primary" style={{ fontSize: "0.9rem" }}>Available</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.08em", color: "var(--color-antique-gold)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Image URL OR Upload</span>
                  {uploadingImage && <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />}
                </label>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <input type="url" className="input-field" style={{ flex: 1 }} value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://…" />
                  <label className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: "0 1rem", borderRadius: "10px", border: "1px solid rgba(198,162,74,0.3)" }}>
                    <ImageIcon size={18} />
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
                {formData.image_url && (
                  <div style={{ marginTop: "var(--space-2)", padding: "4px", background: "rgba(0,0,0,0.2)", borderRadius: "10px", display: "inline-block", border: "1px solid rgba(198,162,74,0.2)" }}>
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      referrerPolicy="no-referrer"
                      style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "6px", display: "block" }} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>';
                      }}
                    />
                  </div>
                )}
              </div>
            </form>

            <div className="admin-modal-footer">
              <button type="button" className="admin-modal-btn-cancel" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" form="menu-form" className="admin-modal-btn-submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : editingItem ? "Save Changes" : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 440 }}>
            <div className="admin-modal-header">
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-error)" }}>Delete Item?</h2>
              <button onClick={() => !isSubmitting && setShowDeleteModal(false)} style={{ color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer" }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: "var(--space-6)" }}>
              <p style={{ color: "var(--color-text-primary)" }}>
                Delete <strong>{itemToDelete?.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-modal-btn-cancel" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>
                Cancel
              </button>
              <button className="admin-modal-btn-danger" onClick={handleDelete} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
