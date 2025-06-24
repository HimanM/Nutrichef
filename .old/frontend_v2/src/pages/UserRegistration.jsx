import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const PersonOutlineIcon = () => <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const EmailOutlinedIcon = () => <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 11.884l7.997-6M2 18h16a2 2 0 002-2V4a2 2 0 00-2-2H2a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LockOutlinedIcon = () => <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const PersonAddIcon = () => <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>;

const UserRegistration = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            const response = await fetch('/api/register', { // Real API call
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
                    // If response is not JSON or error field is missing, use status text or default
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

    const commonIconClassName = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none";
    const commonInputClassName = "block w-full border-0 p-0 bg-transparent text-white placeholder-gray-400 focus:ring-0 focus:outline-none sm:text-sm disabled:bg-gray-700 pl-10";
    const commonInputDivClassName = "mt-1 relative border border-gray-600 rounded-md px-3 py-2.5 shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500";


    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="auth-page-card py-8 px-4 sm:px-10">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
                        <h2 className="mt-6 text-3xl">
                            Create your account
                        </h2>
                    </div>

                    {message && (
                        <div className={`mb-4 p-3 rounded-md text-sm ${isError ? 'bg-red-700 border border-red-500 text-red-200' : 'bg-green-700 border border-green-500 text-green-200'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full name</label>
                            <div className={commonInputDivClassName}>
                                <div className={commonIconClassName}><PersonOutlineIcon /></div>
                                <input id="name" name="name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} className={commonInputClassName} placeholder="Your Name" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email address</label>
                            <div className={commonInputDivClassName}>
                                <div className={commonIconClassName}><EmailOutlinedIcon /></div>
                                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className={commonInputClassName} placeholder="you@example.com" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                            <div className={commonInputDivClassName}>
                                <div className={commonIconClassName}><LockOutlinedIcon /></div>
                                <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className={commonInputClassName} placeholder="Password"/>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirm Password</label>
                            <div className={commonInputDivClassName}>
                                <div className={commonIconClassName}><LockOutlinedIcon /></div>
                                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className={commonInputClassName} placeholder="Confirm Password"/>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="gradient-button w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-md shadow-sm disabled:opacity-75"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                     <PersonAddIcon /> Register
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <RouterLink
                            to="/login"
                            className="font-medium hover:underline"
                        >
                            Already have an account? Sign In
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRegistration;
