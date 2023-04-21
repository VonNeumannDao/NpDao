import {Container, Typography, Box, Paper} from "@mui/material";
import React from 'react';

function NonProfitDAOPage() {
    return (
        <Paper>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography
                    variant="h2"
                    align="center"
                    gutterBottom
                    sx={{ my: 4 }}
                >
                    Welcome to the Non-Profit DAO!
                </Typography>
                <img
                    src="/image.png"
                    alt="Non-Profit DAO Logo"
                    style={{ width: "500px", marginBottom: "32px" }}
                />
                <Container maxWidth="sm">
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
                    <Typography variant="body1" align="justify" gutterBottom>
                        Our governance model is designed to be transparent and fair, giving
                        all members an equal say in how the organization is run, regardless
                        of their level of investment or expertise. By joining the Non-Profit
                        DAO community, you become an integral part of our efforts to create a
                        more just and equitable world.
                    </Typography>
                </Container>
            </Box>
        </Paper>
    );
}

export default NonProfitDAOPage;
