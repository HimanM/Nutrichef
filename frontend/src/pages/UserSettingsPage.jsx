import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { authenticatedFetch } from '../utils/apiUtil.js';
import { PageLoaderSpinner } from '../components/common/LoadingComponents.jsx';
import UserSettingsViews from '../components/pages/user-settings/UserSettingsViews.jsx';

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
    const { currentUser: authContextUser, token, loading: authLoading } = auth;
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('User');
    const [userEmail, setUserEmail] = useState('');
    const { showModal } = useModal();

    useEffect(() => {
        let effectiveUserId = null; let resolvedUserName = 'User'; let resolvedUserEmail = '';
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const u = JSON.parse(storedUser);
                effectiveUserId = String(u.UserID || u.id);
                resolvedUserName = u.Name || u.Email?.split('@')[0] || `User ID: ${effectiveUserId}`;
                resolvedUserEmail = u.Email || '';
            } catch (e) { 
                console.error("Error parsing stored user data:", e);
                // Continue with auth context
            }
        }
        if (!effectiveUserId && authContextUser) {
            effectiveUserId = String(authContextUser.UserID || authContextUser.id);
            resolvedUserName = authContextUser.Name || authContextUser.Email?.split('@')[0] || `User ID: ${effectiveUserId}`;
            resolvedUserEmail = authContextUser.Email || '';
        }
        if (effectiveUserId) { 
            setUserId(effectiveUserId);
        } else {
            console.error('Error: UserID could not be determined. Falling back to default user settings.');
            showModal('Error', 'We could not determine your user information. Some features may not work as expected.');
        }
        setUserName(resolvedUserName);
        setUserEmail(resolvedUserEmail);
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
                    <UserSettingsViews 
                        // User info props
                        userName={userName}
                        userEmail={userEmail}
                        
                        // Allergies props
                        allAllergies={allAllergies}
                        selectedAllergyIds={selectedAllergyIds}
                        handleAllergySelectionChange={handleAllergySelectionChange}
                        handleSaveAllergies={handleSaveAllergies}
                        isLoadingAllergies={isLoadingAllergies}
                        allergiesMessage={allergiesMessage}
                        
                        // Password props
                        currentPassword={currentPassword}
                        setCurrentPassword={setCurrentPassword}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        confirmNewPassword={confirmNewPassword}
                        setConfirmNewPassword={setConfirmNewPassword}
                        handleChangePassword={handleChangePassword}
                        isLoadingPassword={isLoadingPassword}
                        passwordMessage={passwordMessage}
                        showCurrentPassword={showCurrentPassword}
                        setShowCurrentPassword={setShowCurrentPassword}
                        showNewPassword={showNewPassword}
                        setShowNewPassword={setShowNewPassword}
                        showConfirmPassword={showConfirmPassword}
                        setShowConfirmPassword={setShowConfirmPassword}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserSettingsPage;
