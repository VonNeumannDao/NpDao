import {Container, Typography, Box, Paper, Card, CardHeader, CardContent, Avatar} from "@mui/material";
import React from 'react';
import {DescriptionRounded, InfoRounded} from "@mui/icons-material";
import config from "../../../../cig-config.json";
import ReactMarkdown from "react-markdown";
import aboutPage from "../../../../pages/about-page.md";
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
                        src="/about-logo.webp"
                        alt={config.name + " logo"}
                        style={{
                            width: "500px",
                            marginRight: "32px",
                            maxWidth: "100%",
                        }}
                    />
                    <div className={"markdown-content"} style={{ flex: 1, fontFamily: "Roboto, Helvetica, Arial, sans-serif" }}>
                        <ReactMarkdown >{aboutPage}</ReactMarkdown>
                    </div>
            </CardContent>
        </Card>
    );
}

export default NonProfitDAOPage;
