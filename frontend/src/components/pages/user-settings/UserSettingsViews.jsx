import React from 'react';
import UserSettingsMobileView from './UserSettingsMobileView.jsx';
import UserSettingsDesktopView from './UserSettingsDesktopView.jsx';

const UserSettingsViews = (props) => {
    return (
        <div className="max-w-6xl mx-auto">
            {/* Desktop Layout */}
            <UserSettingsDesktopView {...props} />
            
            {/* Mobile Layout */}
            <UserSettingsMobileView {...props} />
        </div>
    );
};

export default UserSettingsViews;
