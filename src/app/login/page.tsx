'use client';

import { useState, useEffect } from 'react';
import logo from '@/assets/PROVEN-LOGO-1.png';
import Image from 'next/image';
import Link from 'next/link';
import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  signInWithGoogle,
  resetPassword
} from '@/lib/firebaseService';
import { useRouter } from 'next/navigation';
import {
  BellAlertIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserCircleIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Animation states
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const resetFormStates = () => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (showForgotPassword) {
        // Handle password reset
        const result = await resetPassword(email);
        if (result.success) {
          setSuccess('Password reset email sent. Please check your inbox.');
        } else {
          setError('Failed to send reset email. Please try again.');
        }
      } else if (isLogin) {
        // Handle login
        const result = await loginWithEmailAndPassword(email, password);
        if (result.success) {
          router.push('/dashboard');
        } else {
          setError('Invalid email or password. Please try again.');
        }
      } else {
        // Handle registration
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const result = await registerWithEmailAndPassword(email, password, displayName);
        if (result.success) {
          setSuccess('Account created successfully! You can now log in.');
          setIsLogin(true);
        } else {
          setError('Registration failed. This email might already be in use.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        router.push('/');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error(err);
    } finally {
    }
  };

  const switchMode = (mode: 'login' | 'register' | 'reset') => {
    setAnimate(false);
    setTimeout(() => {
      if (mode === 'login') {
        setIsLogin(true);
        setShowForgotPassword(false);
      } else if (mode === 'register') {
        setIsLogin(false);
        setShowForgotPassword(false);
      } else {
        setShowForgotPassword(true);
      }
      resetFormStates();
      setAnimate(true);
    }, 200);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-sky-500 to-sky-600 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-pattern opacity-10"></div>

        {/* Content container with white background for logo */}
        <div className="z-20 text-center">
          <div className="bg-white rounded-xl p-4 inline-block mb-8 shadow-lg">
            <Link href="/">
              <Image
                src={logo}
                alt="Proven Accountants"
                className="h-16 w-auto"
              />
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6">Welcome to Proven Accountants</h1>
          <p className="text-white/90 text-lg mx-auto mb-8">
            Boutique firm tailoring services to suit your business needs. Professional, qualified & experienced accountants.
          </p>

          {/* Service highlights with improved design */}
          <div className="space-y-2 max-w-lg mx-auto">
            <div className="flex items-center space-x-4 p-2 transform transition-all hover:translate-x-1">
              <DocumentTextIcon className="h-6 w-6 text-white" />
              <div className="text-left">
                <h3 className="font-bold text-white text-lg">Business Structure</h3>
                <p className="text-white/90">Tailored advice on optimal business structures to enhance efficiency and compliance.</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-2 transform transition-all hover:translate-x-1">
              <CalculatorIcon className="h-6 w-6 text-white" />
              <div className="text-left">
                <h3 className="font-bold text-white text-lg">Accounting Services</h3>
                <p className="text-white/90">Comprehensive bookkeeping and financial reporting services tailored to your needs.</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-2 transform transition-all hover:translate-x-1">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
              <div className="text-left">
                <h3 className="font-bold text-white text-lg">Tax Compliance</h3>
                <p className="text-white/90">Expert assistance with BAS, IAS, and tax return services to ensure compliance.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 max-w-md mx-auto flex items-center justify-center space-x-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center text-white">
              <PhoneIcon className="h-5 w-5 mr-2" />
              <a href='tel:+6 1300 811 002'>1300 811 002</a>
            </div>
            <div className="flex items-center text-white">
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              <a href='mailto:info@provenaccountants.com.au'>info@provenaccountants.com.au</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-6 overflow-y-auto h-screen">
        <div
          className={`w-full max-w-md transition-all duration-500 ease-in-out transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            } py-8`}
        >
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="flex justify-center lg:hidden mb-6">
              <div className="bg-white rounded-xl p-3 inline-block shadow-md">
                <Link href="/">
                  <Image
                    src={logo}
                    alt="Proven Accountants"
                    className="h-10 w-auto"
                  />
                </Link>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {showForgotPassword
                ? 'Reset Password'
                : isLogin
                  ? 'Sign in to your account'
                  : 'Create your account'}
            </h2>

            <p className="text-center text-gray-600">
              {showForgotPassword
                ? 'Enter your email to receive a password reset link'
                : isLogin
                  ? 'Access your Proven Accountants dashboard'
                  : 'Join Proven Accountants today'}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <BellAlertIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && !showForgotPassword && (
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-2.5 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-2.5 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {!showForgotPassword && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-sm font-medium text-sky-600 hover:text-sky-500"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-2.5 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm"
                      placeholder={isLogin ? "Your password" : "Create a password"}
                    />
                  </div>
                </div>
              )}

              {!isLogin && !showForgotPassword && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-2.5 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    showForgotPassword
                      ? 'Send Reset Link'
                      : isLogin
                        ? 'Sign in'
                        : 'Create account'
                  )}
                </button>
              </div>
            </form>

            {!showForgotPassword && (
              <>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                      >
                        <path
                          fill="#4285F4"
                          d="M24 9.5c3.5 0 5.9 1.5 7.3 2.7l5.4-5.4C33.9 3.5 29.4 1.5 24 1.5 14.8 1.5 7.2 7.9 4.6 16.1l6.7 5.2C12.5 14.1 17.7 9.5 24 9.5z"
                        />
                        <path
                          fill="#34A853"
                          d="M46.1 24.5c0-1.5-.1-2.6-.4-3.7H24v7.1h12.5c-.3 2-1.7 5-5 7l7.7 5.9c4.5-4.1 7-10 7-16.3z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M11.3 28.3c-.5-1.3-.8-2.6-.8-4 0-1.4.3-2.8.8-4l-6.7-5.2c-1.4 2.8-2.2 6-2.2 9.2 0 3.3.8 6.4 2.2 9.2l6.7-5.2z"
                        />
                        <path
                          fill="#EA4335"
                          d="M24 46.5c6.3 0 11.6-2.1 15.5-5.8l-7.7-5.9c-2.1 1.4-5 2.3-7.8 2.3-6 0-11.1-4.1-12.9-9.6l-6.7 5.2c3.2 6.4 9.7 10.8 17.6 10.8z"
                        />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
                    <div className="flex items-start">
                      <BuildingOfficeIcon className="h-5 w-5 text-sky-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Why choose Proven Accountants?</h3>
                        <ul className="mt-2 text-xs text-gray-600 space-y-1">
                          <li className="flex items-center">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-500 mr-2"></span>
                            Over 14 years of experience in accounting & tax advice
                          </li>
                          <li className="flex items-center">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-500 mr-2"></span>
                            Young, enthusiastic team of advisors
                          </li>
                          <li className="flex items-center">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-500 mr-2"></span>
                            Professional financial specialists
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => switchMode(isLogin ? 'register' : 'login')}
                    className="font-medium text-sky-600 hover:text-sky-500"
                  >
                    {isLogin ? 'Sign up now' : 'Sign in'}
                  </button>
                </p>
              </>
            )}

            {showForgotPassword && (
              <p className="mt-8 text-center text-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-medium text-sky-600 hover:text-sky-500"
                >
                  Back to sign in
                </button>
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-sky-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-sky-600 hover:underline">
              Privacy Policy
            </Link>
          </p>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              ABN: 31623798827 | Liability limited by a scheme approved under professional standards legislation
            </p>
            <p className="text-xs text-gray-500 mt-1">
              © 2015 - {new Date().getFullYear()} by Provens, All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;