import React, { useState } from 'react';
import {
  TextInput,
  Button,
  Form,
  Stack,
  InlineNotification,
  Link,
} from '@carbon/react';
import { Login, View, ViewOff, ArrowLeft } from '@carbon/icons-react';
import { useUser } from '../contexts/UserContext';

const LoginPage = ({ onLogin }) => {
  const { resetPassword } = useUser();

  // authStage: 'email' | 'password' | 'forgot' | 'reset-sent'
  const [authStage, setAuthStage] = useState('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Check for remembered email on mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) setEmail(rememberedEmail);
  }, []);

  // ── Step 1: checkEmail() — look up role in users table ───────────────────
  const checkEmail = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().match(/@([a-z]+\.)?ibm\.com$/)) {
      setError('Please enter a valid IBM email address (e.g. firstname.lastname@ibm.com or @uk.ibm.com)');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin({ email, step: 'check' });
      // authStage → 'seller': already logged in, App.js unmounts this page
    } catch (err) {
      if (err.message === 'NEEDS_PASSWORD') {
        // authStage → 'password': marketer or admin-manager
        setAuthStage('password');
      } else {
        setError(err.message || 'Unable to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: password submitted ────────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      localStorage.setItem('rememberedEmail', email);
      await onLogin({ email, password, step: 'password' });
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    const result = await resetPassword(resetEmail);
    setResetLoading(false);
    if (!result.success) {
      setResetError(result.error || 'Failed to send reset email');
    } else {
      setAuthStage('reset-sent');
    }
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    padding: '48px 32px',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(6,12,42,0.35)',
  };

  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #060c2a 0%, #0f1f60 55%, #162880 100%)',
    padding: '20px',
  };

  const Header = () => (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <Login size={48} style={{ color: '#4589ff', marginBottom: '16px' }} />
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#161616', margin: '0 0 8px 0', letterSpacing: '0.04em' }}>
        IBM UKI MARKETING HUB
      </h2>
      <p style={{ fontSize: '14px', color: '#525252', margin: 0 }}>
        Sign in to your account
      </p>
    </div>
  );

  const ErrorBanner = ({ msg }) => msg ? (
    <div style={{ marginBottom: '24px' }}>
      <InlineNotification kind="error" title="Error" subtitle={msg} hideCloseButton lowContrast />
    </div>
  ) : null;

  // ── Forgot password form ──────────────────────────────────────────────────
  if (authStage === 'forgot') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <button
            type="button"
            onClick={() => { setAuthStage('password'); setResetError(''); setResetEmail(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f62fe', fontSize: '14px', padding: 0, marginBottom: '24px' }}
          >
            <ArrowLeft size={16} /> Back to sign in
          </button>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '400', color: '#161616', margin: '0 0 8px 0' }}>Reset your password</h2>
            <p style={{ fontSize: '14px', color: '#525252', margin: 0 }}>Enter your email and we'll send you a reset link.</p>
          </div>
          <ErrorBanner msg={resetError} />
          <Form onSubmit={handleResetSubmit}>
            <Stack gap={6}>
              <TextInput
                id="reset-email"
                labelText="Email address"
                placeholder="Enter your email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Button type="submit" kind="primary" size="lg" disabled={resetLoading || !resetEmail} style={{ width: '100%', marginTop: '8px' }}>
                {resetLoading ? 'Sending...' : 'Send reset link'}
              </Button>
            </Stack>
          </Form>
        </div>
      </div>
    );
  }

  // ── Reset email sent ──────────────────────────────────────────────────────
  if (authStage === 'reset-sent') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#defbe6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#24a148" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '400', color: '#161616', margin: '0 0 12px 0' }}>Check your email</h2>
            <p style={{ fontSize: '14px', color: '#525252', marginBottom: '8px' }}>We sent a reset link to:</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '24px' }}>{resetEmail}</p>
            <p style={{ fontSize: '13px', color: '#525252', marginBottom: '32px' }}>The link expires after 1 hour.</p>
            <Button kind="tertiary" size="md" onClick={() => { setAuthStage('password'); setResetEmail(''); }} style={{ width: '100%' }}>
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: password form (admin-manager / marketer) ─────────────────────
  if (authStage === 'password') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <button
            type="button"
            onClick={() => { setAuthStage('email'); setPassword(''); setError(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#0f62fe', fontSize: '14px', padding: 0, marginBottom: '24px' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <Header />
          <p style={{ fontSize: '14px', color: '#525252', marginBottom: '24px', textAlign: 'center' }}>
            Signing in as <strong>{email}</strong>
          </p>
          <ErrorBanner msg={error} />
          <Form onSubmit={handlePasswordSubmit}>
            <Stack gap={6}>
              <div style={{ position: 'relative' }}>
                <TextInput
                  id="password"
                  labelText="Password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#525252' }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <ViewOff size={16} /> : <View size={16} />}
                </button>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Link
                  href="#"
                  onClick={(e) => { e.preventDefault(); setError(''); setResetEmail(email); setAuthStage('forgot'); }}
                  style={{ fontSize: '14px' }}
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                kind="primary"
                size="lg"
                disabled={isLoading || !password}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </Form>
        </div>
      </div>
    );
  }

  // ── Step 1: EmailStep — authStage 'email' (default) ──────────────────────
  const EmailStep = () => (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <Header />
        <ErrorBanner msg={error} />
        <Form onSubmit={checkEmail}>
          <Stack gap={6}>
            <TextInput
              id="email"
              labelText="Email address"
              placeholder="firstname.lastname@ibm.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
            <Button
              type="submit"
              kind="primary"
              size="lg"
              disabled={isLoading || !email}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {isLoading ? 'Checking...' : 'Continue'}
            </Button>
          </Stack>
        </Form>
      </div>
    </div>
  );

  return <EmailStep />;
};

export default LoginPage;

// Made with Bob
