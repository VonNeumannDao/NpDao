import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import config from "../../../../cig-config.json";
import {Lock} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {useNavigate} from "react-router-dom";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE, StakingAccount} from "../declarations/token/token.did";
import {
    bigIntToDecimalPrettyString,
    convertToBigInt,
    generateUUID,
    hexStringToUint8Array,
    stringToAccount,
    stringToUint8
} from "../util/bigintutils";
import {LoadingButton} from "@mui/lab";
import {Principal} from "@dfinity/principal";
import {canisterId as tokenCanister} from "../declarations/token";
import CountdownTimer from "./CountdownTimer";
import {useAppContext} from "./AppContext";

const Staking = () => {
    const [stakingAmount, setStakingAmount] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingUnstake, setLoadingUnstake] = useState(false);
    const [loadingWithdraw, setLoadingWithdraw] = useState(false);
    const {reloadBalance} = useAppContext();

    const [stakingRecords, setStakingRecords] = useState<StakingAccount[]>([]);
    const tokenName = config.symbol;
    const navigate = useNavigate();
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const {principal, isConnected} = useConnect({
        onConnect: async () => {
            await init();
        }
    });

    useEffect(() => {
        if (isConnected) {
            init().then();
        }
    }, [principal, isConnected]);

    async function init() {
        const stakingAccounts = await tokenActor.getStakingAccount(principal);
        setStakingRecords(stakingAccounts.reverse());
    }

    const handleStake = async () => {
        setLoading(true);
        const stakingAccounts = await tokenActor.getStakingAccount(principal);

        const amount = convertToBigInt(stakingAmount);
        const stakeId = generateUUID();
        const account = stringToAccount(stakeId);
        const memo = "Stake";
        const response = await tokenActor.icrc1_transfer({
            to: {
                owner: Principal.fromText(tokenCanister),
                subaccount: [account]
            },
            fee: [],
            memo: [stringToUint8(memo)],
            from_subaccount: [],
            created_at_time: [],
            amount: amount,
        });
        if ("Err" in response) {
            console.log(response.Err);
            setLoading(false);
            return;
        }
        const startStaking = await tokenActor.startStaking(account, amount, response.Ok, stakeId);
        console.log(startStaking);
        await init();
        await reloadBalance();
        setLoading(false);
    };

    const handleUnstake = async (stakeId: string) => {
        setLoadingUnstake(true);
        const startUnstaking = await tokenActor.startEndStaking(stakeId);
        console.log(startUnstaking);
        await init();
        await reloadBalance();
        setLoadingUnstake(false);
    };

    const withdraw = async (stakeId: string) => {
        setLoadingWithdraw(true);
        const withdr = await tokenActor.claimStaking(stakeId);
        console.log(withdr);
        await init();
        await reloadBalance();

        setLoadingWithdraw(false);
    };

    const formatTime = (time: bigint) => {
        return new Date(Number(time / 1000000n)).toLocaleString();
    };

    const reload = async () => {
        await init();
    }

    return (<>{isConnected &&
            <Card sx={{mt: 5}}>
                <CardHeader
                    titleTypographyProps={{variant: 'h4'}}
                    color={'secondary'}
                    avatar={
                        <Avatar>
                            <Lock/>
                        </Avatar>
                    }
                    title={"Stake" + tokenName}
                    action={
                        <IconButton onClick={() => navigate(-1)}>
                            <CloseIcon/>
                        </IconButton>
                    }
                />
                <CardContent>
                    <code>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Staking your NP tokens in our DAO provides you with a number of benefits. First, your tokens are locked up for a defined period of time, helping to incentivize long-term commitment and investment in the project. During this period, you cannot withdraw your tokens, but you'll be rewarded with a fixed APY auto-compounding reward for staking them. This reward is automatically added to your balance, helping you to maximize your earnings over time.
                        </Typography>

                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Second, for every token staked, you'll receive one voting power for the DAO's governance process. This means that you'll have a say in the future direction of the project and can help to shape its growth and development.
                        </Typography>

                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Overall, staking your NP tokens in our DAO is a great way to participate in the growth and success of the project. By locking up your tokens and participating in the governance process, you'll be helping to create a decentralized and democratic community that's committed to building a better future together.
                        </Typography>
                    </code>

                    <Typography variant="subtitle1" sx={{mt: 2}}>
                        Total Staked:
                    </Typography>
                    <Box sx={{display: "flex", flexDirection: "row", flexGrow: 1}}>
                        <TextField
                            label={`Enter the amount of ${tokenName} to stake`}
                            type="number"
                            value={stakingAmount}
                            onChange={(e) => setStakingAmount(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <LoadingButton loading={loading} sx={{height: "56px", marginTop: "16px"}} variant="contained"
                                       onClick={handleStake}>
                            Stake
                        </LoadingButton>
                    </Box>

                    {stakingRecords.length > 0 &&
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Balance</TableCell>
                                        <TableCell>Rewards</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Time Staked</TableCell>
                                        <TableCell>Time to Unstake</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stakingRecords.filter(x => !x.claimed).map((record, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{bigIntToDecimalPrettyString(record.amount)}</TableCell>
                                            <TableCell>{record.reward.length > 0 ? bigIntToDecimalPrettyString(record.reward[0]) : "0"}</TableCell>
                                            <TableCell>{bigIntToDecimalPrettyString(record.total)}</TableCell>
                                            <TableCell>{formatTime(record.startStakeDate)}</TableCell>
                                            <TableCell>{record.endStakeDate.length > 0 ?
                                                <CountdownTimer onComplete={reload} date={new Date(Number(record.endStakeDate[0] / 1000000n))}/>
                                                : ""}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(Number(record.endStakeDate[0]) / 1000000) <= new Date() ?
                                                    <LoadingButton loading={loadingWithdraw} variant="outlined"
                                                                   onClick={() => withdraw(record.stakeId)}>
                                                        Claim
                                                    </LoadingButton>
                                                    :
                                                    <LoadingButton loading={loadingUnstake}
                                                                   disabled={record.endStakeDate.length > 0}
                                                                   variant="outlined"
                                                                   onClick={() => handleUnstake(record.stakeId)}>
                                                        Unstake
                                                    </LoadingButton>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }
                </CardContent>
            </Card>}
        </>
    );
};

export default Staking;
