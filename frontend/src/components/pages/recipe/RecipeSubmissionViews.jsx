import React from 'react';
import RecipeSubmissionMobileView from './RecipeSubmissionMobileView.jsx';
import RecipeSubmissionDesktopView from './RecipeSubmissionDesktopView.jsx';

const RecipeSubmissionViews = (props) => {
    return (
        <div className="space-y-2">
            {/* Mobile Layout - Stacked */}
            <RecipeSubmissionMobileView {...props} />
            
            {/* Desktop Layout - Horizontal */}
            <RecipeSubmissionDesktopView {...props} />
        </div>
    );
};

export default RecipeSubmissionViews;
