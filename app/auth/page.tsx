'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        router.push('/boards');
      }
    } catch (err: any) {
      console.error('Auth error details:', err);
      
      // Show specific error messages
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError('Please check your email and password and try again.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please check your credentials.');
      } else if (err.response?.status === 409) {
        setError('An account with this email already exists.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Kanban Board
          </h1>
          <p className="text-text-secondary">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-dark-surface rounded-card shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field (only for signup) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-button text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                  placeholder="Enter your name"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-button text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-button text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-text-muted">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-button p-3">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-primary hover:bg-accent-hover text-white font-medium py-3 px-4 rounded-button transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  {isLogin ? 'Logging in...' : 'Signing up...'}
                </span>
              ) : isLogin ? (
                'Log In'
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Toggle between login and signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '' });
              }}
              className="text-accent-primary hover:text-accent-light transition-colors text-sm font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
