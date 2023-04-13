import {
    AppBar,
    Container,
    Toolbar,
    Box,
    Menu,
    MenuItem,
    Divider,
    Typography,
    CircularProgress,
    Button
} from '@mui/material';
import React, {useEffect} from 'react';
import {useCanister, useConnect} from '@connect2ic/react';
import { NFID, PlugWallet, StoicWallet } from '@connect2ic/core/providers';
import { _SERVICE as _LEDGER_SERVICE } from '../ldl/ledgerIdlFactory.did';

export default function TopBar() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const {connect, principal, isInitializing, disconnect, isConnected} = useConnect({
        onConnect: () => {
            // Signed in
        },
        onDisconnect: () => {
            // Signed out
        }
    });
    const [_ledgerActor] = useCanister('ledger');
    const ledgerActor = _ledgerActor as unknown as _LEDGER_SERVICE;
    function handleLoginClick(provider: string) {
        console.log(provider);
        connect(provider);
        setAnchorEl(null);
    }

    useEffect(() => {
        initialize().then();
    }, [principal]);

    async function initialize() {

    }

    return (
        <AppBar position='static' elevation={0}>
            <Container maxWidth='xl'>
                <Toolbar disableGutters>
                    <Box sx={{ display: 'flex', width: '33%', alignItems: 'center', justifyContent: 'left' }}>
                        <Box sx={{ paddingLeft: 2, flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Typography variant='h6'>Crypto is Good</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '33%', justifyContent: 'right' }}>
                        <Button disabled={isInitializing} variant='outlined' color='inherit' onClick={e => {
                            disconnect();
                            setAnchorEl(e.currentTarget);
                        }}>
                            {isInitializing ? <CircularProgress color='inherit' size={24} /> :

                                isConnected ? 'Disconnect' : 'Connect'}
                        </Button>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                            <MenuItem onClick={() => handleLoginClick('plug')}>
                                <img src={new PlugWallet().meta.icon.light} height={20} width={20} />
                                <Box sx={{ marginLeft: 2 }}>PLUG</Box>
                            </MenuItem>
                            <MenuItem onClick={() => handleLoginClick('stoic')}>
                                <img src={new StoicWallet().meta.icon.light} height={20} width={20} />
                                <Box sx={{ marginLeft: 2 }}>STOIC</Box>
                            </MenuItem>
                            <MenuItem onClick={() => handleLoginClick('nfid')}>
                                <img src={new NFID().meta.icon.light} height={20} width={20} />
                                <Box sx={{ marginLeft: 2 }}>NFID</Box>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
            <Divider />
        </AppBar>
    );
}
