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
import { Login, View, ViewOff } from '@carbon/icons-react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials for testing
  const DEMO_CREDENTIALS = {
    email: 'admin@ibm.com',
    password: 'admin123'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Simple validation for demo
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        // Store login state
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        // Call parent callback
        onLogin({ email, rememberMe });
      } else {
        setError('Invalid email or password. Try admin@ibm.com / admin123');
      }
      setIsLoading(false);
    }, 800);
  };

  // Check for remembered email on mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f4f4f4',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '48px 32px',
        borderRadius: '4px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
      }}>
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

        {/* Demo Credentials Info */}
        <div style={{
          backgroundColor: '#e5f6ff',
          border: '1px solid #0f62fe',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '24px',
          fontSize: '12px',
          color: '#161616'
        }}>
          <strong>Demo Credentials:</strong><br />
          Email: admin@ibm.com<br />
          Password: admin123
        </div>

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
                  alert('Password reset functionality coming soon!');
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