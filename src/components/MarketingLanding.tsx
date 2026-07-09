import React, { useState } from 'react';
import { 
  Building2, 
  Map, 
  FileText, 
  AlertTriangle, 
  Layers, 
  Play, 
  Send, 
  Users, 
  CheckCircle2,
  Lock,
  Loader2
} from 'lucide-react';
import { supabase, hasRealSupabase } from '../supabaseClient';

interface MarketingLandingProps {
  onLoginDemo: (demoProfile: any) => void;
  onEnterApp: () => void;
  addNotification: (msg: string) => void;
}

export const MarketingLanding: React.FC<MarketingLandingProps> = ({
  onLoginDemo,
  onEnterApp,
  addNotification
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const [demoLoading, setDemoLoading] = useState(false);
  
  // Request Demo Form States
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [notes, setNotes] = useState('');

  // Staff Login Form States
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (error) {
        addNotification(`Auth Error: ${error.message}`);
        // Check if user is logging in with global admin email and keys are dummy
        if (!hasRealSupabase && loginEmail === 'global_admin@munevo.gov') {
          addNotification('Local Dev Sync: Real credentials registry match simulated bypass.');
          // Simulate Global Admin bypass locally for ease of client onboarding wizard tests
          const res = await fetch(`${API_URL}/api/profiles/me`, {
            headers: {
              'x-user-email': loginEmail
            }
          });
          if (res.ok) {
            const profile = await res.json();
            onLoginDemo(profile);
            setShowLoginForm(false);
          }
        }
      } else if (data.user) {
        addNotification('Authentication Successful. Resolving registry record...');
        const res = await fetch(`${API_URL}/api/profiles/me`, {
          headers: {
            'x-user-id': data.user.id,
            'x-user-email': data.user.email || ''
          }
        });
        if (res.ok) {
          const profile = await res.json();
          onLoginDemo(profile);
          setShowLoginForm(false);
        } else {
          addNotification('Database Registry Loss: Profile record not configured.');
        }
      }
    } catch (err: any) {
      console.error(err);
      addNotification(`API Error: ${err.message || 'Failed connecting to database registry auth.'}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLaunchSandbox = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/demo/spinup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        addNotification(`Demo Provisioner: Created sandbox "${data.organization.name}" successfully!`);
        // Log in prospect instantly
        onLoginDemo(data.profile);
      } else {
        addNotification('Error provisioning sandbox. Please verify server connectivity.');
      }
    } catch (err) {
      console.error(err);
      addNotification('API connection error launching sandbox.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification(`Thank you ${name}! A GovOS specialist will contact the ${municipality} team soon.`);
    setName('');
    setEmail('');
    setMunicipality('');
    setNotes('');
    setShowRequestForm(false);
  };

  return (
    <div style={{ background: '#08080c', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Navigation Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 style={{ color: 'var(--primary-color)' }} size={28} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
              MUNEVO <span style={{ color: 'var(--primary-color)', fontSize: '0.65rem', verticalAlign: 'super', fontWeight: 600 }}>GovOS</span>
            </h1>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Unified Cloud Platform</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            onClick={() => setShowLoginForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}
          >
            <Lock size={14} />
            <span>Staff Portal Login</span>
          </button>
          <button 
            onClick={() => setShowRequestForm(true)}
            style={{ background: 'var(--primary-color)', color: '#000', border: 0, borderRadius: '6px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Request a Demo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px 60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: '11px', color: 'var(--primary-color)', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '100px', padding: '6px 14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Munevo Cloud Platform v2.0
        </span>
        <h2 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, maxWidth: '850px', letterSpacing: '-0.04em', margin: 0 }}>
          The Single Cloud Operating System for <span className="brand-gradient-text">Modern Municipalities</span>
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '650px', lineHeight: 1.5, margin: 0 }}>
          Replace fragmented legacy software silos with one unified tenant, one shared database, and intelligent spatial workflows.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <button 
            onClick={handleLaunchSandbox}
            disabled={demoLoading}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'linear-gradient(135deg, var(--primary-color), #2563eb)', 
              color: '#fff', 
              border: 0, 
              borderRadius: '8px', 
              padding: '12px 28px', 
              fontSize: '0.95rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
              transition: 'transform 0.2s'
            }}
          >
            {demoLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}
            {demoLoading ? 'Deploying Demo Sandbox...' : 'Launch Demo Sandbox'}
          </button>
          <button 
            onClick={() => setShowRequestForm(true)}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 24px', fontSize: '0.95rem', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
          >
            Request Custom Setup
          </button>
        </div>

        {/* Hero Interactive App Screenshot */}
        <div style={{ marginTop: '50px', width: '100%', position: 'relative', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
          <img 
            src="/munevo_hero.jpg" 
            alt="Munevo Dashboard UI Mockup" 
            style={{ width: '100%', display: 'block', maxHeight: '580px', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #08080c 5%, transparent 40%)' }}></div>
        </div>
      </section>

      {/* Modules Matrix Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px 100px 40px' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px', letterSpacing: '-0.02em' }}>
          Explore the Integrated Product Modules
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
              <Layers size={20} />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>311 & Universal Tracker</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Centralized intake panel featuring intelligent auto-routing based on natural language ticket classification. Track SLA timers in real time.
            </p>
          </div>

          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-text)' }}>
              <FileText size={20} />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Permits & Licensing</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Configure progressive plan review, step-by-step contractor document sign-off checks, and electronic zoning fee validation rules.
            </p>
          </div>

          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-text)' }}>
              <AlertTriangle size={20} />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Code Enforcement</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Dispatch structural inspections, safety checklists, and register field citations directly via the mobile-optimized interface.
            </p>
          </div>

          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Map size={20} />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>GIS Intelligence Map</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Fully interactive Leaflet GIS overlay displaying permit pins, properties, and emergency tracker cases dynamically by classification.
            </p>
          </div>

          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
              <Users size={20} />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Resident & Business Portals</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enable citizens to verify properties, file 311 walk-in tickets, book council appointments, and search public records dynamically.
            </p>
          </div>

          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Modular Admin Console</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Deploy organizations instantly, choose reusable municipal custom roles, and select exactly which features to enable per client.
            </p>
          </div>

        </div>
      </section>

      {/* Request a Demo Modal Overlay */}
      {showRequestForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <form 
            onSubmit={handleDemoSubmit} 
            style={{ background: '#11131c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Request a Custom Demo</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tell us about your municipality's current digital objectives.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Municipality / Agency Name</label>
              <input 
                type="text" 
                className="ai-input" 
                style={{ width: '100%' }}
                value={municipality} 
                onChange={e => setMunicipality(e.target.value)} 
                placeholder="e.g. Town of Newark" 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Contact Name</label>
              <input 
                type="text" 
                className="ai-input" 
                style={{ width: '100%' }}
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Mayor Marcus Miller" 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Work Email Address</label>
              <input 
                type="email" 
                className="ai-input" 
                style={{ width: '100%' }}
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="e.g. miller@newark.gov" 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Objective or Custom Requirements</label>
              <textarea 
                className="ai-input" 
                style={{ width: '100%', minHeight: '80px' }}
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="e.g. We want to deploy permits workflows but bypass code citations..." 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setShowRequestForm(false)} 
                style={{ flex: 1, height: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ flex: 2, height: '40px', background: 'var(--primary-color)', border: 0, color: '#000', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Send size={14} />
                <span>Submit Query</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Login Modal Overlay */}
      {showLoginForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <form 
            onSubmit={handleStaffLogin} 
            style={{ background: '#11131c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} style={{ color: 'var(--primary-color)' }} />
                <span>Staff Portal Access</span>
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sign in using your government credentials.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Work Email Address</label>
              <input 
                type="email" 
                className="ai-input" 
                style={{ width: '100%' }}
                value={loginEmail} 
                onChange={e => setLoginEmail(e.target.value)} 
                placeholder="e.g. admin@munevo.gov" 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Secure Password</label>
              <input 
                type="password" 
                className="ai-input" 
                style={{ width: '100%' }}
                value={loginPassword} 
                onChange={e => setLoginPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => {
                  setShowLoginForm(false);
                  setLoginEmail('');
                  setLoginPassword('');
                }} 
                style={{ flex: 1, height: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={authLoading}
                style={{ flex: 2, height: '40px', background: 'linear-gradient(135deg, var(--primary-color), #2563eb)', border: 0, color: '#fff', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                {authLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{authLoading ? 'Verifying...' : 'Sign In'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
