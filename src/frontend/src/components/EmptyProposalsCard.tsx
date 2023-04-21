import React from 'react';
import {Card, CardContent, Typography, CardHeader, Avatar, Divider, Box} from "@mui/material";
import { SentimentVeryDissatisfiedOutlined} from "@mui/icons-material";
import {StyledLink} from "./StyledComponents";

const EmptyProposalsCard: React.FC = () => {
    return (
        <Card sx={{ marginTop: 5 }}>
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
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <StyledLink to="/about" color="primary" sx={{ fontSize: '0.8rem' }}>Learn more about us</StyledLink>
                    <Divider orientation="vertical" flexItem sx={{ margin: '0 16px', height: 40, backgroundColor: 'white' }} />
                    <StyledLink to="/distribution" color="primary" sx={{ fontSize: '0.8rem' }}>Make a donation</StyledLink>
                </Box>
            </CardContent>
        </Card>
    );
};

export default EmptyProposalsCard;