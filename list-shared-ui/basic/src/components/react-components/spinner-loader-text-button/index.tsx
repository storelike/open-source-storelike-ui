import React from 'react';

interface SpinnerLoaderTextButtonProps {
    loading: boolean;
    spinTitleText: string;
    titleText: string;
}

const SpinnerLoaderTextButton: React.FC<SpinnerLoaderTextButtonProps> = ({ loading, spinTitleText, titleText }) => {
    return (
        <>
            {loading ? (
                <>
                    <svg className="flex animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {spinTitleText}
                </>
            ) : (
                <> {titleText} </>
            )}
        </>
    );
}

export default SpinnerLoaderTextButton;
