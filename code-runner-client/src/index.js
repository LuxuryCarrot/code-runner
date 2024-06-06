import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const Root = () => {
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    background: {
                        default: darkMode ? '#303030' : '#fafafa',
                        paper: darkMode ? '#424242' : '#fff',
                    },
                },
            }),
        [darkMode]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App darkMode={darkMode} setDarkMode={setDarkMode} />
        </ThemeProvider>
    );
};

ReactDOM.render(<Root />, document.getElementById('root'));
