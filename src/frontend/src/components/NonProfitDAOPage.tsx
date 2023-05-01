import {Avatar, Card, CardContent, CardHeader, useMediaQuery, useTheme} from "@mui/material";
import React from 'react';
import {InfoRounded} from "@mui/icons-material";
import config from "../../../../cig-config.json";
import ReactMarkdown from "react-markdown";
import aboutPage from "../../../../pages/about-page.md";

function NonProfitDAOPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
            <CardContent sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
            }}>
                <img
                    src="/about-logo.webp"
                    alt={config.name + " logo"}
                    style={{
                        width: '100%',
                        height: 'auto',
                        maxWidth: '500px',
                        marginRight: isMobile ? '0'  : "32px",
                    }}
                />
                <div
                    className={"markdown-content"}
                    style={{
                        flex: 1,
                        fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                        maxWidth: '100%',
                        marginLeft: isMobile ? '0'  : "32px",
                    }}
                >
                    <ReactMarkdown>{aboutPage}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
    );
}

export default NonProfitDAOPage;
