export default function Contact() {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <h1 className="page-title text-center">Contact Us</h1>
      <p className="page-subtitle text-center" style={{ marginBottom: 'var(--space-8)' }}>
        We would love to hear from you. Reach out for reservations, catering, or general inquiries.
      </p>
      
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-8)' }}>
        <form className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="input-field" placeholder="Your Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="input-field" placeholder="Your Email" />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="input-field" rows={5} placeholder="How can we help you?"></textarea>
          </div>
          <button type="button" className="btn-primary" style={{ marginTop: 'var(--space-4)' }}>Send Message</button>
        </form>
      </div>
    </div>
  );
}
