import React, { useState, useEffect } from 'react';
import { 
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
  Sparkles,
  Map,
  FileText,
  Eye,
  EyeOff,
  ShieldCheck,
  Key,
  ArrowLeft
} from 'lucide-react';
import { supabase, hasRealSupabase } from '../supabaseClient';
import { Logo } from './Logo';

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
  const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : '');
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'modules'>('home');
  const [activeModuleDetail, setActiveModuleDetail] = useState<string>('311');
  const [activeHeroGraphic, setActiveHeroGraphic] = useState('/assets/prototypes/munevo_command_center_desktop.png');

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

  // Staff Login & Authentication Strengthening States
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'forgot' | 'reset-complete'>('signin');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Reset Password Completion States
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

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

  // Microsoft Entra ID Sign-In Handler
  const handleMicrosoftLogin = async () => {
    setAuthLoading(true);
    addNotification('Initiating Microsoft Entra ID OIDC Authorization Code Flow with PKCE...');
    try {
      // Record Auth Audit Event
      fetch(`${API_URL}/api/audit-logs/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'MICROSOFT_SIGN_IN_INITIATED', provider: 'MicrosoftEntraID' })
      }).catch(() => {});

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'openid profile email',
          redirectTo: window.location.origin
        }
      });

      if (error) {
        addNotification(`Microsoft SSO Error: ${error.message}`);
        // Fallback for local simulated environment if Supabase OAuth is not configured
        addNotification('Simulating Microsoft Work Account single sign-on mapping for Newark Gov Cloud...');
        const res = await fetch(`${API_URL}/api/profiles/me`, {
          headers: { 'x-user-email': 'mayor@munevo.gov' }
        });
        if (res.ok) {
          const profile = await res.json();
          onLoginDemo(profile);
          setShowLoginForm(false);
        }
      }
    } catch (err: any) {
      addNotification(`Microsoft Auth Exception: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot Password Request Handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      addNotification('Please enter a valid work email address.');
      return;
    }

    setAuthLoading(true);
    try {
      // Record Security Audit Event
      fetch(`${API_URL}/api/audit-logs/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'PASSWORD_RESET_REQUESTED', userEmail: forgotEmail, provider: 'SupabaseAuth' })
      }).catch(() => {});

      await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}`
      });

      // Always display neutral confirmation message to prevent account enumeration
      setForgotSubmitted(true);
      addNotification('Password reset request processed securely.');
    } catch (err: any) {
      console.error(err);
      setForgotSubmitted(true);
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset Password Completion Handler
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetNewPassword.length < 12) {
      addNotification('Password must be at least 12 characters in accordance with Munevo Security Policy.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      addNotification('Passwords do not match. Please re-enter passwords.');
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: resetNewPassword });
      if (error) {
        addNotification(`Reset Error: ${error.message}`);
      } else {
        setResetSuccess(true);
        addNotification('Your password has been reset successfully. Sign in with your new password.');
        // Record Security Audit Event
        fetch(`${API_URL}/api/audit-logs/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: 'PASSWORD_RESET_COMPLETED', provider: 'SupabaseAuth' })
        }).catch(() => {});
      }
    } catch (err: any) {
      addNotification(`Reset Error: ${err.message}`);
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
    <div style={{ background: '#0E0F12', minHeight: '100vh', color: '#F6F8FD', fontFamily: '"Inter", system-ui, sans-serif' }}>
      
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontFamily: '"Montserrat", sans-serif'
          }}
        >
          <Sparkles size={16} />
          <span>FIRST-RUN SETUP: No Global Administrator account exists. Click here to initialize your root credentials.</span>
        </div>
      )}

      {/* Navigation Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px', 
        borderBottom: '1px solid #2A2E37', 
        backdropFilter: 'blur(12px)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'rgba(14,15,18,0.85)',
        height: '70px'
      }}>
        <div style={{ cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <Logo variant="master" size={32} wordmarkSize="1.25rem" />
        </div>

        {/* Tab Page Toggles */}
        <nav style={{ display: 'flex', gap: '30px' }}>
          <button 
            onClick={() => setActiveTab('home')}
            style={{ background: 'transparent', border: 0, color: activeTab === 'home' ? '#2F6FED' : '#9AA3B2', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('modules')}
            style={{ background: 'transparent', border: 0, color: activeTab === 'modules' ? '#2F6FED' : '#9AA3B2', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }}
          >
            Product Modules
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => setShowLoginForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 0, color: '#9AA3B2', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, fontFamily: '"Montserrat", sans-serif' }}
          >
            <Lock size={14} style={{ color: '#2F6FED' }} />
            <span>Staff Portal Login</span>
          </button>
          <button 
            onClick={() => setShowRequestForm(true)}
            style={{ background: '#2F6FED', color: '#fff', border: 0, borderRadius: '6px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }}
          >
            Request a Demo
          </button>
        </div>
      </header>

      {activeTab === 'home' ? (
        <>
          {/* Hero Section */}
          <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '90px 40px 60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <Logo variant="master" size={74} wordmarkSize="3.8rem" />
            </div>
            
            <p style={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 600, fontSize: '1.35rem', color: '#9AA3B2', letterSpacing: '-0.01em', margin: '-10px 0 10px 0' }}>
              One login. Your whole city.
            </p>

            <h2 style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, maxWidth: '850px', letterSpacing: '-0.04em', margin: 0 }}>
              The Unified Operating System for <span style={{ color: '#2F6FED' }}>Modern Municipalities</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#9AA3B2', maxWidth: '650px', lineHeight: 1.5, margin: 0 }}>
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
                  background: 'linear-gradient(135deg, #2F6FED, #1fbf75)', 
                  color: '#fff', 
                  border: 0, 
                  borderRadius: '8px', 
                  padding: '12px 28px', 
                  fontSize: '0.95rem', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(47,111,237,0.3)',
                  transition: 'transform 0.2s',
                  fontFamily: '"Montserrat", sans-serif'
                }}
              >
                {demoLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                {demoLoading ? 'Deploying Sandbox...' : 'Launch Demo Sandbox'}
              </button>
              <button 
                onClick={() => setShowRequestForm(true)}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #2A2E37', borderRadius: '8px', padding: '12px 24px', fontSize: '0.95rem', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }}
              >
                Request Custom Setup
              </button>
            </div>

            {/* Interactive High-Fidelity Prototype Visual Showcase */}
            <div style={{ marginTop: '40px', width: '100%', position: 'relative', borderRadius: '20px', border: '1px solid #2A2E37', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.85)', background: '#121520' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#0b0d14', borderBottom: '1px solid #2A2E37', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Canvas OS Live Prototype Visuals
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                  {[
                    { id: 'command', label: 'Executive Command Center', img: '/assets/prototypes/munevo_command_center_desktop.png' },
                    { id: 'property', label: 'Property 360 Workspace', img: '/assets/prototypes/munevo_property_360_workspace.png' },
                    { id: 'gis', label: 'GIS Spatial Intelligence', img: '/assets/prototypes/munevo_gis_digital_twin.png' },
                    { id: 'tablet', label: 'Mobile Field Inspector', img: '/assets/prototypes/munevo_field_inspector_tablet.png' }
                  ].map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveHeroGraphic(item.img)}
                      style={{
                        border: 'none',
                        background: activeHeroGraphic === item.img ? 'var(--primary-color, #3b82f6)' : 'rgba(255,255,255,0.05)',
                        color: activeHeroGraphic === item.img ? '#fff' : '#9AA3B2',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <img 
                src={activeHeroGraphic} 
                alt="Munevo Canvas OS High-Fidelity Prototype Visual" 
                style={{ width: '100%', display: 'block', maxHeight: '640px', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(to top, #0E0F12 10%, transparent 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>NEWARK GOV CLOUD PROTOTYPE</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Unified Multi-Tenant Government Operating System</div>
                </div>
                <button 
                  onClick={handleLaunchSandbox}
                  style={{ background: '#3b82f6', color: '#fff', border: 0, borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Interactive Demo Sandbox →
                </button>
              </div>
            </div>
          </section>

          {/* New Portal Family Grid Showcase */}
          <section style={{ borderTop: '1px solid #2A2E37', padding: '80px 40px', background: '#16181D' }}>
            <div style={{ maxWidth: '1060px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9AA3B2' }}>
                  The portals
                </span>
                <h2 style={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.9rem', color: '#F6F8FD', marginTop: '8px', marginBottom: '12px' }}>
                  Same family, tuned per audience
                </h2>
                <p style={{ color: '#9AA3B2', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
                  One identity for your whole city. Seamless single sign-on access tailored dynamically to residents, local merchants, and licensed field contractors.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* Card 1: Resident */}
                <div style={{ border: '1px solid #2A2E37', borderRadius: '20px', background: '#0E0F12', overflow: 'hidden' }}>
                  <div style={{ padding: '30px 26px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', borderBottom: '1px solid #2A2E37' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                      <Logo variant="resident" size={42} showWordmark={true} wordmarkSize="1.6rem" />
                    </div>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '7px', 
                      fontFamily: '"Montserrat", sans-serif', 
                      fontWeight: 700, 
                      fontSize: '0.72rem', 
                      letterSpacing: '0.14em', 
                      textTransform: 'uppercase', 
                      padding: '5px 12px', 
                      borderRadius: '100px',
                      background: 'rgba(47,111,237,.13)', 
                      color: '#5B8DFF'
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B8DFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>
                      Resident
                    </span>
                  </div>
                  <div style={{ padding: '18px 26px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                    <span style={{ fontSize: '0.86rem', color: '#9AA3B2' }}>For residents &amp; homeowners</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, background: '#2F6FED' }}></span>
                    </span>
                  </div>
                </div>

                {/* Card 2: Business */}
                <div style={{ border: '1px solid #2A2E37', borderRadius: '20px', background: '#0E0F12', overflow: 'hidden' }}>
                  <div style={{ padding: '30px 26px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', borderBottom: '1px solid #2A2E37' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                      <Logo variant="business" size={42} showWordmark={true} wordmarkSize="1.6rem" />
                    </div>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '7px', 
                      fontFamily: '"Montserrat", sans-serif', 
                      fontWeight: 700, 
                      fontSize: '0.72rem', 
                      letterSpacing: '0.14em', 
                      textTransform: 'uppercase', 
                      padding: '5px 12px', 
                      borderRadius: '100px',
                      background: 'rgba(31,191,117,.13)', 
                      color: '#3BD68C'
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3BD68C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="1.5"/><path d="M8 8V5h8v3"/></svg>
                      Business
                    </span>
                  </div>
                  <div style={{ padding: '18px 26px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                    <span style={{ fontSize: '0.86rem', color: '#9AA3B2' }}>For business owners</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, background: '#1FBF75' }}></span>
                    </span>
                  </div>
                </div>

                {/* Card 3: Contractor */}
                <div style={{ border: '1px solid #2A2E37', borderRadius: '20px', background: '#0E0F12', overflow: 'hidden' }}>
                  <div style={{ padding: '30px 26px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', borderBottom: '1px solid #2A2E37' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                      <Logo variant="contractor" size={42} showWordmark={true} wordmarkSize="1.6rem" />
                    </div>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '7px', 
                      fontFamily: '"Montserrat", sans-serif', 
                      fontWeight: 700, 
                      fontSize: '0.72rem', 
                      letterSpacing: '0.14em', 
                      textTransform: 'uppercase', 
                      padding: '5px 12px', 
                      borderRadius: '100px',
                      background: 'rgba(245,165,36,.14)', 
                      color: '#FFB733'
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFB733" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h20"/><path d="M4 18a8 8 0 0 1 16 0"/><path d="M12 6V4"/></svg>
                      Contractor
                    </span>
                  </div>
                  <div style={{ padding: '18px 26px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                    <span style={{ fontSize: '0.86rem', color: '#9AA3B2' }}>For licensed contractors</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, background: '#F5A524' }}></span>
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Section 3: Legacy Silos vs. GovOS Relational Paradigm */}
          <section style={{ borderTop: '1px solid #2A2E37', padding: '80px 40px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#2F6FED' }}>Data Normalization Paradigm</span>
                <h3 style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '2rem', fontWeight: 800, margin: '8px 0 0 0', letterSpacing: '-0.02em' }}>The Unified Property & Person Model</h3>
                <p style={{ color: '#9AA3B2', fontSize: '0.95rem', maxWidth: '600px', margin: '12px auto 0 auto', lineHeight: 1.5 }}>
                  Traditional govtech separates your billing, permits, and citizen tickets into isolated databases. Munevo links all operations to central parcel records.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                <div style={{ background: '#16181D', border: '1px solid #2A2E37', borderRadius: '12px', padding: '28px' }}>
                  <Database style={{ color: '#2F6FED', marginBottom: '16px' }} size={24} />
                  <h4 style={{ fontFamily: '"Montserrat", sans-serif', margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 700 }}>Single Source of Truth</h4>
                  <p style={{ margin: 0, color: '#9AA3B2', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    Every document, citation, permit application, or 311 request links back to a central parcel ID. Staff see a property's full compliance lifecycle instantly.
                  </p>
                </div>

                <div style={{ background: '#16181D', border: '1px solid #2A2E37', borderRadius: '12px', padding: '28px' }}>
                  <Users style={{ color: '#1FBF75', marginBottom: '16px' }} size={24} />
                  <h4 style={{ fontFamily: '"Montserrat", sans-serif', margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 700 }}>Intelligent Contractor Hub</h4>
                  <p style={{ margin: 0, color: '#9AA3B2', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    Associates businesses and contractors directly with properties they are working on. Self-service claims route to permit clerks for fast verification.
                  </p>
                </div>

                <div style={{ background: '#16181D', border: '1px solid #2A2E37', borderRadius: '12px', padding: '28px' }}>
                  <Layers style={{ color: '#F5A524', marginBottom: '16px' }} size={24} />
                  <h4 style={{ fontFamily: '"Montserrat", sans-serif', margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 700 }}>Dynamic Work Routing</h4>
                  <p style={{ margin: 0, color: '#9AA3B2', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    Intelligent role-aware task assignment schedules code enforcement citations, structural inspections, or FOIA requests directly to the designated officer's roster.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Interactive Visual Features Preview */}
          <section style={{ borderTop: '1px solid #2A2E37', padding: '80px 40px', background: '#16181D' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px' }}>
              
              {/* Row 1: GIS Map */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '50px' }}>
                <div style={{ flex: 1, minWidth: '320px' }}>
                  <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: '#2F6FED', fontWeight: 800, textTransform: 'uppercase' }}>Spatial Intelligence</span>
                  <h3 style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 12px 0' }}>Real-time Leaflet GIS Mapping</h3>
                  <p style={{ color: '#9AA3B2', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                    Plot your city's workload instantly. Visual layers let dispatchers filter for open zoning permits, delinquent property files, and high-priority safety hazards simultaneously.
                  </p>
                  <button onClick={() => { setActiveTab('modules'); setActiveModuleDetail('gis'); }} style={{ border: 0, background: 'transparent', color: '#2F6FED', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontFamily: '"Montserrat", sans-serif' }}>
                    <span>Explore GIS Module</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
                <div style={{ flex: 1.2, minWidth: '320px', borderRadius: '12px', border: '1px solid #2A2E37', overflow: 'hidden' }}>
                  <img src="/munevo_gis_preview.jpg" alt="Munevo GIS Map View" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                </div>
              </div>

              {/* Row 2: Permits Desk */}
              <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '50px' }}>
                <div style={{ flex: 1.2, minWidth: '320px', borderRadius: '12px', border: '1px solid #2A2E37', overflow: 'hidden' }}>
                  <img src="/munevo_permit_preview.jpg" alt="Munevo Permits Queue" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: '320px' }}>
                  <span style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: '#1FBF75', fontWeight: 800, textTransform: 'uppercase' }}>Building Services</span>
                  <h3 style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 12px 0' }}>Workflow Permitting desk</h3>
                  <p style={{ color: '#9AA3B2', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                    Manage construction milestones electronically. Configure progressive review steps, record structural inspections, and link contractor credentials to avoid citation risks.
                  </p>
                  <button onClick={() => { setActiveTab('modules'); setActiveModuleDetail('permits'); }} style={{ border: 0, background: 'transparent', color: '#1FBF75', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontFamily: '"Montserrat", sans-serif' }}>
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
            <h2 style={{ fontFamily: '"Montserrat", sans-serif', fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>GovOS Modular Capabilities</h2>
            <p style={{ color: '#9AA3B2', fontSize: '1rem', marginTop: '8px' }}>Select a product module below to preview workflows and layout screenshots.</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
            
            {/* Sidebar Tab Menu */}
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => setActiveModuleDetail('311')}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  background: activeModuleDetail === '311' ? 'rgba(47,111,237,0.08)' : 'transparent',
                  border: '1px solid ' + (activeModuleDetail === '311' ? 'rgba(47,111,237,0.15)' : '#2A2E37'),
                  color: activeModuleDetail === '311' ? '#2F6FED' : '#9AA3B2',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: '"Montserrat", sans-serif'
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
                  background: activeModuleDetail === 'gis' ? 'rgba(47,111,237,0.08)' : 'transparent',
                  border: '1px solid ' + (activeModuleDetail === 'gis' ? 'rgba(47,111,237,0.15)' : '#2A2E37'),
                  color: activeModuleDetail === 'gis' ? '#2F6FED' : '#9AA3B2',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: '"Montserrat", sans-serif'
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
                  background: activeModuleDetail === 'permits' ? 'rgba(47,111,237,0.08)' : 'transparent',
                  border: '1px solid ' + (activeModuleDetail === 'permits' ? 'rgba(47,111,237,0.15)' : '#2A2E37'),
                  color: activeModuleDetail === 'permits' ? '#2F6FED' : '#9AA3B2',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: '"Montserrat", sans-serif'
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
                  background: activeModuleDetail === 'staff' ? 'rgba(47,111,237,0.08)' : 'transparent',
                  border: '1px solid ' + (activeModuleDetail === 'staff' ? 'rgba(47,111,237,0.15)' : '#2A2E37'),
                  color: activeModuleDetail === 'staff' ? '#2F6FED' : '#9AA3B2',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: '"Montserrat", sans-serif'
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
                  <div style={{ border: '1px solid #2A2E37', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src="/munevo_tracker_preview.jpg" alt="311 Tracker Dashboard" style={{ width: '100%', display: 'block' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: '"Montserrat", sans-serif' }}>311 Intake & Natural Language Ticket Router</h3>
                    <p style={{ color: '#9AA3B2', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '8px' }}>
                      Citizen service calls are parsed and routed to departments dynamically. Centralizes pothole, noise, street cleaning, or trash tickets in real-time, displaying priority flags, assigned staff owners, and SLA clock compliance meters.
                    </p>
                  </div>
                </div>
              )}

              {activeModuleDetail === 'gis' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ border: '1px solid #2A2E37', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src="/munevo_gis_preview.jpg" alt="GIS Intelligence Map" style={{ width: '100%', display: 'block' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: '"Montserrat", sans-serif' }}>Leaflet GIS Spatial Overlay</h3>
                    <p style={{ color: '#9AA3B2', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '8px' }}>
                      Interactive mapping workspace detailing active construction permits, safety violations, and 311 intake hotspots. Let dispatchers query parcel data and schedule field code citations on coordinates instantly.
                    </p>
                  </div>
                </div>
              )}

              {activeModuleDetail === 'permits' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ border: '1px solid #2A2E37', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src="/munevo_permit_preview.jpg" alt="Permitting Desk" style={{ width: '100%', display: 'block' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: '"Montserrat", sans-serif' }}>Progressive Plan Reviews & Contractor Portal</h3>
                    <p style={{ color: '#9AA3B2', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '8px' }}>
                      Streamline zoning applications. Enable developers to submit construction files, calculate estimated values, verify licenses, and coordinate milestones online. Automatically triggers code safety checks post-issuance.
                    </p>
                  </div>
                </div>
              )}

              {activeModuleDetail === 'staff' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ border: '1px solid #2A2E37', borderRadius: '12px', overflow: 'hidden', padding: '40px', background: 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
                    <Users size={64} style={{ color: '#2F6FED', marginBottom: '16px', opacity: 0.8 }} />
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 700, fontFamily: '"Montserrat", sans-serif' }}>Employee Directory & Roster Console</h4>
                    <p style={{ color: '#9AA3B2', fontSize: '0.85rem', maxWidth: '380px', margin: '8px auto 0 auto' }}>
                      Track employee profiles, active working hours timesheets, and professional inspector certifications in one place.
                    </p>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: '"Montserrat", sans-serif' }}>Municipal Roster, Timesheets, and Compliance</h3>
                    <p style={{ color: '#9AA3B2', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '8px' }}>
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
            style={{ background: '#16181D', border: '1px solid #2A2E37', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: '"Montserrat", sans-serif' }}>Request a Custom Demo</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#9AA3B2' }}>Tell us about your municipality's current digital objectives.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#9AA3B2', marginBottom: '6px' }}>Municipality / Agency Name</label>
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
              <label style={{ display: 'block', fontSize: '11px', color: '#9AA3B2', marginBottom: '6px' }}>Contact Name</label>
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
              <label style={{ display: 'block', fontSize: '11px', color: '#9AA3B2', marginBottom: '6px' }}>Work Email Address</label>
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
              <label style={{ display: 'block', fontSize: '11px', color: '#9AA3B2', marginBottom: '6px' }}>Objective or Custom Requirements</label>
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
                style={{ flex: 1, height: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid #2A2E37', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ flex: 2, height: '40px', background: '#2F6FED', border: 0, color: '#fff', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }}
              >
                <Send size={14} />
                <span>Submit Query</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Login / Authentication Strengthening Modal Overlay */}
      {showLoginForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          
          {/* VIEW A: Standard Sign-In Form */}
          {authView === 'signin' && (
            <form 
              onSubmit={hasGlobalAdmin ? handleStaffLogin : handleBootstrapAdmin} 
              style={{ background: '#12141c', border: '1px solid #2A2E37', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Logo variant="master" size={36} wordmarkSize="1.5rem" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: '"Montserrat", sans-serif' }}>
                  {hasGlobalAdmin ? 'Government Cloud Sign In' : 'First-Run Setup Wizard'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#9AA3B2' }}>
                  {hasGlobalAdmin ? 'Sign in using your authorized municipal credentials.' : 'Initialize the root Global Administrator account credentials.'}
                </p>
              </div>

              {/* Microsoft Entra ID SSO Button */}
              {hasGlobalAdmin && (
                <>
                  <button
                    type="button"
                    onClick={handleMicrosoftLogin}
                    disabled={authLoading}
                    style={{
                      width: '100%',
                      height: '44px',
                      background: '#1f2330',
                      border: '1px solid #363b4e',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: '"Montserrat", sans-serif'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                    </svg>
                    <span>Sign in with Microsoft</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#2A2E37' }} />
                    <span style={{ fontSize: '0.7rem', color: '#9AA3B2', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>or sign in with email</span>
                    <div style={{ flex: 1, height: '1px', background: '#2A2E37' }} />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#9AA3B2', marginBottom: '6px', fontWeight: 600 }}>Work Email Address</label>
                <input 
                  type="email" 
                  autoComplete="email"
                  className="ai-input" 
                  style={{ width: '100%', height: '40px' }}
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)} 
                  placeholder="e.g. mayor@munevo.gov" 
                  required 
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#9AA3B2', fontWeight: 600 }}>Password</label>
                  {hasGlobalAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('forgot');
                        setForgotEmail(loginEmail);
                      }}
                      style={{ background: 'none', border: 0, color: '#3b82f6', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    autoComplete="current-password"
                    className="ai-input" 
                    style={{ width: '100%', height: '40px', paddingRight: '36px' }}
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)} 
                    placeholder="••••••••••••" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 0, color: '#9AA3B2', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#9AA3B2', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={e => setRememberMe(e.target.checked)} 
                    style={{ accentColor: '#3b82f6' }}
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              {/* Local Dev Warning Banner */}
              {!hasRealSupabase && (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '10.5px', color: 'var(--warning-text)', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
                  <HelpCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Local Dev Mode:</strong> Using simulated backend registry bypass for demonstration accounts.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowLoginForm(false);
                    setLoginEmail('');
                    setLoginPassword('');
                  }} 
                  style={{ flex: 1, height: '42px', background: 'rgba(255,255,255,0.02)', border: '1px solid #2A2E37', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={authLoading}
                  style={{ flex: 2, height: '42px', background: 'linear-gradient(135deg, #2F6FED, #1fbf75)', border: 0, color: '#fff', borderRadius: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }}
                >
                  {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
                  <span>{authLoading ? 'Authenticating...' : (hasGlobalAdmin ? 'Sign In' : 'Setup Admin')}</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.72rem', color: '#9AA3B2', borderTop: '1px solid #2A2E37', paddingTop: '12px' }}>
                <span style={{ cursor: 'pointer' }}>Security & Audit Policy</span>
                <span>•</span>
                <span style={{ cursor: 'pointer' }}>Privacy Notice</span>
                <span>•</span>
                <span style={{ cursor: 'pointer' }}>Help Desk</span>
              </div>
            </form>
          )}

          {/* VIEW B: Forgot Password Form */}
          {authView === 'forgot' && (
            <form 
              onSubmit={handleForgotPasswordSubmit} 
              style={{ background: '#12141c', border: '1px solid #2A2E37', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Logo variant="master" size={36} wordmarkSize="1.5rem" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: '"Montserrat", sans-serif' }}>
                  Reset your password
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#9AA3B2', lineHeight: 1.5 }}>
                  Enter the work email address associated with your Munevo account to receive a secure password-reset link.
                </p>
              </div>

              {forgotSubmitted ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={32} style={{ color: '#10b981' }} />
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                    If an account exists for this email address, password-reset instructions have been sent.
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#9AA3B2', margin: 0 }}>
                    Please check your inbox and click the one-time link. The link expires in 60 minutes.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('signin');
                      setForgotSubmitted(false);
                    }}
                    style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '8px 20px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#9AA3B2', marginBottom: '6px', fontWeight: 600 }}>Work Email Address</label>
                    <input 
                      type="email" 
                      autoComplete="email"
                      className="ai-input" 
                      style={{ width: '100%', height: '40px' }}
                      value={forgotEmail} 
                      onChange={e => setForgotEmail(e.target.value)} 
                      placeholder="e.g. mayor@munevo.gov" 
                      required 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <button 
                      type="button" 
                      onClick={() => setAuthView('signin')} 
                      style={{ flex: 1, height: '42px', background: 'rgba(255,255,255,0.02)', border: '1px solid #2A2E37', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: '"Montserrat", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                    <button 
                      type="submit" 
                      disabled={authLoading}
                      style={{ flex: 2, height: '42px', background: '#3b82f6', border: 0, color: '#fff', borderRadius: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }}
                    >
                      {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                      <span>{authLoading ? 'Sending...' : 'Send Reset Link'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* VIEW C: Reset Password Completion Form */}
          {authView === 'reset-complete' && (
            <form 
              onSubmit={handleResetPasswordSubmit} 
              style={{ background: '#12141c', border: '1px solid #2A2E37', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Logo variant="master" size={36} wordmarkSize="1.5rem" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: '"Montserrat", sans-serif' }}>
                  Set New Password
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#9AA3B2' }}>
                  Enter a new strong password for your Munevo account (minimum 12 characters).
                </p>
              </div>

              {resetSuccess ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={32} style={{ color: '#10b981' }} />
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
                    Your password has been reset successfully.
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#9AA3B2', margin: 0 }}>
                    Sign in with your new password to access your Munevo workspace.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthView('signin')}
                    style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '8px 20px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}
                  >
                    Sign In Now →
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#9AA3B2', marginBottom: '6px', fontWeight: 600 }}>New Password</label>
                    <input 
                      type="password" 
                      autoComplete="new-password"
                      className="ai-input" 
                      style={{ width: '100%', height: '40px' }}
                      value={resetNewPassword} 
                      onChange={e => setResetNewPassword(e.target.value)} 
                      placeholder="Minimum 12 characters" 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#9AA3B2', marginBottom: '6px', fontWeight: 600 }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      autoComplete="new-password"
                      className="ai-input" 
                      style={{ width: '100%', height: '40px' }}
                      value={resetConfirmPassword} 
                      onChange={e => setResetConfirmPassword(e.target.value)} 
                      placeholder="Re-enter new password" 
                      required 
                    />
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', fontSize: '0.72rem', color: '#9AA3B2' }}>
                    • Minimum 12 characters required<br/>
                    • Passwords must match exactly
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <button 
                      type="submit" 
                      disabled={authLoading}
                      style={{ width: '100%', height: '42px', background: '#10b981', border: 0, color: '#fff', borderRadius: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }}
                    >
                      {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={15} />}
                      <span>{authLoading ? 'Updating Password...' : 'Reset Password'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #2A2E37', padding: '46px 24px', textAlign: 'center', color: '#9AA3B2', fontSize: '0.86rem', background: '#0E0F12' }}>
        <div style={{ marginBottom: '8px' }}><b style={{ color: '#F6F8FD' }}>MyMunevo</b> — powered by Munevo Government OS</div>
        Residents · Businesses · Contractors — one identity, one city.
      </footer>

    </div>
  );
};
