import React from 'react';
import {Avatar, Box, Card, CardContent, CardHeader, Divider, Typography, Link} from "@mui/material";
import {SentimentVeryDissatisfiedOutlined} from "@mui/icons-material";
import { Link as RouterLink } from 'react-router-dom';

const EmptyProposalsCard: React.FC = () => {
    return (
        <Card sx={{ marginTop: 2 }}>
            <CardHeader
                titleTypographyProps={{ variant: 'h4' }}
                color={'secondary'}
                avatar={
                    <Avatar>
                        <SentimentVeryDissatisfiedOutlined />
                    </Avatar>
                }
                title="Sorry, there are no proposals yet"
            />
            <CardContent>
                <Typography variant="body1" gutterBottom>
                    We apologize for the inconvenience, but there are currently no proposals available to view. However, you can still learn more about our non-profit DAO owned by token holders by visiting the About section.
                </Typography>
                <Typography variant="body1">
                    If you would like to support our cause, please consider visiting the Distribution section to make a donation.
                </Typography>
                <Box sx={{ marginTop:"10px", display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Link component={RouterLink} to="/about" sx={{ fontSize: '1.0rem' }}>Learn more about us</Link>
                    <Divider orientation="vertical" flexItem sx={{ margin: '0 16px', height: 20, backgroundColor: 'white' }} />
                    <Link component={RouterLink} to="/distribution" sx={{ fontSize: '1.0rem' }}>Make a donation</Link>
                </Box>
            </CardContent>
        </Card>
    );
};

export default EmptyProposalsCard;