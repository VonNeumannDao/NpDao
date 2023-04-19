import React from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, styled} from "@mui/material";

interface ErrorDialogProps {
    open: boolean;
    onClose: () => void;
    message: string;
}

export default function ErrorDialog({open, onClose, message}: ErrorDialogProps) {
    const ErrorDialogTitle = styled(DialogTitle)`
      background-color: ${(props) => props.theme.palette.error.main};
      color: ${(props) => props.theme.palette.common.white};
    `;

    const ErrorDialogContent = styled(DialogContent)`
      color: ${(props) => props.theme.palette.error.main};
    `;
    return (
        <Dialog open={open} onClose={onClose}>
            <ErrorDialogTitle>Error</ErrorDialogTitle>
            <ErrorDialogContent>{message}</ErrorDialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
