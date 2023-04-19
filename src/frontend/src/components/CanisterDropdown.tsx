import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Menu, MenuItem } from '@mui/material';

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

    return (
            <>
                <Button variant='contained' color='info' onClick={handleClick}>
                    Canisters
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    {menuItems && menuItems.map((menuItem, index) => (
                        <MenuItem key={index} onClick={handleClose}>
                            <a href={menuItem.to} >
                                {menuItem.label}
                            </a>
                        </MenuItem>
                    ))}
                </Menu>
            </>
    );
};

export default CanisterDropdown;
