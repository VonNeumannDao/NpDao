import { Button, Card, CardContent, CardHeader, TextField } from '@mui/material';
import React, { useState } from 'react';

interface CustodianActionsProps {
    tableTitle: string;
    addFunc: (principal: string) => Promise<any>;
    removeFunc: (principal: string) => Promise<any>;
}

export default function CustodianActions(props: CustodianActionsProps) {
    const [principal, setPrincipal] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddClick = async () => {
        setIsLoading(true);
        try {
            const resp = await props.addFunc(principal);
            console.log('addCustodian response:', resp);
            setIsLoading(false);
            setPrincipal('');
        } catch (error) {
            console.error('Error adding custodian:', error);
            setIsLoading(false);
        }
    };

    const handleRemoveClick = async () => {
        setIsLoading(true);
        try {
            const resp = await props.removeFunc(principal);
            console.log('removeCustodian response:', resp);
            setIsLoading(false);
            setPrincipal('');
        } catch (error) {
            console.error('Error removing custodian:', error);
            setIsLoading(false);
        }
    };

    return (
        <Card style={{ marginTop: '20px' }}>
            <CardHeader title={`${props.tableTitle} Custodians`} />
            <CardContent>
                <TextField
                    label="Principal ID"
                    variant="outlined"
                    value={principal}
                    onChange={(event) => setPrincipal(event.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <Button
                    variant="contained"
                    disabled={isLoading || !principal}
                    onClick={handleAddClick}
                    style={{ marginRight: '10px' }}
                >
                    {isLoading ? 'Adding...' : 'Add'}
                </Button>
                <Button
                    variant="contained"
                    disabled={isLoading || !principal}
                    onClick={handleRemoveClick}
                >
                    {isLoading ? 'Removing...' : 'Remove'}
                </Button>
            </CardContent>
        </Card>
    );
}
