import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { EmeraldSpinner } from '../components/common/LoadingComponents.jsx';
import { CheckCircleOutlineIcon } from '../utils/commonIcons.jsx';

const ErrorOutlineIcon = () => <svg className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

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
                <div className="card-glass p-8">
                    <h1 className="text-3xl font-bold mb-8 gradient-text">
                        Email Verification
                    </h1>

                    {verificationStatus === 'pending' && (
                        <div className="flex flex-col items-center">
                            <EmeraldSpinner size="h-10 w-10" className="mb-4" />
                            <p className="text-lg text-gray-600">Verifying your email, please wait...</p>
                        </div>
                    )}

                    {verificationStatus === 'success' && (
                        <div className="flex flex-col items-center">
                            <CheckCircleOutlineIcon />
                            <div className="w-full p-4 mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                                {message}
                            </div>
                            <RouterLink
                                to="/login"
                                className="btn-primary w-full sm:w-auto inline-flex items-center justify-center"
                            >
                                Go to Login
                            </RouterLink>
                        </div>
                    )}

                    {verificationStatus === 'error' && (
                        <div className="flex flex-col items-center">
                            <ErrorOutlineIcon />
                            <div className="w-full p-4 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                                {message}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
                                <RouterLink
                                    to="/register"
                                    className="btn-outline w-full sm:w-auto inline-flex items-center justify-center"
                                >
                                    Try Registration Again
                                </RouterLink>
                                 <RouterLink
                                    to="/"
                                    className="btn-primary w-full sm:w-auto inline-flex items-center justify-center"
                                >
                                    Go to Homepage
                                </RouterLink>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
