import {Box, Grid, LinearProgress, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE, VoteStatus} from "../declarations/token/token.did";
import {useAppContext} from "./AppContext";
import {Principal} from "@dfinity/principal";
import LoadingButton from "@mui/lab/LoadingButton";

interface VotingProps {
    proposalId: bigint;
}

function Voting({proposalId}: VotingProps) {
    const [yesVotesPercent, setYesVotesPercent] = useState(0);
    const [noVotesPercent, setNoVotesPercent] = useState(0);
    const [votingPower, setVotingPower] = useState(0n);
    const [loadingButton, setLoadingButton] = useState(false);
    const [disableVoting, setDisableVoting] = useState(false);
    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [voteStatus, setVoteStatus] = useState<VoteStatus>();
    const {setBalanceVal, balancePretty, balance, activeProposal} = useAppContext();
    const {principal} = useConnect();
    const {reloadActiveProposal} = useAppContext();

    useEffect(() => {
        init().then();
    }, [balancePretty, principal]);

    function voteCheck() {
        const voted = activeProposal.voters.find(x => x.voter === principal);
        console.log(voted);
        if (voted) {
            setDisableVoting(true);
        }

    }

    async function init() {
        const voteStatus = await tokenActor.voteStatus();
        const totalStaked = await tokenActor.getTotalStaked(principal);
        setVotingPower(totalStaked);
        setVoteStatus(voteStatus["Ok"]);
        const vs = voteStatus["Ok"] as VoteStatus;
        setYesVotesPercent(percentCalc(vs.voteYes, vs.voteYes + vs.voteNo));
        setNoVotesPercent(percentCalc(vs.voteNo, vs.voteYes + vs.voteNo));
        await reloadActiveProposal();
        voteCheck();
    }

    function percentCalc(voteCount: bigint, totalVotes: bigint): number {
        if (totalVotes === 0n) {
            return 0;
        }

        const percentage = (voteCount * 100n) / totalVotes;
        return Math.floor(Number(percentage));
    }

    async function onVote(voteDirection: boolean) {
        setLoadingButton(true);
        const result = await tokenActor.vote({
            owner: Principal.fromText(principal),
            subaccount: []
        }, proposalId, voteDirection);

        await init();
        setDisableVoting(true);
        setLoadingButton(false);
    }

    return (
        <Box
            sx={{
                marginTop: "20px",
                marginBottom: "2"
            }}
        >
            <Grid container spacing={3} alignItems="center">
                {votingPower > 0 ? (
                    <>
                        <Grid item xs={6} md={6}>
                            <LoadingButton disabled={disableVoting} loading={loadingButton} fullWidth variant="contained"
                                           onClick={() => onVote(true)}>
                                Yey
                            </LoadingButton>
                        </Grid>
                        <Grid item xs={6} md={6}>
                            <LoadingButton disabled={disableVoting} loading={loadingButton} fullWidth variant="contained" color="error"
                                           onClick={() => onVote(false)}>
                                Nay
                            </LoadingButton>
                        </Grid>
                        <Grid item xs={12}>
                            <LinearProgress
                                variant="determinate"
                                value={yesVotesPercent}
                                color="success"
                                sx={{
                                    background: `linear-gradient(to right, #28a745 ${yesVotesPercent}%, #dc3545 ${noVotesPercent}%)`,
                                    height: 15, // set the height to make it thicker
                                    borderRadius: 10, // set the border radius to make the ends rounded
                                }}
                            />
                        </Grid>
                    </>
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1, textAlign: "center"}}>
                            You need to stake some tokens to vote.
                        </Typography>
                    </Grid>)
                }
            </Grid>
        </Box>
    );
}

export default Voting;
