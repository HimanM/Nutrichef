import React from 'react';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineLockClosed, HiOutlinePlus, HiOutlineUser } from 'react-icons/hi';
import { InlineSpinner } from '../../common/LoadingComponents.jsx';

const UserSettingsDesktopView = ({
    // User info props
    userName,
    userEmail,
    
    // Allergies props
    allAllergies,
    selectedAllergyIds,
    handleAllergySelectionChange,
    handleSaveAllergies,
    isLoadingAllergies,
    allergiesMessage,
    
    // Password props
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    handleChangePassword,
    isLoadingPassword,
    passwordMessage,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword
}) => {
    return (
        <div className="hidden md:block">
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* User Profile Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8">
                    <h2 className="text-xl font-semibold mb-6 text-emerald-700 flex items-center">
                        <HiOutlineUser className="w-5 h-5 mr-2" />
                        Profile Information
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-emerald-700">Username</label>
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
                                {userName || 'Not available'}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-emerald-700">Email Address</label>
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
                                {userEmail || 'Not available'}
                            </div>
                        </div>
                    </div>
                </div>
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
                    <form onSubmit={handleChangePassword}>
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
                                type="submit"
                                disabled={isLoadingPassword} 
                                className="btn-primary px-8 py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-200 hover:scale-105"
                            >
                                {isLoadingPassword ? <InlineSpinner /> : null} 
                                {isLoadingPassword ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </form>
                    
                    {passwordMessage.text && (
                        <div className={`mt-4 p-3 rounded-xl text-sm ${passwordMessage.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                            {passwordMessage.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSettingsDesktopView;
