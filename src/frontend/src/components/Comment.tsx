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
    Button, CardContent, CardActions, List, ListItem, ListItemAvatar, ListItemText, TextField
} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useCanister, useConnect} from '@connect2ic/react';
import Card from "@mui/material/Card";
import {_SERVICE, Message} from "../declarations/backend/backend.did";
import LoadingButton from '@mui/lab/LoadingButton';


export default function Comment() {
    const {connect, principal, isInitializing, disconnect, isConnected} = useConnect();
    const [_backendActor] = useCanister('backend');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const backendActor = _backendActor as unknown as _SERVICE;
    useEffect(() => {
        initialize().then();
    }, [principal]);

    async function initialize() {
        const inMessages = await backendActor.getMessages();
        setMessages(inMessages.reverse());
    }

    async function onChange(e: any) {
        setComment(e.target.value);
    }

    async function saveComment() {
        setLoading(true);
        const result = await backendActor.setMessage({
            principal: principal,
            message: comment,
            date: new Date().toISOString()
        })
        console.log(result);
        await initialize();
        setLoading(false);
        setComment("");

    }

    return (<>
            <Box sx={{ display: 'flex', width: "50%", marginLeft: "auto", marginRight:"auto", flexDirection: 'row', marginBottom: "4px", marginTop: "50px" }}>
                <TextField value={comment} onChange={onChange} fullWidth label="Comment" id="fullWidth" />
                <LoadingButton loading={loading} onClick={saveComment} variant="text">Save</LoadingButton>
            </Box>

            <Box sx={{ display: 'flex', width: "50%", marginLeft: "auto", marginRight:"auto", flexDirection: 'column', marginBottom: "4px", marginTop: "50px" }}>
                <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    {messages.map((mes) =>
                            <ListItem key={mes.date}  alignItems="flex-start">
                                <ListItemText
                                    primary={mes.message}
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {mes.principal}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                    )}

                </List>
            </Box>


        </>
    );
}
