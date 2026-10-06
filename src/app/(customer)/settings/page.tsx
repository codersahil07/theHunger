export default function Settings() {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <h1 className="page-title">Settings</h1>
      
      <div className="card" style={{ padding: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
        <form className="flex flex-col gap-6" style={{ maxWidth: '500px' }}>
          <div>
            <h3>Account Preferences</h3>
            <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-4)' }}>Update your account details and preferences.</p>
            
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input type="text" className="input-field" defaultValue="John Doe" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Notifications</label>
              <select className="input-field">
                <option>All notifications</option>
                <option>Only important updates</option>
                <option>None</option>
              </select>
            </div>
            
            <button type="button" className="btn-primary" style={{ marginTop: 'var(--space-4)' }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
