import React from 'react';

const SkeletonLoader = ({ width, height, borderRadius = '12px', className = '', style = {} }) => {
    return (
        <div
            className={`skeleton-pulse ${className}`}
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius,
                backgroundColor: '#e2e8f0',
                ...style
            }}
        >
            <style>{`
            .skeleton-pulse {
                animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `}</style>
        </div>
    );
};

export default SkeletonLoader;
