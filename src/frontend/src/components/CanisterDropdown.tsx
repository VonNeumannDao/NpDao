import React from 'react';
import {Button, Menu, MenuItem} from '@mui/material';
import {isDebugOn} from "./DebugOnly";
import {ArrowDropDown} from "@mui/icons-material";

interface Props {
    menuItems: { label: string, to: string }[];
}

const CanisterDropdown: React.FC<Props> = ({ menuItems }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const getLink = (canisterId) => {
        if (isDebugOn) {
            return `http://127.0.0.1:4943/?canisterId=rkp4c-7iaaa-aaaaa-aaaca-cai&id=${canisterId}`;
        } else {
            return `https://icscan.io/canister/${canisterId}`;
        }
    };
    return (
            <>
                <Button variant='contained' color='info' onClick={handleClick}>
                    Canisters <ArrowDropDown/>
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    {menuItems && menuItems.map((menuItem, index) => (
                        <MenuItem key={index} onClick={handleClose}>
                            <a href={getLink(menuItem.to)} >
                                {menuItem.label}
                            </a>
                        </MenuItem>
                    ))}
                </Menu>
            </>
    );
};

export default CanisterDropdown;
