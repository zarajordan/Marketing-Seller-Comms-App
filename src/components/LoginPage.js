import React, { useState } from 'react';
import {
  TextInput,
  Button,
  Form,
  Stack,
  InlineNotification,
  Checkbox,
  Link
} from '@carbon/react';
import { Login, View, ViewOff, ArrowLeft } from '@carbon/icons-react';
import { useUser } from '../contexts/UserContext';

const LoginPage = ({ onLogin }) => {
  const { resetPassword } = useUser();

  // 'login' | 'forgot' | 'reset-sent'
  const [view, setView] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('LOGIN: submitting', email);

    try {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      }

      console.log('LOGIN: calling onLogin');
      await onLogin({ email, rememberMe, password });
      console.log('LOGIN: onLogin returned');
    } catch (loginError) {
      console.error('LOGIN: caught error', loginError);
      setError(loginError.message || 'Unable to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);

    const result = await resetPassword(resetEmail);

    setResetLoading(false);

    if (!result.success) {
      setResetError(result.error || 'Failed to send reset email');
    } else {
      setView('reset-sent');
    }
  };

  // Check for remembered email on mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const cardStyle = {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    padding: '48px 32px',
    borderRadius: '4px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
  };

  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
    padding: '20px'
  };

  // ── Forgot password form ──────────────────────────────────────────────────
  if (view === 'forgot') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <button
            type="button"
            onClick={() => { setView('login'); setResetError(''); setResetEmail(''); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#0f62fe',
              fontSize: '14px',
              padding: 0,
              marginBottom: '24px'
            }}
          >
            <ArrowLeft size={16} /> Back to sign in
          </button>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '400', color: '#161616', margin: '0 0 8px 0' }}>
              Reset your password
            </h2>
            <p style={{ fontSize: '14px', color: '#525252', margin: 0 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {resetError && (
            <div style={{ marginBottom: '24px' }}>
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={resetError}
                hideCloseButton
                lowContrast
              />
            </div>
          )}

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
              <Button
                type="submit"
                kind="primary"
                size="lg"
                disabled={resetLoading || !resetEmail}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {resetLoading ? 'Sending...' : 'Send reset link'}
              </Button>
            </Stack>
          </Form>
        </div>
      </div>
    );
  }

  // ── Reset email sent confirmation ─────────────────────────────────────────
  if (view === 'reset-sent') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#defbe6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#24a148" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '400', color: '#161616', margin: '0 0 12px 0' }}>
              Check your email
            </h2>
            <p style={{ fontSize: '14px', color: '#525252', marginBottom: '8px' }}>
              We sent a password reset link to:
            </p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '24px' }}>
              {resetEmail}
            </p>
            <p style={{ fontSize: '13px', color: '#525252', marginBottom: '32px' }}>
              Click the link in the email to set a new password. The link expires after 1 hour.
            </p>
            <Button
              kind="tertiary"
              size="md"
              onClick={() => { setView('login'); setResetEmail(''); }}
              style={{ width: '100%' }}
            >
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Login form (default) ──────────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Login size={48} style={{ color: '#0f62fe', marginBottom: '16px' }} />
          <h2 style={{
            fontSize: '28px',
            fontWeight: '400',
            color: '#161616',
            margin: '0 0 8px 0'
          }}>
            Comms App
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#525252',
            margin: 0
          }}>
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <InlineNotification
              kind="error"
              title="Login Failed"
              subtitle={error}
              hideCloseButton
              lowContrast
            />
          </div>
        )}

        {/* Login Form */}
        <Form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <TextInput
              id="email"
              labelText="Email address"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '38px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#525252'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <ViewOff size={16} /> : <View size={16} />}
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px'
            }}>
              <Checkbox
                id="remember-me"
                labelText="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setError('');
                  setResetEmail(email);
                  setView('forgot');
                }}
                style={{ fontSize: '14px' }}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              kind="primary"
              size="lg"
              disabled={isLoading || !email || !password}
              style={{ width: '100%', marginTop: '16px' }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Stack>
        </Form>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
          fontSize: '14px',
          color: '#525252'
        }}>
          Don't have an account?{' '}
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert('Registration functionality coming soon!');
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

// Made with Bob
