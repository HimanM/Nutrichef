import React from 'react';
import ResponsiveTableMobileView from './ResponsiveTableMobileView.jsx';
import ResponsiveTableDesktopView from './ResponsiveTableDesktopView.jsx';

const ResponsiveTableViews = (props) => {
    return (
        <>
            {/* Desktop Table */}
            <ResponsiveTableDesktopView {...props} />

            {/* Mobile Card Layout */}
            <ResponsiveTableMobileView {...props} />
        </>
    );
};

export default ResponsiveTableViews;
