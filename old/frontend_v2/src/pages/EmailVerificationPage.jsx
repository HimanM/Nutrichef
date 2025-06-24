import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

const CheckCircleOutlineIcon = () => <svg className="h-16 w-16 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ErrorOutlineIcon = () => <svg className="h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-10 w-10 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

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
                await new Promise(resolve => setTimeout(resolve, 1500));
                let responseData;
                let responseOk;

                if (token === "valid_token") {
                    responseData = { message: 'Email successfully verified! You can now log in.' };
                    responseOk = true;
                } else if (token === "already_verified_token") {
                    responseData = { message: 'This email has already been verified. Please proceed to login.' };
                    responseOk = true;
                } else if (token === "expired_token") {
                    responseData = { error: 'Verification link has expired. Please request a new one.' };
                    responseOk = false;
                } else {
                    responseData = { error: 'Invalid or unrecognized verification token.' };
                    responseOk = false;
                }

                if (responseOk) {
                    setVerificationStatus('success');
                    setMessage(responseData.message || 'Email successfully verified! You can now log in.');
                } else {
                    setVerificationStatus('error');
                    setMessage(responseData.error || `Verification failed.`);
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
        <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="page-container text-center w-full max-w-md">
                <h1 className="mb-8">
                    Email Verification
                </h1>

                {verificationStatus === 'pending' && (
                    <div className="flex flex-col items-center">
                        <SpinnerIcon />
                        <p className="text-lg text-gray-300">Verifying your email, please wait...</p>
                    </div>
                )}

                {verificationStatus === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircleOutlineIcon />
                        <div className="w-full p-4 mb-4 text-sm text-green-200 bg-green-700 border border-green-500 rounded-lg">
                            {message}
                        </div>
                        <RouterLink
                            to="/login"
                            className="gradient-button w-full sm:w-auto inline-flex items-center justify-center"
                        >
                            Go to Login
                        </RouterLink>
                    </div>
                )}

                {verificationStatus === 'error' && (
                    <div className="flex flex-col items-center">
                        <ErrorOutlineIcon />
                        <div className="w-full p-4 mb-4 text-sm text-red-200 bg-red-700 border border-red-500 rounded-lg">
                            {message}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
                            <RouterLink
                                to="/register"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                            >
                                Try Registration Again
                            </RouterLink>
                             <RouterLink
                                to="/"
                                className="gradient-button w-full sm:w-auto inline-flex items-center justify-center"
                            >
                                Go to Homepage
                            </RouterLink>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailVerificationPage;
