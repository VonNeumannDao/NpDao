import React, {ReactNode} from 'react';

interface Props {
    children: ReactNode;
}
export const isDebugOn = !process.env.DFX_NETWORK|| process.env.DFX_NETWORK === 'local';

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
