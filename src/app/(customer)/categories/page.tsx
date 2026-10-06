import Link from "next/link";

export default function Categories() {
  const categories = ["Starters", "Main Course", "Biryani", "Breads", "Desserts", "Beverages"];
  
  return (
    <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <h1 className="page-title text-center">Menu Categories</h1>
      <p className="page-subtitle text-center" style={{ marginBottom: 'var(--space-8)' }}>
        Explore our wide range of premium offerings.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
        {categories.map((cat, idx) => (
          <Link href={`/menu?category=${cat}`} key={idx} className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', textDecoration: 'none' }}>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>{cat}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
