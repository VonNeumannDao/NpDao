import {AppBar, Box, Button, Container, Divider, IconButton, Menu, MenuItem, styled, Toolbar} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {ConnectButton, ConnectDialog, useCanister, useConnect} from '@connect2ic/react';
import MintTokenButton from "./MintTokenButton";
import config from "../../../../cig-config.json"
import ContentModal from "./ContentModal";
import TreasuryProposal from "./TreasuryProposal";
import {_SERVICE} from "../declarations/token/token.did";
import WasmProposal from "./WasmProposal";
import DeleteWasmProposal from "./DeleteWasmProposal";
import AdminOnly from "./AdminOnly";
import {Link} from "react-router-dom";
import {ArrowDropDown, Menu as MenuIcon} from "@mui/icons-material";
import AirdropButton from "./AirdropButton";
import DeployerOnly from "./DeployerOnly";
import DeployerProposal from "./DeployerProposal";
import ChangePriceProposal from "./ChangePriceProposal";

export default function TopBar() {
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const {isConnected, principal} = useConnect();
    const [activeProposal, setActiveProposal] = useState<boolean>(false);
    const [proposalAnchorEl, setProposalAnchorEl] = useState(null);
    const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

    const handleMobileMenuClick = (event) => {
        setMobileMenuAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuAnchorEl(null);
    };
    const handleProposalClick = (event) => {
        setProposalAnchorEl(event.currentTarget);
    };

    const handleProposalClose = () => {
        setProposalAnchorEl(null);
    };

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
        return !isConnected || !principal;
    }

    return (
        <AppBar style={{zIndex: 10}} position='static' elevation={0}>
            <Container maxWidth='xl'>
                <Toolbar disableGutters sx={{width: '100%', margin: "auto"}}>
                    <Box sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        paddingLeft: 2,
                        flexGrow: 1
                    }}>
                        <Box sx={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            display: "flex"
                        }}>

                        <IconButton edge="start" color="inherit" aria-label="menu">
                                <img style={{maxWidth: "50px"}} src={"/token.webp"} alt="Logo"/>
                            </IconButton>
                            <Box sx={{display: {md: "flex", sm: "none", xs: "none"}}}>

                                <StyledLink to="/" color="inherit">
                                    {config.symbol} DAO
                                </StyledLink>
                                <Divider orientation="vertical" flexItem sx={{
                                    margin: '0 16px',
                                    height: 30,
                                    backgroundColor: 'white'
                                }}/>
                                <StyledLink to="/distribution" color="inherit">
                                    Distribution
                                </StyledLink>
                                <Divider orientation="vertical" flexItem sx={{
                                    margin: '0 16px',
                                    height: 30,
                                    backgroundColor: 'white'
                                }}/>
                                <StyledLink to="/about" color="inherit">
                                    About
                                </StyledLink>
                                <Divider orientation="vertical" flexItem sx={{
                                    margin: '0 16px',
                                    height: 30,
                                    backgroundColor: 'white'
                                }}/>

                                <StyledLink to="/transactions" color="inherit">
                                    Transactions
                                </StyledLink>
                                <AdminOnly>
                                    <>
                                        <Divider orientation="vertical" flexItem sx={{
                                            margin: '0 16px',
                                            height: 30,
                                            backgroundColor: 'white'
                                        }}/>
                                        <StyledLink to="/admin">
                                            Admin
                                        </StyledLink>
                                    </>
                                </AdminOnly>
                            </Box>
                        </Box>
                        <Box sx={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            display: "flex"
                        }}>
                            <Box sx={{display: {md: "flex", xs: "none"}}}>
                                <Button sx={{marginLeft: 2}} disabled={disabledIfProposal()} variant='contained'
                                        color='secondary' onClick={handleProposalClick}>Create Proposal <ArrowDropDown/></Button>
                                <Menu
                                    anchorEl={proposalAnchorEl}
                                    open={Boolean(proposalAnchorEl)}
                                    onClose={handleProposalClose}
                                >
                                    <DeployerOnly>
                                        <ContentModal disabled={disabledIfProposal()} trigger={"Wasm Proposal"}>
                                            <WasmProposal/>
                                        </ContentModal>
                                    </DeployerOnly>
                                    <ContentModal disabled={disabledIfProposal()} trigger={"Treasury Proposal"}>
                                        <TreasuryProposal/>
                                    </ContentModal>
                                    <DeployerOnly>
                                        <ContentModal disabled={disabledIfProposal()} trigger={"Delete Wasm Proposal"}>
                                            <DeleteWasmProposal/>
                                        </ContentModal>
                                    </DeployerOnly>
                                    <ContentModal disabled={disabledIfProposal()} trigger={"Deployer Proposal"}>
                                        <DeployerProposal/>
                                    </ContentModal>
                                    <ContentModal disabled={disabledIfProposal()} trigger={"Proposal Cost Proposal"}>
                                        <DeployerOnly>
                                            <ChangePriceProposal/>
                                        </DeployerOnly>
                                    </ContentModal>
                                </Menu>
                                <AdminOnly>
                                    <MintTokenButton/>
                                </AdminOnly>
                                <ConnectButton/>

                            </Box>

                        </Box>
                        <ConnectDialog/>
                        <IconButton color="inherit" aria-label="menu" sx={{display: {md: 'none'}}}
                                    onClick={handleMobileMenuClick}>
                            <MenuIcon/>
                        </IconButton>
                        <Menu
                            anchorEl={mobileMenuAnchorEl}
                            open={Boolean(mobileMenuAnchorEl)}
                            onClose={handleMobileMenuClose}
                            disableScrollLock={true}
                            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                            transformOrigin={{vertical: 'top', horizontal: 'right'}}
                        >
                            <MenuItem onClick={handleMobileMenuClose}>
                                <StyledLink to="/" color="inherit">
                                    {config.name} DAO
                                </StyledLink>
                            </MenuItem>
                            <MenuItem onClick={handleMobileMenuClose}>
                                <StyledLink to="/distribution" color="inherit">
                                    Distribution
                                </StyledLink>
                            </MenuItem>
                            <MenuItem onClick={handleMobileMenuClose}>
                                <StyledLink to="/about" color="inherit">
                                    About
                                </StyledLink>
                            </MenuItem>
                            <MenuItem onClick={handleMobileMenuClose}>
                                <StyledLink to="/transactions" color="inherit">
                                    Transactions
                                </StyledLink>
                            </MenuItem>
                            <DeployerOnly>
                                <MenuItem onClick={handleMobileMenuClose}>
                                    <StyledLink to="/admin" color="inherit">
                                        Admin
                                    </StyledLink>
                                </MenuItem>
                            </DeployerOnly>
                            <MenuItem onClick={handleMobileMenuClose}>
                                <ConnectButton style={{width: "100%"}}/>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
            <Divider/>
        </AppBar>
    );
}
