import React, { useEffect, useState } from 'react';
import {Typography} from "@mui/material";

interface Props {
    date: Date;
    onComplete: () => void;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function CountdownTimer({ date, onComplete }: Props) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(calculateTimeRemaining());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    function calculateTimeRemaining(): TimeRemaining {
        const difference = date.getTime() - new Date().getTime();
        const seconds = Math.max(Math.floor(difference / 1000) % 60, 0);
        const minutes = Math.max(Math.floor(difference / 1000 / 60) % 60, 0);
        const hours = Math.max(Math.floor(difference / 1000 / 60 / 60) % 24, 0);
        const days = Math.max(Math.floor(difference / 1000 / 60 / 60 / 24), 0);
        return { days, hours, minutes, seconds };
    }

    useEffect(() => {
        if (timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
            onComplete();
        }
    }, [timeRemaining, onComplete]);

    return (
        <Typography variant="inherit" component="span">
            {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
        </Typography>
    );
}

export default CountdownTimer;
