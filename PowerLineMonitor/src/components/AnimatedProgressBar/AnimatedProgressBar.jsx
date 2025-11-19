import React, { useState, useEffect } from 'react';
import { ProgressBar } from 'react-step-progress-bar';
import 'react-step-progress-bar/styles.css';

const AnimatedProgressBar = ({ targetPercent, filledBackground, height }) => {
    const [percent, setPercent] = useState(0);

    useEffect(() => {
        let current = 0;
        const increment = 15; // шаг 1%
        const intervalTime = 1; // в миллисекундах

        const interval = setInterval(() => {
            current += increment;
            if (current > targetPercent) {
                current = targetPercent;
                clearInterval(interval);
            }
            setPercent(current);
        }, intervalTime);

        return () => clearInterval(interval);
    }, [targetPercent]);

    return (
        <ProgressBar
            percent={percent}
            filledBackground={filledBackground}
            height={height}
        />
    );
};

export default AnimatedProgressBar;
