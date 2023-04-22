import React, {useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent, CardHeader, IconButton,
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
import {ArrowBack, InfoRounded, Lock} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {useNavigate} from "react-router-dom";

type StakingRecord = {
    balance: String;
    startTime: Date;
    endTime: Date;
};


const Staking = () => {
    const [stakingAmount, setStakingAmount] = useState<String>();
    const [stakingRecords, setStakingRecords] = useState<StakingRecord[]>([]);
    const tokenName = config.symbol;
    const navigate = useNavigate();

    const handleStake = () => {
        const newRecord: StakingRecord = {
            balance: stakingAmount,
            startTime: new Date(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // stake for 1 day by default
        };
        setStakingRecords([...stakingRecords, newRecord]);
        setStakingAmount("0");
    };

    const handleUnstake = (index: number) => {
        const newRecords = [...stakingRecords];
        newRecords.splice(index, 1);
        setStakingRecords(newRecords);
    };

    const formatTime = (time: Date) => {
        return time.toLocaleDateString();
    };

    return (
        <Card sx={{mt: 5}}>
            <CardHeader
                titleTypographyProps={{ variant: 'h4' }}
                color={'secondary'}
                avatar={
                    <Avatar>
                        <Lock />
                    </Avatar>
                }
                title={"Stake" + tokenName}
                action={
                    <IconButton onClick={() => navigate(-1)}>
                        <CloseIcon />
                    </IconButton>
                }
            />
            <CardContent>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    By staking NP tokens, members commit to locking them up for a minimum of 30 days. During this time, the tokens cannot be claimed until the unstake process is initiated. Once the unstake button is clicked, it takes 30 days for the tokens to become available for withdrawal. This ensures that voters have a long-term interest in the success of the project and are committed to its growth, while still allowing for flexibility in case of changing circumstances. Additionally, members who participate in the DAO's decision-making process will receive a small amount of newly minted tokens as a reward for their involvement in the governance process.                </Typography>
                <Box sx={{display: "flex", flexDirection: "row", flexGrow: 1}}>
                    <TextField
                        label={`Enter the amount of ${tokenName} to stake`}
                        type="number"
                        value={stakingAmount}
                        onChange={(e) => setStakingAmount(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <Button sx={{height: "56px", marginTop: "16px"}} variant="contained" onClick={handleStake}>
                        Stake
                    </Button>
                </Box>

                {stakingRecords.length > 0 &&
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Balance</TableCell>
                                <TableCell>Time Staked</TableCell>
                                <TableCell>Time to Unstake</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stakingRecords.map((record, index) => (
                                <TableRow key={index}>
                                    <TableCell>{record.balance}</TableCell>
                                    <TableCell>{formatTime(record.startTime)}</TableCell>
                                    <TableCell>{formatTime(record.endTime)}</TableCell>
                                    <TableCell>
                                        <Button variant="outlined" onClick={() => handleUnstake(index)}>
                                            Unstake
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                }
            </CardContent>
        </Card>
    );
};

export default Staking;
