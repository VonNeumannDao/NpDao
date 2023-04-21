import React, {useEffect, useState} from "react";
import {Avatar, Box, Card, CardHeader, List, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import {_SERVICE, ProposalType, ProposalViewResponse} from "../declarations/icrc_1/icrc_1.did";
import {useCanister} from "@connect2ic/react";
import {useNavigate} from "react-router-dom";
import {DescriptionRounded, Error, SentimentVeryDissatisfiedOutlined} from "@mui/icons-material";

function ProposalList() {
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [proposals, setProposals] = useState<ProposalViewResponse[]>([]);

    useEffect(() => {
        init().then();
    }, []);

    async function init() {
        const proposals = await tokenActor.pastProposals();
        setProposals(proposals.reverse().filter(x => x.ended));
    }

    const renderProposalType = (proposalType: ProposalType) => {
        switch (proposalType) {
            case {installAppAction: null}:
                return "Install App";
            case {treasuryAction: null}:
                return "Treasury";
            case {deleteAppAction: null}:
                return "Delete App";
            default:
                return "";
        }
    };

    const renderExecutedIcon = (executed: boolean) => {
        return executed ? <VerifiedIcon color="success"/> : <CloseIcon color="error"/>;
    };

    const navigate = useNavigate();

    const handleListItemClick = (url: string) => {
        navigate(url);
    };

    return (
        <Card sx={{ marginTop: 2, marginLeft: "auto", marginRight: "auto"  }}>
            <CardHeader
                titleTypographyProps={{ variant: 'h4' }}
                color={'secondary'}
                avatar={
                    <Avatar>
                        <DescriptionRounded />
                    </Avatar>
                }
                title="Past Proposals"
            />
                {proposals && proposals.length > 0 && (
                    <List>
                        {proposals.map((proposal, index) => (
                            <ListItemButton
                                key={index}
                                onClick={() => handleListItemClick(`/proposals/${proposal.id}`)}
                            >
                                <ListItemText
                                    primary={proposal.title}
                                    secondary={`${new Date(Number(proposal.endTime.toString(10)) / 1000000).toLocaleDateString()} - ${renderProposalType(
                                        proposal.proposalType
                                    )}`}
                                />
                                <ListItemIcon>{renderExecutedIcon(proposal.executed)}</ListItemIcon>
                                {proposal.error.length > 0 && <ListItemIcon><Error color="error" /></ListItemIcon>}
                            </ListItemButton>
                        ))}
                    </List>
                )}
        </Card>

    );
}

export default ProposalList;
