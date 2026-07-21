import React, { useState } from 'react';
import { TextInput, Button, Form, Stack, InlineNotification } from '@carbon/react';
import { View, ViewOff, Password } from '@carbon/icons-react';
import { toast } from 'react-toastify';

const SetNewPasswordPage = ({ updatePassword }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await updatePassword(password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to update password');
    } else {
      toast.success('Password updated successfully! Please sign in.');
    }
  };

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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Password size={48} style={{ color: '#0f62fe', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '400', color: '#161616', margin: '0 0 8px 0' }}>
            Set new password
          </h2>
          <p style={{ fontSize: '14px', color: '#525252', margin: 0 }}>
            Choose a strong password for your account.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '24px' }}>
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              hideCloseButton
              lowContrast
            />
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <div style={{ position: 'relative' }}>
              <TextInput
                id="new-password"
                labelText="New password"
                placeholder="At least 6 characters"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

            <TextInput
              id="confirm-password"
              labelText="Confirm new password"
              placeholder="Re-enter your password"
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              kind="primary"
              size="lg"
              disabled={isLoading || !password || !confirm}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {isLoading ? 'Updating...' : 'Update password'}
            </Button>
          </Stack>
        </Form>
      </div>
    </div>
  );
};

export default SetNewPasswordPage;

// Made with Bob
