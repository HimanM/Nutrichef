import React from 'react';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineLockClosed, HiOutlinePlus } from 'react-icons/hi';
import { InlineSpinner } from '../../common/LoadingComponents.jsx';

const UserSettingsMobileView = ({
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
                                    placeholder="Enter your current password"
                                    disabled={isLoadingPassword}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-600 hover:text-amber-800 transition-colors duration-150"
                                    disabled={isLoadingPassword}
                                >
                                    {showCurrentPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
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
                                    placeholder="Enter your new password"
                                    disabled={isLoadingPassword}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600 hover:text-emerald-800 transition-colors duration-150"
                                    disabled={isLoadingPassword}
                                >
                                    {showNewPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
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
                                    placeholder="Confirm your new password"
                                    disabled={isLoadingPassword}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600 hover:text-emerald-800 transition-colors duration-150"
                                    disabled={isLoadingPassword}
                                >
                                    {showConfirmPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
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
    );
};

export default UserSettingsMobileView;
