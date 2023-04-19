import {Box, Grid, LinearProgress, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE, VoteStatus} from "../declarations/icrc_1/icrc_1.did";
import {useAppContext} from "./AppContext";
import {Principal} from "@dfinity/principal";
import {bigIntToDecimalPrettyString, convertToBigInt} from "../util/bigintutils";
import LoadingButton from "@mui/lab/LoadingButton";

interface VotingProps {
    proposalId: bigint;
}

function Voting({proposalId}: VotingProps) {
    const [yesVotes, setYesVotes] = useState(0n);
    const [noVotes, setNoVotes] = useState(0n);

    const [yesVotesPercent, setYesVotesPercent] = useState(0);
    const [noVotesPercent, setNoVotesPercent] = useState(0);
    const [loadingButton, setLoadingButton] = useState(false);
    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [voteStatus, setVoteStatus] = useState<VoteStatus>();
    const [voteAmount, setVoteAmount] = useState<string>("");
    const {setBalanceVal, balancePretty, balance} = useAppContext();
    const {principal} = useConnect();

    useEffect(() => {
        init().then();
    }, [balancePretty]);

    async function init() {
        const voteStatus = await tokenActor.voteStatus();
        setVoteStatus(voteStatus["Ok"]);
        const vs = voteStatus["Ok"] as VoteStatus;
        setYesVotes(vs.voteYes);
        setNoVotes(vs.voteNo);
        setYesVotesPercent(percentCalc(vs.voteYes, vs.voteYes + vs.voteNo));
        setNoVotesPercent(percentCalc(vs.voteNo, vs.voteYes + vs.voteNo));
    }

    function percentCalc(voteCount: bigint, totalVotes: bigint): number {
        if (totalVotes === 0n) {
            return 0;
        }

        const percentage = (voteCount * 100n) / totalVotes;
        return Math.floor(Number(percentage));
    }

    const handleVoteAmountChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value.trim();
        setVoteAmount(value);
    };

    async function onVote(voteDirection: boolean) {
        setLoadingButton(true);
        await tokenActor.vote({
            owner: Principal.fromText(principal),
            subaccount: []
        }, proposalId, convertToBigInt(voteAmount), voteDirection);

        const balance = await tokenActor.icrc1_balance_of({
            owner: Principal.fromText(principal),
            subaccount: []
        });
        setBalanceVal(balance);
        init().then();
        setLoadingButton(false);
    }

    return (
        <Box
            sx={{
                paddingLeft: "4px",
                marginLeft: "4px",
                paddingRight: "4px",
                marginRight: "4px",
            }}
        >
            <Grid container spacing={3} alignItems="center">
                <Grid item xs={12}>
                    <TextField
                        label="Number of votes"
                        variant="outlined"
                        value={voteAmount}
                        onChange={handleVoteAmountChange}
                        type="number"
                        inputProps={{max: Number(balancePretty), min: 0, step: 0.00000001}}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={6} md={6}>
                    <LoadingButton loading={loadingButton} fullWidth variant="contained" onClick={() => onVote(true)}>
                        Yes ({bigIntToDecimalPrettyString(yesVotes)})
                    </LoadingButton>
                </Grid>
                <Grid item xs={6} md={6}>
                    <LoadingButton loading={loadingButton} fullWidth variant="contained" color="error"
                                   onClick={() => onVote(false)}>
                        No ({bigIntToDecimalPrettyString(noVotes)})
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
            </Grid>
        </Box>
    );
}

export default Voting;
