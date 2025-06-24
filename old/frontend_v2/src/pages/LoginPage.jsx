import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LockOutlinedIcon = ({ className = "h-5 w-5 text-gray-400" }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const EmailOutlinedIcon = ({ className = "h-5 w-5 text-gray-400" }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 11.884l7.997-6M2 18h16a2 2 0 002-2V4a2 2 0 00-2-2H2a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LoginIcon = ({ className = "h-5 w-5 mr-2" }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;


export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, isAuthenticated, authError, authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        authLogin(data.token, data.user);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: `Login failed. Status: ${response.status}` };
        }
        setFormError(errorData.message || 'Invalid email or password.');
      }
    } catch (error) {
      console.error("Login API call error:", error);
      setFormError('An error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonInputDivClassName = "relative border border-gray-600 rounded-md px-3 py-2.5 shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500";
  const commonInputClassName = "block w-full border-0 p-0 bg-transparent text-white placeholder-gray-400 focus:ring-0 focus:outline-none sm:text-sm disabled:bg-gray-700";
  const commonIconClassName = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none";


  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="auth-page-card py-8 px-4 sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
            <div className="mx-auto h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                <LockOutlinedIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl">
              Sign in to your account
            </h2>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-700 border border-red-500 text-red-200 rounded-md text-sm">
              {authError}
            </div>
          )}

          {formError && (
            <div className="mb-4 p-3 bg-red-700 border border-red-500 text-red-200 rounded-md text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className={`${commonInputDivClassName} mt-1`}>
                 <div className={commonIconClassName}>
                    <EmailOutlinedIcon />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={authLoading || isSubmitting}
                  className={`${commonInputClassName} pl-10`}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
               <div className={`${commonInputDivClassName} mt-1`}>
                <div className={commonIconClassName}>
                    <LockOutlinedIcon />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authLoading || isSubmitting}
                  className={`${commonInputClassName} pl-10`}
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="gradient-button w-full flex justify-center disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LoginIcon className="h-5 w-5 mr-2 text-white" /> Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <RouterLink
                to="/register"
                className="font-medium hover:underline"
              >
                Don't have an account? Sign Up
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
