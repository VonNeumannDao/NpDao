import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Menu,
    MenuItem,
    Toolbar,
    Typography
} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useCanister, useConnect} from '@connect2ic/react';
import {NFID, PlugWallet, StoicWallet} from '@connect2ic/core/providers';
import MintTokenButton from "./MintTokenButton";
import config from "../../../../cig-config.json"
import ContentModal from "./ContentModal";
import TreasuryProposal from "./TreasuryProposal";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";
import {useAppContext} from "./AppContext";

export default function TopBar() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const {connect, isInitializing, disconnect, isConnected, principal} = useConnect();
    const [activeProposal, setActiveProposal] = useState<boolean>(false);
    const {balancePretty} = useAppContext();


    useEffect(() => {
        if (principal)
            init().then();
    }, [principal]);

    async function init() {
        const activeProposal = await tokenActor.activeProposal();
        setActiveProposal(!!activeProposal["Ok"]);
    }

    function handleLoginClick(provider: string) {
        console.log(provider);
        connect(provider);
        setAnchorEl(null);
    }

    return (
        <AppBar style={{zIndex: 10}} position='static' elevation={0}>
            <Container maxWidth='xl'>
                <Toolbar disableGutters sx={{width: '100%', margin: "auto"}}>
                    <Box sx={{display: 'flex', width: '100%', justifyContent: 'space-between'}}>
                        <Box sx={{paddingLeft: 2, flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
                            <Typography variant='h6'>{config.symbol} DAO</Typography>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <Typography variant='subtitle1'
                                        sx={{marginRight: 1}}>Balance: {balancePretty}${config.symbol}</Typography>
                        </Box>
                        <ContentModal disabled={!isConnected || activeProposal} trigger={"Create Proposal"}>
                            <TreasuryProposal/>
                        </ContentModal>
                        <MintTokenButton/>
                        <Button sx={{marginLeft: 2}} disabled={isInitializing} variant='outlined' color='inherit'
                                onClick={e => {
                                    disconnect();
                                    setAnchorEl(e.currentTarget);
                                }}>
                            {isInitializing ? <CircularProgress color='inherit' size={24}/> :
                                isConnected ? 'Disconnect' : 'Connect'}
                        </Button>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                            <MenuItem onClick={() => handleLoginClick('plug')}>
                                <img src={new PlugWallet().meta.icon.light} height={20} width={20}/>
                                <Box sx={{marginLeft: 2}}>PLUG</Box>
                            </MenuItem>
                            <MenuItem onClick={() => handleLoginClick('stoic')}>
                                <img src={new StoicWallet().meta.icon.light} height={20} width={20}/>
                                <Box sx={{marginLeft: 2}}>STOIC</Box>
                            </MenuItem>
                            <MenuItem onClick={() => handleLoginClick('nfid')}>
                                <img src={new NFID().meta.icon.light} height={20} width={20}/>
                                <Box sx={{marginLeft: 2}}>NFID</Box>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
            <Divider/>
        </AppBar>
    );
}
