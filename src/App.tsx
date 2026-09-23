import { useState } from 'react';
import { Button, Dialog, TextField } from './design-system';

type Page = 'people' | 'policies' | 'components';

const people = [
  { initials: 'MC', name: 'Maya Chen', email: 'maya@northstar.example', role: 'Admin', status: 'Active' },
  { initials: 'JR', name: 'Jordan Reyes', email: 'jordan@northstar.example', role: 'Member', status: 'Active' },
  { initials: 'AP', name: 'Avery Patel', email: 'avery@northstar.example', role: 'Member', status: 'Invited' },
];

function App() {
  const [page, setPage] = useState<Page>('people');
  const [dialog, setDialog] = useState<'add' | 'archive' | null>(null);
  const [memberTab, setMemberTab] = useState<'all' | 'invited'>('all');
  const [archived, setArchived] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const visiblePeople = people.filter((person) => memberTab === 'all' || person.status === 'Invited');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">C</span><span>Comp</span></div>
        <nav aria-label="Main navigation">
          <button className={page === 'people' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('people')}>People</button>
          <button className={page === 'policies' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('policies')}>Policies</button>
          <button className={page === 'components' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('components')}>Components</button>
        </nav>
        <div className="sidebar-footer"><span className="avatar avatar--small">MC</span><span>Northstar Labs</span></div>
      </aside>

      <main className="main">
        <header className="topbar"><span>Workspace</span><span className="topbar-user">Maya Chen <span className="avatar avatar--small">MC</span></span></header>
        <div className="page-content">
          {page === 'people' && <>
            <div className="page-heading"><div><h1>People</h1><p>Manage your team and invitations.</p></div><Button variant="primary" onClick={() => setDialog('add')}>Add user</Button></div>
            <div className="tabs" role="tablist" aria-label="People list">
              <button role="tab" aria-selected={memberTab === 'all'} onClick={() => setMemberTab('all')}>All people</button>
              <button role="tab" aria-selected={memberTab === 'invited'} onClick={() => setMemberTab('invited')}>Invited</button>
            </div>
            <div className="table-card">
              <div className="table-head"><span>Person</span><span>Role</span><span>Status</span></div>
              {visiblePeople.map((person) => <div className="table-row" key={person.email}>
                <div className="person-cell"><span className="avatar">{person.initials}</span><span><strong>{person.name}</strong><small>{person.email}</small></span></div>
                <span>{person.role}</span><span className={person.status === 'Active' ? 'pill pill--active' : 'pill'}>{person.status}</span>
              </div>)}
            </div>
          </>}

          {page === 'policies' && <>
            <div className="page-heading"><div><h1>Policies</h1><p>Review and manage your company policies.</p></div><Button variant="primary">Create policy</Button></div>
            <div className="policy-card">
              <div className="policy-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5" /></svg></div>
              <div className="policy-details"><h2>Access policy</h2><p>How employees get and keep access to company systems.</p><span className="policy-meta">Updated September 18, 2026</span></div>
              {archived ? <span className="pill">Archived</span> : <Button onClick={() => setDialog('archive')}>Archive</Button>}
            </div>
            <div className="policy-card">
              <div className="policy-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5" /></svg></div>
              <div className="policy-details"><h2>Device policy</h2><p>Requirements for laptops and mobile devices.</p><span className="policy-meta">Updated September 12, 2026</span></div>
              <span className="pill pill--active">Published</span>
            </div>
          </>}

          {page === 'components' && <>
            <div className="page-heading"><div><h1>Components</h1><p>The controls used across this demo.</p></div></div>
            <section className="component-card"><h2>Buttons</h2><p>Use the red action for a destructive step.</p><div className="component-row"><Button variant="primary">Primary</Button><Button>Secondary</Button><Button variant="danger">Delete</Button></div></section>
            <section className="component-card"><h2>Fields</h2><div className="component-field"><TextField id="example-email" label="Email" type="email" placeholder="name@company.com" /></div></section>
          </>}
        </div>
      </main>

      {dialog === 'add' && <Dialog title="Add user" description="Invite someone to your workspace." onClose={() => setDialog(null)}>
        <form onSubmit={(event) => { event.preventDefault(); setInviteMessage(`Invitation ready for ${email}`); setDialog(null); }}>
          <div className="dialog-body"><TextField id="invite-email" label="Email address" type="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className="dialog-actions"><Button type="button" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit" variant="primary">Send invite</Button></div>
        </form>
      </Dialog>}

      {dialog === 'archive' && <Dialog title="Archive access policy" description="This removes it from active policies. You can restore it later." onClose={() => setDialog(null)}>
        <div className="dialog-actions"><Button onClick={() => setDialog(null)}>Keep policy</Button><Button data-testid="archive-confirm" variant="danger" onClick={() => { setArchived(true); setDialog(null); }}>Archive policy</Button></div>
      </Dialog>}
      {inviteMessage && <div className="toast" role="status">{inviteMessage}</div>}
    </div>
  );
}

export default App;
