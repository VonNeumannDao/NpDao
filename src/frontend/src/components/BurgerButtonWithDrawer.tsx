import React, { useState } from 'react';
import {IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider} from '@mui/material';
import {AccountBalanceTwoTone, AccountBalanceWallet, CurrencyBitcoin, Menu as MenuIcon} from '@mui/icons-material';
import InternetComputerIcon from "./InternetComputerIcon";

const BurgerButtonWithDrawer = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const drawerContent = (
        <div>
            <List>
                <ListItem>
                    <ListItemIcon>
                        <AccountBalanceWallet />
                    </ListItemIcon>
                    <ListItemText primary={`Cycles: ${1000}`} />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <InternetComputerIcon />
                    </ListItemIcon>
                    <ListItemText primary={`ICP: ${1000}`} />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <CurrencyBitcoin />
                    </ListItemIcon>
                    <ListItemText primary={`BTC: ${1000}`} />
                </ListItem>
            </List>
            <Divider />
            <List>
                {['Item 1', 'Item 2', 'Item 3'].map((text, index) => (
                    <ListItem button key={text}>
                        <ListItemText primary={text} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
            >
                <MenuIcon />
            </IconButton>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default BurgerButtonWithDrawer;
