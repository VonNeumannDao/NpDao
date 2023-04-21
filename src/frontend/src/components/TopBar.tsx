import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Menu,
    MenuItem, styled,
    Toolbar,
    Typography
} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useCanister, useConnect} from '@connect2ic/react';
import {AstroX, InfinityWallet, NFID, PlugWallet, StoicWallet} from '@connect2ic/core/providers';
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
import AdminOnly from "./AdminOnly";
import {Link} from "react-router-dom";

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
        try {
            const activeProposal = await tokenActor.activeProposal();
            setActiveProposal(!!activeProposal["Ok"]);
            const canisters = await tokenActor.canisters();
            const map = new Map<string, string>();
            for (let canister of canisters) {
                map.set(canister.canisterId, canister.appName);
            }
            setCanisters(map);
        }catch (e) {
            console.log(e);
        }

    }

    function handleLoginClick(provider: string) {
        console.log(provider);
        connect(provider);
        setAnchorEl(null);
    }
    const StyledLink = styled(Link)`
      color: inherit;
      text-decoration: none;
      margin-left: 2px;
      margin-right: 5px;
      transition: text-decoration 0.2s ease;
    
      &:hover {
        text-decoration: underline;
      }
`;

    function disabledIfProposal() {
        return !isConnected || activeProposal || !principal;
    }

    return (
        <AppBar style={{zIndex: 10}} position='static' elevation={0}>
            <Container maxWidth='xl'>
                <Toolbar disableGutters sx={{width: '100%', margin: "auto"}}>
                    <Box   sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        paddingLeft: 2,
                        flexGrow: 1
                    }}>
                        <Typography variant="h6">
                            <StyledLink  to="/" color="inherit">
                                {config.name} DAO
                            </StyledLink>
                            <Typography variant='subtitle1'
                                        sx={{marginRight: 1}}>Balance: {balancePretty}${config.symbol}</Typography>
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", paddingBottom: "10px" }}>
                            <StyledLink to="/" color="inherit" >
                                Home
                            </StyledLink>
                            <Divider orientation="vertical" flexItem sx={{ margin: '0 16px', height: 40, backgroundColor: 'white' }} />
                            <StyledLink to="/distribution" color="inherit" >
                                Distribution
                            </StyledLink>
                            <Divider orientation="vertical" flexItem sx={{ margin: '0 16px', height: 40, backgroundColor: 'white' }} />
                            <StyledLink  to="/about" color="inherit" >
                                About
                            </StyledLink>
                            <Divider orientation="vertical" flexItem sx={{ margin: '0 16px', height: 40, backgroundColor: 'white' }} />
                            <AdminOnly>
                                <>
                                    <StyledLink to="/admin" >
                                        Admin
                                    </StyledLink>
                                    <Divider orientation="vertical" flexItem sx={{ margin: '0 16px', height: 40, backgroundColor: 'white' }} />
                                </>
                            </AdminOnly>

                            {canisters.size > 0 &&
                                <CanisterDropdown menuItems={Array.from(canisters.entries()).map((x) => {
                                    return {
                                        label: x[1], to: x[0]
                                    }
                                })} />
                            }

                            <Button sx={{marginLeft: 2}} disabled={disabledIfProposal()}  variant='contained' color='secondary' onClick={handleProposalClick}>Create Proposal</Button>
                            <Menu
                                anchorEl={proposalAnchorEl}
                                open={Boolean(proposalAnchorEl)}
                                onClose={handleProposalClose}
                            >
                                <AdminOnly>
                                    <ContentModal disabled={disabledIfProposal()} trigger={"Wasm Proposal"}>
                                        <WasmProposal/>
                                    </ContentModal>
                                </AdminOnly>
                                <ContentModal disabled={disabledIfProposal()} trigger={"Treasury Proposal"}>
                                    <TreasuryProposal/>
                                </ContentModal>
                                <AdminOnly>
                                    <ContentModal disabled={disabledIfProposal()} trigger={"Delete Wasm Proposal"}>
                                        <DeleteWasmProposal/>
                                    </ContentModal>
                                </AdminOnly>
                            </Menu>
                            <AdminOnly>
                                <MintTokenButton/>
                            </AdminOnly>

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
                            </Menu>
                        </Box>
                    </Box>
                </Toolbar>
            </Container>
            <Divider/>
        </AppBar>
    );
}
