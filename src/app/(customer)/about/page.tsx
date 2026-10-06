export default function About() {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <h1 className="page-title text-center">About Our Heritage</h1>
      <p className="page-subtitle text-center" style={{ marginBottom: 'var(--space-8)' }}>
        Discover the legacy of our culinary passion and dedication to authentic flavors.
      </p>
      <div className="card" style={{ padding: 'var(--space-8)' }}>
        <p className="text-secondary" style={{ marginBottom: 'var(--space-4)', fontSize: '1.6rem', fontFamily: 'var(--font-caveat)' }}>
          Welcome to an ultra-premium dining experience. Our restaurant was founded on the belief that fine dining is an art form. We blend modern culinary techniques with traditional, rich Indian flavors to create unforgettable meals.
        </p>
        <p className="text-secondary" style={{ fontSize: '1.6rem', marginBottom: 'var(--space-8)', fontFamily: 'var(--font-caveat)' }}>
          Our chefs source only the finest ingredients, ensuring each dish represents the pinnacle of taste and quality. Whether you're here for a quick bite or a grand celebration, our commitment remains the same: excellence in every bite.
        </p>

        <div style={{ marginTop: 'var(--space-8)', borderTop: 'var(--border-subtle)', paddingTop: 'var(--space-6)' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>Franchise Opportunities</h2>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
            Interested in bringing The Hunger to your city? We are always looking for passionate partners to expand our luxury dining experience globally.
          </p>
          <button className="btn-primary">Apply for Franchise</button>
        </div>
      </div>
    </div>
  );
}
