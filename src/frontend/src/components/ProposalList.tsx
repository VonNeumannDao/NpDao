import React, {useEffect, useState} from "react";
import {Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import {ProposalViewResponse, ProposalType, _SERVICE} from "../declarations/icrc_1/icrc_1.did";
import {useCanister} from "@connect2ic/react";
import {useNavigate} from "react-router-dom";

function ProposalList() {
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [proposals, setProposals] = useState<ProposalViewResponse[]>([]);

    useEffect(() => {
        init().then();
    }, []);
    async function init(){
        const proposals = await tokenActor.pastProposals();
        setProposals(proposals.reverse().filter(x => x.ended));
    }

    const renderProposalType = (proposalType: ProposalType) => {
        switch (proposalType) {
            case { installAppAction: null }:
                return "Install App";
            case { treasuryAction: null }:
                return "Treasury";
            default:
                return "";
        }
    };

    const renderExecutedIcon = (executed: boolean) => {
        return executed ? <VerifiedIcon color="success" /> : <CloseIcon color="error" />;
    };

    const navigate = useNavigate();

    const handleListItemClick = (url: string) => {
        navigate(url);
    };

    return (
        <Box sx={{ maxWidth: "100%" }}>
            <h2 style={{ textAlign: "center" }}>Past Proposals</h2>
            <List sx={{ bgcolor: "background.paper" }}>
                {proposals.map((proposal, index) => (
                    <ListItemButton key={index}
                                    onClick={() => handleListItemClick(`/proposals/${proposal.id}`)}
                    >
                        <ListItemText
                            primary={proposal.title}
                            secondary={`${new Date(Number(proposal.endTime.toString(10) ) / 1000000).toLocaleDateString()} - ${renderProposalType(
                                proposal.proposalType
                            )}`}
                        />
                        <ListItemIcon>{renderExecutedIcon(proposal.executed)}</ListItemIcon>
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}

export default ProposalList;
