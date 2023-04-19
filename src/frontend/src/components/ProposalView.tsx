import React from 'react';
import {Grid, Paper, Typography} from '@mui/material';
import {ProposalType, ProposalViewResponse} from '../declarations/icrc_1/icrc_1.did';
import {bigIntToDecimalPrettyString} from "../util/bigintutils";

interface ProposalViewProps {
    proposal: ProposalViewResponse;
}

function ProposalView({proposal}: ProposalViewProps) {
    const proposalTypeLabel = getProposalTypeLabel(proposal.proposalType);

    return (
        <Paper
            sx={{
                padding: '16px',
                margin: '16px',
                '@media (min-width: 600px)': {
                    margin: '32px',
                },
            }}
        >
            <div
                style={{
                    backgroundColor: '#f44336',
                    padding: '24px',
                }}
            >
                <Typography variant="h4"
                            sx={{
                                color: '#fff',
                            }}
                >
                    {proposal.title}
                </Typography>
            </div>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Typography sx={{fontWeight: 'bold'}}>Proposal ID:</Typography>
                    <Typography>{proposal.id.toString(10)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography sx={{fontWeight: 'bold'}}>Proposal Type:</Typography>
                    <Typography>{proposalTypeLabel}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography sx={{fontWeight: 'bold'}}>Description:</Typography>
                    <Typography>{proposal.description}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography sx={{fontWeight: 'bold'}}>Proposer:</Typography>
                    <Typography>{proposal.proposer.owner.toText()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography sx={{fontWeight: 'bold'}}>End Time:</Typography>
                    <Typography>{new Date(Number(proposal.endTime / 1000000n)).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography sx={{fontWeight: 'bold'}}>Amount:</Typography>
                    <Typography>{proposal.amount.length > 0 ? bigIntToDecimalPrettyString(proposal.amount[0]) : '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography sx={{fontWeight: 'bold'}}>Receiver:</Typography>
                    <Typography>{proposal.receiver.length > 0 ? proposal.receiver[0].owner.toText() : '-'}</Typography>
                </Grid>
            </Grid>
        </Paper>
    );

    function getProposalTypeLabel(proposalType: ProposalType) {
        switch (Object.keys(proposalType)[0]) {
            case 'installAppAction':
                return 'Install App Action';
            case 'treasuryAction':
                return 'Treasury Action';
            default:
                return '';
        }
    }
}

export default ProposalView;
