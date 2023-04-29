import { Button, Card, CardContent, CardHeader, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useCanister } from "@connect2ic/react";
import { _SERVICE } from "../declarations/token/token.did";

export default function CustodianActions() {
    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [principal, setPrincipal] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddCustodianClick = async () => {
        setIsLoading(true);
        try {
            const resp = await tokenActor.addCustodian([principal]);
            console.log('addCustodian response:', resp);
            setIsLoading(false);
            setPrincipal('');
        } catch (error) {
            console.error('Error adding custodian:', error);
            setIsLoading(false);
        }
    };

    const handleRemoveCustodianClick = async () => {
        setIsLoading(true);
        try {
            const resp = await tokenActor.removeCustodian([principal]);
            console.log('addCustodian response:', resp);
            setIsLoading(false);
            setPrincipal('');
        } catch (error) {
            console.error('Error removing custodian:', error);
            setIsLoading(false);
        }
    };

    return (
        <Card style={{ marginTop: '20px' }}>
            <CardHeader title="Custodian Actions" />
            <CardContent>
                <TextField
                    label="Principal ID"
                    variant="outlined"
                    value={principal}
                    onChange={(event) => setPrincipal(event.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <Button variant="contained" disabled={isLoading || !principal} onClick={handleAddCustodianClick} style={{ marginRight: '10px' }}>
                    {isLoading ? 'Adding...' : 'Add'}
                </Button>
                <Button variant="contained" disabled={isLoading || !principal} onClick={handleRemoveCustodianClick}>
                    {isLoading ? 'Removing...' : 'Remove'}
                </Button>
            </CardContent>
        </Card>
    );
}
