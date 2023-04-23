import React, {useState} from 'react';
import {MenuItem, Modal, styled} from "@mui/material";


function ContentModal({trigger, children, disabled}) {
    const ModalWrapper = styled(Modal)({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    const PaperWrapper = styled('div')(({theme}) => ({
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        display: 'flex',
        flexDirection: 'column',
    }));

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <MenuItem disabled={disabled} onClick={handleOpen}>{trigger}</MenuItem>
            <ModalWrapper
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <PaperWrapper>
                    {children}
                </PaperWrapper>
            </ModalWrapper>
        </>
    );
}

export default ContentModal;
