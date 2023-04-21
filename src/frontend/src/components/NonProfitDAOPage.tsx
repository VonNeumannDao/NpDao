import {Container, Typography, Box, Paper, Card, CardHeader, CardContent, Avatar} from "@mui/material";
import React from 'react';
import {DescriptionRounded, InfoRounded} from "@mui/icons-material";

function NonProfitDAOPage() {
    return (
        <Card sx={{ marginTop: 5 }}>
            <CardHeader
                titleTypographyProps={{ variant: 'h4' }}
                color={'secondary'}
                avatar={
                    <Avatar>
                        <InfoRounded />
                    </Avatar>
                }
                title="About"
            />
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src="/image.webp"
                    alt="Non-Profit DAO Logo"
                    style={{ width: "500px", marginRight: "32px" }}
                />
                <div>
                    <Typography
                        variant="h5"
                        align="left"
                        gutterBottom
                    >
                        Welcome to the Non-Profit DAO
                    </Typography>
                    <Typography
                        variant="body1"
                        align="justify"
                        gutterBottom
                        sx={{ mb: 2 }}
                    >
                        Non-Profit DAO is a non-profit decentralized autonomous organization
                        that supports developers by covering their cycle costs for valuable
                        applications donated as public works on the Internet Computer. As a
                        token holder, you are responsible for the success of the DAO and have
                        an equal say in its decision-making processes.
                    </Typography>
                    <Typography
                        variant="body1"
                        align="justify"
                        gutterBottom
                        sx={{ mb: 2 }}
                    >
                        Our mission is to promote public works and support the growth of the
                        Internet Computer ecosystem. We believe that by working together, we
                        can make a meaningful impact on the world and create a better future
                        for everyone.
                    </Typography>
                    <Typography
                        variant="body1"
                        align="justify"
                        gutterBottom
                    >
                        Our governance model is designed to be transparent and fair, giving
                        all members an equal say in how the organization is run, regardless
                        of their level of investment or expertise. By joining the Non-Profit
                        DAO community, you become an integral part of our efforts to create a
                        more just and equitable world.
                    </Typography>
                </div>
            </CardContent>
        </Card>
    );
}

export default NonProfitDAOPage;
