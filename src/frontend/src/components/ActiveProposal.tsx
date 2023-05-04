import React from 'react';
import ProposalView from './ProposalView';
import {useCanister} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";
import {Avatar, Card, CardContent, CardHeader, Typography} from "@mui/material";
import Voting from "./Voting";
import EmptyProposalsCard from "./EmptyProposalsCard";
import {EmojiPeopleRounded} from "@mui/icons-material";
import {useAppContext} from "./AppContext";

export default function ActiveProposal() {
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const {activeProposals} = useAppContext();

    return (
        <>
            {activeProposals && activeProposals.length > 0 &&
            <Typography color={"white"} variant="subtitle1" component="div" >
                {activeProposals.length} Live Proposals
            </Typography>
            }
            {activeProposals && activeProposals.map(activeProposal => <div
                key={activeProposal.id.toString(10)}
            >
                <Card  sx={{ marginTop: 1 }}>
                <CardHeader
                        titleTypographyProps={{ variant: 'h4' }}
                        color={'secondary'}
                        avatar={
                            <Avatar>
                                <EmojiPeopleRounded />
                            </Avatar>
                        }
                        title="Active Proposal"
                    />
                    <CardContent>
                        <ProposalView proposal={activeProposal}/>
                        <Voting proposalId={activeProposal.id}/>
                    </CardContent>
                </Card>
            </div>)}
            {activeProposals && activeProposals.length === 0 && <EmptyProposalsCard/>}
        </>
    );
}
