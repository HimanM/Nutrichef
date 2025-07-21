import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { HiOutlineLockClosed, HiOutlineMail, HiOutlineArrowRight, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, isAuthenticated, authError, authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailNotVerified, setShowEmailNotVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setShowEmailNotVerified(false);
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
          errorData = { error: `Login failed. Status: ${response.status}` };
        }
        
        // Check if it's the specific email not verified error
        if (errorData.error && errorData.error.includes("Email not verified")) {
          setShowEmailNotVerified(true);
          setFormError(errorData.error);
        } else {
          setFormError(errorData.error || 'Invalid email or password.');
        }
      }
    } catch (error) {
      console.error("Login API call error:", error);
      setFormError('An error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-4 px-4 sm:py-8 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="w-full max-w-md mx-auto">
        <div className="card-glass py-6 px-4 sm:py-8 sm:px-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-transparent rounded-2xl flex items-center justify-center shadow-lg mb-3">
              <div className="nutrichef-logo nutrichef-logo-full-sm sm:nutrichef-logo-full-lg"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Welcome back
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Sign in to your NutriChef account
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-slide-in">
              {authError}
            </div>
          )}

          {formError && !showEmailNotVerified && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-slide-in">
              {formError}
            </div>
          )}

          {showEmailNotVerified && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm animate-slide-in">
              <div className="mb-2">
                <p className="font-medium">{formError}</p>
              </div>
              <div className="flex flex-col gap-2">
                <RouterLink
                  to="/register"
                  className="btn-primary text-sm px-3 py-2 text-center"
                >
                  Register Again
                </RouterLink>
                <button
                  onClick={() => {
                    setShowEmailNotVerified(false);
                    setFormError('');
                  }}
                  className="btn-outline text-sm px-3 py-2"
                >
                  Try Different Email
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">{/* Reduced space */}
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlineMail className="h-5 w-5 text-gray-400" />
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
                  className="form-input pl-12 py-2.5"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authLoading || isSubmitting}
                  className="form-input pl-12 pr-12 py-2.5"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  disabled={authLoading || isSubmitting}
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="btn-primary w-full flex justify-center items-center py-2.5 disabled:opacity-75 disabled:cursor-not-allowed"
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
                    Sign In
                    <HiOutlineArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  New to NutriChef?
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <RouterLink
                to="/register"
                className="btn-outline w-full py-2.5"
              >
                Create an account
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
