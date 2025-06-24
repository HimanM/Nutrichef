import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const SpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const InlineSpinner = () => <svg className="animate-spin h-5 w-5 text-indigo-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const PageLoaderSpinner = () => <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const UserSettingsPage = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ text: '', type: 'info' });
    const [allAllergies, setAllAllergies] = useState([]);
    const [selectedAllergyIds, setSelectedAllergyIds] = useState([]);
    const [allergiesMessage, setAllergiesMessage] = useState({ text: '', type: 'info' });
    const [isLoadingAllergies, setIsLoadingAllergies] = useState(false);
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const auth = useAuth();
    const { currentUser: authContextUser, token, showExpiryMessageAndLogout, loading: authLoading } = auth;
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('User');
    const { showModal } = useModal();
    const navigate = useNavigate();

    useEffect(() => {
        let effectiveUserId = null; let userIdSource = 'default'; let resolvedUserName = 'User';
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const u = JSON.parse(storedUser);
                effectiveUserId = String(u.UserID || u.id); userIdSource = 'localStorage';
                resolvedUserName = u.Name || u.Email?.split('@')[0] || `User ID: ${effectiveUserId}`;
            } catch (e) { console.error('Failed to parse stored user:', e); }
        }
        if (!effectiveUserId && authContextUser) {
            effectiveUserId = String(authContextUser.UserID || authContextUser.id); userIdSource = 'AuthContext';
            resolvedUserName = authContextUser.Name || authContextUser.Email?.split('@')[0] || `User ID: ${effectiveUserId}`;
        }
        if (effectiveUserId) { setUserId(effectiveUserId); console.log(`UserID ${effectiveUserId} from ${userIdSource}`);}
        else console.warn('UserID could not be determined.');
        setUserName(resolvedUserName);
    }, [authContextUser]);

    const fetchAllData = useCallback(async () => {
        if (!userId || !token) return;
        setIsLoadingAllergies(true);
        setAllergiesMessage({ text: '', type: 'info' });
        try {
            const [allergiesResponse, userAllergiesResponse] = await Promise.all([
                authenticatedFetch('/api/allergies', { method: 'GET' }, auth),
                authenticatedFetch(`/api/users/${userId}/allergies`, { method: 'GET' }, auth)
            ]);

            if (allergiesResponse.ok) {
                const allergiesData = await allergiesResponse.json();
                setAllAllergies(allergiesData || []);
            } else {
                const errorData = await allergiesResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to load allergy options. Status: ${allergiesResponse.status}`);
            }

            if (userAllergiesResponse.ok) {
                const userAllergiesData = await userAllergiesResponse.json();
                setSelectedAllergyIds((userAllergiesData.allergies || []).map(a => a.id));
            } else {
                const errorData = await userAllergiesResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to load user allergies. Status: ${userAllergiesResponse.status}`);
            }
        } catch (error) {
            setAllergiesMessage({ type: 'error', text: error.message || 'An unexpected error occurred while fetching data.' });
        } finally {
            setIsLoadingAllergies(false);
        }
    }, [userId, token, auth]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleChangePassword = async (event) => {
        event.preventDefault();
        setPasswordMessage({ text: '', type: 'info' });
        if (!newPassword) { setPasswordMessage({ type: 'error', text: 'New password cannot be empty.' }); return; }
        if (newPassword !== confirmNewPassword) { setPasswordMessage({ type: 'error', text: 'New passwords do not match.' }); return; }

        setIsLoadingPassword(true);
        const payload = { currentPassword, newPassword, userID: userId };
        try {
            const response = await authenticatedFetch('/api/user/password', {
                method: 'PUT',
                body: JSON.stringify(payload),
            }, auth);
            const result = await response.json();
            if (response.ok) {
                setPasswordMessage({ type: 'success', text: result.message || 'Password changed successfully!' });
                setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
            } else {
                setPasswordMessage({ type: 'error', text: result.error || `Password change failed: ${response.status}` });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' });
        } finally {
            setIsLoadingPassword(false);
        }
    };

    const handleAllergySelectionChange = (allergyId) => {
        setSelectedAllergyIds(prev =>
            prev.includes(allergyId) ? prev.filter(id => id !== allergyId) : [...prev, allergyId]
        );
    };

    const handleSaveAllergies = async (event) => {
        event.preventDefault();
        setIsLoadingAllergies(true); setAllergiesMessage({ text: '', type: 'info' });
        const payload = { allergy_ids: selectedAllergyIds };
        try {
            const response = await authenticatedFetch(`/api/users/${userId}/allergies`, {
                method: 'POST',
                body: JSON.stringify(payload),
            }, auth);
            const result = await response.json();
            if (response.ok) {
                setAllergiesMessage({ type: 'success', text: result.message || 'Allergies updated successfully!' });
            } else {
                setAllergiesMessage({ type: 'error', text: result.error || `Failed to update allergies: ${response.status}` });
            }
        } catch (error) {
            setAllergiesMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' });
        } finally {
            setIsLoadingAllergies(false);
        }
    };

    if (authLoading || (!userId && !authContextUser)) {
      return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><PageLoaderSpinner /><p className="ml-2 text-gray-700">Loading user data...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            <div className="section-padding">
                <div className="container-modern">
                    {/* Header */}
                    <div className="text-center mb-12 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">User Settings</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Manage your account preferences, dietary restrictions, and personal information
                        </p>
                    </div>

                    <div className="bg-white/80 shadow-xl rounded-3xl p-8 border border-emerald-100 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Password Section */}
                            <div>
                                <h2 className="text-xl font-semibold border-b border-emerald-100 pb-3 mb-6 text-emerald-700">Change Password</h2>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-emerald-700">Current Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showCurrentPassword ? "text" : "password"} 
                                                id="currentPassword" 
                                                value={currentPassword} 
                                                onChange={(e) => setCurrentPassword(e.target.value)} 
                                                required 
                                                className="mt-1 block w-full px-3 py-2 pr-12 bg-white border border-emerald-100 text-emerald-700 rounded-md shadow-sm focus:outline-none focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm disabled:bg-emerald-50 disabled:opacity-75" 
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onMouseDown={() => setShowCurrentPassword(true)}
                                                onMouseUp={() => setShowCurrentPassword(false)}
                                                onMouseLeave={() => setShowCurrentPassword(false)}
                                                onTouchStart={() => setShowCurrentPassword(true)}
                                                onTouchEnd={() => setShowCurrentPassword(false)}
                                                disabled={isLoadingPassword}
                                            >
                                                {showCurrentPassword ? (
                                                    <HiOutlineEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                                ) : (
                                                    <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-emerald-700">New Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showNewPassword ? "text" : "password"} 
                                                id="newPassword" 
                                                value={newPassword} 
                                                onChange={(e) => setNewPassword(e.target.value)} 
                                                required 
                                                className="mt-1 block w-full px-3 py-2 pr-12 bg-white border border-emerald-100 text-emerald-700 rounded-md shadow-sm focus:outline-none focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm disabled:bg-emerald-50 disabled:opacity-75" 
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onMouseDown={() => setShowNewPassword(true)}
                                                onMouseUp={() => setShowNewPassword(false)}
                                                onMouseLeave={() => setShowNewPassword(false)}
                                                onTouchStart={() => setShowNewPassword(true)}
                                                onTouchEnd={() => setShowNewPassword(false)}
                                                disabled={isLoadingPassword}
                                            >
                                                {showNewPassword ? (
                                                    <HiOutlineEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                                ) : (
                                                    <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-emerald-700">Confirm New Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                id="confirmNewPassword" 
                                                value={confirmNewPassword} 
                                                onChange={(e) => setConfirmNewPassword(e.target.value)} 
                                                required 
                                                className="mt-1 block w-full px-3 py-2 pr-12 bg-white border border-emerald-100 text-emerald-700 rounded-md shadow-sm focus:outline-none focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm disabled:bg-emerald-50 disabled:opacity-75" 
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onMouseDown={() => setShowConfirmPassword(true)}
                                                onMouseUp={() => setShowConfirmPassword(false)}
                                                onMouseLeave={() => setShowConfirmPassword(false)}
                                                onTouchStart={() => setShowConfirmPassword(true)}
                                                onTouchEnd={() => setShowConfirmPassword(false)}
                                                disabled={isLoadingPassword}
                                            >
                                                {showConfirmPassword ? (
                                                    <HiOutlineEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                                ) : (
                                                    <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isLoadingPassword} className="btn-primary px-6 py-2 rounded-lg font-semibold shadow-md flex items-center gap-2 disabled:opacity-60">
                                        {isLoadingPassword ? <SpinnerIcon /> : null} {isLoadingPassword ? "Changing..." : "Change Password"}
                                    </button>
                                    {passwordMessage.text && (
                                        <div className={`mt-3 p-3 rounded-md text-sm ${passwordMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                            {passwordMessage.text}
                                        </div>
                                    )}
                                </form>
                            </div>
                            {/* Allergies Section */}
                            <div>
                                <h2 className="text-xl font-semibold border-b border-emerald-100 pb-3 mb-6 text-emerald-700">Allergies/Intolerances</h2>
                                <form onSubmit={handleSaveAllergies} className="space-y-4">
                                    {isLoadingAllergies && !allAllergies.length ? (
                                        <div className="flex items-center text-emerald-700"><InlineSpinner /> Loading available allergies...</div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-500 mb-2">Select any items you are allergic or intolerant to:</p>
                                            <div className="max-h-60 overflow-y-auto border border-emerald-100 rounded-md p-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 bg-white/60">
                                                {allAllergies.map(allergy => (
                                                    <label key={allergy.id} className="inline-flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            value={allergy.id}
                                                            checked={selectedAllergyIds.includes(allergy.id)}
                                                            onChange={() => handleAllergySelectionChange(allergy.id)}
                                                            className="form-checkbox h-4 w-4 text-emerald-500 border-emerald-300 rounded focus:ring-emerald-400 accent-emerald-500"
                                                        />
                                                        <span className="text-sm text-emerald-700">{allergy.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    <button type="submit" disabled={isLoadingAllergies} className="btn-primary px-6 py-2 rounded-lg font-semibold shadow-md flex items-center gap-2 disabled:opacity-60">
                                        {isLoadingAllergies ? <InlineSpinner /> : null} {isLoadingAllergies ? "Saving..." : "Save Allergies"}
                                    </button>
                                    {allergiesMessage.text && (
                                        <div className={`mt-3 p-3 rounded-md text-sm ${allergiesMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                            {allergiesMessage.text}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettingsPage;
