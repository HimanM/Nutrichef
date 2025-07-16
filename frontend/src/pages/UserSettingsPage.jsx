import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { ButtonSpinner, InlineSpinner, PageLoaderSpinner } from '../components/common/LoadingComponents.jsx';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineLockClosed, HiOutlinePlus } from 'react-icons/hi';

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
            } catch (e) { 
                // Error parsing stored user data - continue with auth context
            }
        }
        if (!effectiveUserId && authContextUser) {
            effectiveUserId = String(authContextUser.UserID || authContextUser.id); userIdSource = 'AuthContext';
            resolvedUserName = authContextUser.Name || authContextUser.Email?.split('@')[0] || `User ID: ${effectiveUserId}`;
        }
        if (effectiveUserId) { 
            setUserId(effectiveUserId);
        } else {
            // UserID could not be determined
        }
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
                <div className="container-modern max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-8 animate-fade-in">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            <span className="gradient-text">Settings</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Manage your account preferences and dietary restrictions
                        </p>
                    </div>

                    {/* Content */}
                    <div className="max-w-6xl mx-auto">
                        {/* Desktop Layout */}
                        <div className="hidden md:block">
                            <div className="space-y-8 max-w-4xl mx-auto">
                                {/* Dietary Restrictions Section */}
                                <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8">
                                    <h2 className="text-xl font-semibold mb-6 text-emerald-700 flex items-center">
                                        <HiOutlinePlus className="w-5 h-5 mr-2" />
                                        Dietary Restrictions
                                    </h2>
                                    <form onSubmit={handleSaveAllergies}>
                                        {allAllergies.length > 0 && (
                                            <div className="space-y-4">
                                                <p className="text-sm text-gray-600">Select your dietary restrictions and allergies:</p>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                    {allAllergies.map((allergy) => (
                                                        <label key={allergy.id} className="flex items-center space-x-3 cursor-pointer hover:bg-emerald-50 p-3 rounded-lg transition-colors duration-150 border border-emerald-100">
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
                                            </div>
                                        )}
                                        
                                        <div className="mt-8 flex justify-end">
                                            <button 
                                                type="submit" 
                                                disabled={isLoadingAllergies} 
                                                className="btn-primary px-8 py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200 hover:scale-105"
                                            >
                                                {isLoadingAllergies ? <InlineSpinner /> : null} 
                                                {isLoadingAllergies ? "Saving..." : "Save Preferences"}
                                            </button>
                                        </div>
                                        
                                        {allergiesMessage.text && (
                                            <div className={`mt-4 p-3 rounded-xl text-sm ${allergiesMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                                {allergiesMessage.text}
                                            </div>
                                        )}
                                    </form>
                                </div>

                                {/* Password Section */}
                                <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8">
                                    <h2 className="text-xl font-semibold mb-6 text-emerald-700 flex items-center">
                                        <HiOutlineLockClosed className="w-5 h-5 mr-2" />
                                        Change Password
                                    </h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div>
                                            <label htmlFor="currentPassword" className="block text-sm font-medium text-emerald-700 mb-2">Current Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showCurrentPassword ? "text" : "password"} 
                                                    id="currentPassword" 
                                                    value={currentPassword} 
                                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                                    required 
                                                    className="block w-full px-3 py-3 pr-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 sm:text-sm disabled:bg-amber-100 disabled:opacity-75 transition-all duration-200 placeholder-amber-500" 
                                                    placeholder="Enter current password"
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
                                                        <HiOutlineEyeOff className="h-5 w-5 text-amber-500 hover:text-amber-700 transition-colors" />
                                                    ) : (
                                                        <HiOutlineEye className="h-5 w-5 text-amber-500 hover:text-amber-700 transition-colors" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-emerald-700 mb-2">New Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showNewPassword ? "text" : "password"} 
                                                    id="newPassword" 
                                                    value={newPassword} 
                                                    onChange={(e) => setNewPassword(e.target.value)} 
                                                    required 
                                                    className="block w-full px-3 py-3 pr-12 bg-white border border-emerald-200 text-emerald-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm disabled:bg-emerald-50 disabled:opacity-75 transition-all duration-200" 
                                                    placeholder="Enter new password"
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
                                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-emerald-700 mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showConfirmPassword ? "text" : "password"} 
                                                    id="confirmNewPassword" 
                                                    value={confirmNewPassword} 
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)} 
                                                    required 
                                                    className="block w-full px-3 py-3 pr-12 bg-white border border-emerald-200 text-emerald-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm disabled:bg-emerald-50 disabled:opacity-75 transition-all duration-200" 
                                                    placeholder="Confirm new password"
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
                                    </div>
                                    
                                    <div className="mt-8 flex justify-end">
                                        <button 
                                            onClick={handleChangePassword}
                                            disabled={isLoadingPassword} 
                                            className="btn-primary px-8 py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200 hover:scale-105"
                                        >
                                            {isLoadingPassword ? <InlineSpinner /> : null} 
                                            {isLoadingPassword ? "Updating..." : "Update Password"}
                                        </button>
                                    </div>
                                    
                                    {passwordMessage.text && (
                                        <div className={`mt-4 p-3 rounded-xl text-sm ${passwordMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                            {passwordMessage.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>                        {/* Mobile Layout */}
                        <div className="md:hidden">
                            <div className="space-y-6">
                                {/* Dietary Restrictions Section */}
                                <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
                                    <h2 className="text-lg font-semibold mb-4 text-emerald-700 flex items-center">
                                        <HiOutlinePlus className="w-5 h-5 mr-2" />
                                        Dietary Restrictions
                                    </h2>
                                    <form onSubmit={handleSaveAllergies} className="space-y-4">
                                        {allAllergies.length > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-sm text-gray-600">Select your dietary restrictions and allergies:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {allAllergies.map((allergy) => (
                                                        <label key={allergy.id} className="flex items-center space-x-2 cursor-pointer hover:bg-emerald-50 p-2 rounded-lg transition-colors duration-150 min-h-[40px] touch-manipulation border border-emerald-100">
                                                            <input
                                                                type="checkbox"
                                                                value={allergy.id}
                                                                checked={selectedAllergyIds.includes(allergy.id)}
                                                                onChange={() => handleAllergySelectionChange(allergy.id)}
                                                                className="form-checkbox h-4 w-4 text-emerald-500 border-emerald-300 rounded focus:ring-emerald-400 accent-emerald-500 flex-shrink-0"
                                                            />
                                                            <span className="text-xs text-emerald-700 leading-tight">{allergy.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <button 
                                            type="submit" 
                                            disabled={isLoadingAllergies} 
                                            className="w-full btn-primary px-6 py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200 min-h-[44px] touch-manipulation"
                                        >
                                            {isLoadingAllergies ? <InlineSpinner /> : null} 
                                            {isLoadingAllergies ? "Saving..." : "Save Preferences"}
                                        </button>
                                        
                                        {allergiesMessage.text && (
                                            <div className={`mt-3 p-3 rounded-xl text-sm ${allergiesMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                                {allergiesMessage.text}
                                            </div>
                                        )}
                                    </form>
                                </div>

                                {/* Password Section */}
                                <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
                                    <h2 className="text-lg font-semibold mb-4 text-emerald-700 flex items-center">
                                        <HiOutlineLockClosed className="w-5 h-5 mr-2" />
                                        Change Password
                                    </h2>
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div>
                                            <label htmlFor="currentPasswordMobile" className="block text-sm font-medium text-emerald-700 mb-2">Current Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showCurrentPassword ? "text" : "password"} 
                                                    id="currentPasswordMobile" 
                                                    value={currentPassword} 
                                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                                    required 
                                                    className="block w-full px-3 py-3 pr-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 sm:text-sm disabled:bg-amber-100 disabled:opacity-75 transition-all duration-200 placeholder-amber-500" 
                                                    placeholder="Enter current password"
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
                                                        <HiOutlineEyeOff className="h-5 w-5 text-amber-500 hover:text-amber-700 transition-colors" />
                                                    ) : (
                                                        <HiOutlineEye className="h-5 w-5 text-amber-500 hover:text-amber-700 transition-colors" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="newPasswordMobile" className="block text-sm font-medium text-emerald-700 mb-2">New Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showNewPassword ? "text" : "password"} 
                                                    id="newPasswordMobile" 
                                                    value={newPassword} 
                                                    onChange={(e) => setNewPassword(e.target.value)} 
                                                    required 
                                                    className="block w-full px-3 py-3 pr-12 bg-white border border-emerald-200 text-emerald-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm disabled:bg-emerald-50 disabled:opacity-75 transition-all duration-200" 
                                                    placeholder="Enter new password"
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
                                            <label htmlFor="confirmNewPasswordMobile" className="block text-sm font-medium text-emerald-700 mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showConfirmPassword ? "text" : "password"} 
                                                    id="confirmNewPasswordMobile" 
                                                    value={confirmNewPassword} 
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)} 
                                                    required 
                                                    className="block w-full px-3 py-3 pr-12 bg-white border border-emerald-200 text-emerald-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm disabled:bg-emerald-50 disabled:opacity-75 transition-all duration-200" 
                                                    placeholder="Confirm new password"
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

                                        <button 
                                            type="submit" 
                                            disabled={isLoadingPassword} 
                                            className="w-full btn-primary px-6 py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200 min-h-[44px] touch-manipulation"
                                        >
                                            {isLoadingPassword ? <InlineSpinner /> : null} 
                                            {isLoadingPassword ? "Updating..." : "Update Password"}
                                        </button>
                                        
                                        {passwordMessage.text && (
                                            <div className={`mt-3 p-3 rounded-xl text-sm ${passwordMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                                {passwordMessage.text}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettingsPage;
