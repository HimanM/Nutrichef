import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { EmeraldSpinner } from '../components/common/LoadingComponents.jsx';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineMail, HiOutlineHome, HiOutlineUserAdd, HiOutlineLogin } from 'react-icons/hi';

const EmailVerificationPage = () => {
    const { token } = useParams();
    const [verificationStatus, setVerificationStatus] = useState('pending');
    const [message, setMessage] = useState('');
    const effectRanOnThisMount = useRef(false);

    useEffect(() => {
        if (effectRanOnThisMount.current) {
            return;
        }
        effectRanOnThisMount.current = true;

        if (!token) {
            setVerificationStatus('error');
            setMessage('No verification token provided or token is invalid.');
            return;
        }

        const verifyToken = async () => {
            setVerificationStatus('pending');
            setMessage('');
            try {
                const response = await fetch(`/api/verify-email/${token}`);
                const responseData = await response.json();

                if (response.ok) {
                    setVerificationStatus('success');
                    setMessage(responseData.message || 'Email successfully verified! You can now log in.');
                } else {
                    setVerificationStatus('error');
                    setMessage(responseData.error || `Verification failed: ${response.statusText}`);
                }
            } catch (error) {
                console.error('Email Verification System Error:', error);
                setVerificationStatus('error');
                setMessage(`Verification failed due to a system error: ${error.message}`);
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="container-modern text-center max-w-md animate-fade-in">
                
                {/* Verification Status */}
                {verificationStatus === 'pending' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-6">
                        <div className="flex flex-col items-center">
                            <div className="mb-8">
                                <EmeraldSpinner size="h-20 w-20" />
                            </div>
                            <h1 className="text-3xl font-bold gradient-text mb-4">
                                Verifying Email
                            </h1>
                            <p className="text-lg text-gray-600 mb-8">
                                Please wait while we verify your email address...
                            </p>
                        </div>
                    </div>
                )}

                {verificationStatus === 'success' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-6">
                        <div className="flex flex-col items-center">
                            <div className="mb-8">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                    <HiOutlineCheckCircle className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-emerald-800 mb-4">
                                Welcome to NutriChef!
                            </h1>
                            <p className="text-lg text-emerald-700 mb-6 font-medium">
                                Your email has been successfully verified
                            </p>
                            <div className="bg-emerald-50 rounded-2xl p-4 mb-8 border border-emerald-100 max-w-sm mx-auto">
                                <p className="text-emerald-800 font-medium mb-2">🎉 You're all set!</p>
                                <p className="text-emerald-700 text-sm leading-relaxed">
                                    Start exploring our AI-powered recipe suggestions, ingredient classification, and personalized meal planning features. Your culinary journey begins now!
                                </p>
                            </div>
                            <div className="space-y-4 w-full">
                                <RouterLink
                                    to="/login"
                                    className="btn-primary w-full inline-flex items-center justify-center px-6 py-3 text-lg"
                                >
                                    <HiOutlineLogin className="w-5 h-5 mr-2" />
                                    Continue to Login
                                </RouterLink>
                                <RouterLink
                                    to="/"
                                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                >
                                    Explore Homepage
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                )}

                {verificationStatus === 'error' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-6">
                        <div className="flex flex-col items-center">
                            <div className="mb-8">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                    <HiOutlineXCircle className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-red-800 mb-4">
                                Verification Failed
                            </h1>
                            <div className="bg-red-50 rounded-2xl p-6 mb-8 border border-red-100">
                                <p className="text-red-800 font-medium mb-2">Unable to verify your email</p>
                                <p className="text-red-700 text-sm">
                                    {message}
                                </p>
                            </div>
                            <div className="space-y-4 w-full">
                                <RouterLink
                                    to="/register"
                                    className="btn-primary w-full inline-flex items-center justify-center px-6 py-3 text-lg"
                                >
                                    <HiOutlineUserAdd className="w-5 h-5 mr-2" />
                                    Try Registration Again
                                </RouterLink>
                                <RouterLink
                                    to="/"
                                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                >
                                    Go to Homepage
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="text-center text-gray-500 text-sm">
                    <p>
                        Having trouble? <RouterLink to="/contact-us" className="text-emerald-600 hover:text-emerald-700 font-medium">Contact our support team</RouterLink>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
