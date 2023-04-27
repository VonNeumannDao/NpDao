import {Button, Card, CardContent, CardHeader, CircularProgress} from '@mui/material';
import React, { useState, useEffect } from 'react';
import {useCanister} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";

export default function TokenSnapshotButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [timerId, setTimerId] = useState<number | null>(null);
    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;

    useEffect(() => {
        console.log('init');
        init().then();
    }, []);

    async function init() {
        const snapshotStatus = await tokenActor.airdrop_snapshot_status();
        console.log(snapshotStatus);
        if (snapshotStatus !== 'complete') {
            await checkSnapshotStatus();
            setTimerId(window.setInterval(checkSnapshotStatus, 30000)); // Start the polling timer
        }
    }
    const handleSnapshotClick = async () => {
        setIsLoading(true);
        // Call the snapshot_token function here
        try {
            await tokenActor.airdrop_snapshot();
            await checkSnapshotStatus();
            setTimerId(window.setInterval(checkSnapshotStatus, 30000)); // Start the polling timer
        } catch (error) {
            console.error('Error taking snapshot:', error);
            setIsLoading(false);
        }
    };

    const checkSnapshotStatus = async () => {
        const snapshotStatus = await tokenActor.airdrop_snapshot_status();
        console.log(snapshotStatus);
        setStatus(snapshotStatus);
        if (snapshotStatus === 'complete') {
            setIsComplete(true);
            clearInterval(timerId!); // Stop the polling timer
        }
    };

    useEffect(() => {
        return () => {
            clearInterval(timerId!); // Clean up the polling timer on unmount
        };
    }, [timerId]);

    return (
        <Card style={{ marginTop: '20px' }}>
            <CardHeader title="Token Snapshot" />
            <CardContent>
                <Button variant="contained" disabled={isLoading || isComplete} onClick={handleSnapshotClick}>
                    {isLoading ? 'Taking snapshot...' : isComplete ? 'Snapshot taken!' : 'Take snapshot'}
                </Button>
                {isLoading && <CircularProgress />}
                {!isComplete && <div style={{ color: status === 'complete' ? 'green' : 'red', marginTop: '10px' }}>Snapshot status: {status}</div>}
            </CardContent>
        </Card>
    );
}
