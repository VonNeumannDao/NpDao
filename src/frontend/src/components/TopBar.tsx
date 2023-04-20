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
import WasmProposal from "./WasmProposal";
import CanisterDropdown from "./CanisterDropdown";
import BalanceList from "./BalanceList";
import DeleteWasmProposal from "./DeleteWasmProposal";
import DebugOnly from "./DebugOnly";

export default function TopBar() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const {connect, isInitializing, disconnect, isConnected, principal} = useConnect();
    const [activeProposal, setActiveProposal] = useState<boolean>(false);
    const {balancePretty} = useAppContext();
    const [proposalAnchorEl, setProposalAnchorEl] = useState(null);
    const [canisters, setCanisters] = useState<Map<string, string>>(new Map());

    const handleProposalClick = (event) => {
        setProposalAnchorEl(event.currentTarget);
    };

    const handleProposalClose = () => {
        setProposalAnchorEl(null);
    };

    useEffect(() => {
        if (principal)
            init().then();
    }, [principal]);

    async function init() {
        const activeProposal = await tokenActor.activeProposal();
        setActiveProposal(!!activeProposal["Ok"]);
        const canisters = await tokenActor.canisters();
        const map = new Map<string, string>();
        for (let canister of canisters) {
            map.set(canister.canisterId, canister.appName);
        }
        setCanisters(map);
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
                        {canisters.size >0 &&
                            <CanisterDropdown menuItems={Array.from(canisters.entries()).map((x) => {
                                return {
                                    label: x[1], to: x[0]
                                }
                            })} />
                        }

                        <Box sx={{display: 'flex', alignItems: 'center', marginLeft: 2}}>
                            <Typography variant='subtitle1'
                                        sx={{marginRight: 1}}>Balance: {balancePretty}${config.symbol}</Typography>
                        </Box>
                        <Button sx={{marginLeft: 2}} variant='contained' color='secondary' onClick={handleProposalClick}>Create Proposal</Button>
                        <Menu
                            anchorEl={proposalAnchorEl}
                            open={Boolean(proposalAnchorEl)}
                            onClose={handleProposalClose}
                        >
                            <ContentModal disabled={!isConnected || activeProposal} trigger={"Wasm Proposal"}>
                                <WasmProposal/>
                            </ContentModal>
                            <ContentModal disabled={!isConnected || activeProposal} trigger={"Treasury Proposal"}>
                                <TreasuryProposal/>
                            </ContentModal>
                            <ContentModal disabled={!isConnected || activeProposal} trigger={"Delete Wasm Proposal"}>
                                <DeleteWasmProposal/>
                            </ContentModal>
                        </Menu>
                        <DebugOnly>
                            <MintTokenButton/>
                        </DebugOnly>

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
