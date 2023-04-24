import {AppBar, Box, Button, Container, Divider, IconButton, Menu, styled, Toolbar} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {ConnectButton, ConnectDialog, useCanister, useConnect} from '@connect2ic/react';
import MintTokenButton from "./MintTokenButton";
import config from "../../../../cig-config.json"
import ContentModal from "./ContentModal";
import TreasuryProposal from "./TreasuryProposal";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";
import {useAppContext} from "./AppContext";
import WasmProposal from "./WasmProposal";
import CanisterDropdown from "./CanisterDropdown";
import DeleteWasmProposal from "./DeleteWasmProposal";
import AdminOnly from "./AdminOnly";
import {Link} from "react-router-dom";
import {ArrowDropDown} from "@mui/icons-material";

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
                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                            <IconButton edge="start" color="inherit" aria-label="menu">
                                <img style={{maxWidth: "50px"}} src={"/token.webp"} alt="Logo" />
                            </IconButton>
                            <StyledLink to="/" color="inherit" >
                                {config.name} DAO
                            </StyledLink>
                            <Divider orientation="vertical" flexItem sx={{margin: '0 16px', height: 30, backgroundColor: 'white', marginTop: "18px" }} />
                            <StyledLink to="/distribution" color="inherit" >
                                Distribution
                            </StyledLink>
                            <Divider orientation="vertical" flexItem sx={{margin: '0 16px', height: 30, backgroundColor: 'white', marginTop: "18px" }} />
                            <StyledLink  to="/about" color="inherit" >
                                About
                            </StyledLink>
                            <AdminOnly>
                                <>
                                    <Divider orientation="vertical" flexItem sx={{margin: '0 16px', height: 30, backgroundColor: 'white', marginTop: "18px" }} />
                                    <StyledLink to="/admin" >
                                        Admin
                                    </StyledLink>
                                </>
                            </AdminOnly>
                        </Box>
                        <Box>
                            <Button sx={{marginLeft: 2}} disabled={disabledIfProposal()}  variant='contained' color='secondary' onClick={handleProposalClick}>Create Proposal <ArrowDropDown/></Button>
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
                            <ConnectButton />
                            <ConnectDialog />

                        </Box>
                    </Box>
                </Toolbar>
            </Container>
            <Divider/>
        </AppBar>
    );
}
