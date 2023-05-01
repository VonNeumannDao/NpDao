import {Button, Link, Snackbar} from '@mui/material';
import React, { useState, useEffect } from 'react';
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";
import {useAppContext} from "./AppContext";

export default function AirdropButton() {
    const [isEntitled, setIsEntitled] = useState<boolean | null>(null);
    const [isClaiming, setIsClaiming] = useState<boolean>(false);
    const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false);
    const {reloadBalance} = useAppContext();
    const {principal} = useConnect();


    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const handleClaimAirdrop = async () => {
        setIsClaiming(true);
        const claim = await tokenActor.airdrop_claim();
        console.log(claim);
        await reloadBalance();
        setIsEntitled(false);
        setIsClaiming(false);
        setIsSnackbarOpen(true);
    };

    useEffect(() => {
        const checkEntitlement = async () => {
            const entitled = await tokenActor.airdrop_entitled(principal);
            console.log(entitled);
            setIsEntitled(entitled.length > 0 && entitled[0].claimed === false);
        };

        if (principal) {
            checkEntitlement();
        }
    }, [principal]);

    if (isEntitled === true) {
        return (
            <>
                <Link
                    component="button"
                    sx={{ marginLeft: 2 }}
                    disabled={isClaiming}
                    onClick={handleClaimAirdrop}
                >
                    {isClaiming ? 'Claiming airdrop...' : 'Claim airdrop'}
                </Link>
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
