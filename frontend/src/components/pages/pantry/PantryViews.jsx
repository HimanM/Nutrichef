import React from 'react';
import PantryMobileView from './PantryMobileView.jsx';
import PantryDesktopView from './PantryDesktopView.jsx';

const PantryViews = (props) => {
    return (
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Desktop Table View - Hidden on Mobile */}
            <PantryDesktopView {...props} />

            {/* Mobile Card View - Hidden on Desktop */}
            <PantryMobileView {...props} />
        </div>
    );
};

export default PantryViews;
