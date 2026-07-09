import React, { useState, useEffect } from 'react';
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
  Loader2,
  HelpCircle,
  Database,
  ArrowRight,
  Sparkles
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
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'modules'>('home');
  const [activeModuleDetail, setActiveModuleDetail] = useState<string>('311');

  // Bootstrap setup checks
  const [hasGlobalAdmin, setHasGlobalAdmin] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/bootstrap-status`)
      .then(res => res.json())
      .then(data => {
        setHasGlobalAdmin(data.hasGlobalAdmin);
      })
      .catch(err => console.error('Failed to resolve bootstrap status:', err));
  }, [API_URL]);

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
          const res = await fetch(`${API_URL}/api/profiles/me`, {
            headers: { 'x-user-email': loginEmail }
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

  const handleBootstrapAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      addNotification('Registering Global Admin user in Supabase Auth...');
      const { data, error } = await supabase.auth.signUp({
        email: loginEmail,
        password: loginPassword
      });

      if (error) {
        addNotification(`Supabase Register Error: ${error.message}`);
        // Handle local simulated dev fallback if Supabase url is dummy/missing
        if (!hasRealSupabase && loginEmail === 'global_admin@munevo.gov') {
          addNotification('Bypassing remote auth; creating database registry locally...');
          const res = await fetch(`${API_URL}/api/auth/bootstrap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'simulated-user-global_admin', email: loginEmail })
          });
          if (res.ok) {
            const profile = await res.json();
            addNotification('Local Bootstrap complete!');
            onLoginDemo(profile);
            setShowLoginForm(false);
            setHasGlobalAdmin(true);
          }
        }
      } else if (data.user) {
        addNotification('User registered in Auth. Creating Global Admin profile in registry...');
        const res = await fetch(`${API_URL}/api/auth/bootstrap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email: loginEmail
          })
        });

        if (res.ok) {
          const profile = await res.json();
          addNotification('Bootstrap Complete! Logged in as Global Administrator.');
          onLoginDemo(profile);
          setShowLoginForm(false);
          setHasGlobalAdmin(true);
        } else {
          const errData = await res.json();
          addNotification(`Bootstrap Error: ${errData.error || 'Failed to provision admin profile.'}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      addNotification(`Connection Error: ${err.message || 'Failed to submit bootstrap query.'}`);
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

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/demo/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, municipality, notes })
      });
      if (res.ok) {
        addNotification(`Thank you ${name}! A GovOS specialist will contact the ${municipality} team soon.`);
        setName('');
        setEmail('');
        setMunicipality('');
        setNotes('');
        setShowRequestForm(false);
      } else {
        const errData = await res.json();
        addNotification(`Submit Error: ${errData.error || 'Failed submitting contact details.'}`);
      }
    } catch (err: any) {
      console.error(err);
      addNotification('API connection error submitting demo request.');
    }
  };

  return (
    <div style={{ background: '#08080c', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Bootstrap Setup Alert Banner */}
      {!hasGlobalAdmin && (
        <div 
          onClick={() => setShowLoginForm(true)}
          style={{ 
            background: 'linear-gradient(135deg, #d97706, #b45309)', 
            color: '#fff', 
            textAlign: 'center', 
            padding: '10px 20px', 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            cursor: 'pointer',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <Sparkles size={16} />
          <span>FIRST-RUN SETUP: No Global Administrator account exists. Click here to initialize your root credentials.</span>
        </div>
      )}

      {/* Navigation Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,12,0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <Building2 style={{ color: 'var(--primary-color)' }} size={28} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
              MUNEVO <span style={{ color: 'var(--primary-color)', fontSize: '0.65rem', verticalAlign: 'super', fontWeight: 600 }}>GovOS</span>
            </h1>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Unified Cloud Platform</span>
          </div>
        </div>

        {/* Tab Page Toggles */}
        <nav style={{ display: 'flex', gap: '30px' }}>
          <button 
            onClick={() => setActiveTab('home')}
            style={{ background: 'transparent', border: 0, color: activeTab === 'home' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('modules')}
            style={{ background: 'transparent', border: 0, color: activeTab === 'modules' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Product Modules
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => setShowLoginForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
          >
            <Lock size={14} style={{ color: 'var(--primary-color)' }} />
            <span>Staff Portal Login</span>
          </button>
          <button 
            onClick={() => setShowRequestForm(true)}
            style={{ background: 'var(--primary-color)', color: '#000', border: 0, borderRadius: '6px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Request a Demo
          </button>
        </div>
      </header>

      {activeTab === 'home' ? (
        <>
          {/* Hero Section */}
          <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px 60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <span style={{ fontSize: '11px', color: 'var(--primary-color)', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '100px', padding: '6px 14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Multi-Tenant Municipal ERP Suite
            </span>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, maxWidth: '850px', letterSpacing: '-0.04em', margin: 0 }}>
              The Unified Operating System for <span className="brand-gradient-text">Modern Municipalities</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '650px', lineHeight: 1.5, margin: 0 }}>
              Replace fragmented legacy silos with one single shared relational model. Seamless permit routing, real-time spatial GIS analysis, and field-ready workflows.
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
                {demoLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                {demoLoading ? 'Deploying Sandbox...' : 'Launch Demo Sandbox'}
              </button>
              <button 
                onClick={() => setShowRequestForm(true)}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 24px', fontSize: '0.95rem', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
              >
                Request Custom Setup
              </button>
            </div>

            {/* Interactive Hero Screenshot */}
            <div style={{ marginTop: '50px', width: '100%', position: 'relative', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
              <img 
                src="/munevo_hero.jpg" 
                alt="Munevo Dashboard UI Mockup" 
                style={{ width: '100%', display: 'block', maxHeight: '580px', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #08080c 5%, transparent 40%)' }} />
            </div>
          </section>

          {/* Section 2: Legacy Silos vs. GovOS Relational Paradigm */}
          <section style={{ borderTop: '1px solid rgba(255,255,255,0.03)', padding: '80px 40px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Data Normalization Paradigm</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0 0 0', letterSpacing: '-0.02em' }}>The Unified Property & Person Model</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '12px auto 0 auto', lineHeight: 1.5 }}>
                  Traditional govtech separates your billing, permits, and citizen tickets into isolated databases. Munevo links all operations to central parcel records.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                <div style={{ background: '#11131c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '28px' }}>
                  <Database style={{ color: 'var(--primary-color)', marginBottom: '16px' }} size={24} />
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 700 }}>Single Source of Truth</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    Every document, citation, permit application, or 311 request links back to a central parcel ID. Staff see a property's full compliance lifecycle instantly.
                  </p>
                </div>

                <div style={{ background: '#11131c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '28px' }}>
                  <Users style={{ color: '#10b981', marginBottom: '16px' }} size={24} />
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 700 }}>Intelligent Contractor Hub</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    Associates businesses and contractors directly with properties they are working on. Self-service claims route to permit clerks for fast verification.
                  </p>
                </div>

                <div style={{ background: '#11131c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '28px' }}>
                  <Layers style={{ color: '#f59e0b', marginBottom: '16px' }} size={24} />
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 700 }}>Dynamic Work Routing</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    Intelligent role-aware task assignment schedules code enforcement citations, structural inspections, or FOIA requests directly to the designated officer's roster.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Interactive Visual Features Preview */}
          <section style={{ borderTop: '1px solid rgba(255,255,255,0.03)', padding: '80px 40px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px' }}>
              
              {/* Row 1: GIS Map */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '50px' }}>
                <div style={{ flex: 1, minWidth: '320px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase' }}>Spatial Intelligence</span>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 12px 0' }}>Real-time Leaflet GIS Mapping</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                    Plot your city's workload instantly. Visual layers let dispatchers filter for open zoning permits, delinquent property files, and high-priority safety hazards simultaneously.
                  </p>
                  <button onClick={() => { setActiveTab('modules'); setActiveModuleDetail('gis'); }} style={{ border: 0, background: 'transparent', color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                    <span>Explore GIS Module</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
                <div style={{ flex: 1.2, minWidth: '320px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <img src="/munevo_gis_preview.jpg" alt="Munevo GIS Map View" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                </div>
              </div>

              {/* Row 2: Permits Desk */}
              <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '50px' }}>
                <div style={{ flex: 1.2, minWidth: '320px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <img src="/munevo_permit_preview.jpg" alt="Munevo Permits Queue" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: '320px' }}>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>Building Services</span>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 12px 0' }}>Workflow Permitting desk</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                    Manage construction milestones electronically. Configure progressive review steps, record structural inspections, and link contractor credentials to avoid citation risks.
                  </p>
                  <button onClick={() => { setActiveTab('modules'); setActiveModuleDetail('permits'); }} style={{ border: 0, background: 'transparent', color: '#10b981', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                    <span>Explore Permits Module</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          </section>
        </>
      ) : (
        /* PAGE B: Modules Showcase Page Catalog */
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px 100px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>GovOS Modular Capabilities</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '8px' }}>Select a product module below to preview workflows and layout screenshots.</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
            
            {/* Sidebar Tab Menu */}
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => setActiveModuleDetail('311')}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  background: activeModuleDetail === '311' ? 'rgba(59,130,246,0.08)' : 'transparent',
                  border: '1px solid ' + (activeModuleDetail === '311' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)'),
                  color: activeModuleDetail === '311' ? 'var(--primary-color)' : 'var(--text-secondary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Layers size={16} />
                <span>311 Tracker</span>
              </button>

              <button 
                onClick={() => setActiveModuleDetail('gis')}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  background: activeModuleDetail === 'gis' ? 'rgba(59,130,246,0.08)' : 'transparent',
                  border: '1px solid ' + (activeModuleDetail === 'gis' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)'),
                  color: activeModuleDetail === 'gis' ? 'var(--primary-color)' : 'var(--text-secondary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Map size={16} />
                <span>GIS Map</span>
              </button>

              <button 
                onClick={() => setActiveModuleDetail('permits')}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  background: activeModuleDetail === 'permits' ? 'rgba(59,130,246,0.08)' : 'transparent',
                  border: '1px solid ' + (activeModuleDetail === 'permits' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)'),
                  color: activeModuleDetail === 'permits' ? 'var(--primary-color)' : 'var(--text-secondary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <FileText size={16} />
                <span>Permits & Licenses</span>
              </button>

              <button 
                onClick={() => setActiveModuleDetail('staff')}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  background: activeModuleDetail === 'staff' ? 'rgba(59,130,246,0.08)' : 'transparent',
                  border: '1px solid ' + (activeModuleDetail === 'staff' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)'),
                  color: activeModuleDetail === 'staff' ? 'var(--primary-color)' : 'var(--text-secondary)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Users size={16} />
                <span>Staff Management</span>
              </button>
            </div>

            {/* Tab Detail Pane */}
            <div style={{ flex: 3, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {activeModuleDetail === '311' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src="/munevo_tracker_preview.jpg" alt="311 Tracker Dashboard" style={{ width: '100%', display: 'block' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>311 Intake & Natural Language Ticket Router</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '8px' }}>
                      Citizen service calls are parsed and routed to departments dynamically. Centralizes pothole, noise, street cleaning, or trash tickets in real-time, displaying priority flags, assigned staff owners, and SLA clock compliance meters.
                    </p>
                  </div>
                </div>
              )}

              {activeModuleDetail === 'gis' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src="/munevo_gis_preview.jpg" alt="GIS Intelligence Map" style={{ width: '100%', display: 'block' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Leaflet GIS Spatial Overlay</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '8px' }}>
                      Interactive mapping workspace detailing active construction permits, safety violations, and 311 intake hotspots. Let dispatchers query parcel data and schedule field code citations on coordinates instantly.
                    </p>
                  </div>
                </div>
              )}

              {activeModuleDetail === 'permits' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src="/munevo_permit_preview.jpg" alt="Permitting Desk" style={{ width: '100%', display: 'block' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Progressive Plan Reviews & Contractor Portal</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '8px' }}>
                      Streamline zoning applications. Enable developers to submit construction files, calculate estimated values, verify licenses, and coordinate milestones online. Automatically triggers code safety checks post-issuance.
                    </p>
                  </div>
                </div>
              )}

              {activeModuleDetail === 'staff' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', padding: '40px', background: 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
                    <Users size={64} style={{ color: 'var(--primary-color)', marginBottom: '16px', opacity: 0.8 }} />
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>Employee Directory & Roster Console</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px', margin: '8px auto 0 auto' }}>
                      Track employee profiles, active working hours timesheets, and professional inspector certifications in one place.
                    </p>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Municipal Roster, Timesheets, and Compliance</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '8px' }}>
                      Oversee municipal workforce across branches (Executive, Legislative). Log employee hire dates, record completed timesheet hours, and set up alerts for expiring building inspector safety credentials to avoid compliance gaps.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      )}

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

      {/* Staff Login / Bootstrap Setup Modal Overlay */}
      {showLoginForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <form 
            onSubmit={hasGlobalAdmin ? handleStaffLogin : handleBootstrapAdmin} 
            style={{ background: '#11131c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} style={{ color: 'var(--primary-color)' }} />
                <span>{hasGlobalAdmin ? 'Staff Portal Access' : 'First-Run Setup Wizard'}</span>
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {hasGlobalAdmin ? 'Sign in using your government credentials.' : 'Initialize the root Global Administrator account credentials.'}
              </p>
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

            {/* local .env credential warning alert block */}
            {!hasRealSupabase && (
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '10.5px', color: 'var(--warning-text)', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
                <HelpCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Local Dev Warning:</strong> VITE_SUPABASE_ANON_KEY environment variables are missing. Using mock bypass credentials locally.
                </div>
              </div>
            )}

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
                <span>{authLoading ? 'Provisioning...' : (hasGlobalAdmin ? 'Sign In' : 'Setup Admin')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
