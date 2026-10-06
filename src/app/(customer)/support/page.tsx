export default function Support() {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <h1 className="page-title text-center">Help & Support</h1>
      <p className="page-subtitle text-center" style={{ marginBottom: 'var(--space-8)' }}>
        Find answers or get in touch with our support team.
      </p>
      
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-8)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ marginBottom: 'var(--space-2)' }}>Do you offer vegan options?</h4>
            <p className="text-secondary text-sm">Yes, we have a dedicated section for vegan and vegetarian delicacies.</p>
          </div>
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ marginBottom: 'var(--space-2)' }}>How does the delivery process work?</h4>
            <p className="text-secondary text-sm">Simply select your items from the menu, fill in the delivery form at checkout, and our premium delivery partners will handle the rest.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
