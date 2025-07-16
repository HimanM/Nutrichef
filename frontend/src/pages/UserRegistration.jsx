import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowRight, HiOutlineSparkles, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const UserRegistration = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsError(false);

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            setIsError(true);
            setIsLoading(false);
            return;
        }

        const userData = { name, email, password };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const responseData = await response.json();
                setMessage(responseData.message || 'Registration successful! Please check your email to verify your account.');
                setIsError(false);
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                let errorMsg = 'Registration failed. Please try again.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorData.message || errorMsg;
                } catch (e) {
                    errorMsg = response.statusText || errorMsg;
                }
                setMessage(errorMsg);
                setIsError(true);
            }
        } catch (error) {
            console.error('Registration System Error:', error);
            setMessage(`Registration failed: ${error.message || "A network error occurred."}`);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-4 px-4 sm:py-8 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            <div className="w-full max-w-md mx-auto">
                <div className="card-glass py-6 px-4 sm:py-8 sm:px-8 animate-fade-in">
                    <div className="text-center mb-6">
                        <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                            <HiOutlineSparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            Join NutriChef
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                            Create your account and start your healthy journey
                        </p>
                    </div>

                    {message && (
                        <div className={`mb-4 p-3 rounded-xl text-sm animate-slide-in ${
                            isError 
                                ? 'bg-red-50 border border-red-200 text-red-700' 
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">{/* Reduced space */}
                        <div>
                            <label htmlFor="name" className="form-label">Full name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <HiOutlineUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    id="name" 
                                    name="name" 
                                    type="text" 
                                    autoComplete="name" 
                                    required 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    disabled={isLoading} 
                                    className="form-input pl-12 py-2.5" 
                                    placeholder="Your full name" 
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="form-label">Email address</label>
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
                                    disabled={isLoading} 
                                    className="form-input pl-12 py-2.5" 
                                    placeholder="you@example.com" 
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    id="password" 
                                    name="password" 
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password" 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    disabled={isLoading} 
                                    className="form-input pl-12 pr-12 py-2.5" 
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    onMouseDown={() => setShowPassword(true)}
                                    onMouseUp={() => setShowPassword(false)}
                                    onMouseLeave={() => setShowPassword(false)}
                                    onTouchStart={() => setShowPassword(true)}
                                    onTouchEnd={() => setShowPassword(false)}
                                    disabled={isLoading}
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
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    id="confirmPassword" 
                                    name="confirmPassword" 
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password" 
                                    required 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    disabled={isLoading} 
                                    className="form-input pl-12 pr-12 py-2.5" 
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    onMouseDown={() => setShowConfirmPassword(true)}
                                    onMouseUp={() => setShowConfirmPassword(false)}
                                    onMouseLeave={() => setShowConfirmPassword(false)}
                                    onTouchStart={() => setShowConfirmPassword(true)}
                                    onTouchEnd={() => setShowConfirmPassword(false)}
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? (
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
                                disabled={isLoading}
                                className="btn-primary w-full flex justify-center items-center py-2.5 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
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
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <RouterLink
                                to="/login"
                                className="btn-outline w-full py-2.5"
                            >
                                Sign in to your account
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRegistration;
