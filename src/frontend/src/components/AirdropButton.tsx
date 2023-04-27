import { Button, Snackbar } from '@mui/material';
import React, { useState, useEffect } from 'react';
import {useCanister} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";
import {useAppContext} from "./AppContext";

export default function AirdropButton() {
    const [isEntitled, setIsEntitled] = useState<boolean | null>(null);
    const [isClaiming, setIsClaiming] = useState<boolean>(false);
    const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false);
    const {reloadBalance} = useAppContext();

    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const handleClaimAirdrop = async () => {
        setIsClaiming(true);
        await tokenActor.airdrop_claim();
        await reloadBalance();
        setIsClaiming(false);
        setIsSnackbarOpen(true);
    };

    useEffect(() => {
        const checkEntitlement = async () => {
            const entitled = await tokenActor.airdrop_entitled();
            setIsEntitled(entitled);
        };

        checkEntitlement();
    }, []);

    if (isEntitled === true) {
        return (
            <>
                <Button
                    variant="contained"
                    color="warning"
                    disabled={isClaiming}
                    onClick={handleClaimAirdrop}
                >
                    {isClaiming ? 'Claiming airdrop...' : 'Claim airdrop'}
                </Button>
                <Snackbar
                    open={isSnackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setIsSnackbarOpen(false)}
                    message="Airdrop claimed successfully!"
                />
            </>
        );
    }

    return null;
}
