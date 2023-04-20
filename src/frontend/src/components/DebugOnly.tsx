import React, { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}
export const isDebugOn = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const DebugOnly: React.FC<Props> = ({ children }) => {
    if (isDebugOn) {
        return (
            <div >
                {children}
            </div>
        );
    }
    return null;
};

export default DebugOnly;
