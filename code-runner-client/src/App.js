import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    AppBar, Toolbar, Typography, Select, MenuItem, FormControl,
    InputLabel, Paper, Switch, FormControlLabel, Box, TextField, IconButton, Divider, CircularProgress
} from '@mui/material';
import Editor from '@monaco-editor/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './App.css';

const App = ({ darkMode, setDarkMode }) => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [result, setResult] = useState('');
    const [executionTime, setExecutionTime] = useState(null);
    const [memoryUsed, setMemoryUsed] = useState(null);
    const [fontSize, setFontSize] = useState(14); // 기본 폰트 크기
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
    const editorRef = useRef(null);

    const runCode = async () => {
        setIsLoading(true); // 로딩 시작
        try {
            const response = await axios.post('https://code-runner-o7nm.onrender.com/run', { code, language });
            setResult(response.data.output || response.data.error);
            setExecutionTime(response.data.executionTime);
            setMemoryUsed(response.data.memoryUsed);
        } catch (error) {
            setResult('Error: ' + error.message);
        }
        setIsLoading(false); // 로딩 종료
    };

    useEffect(() => {
        const handleResize = () => {
            if (editorRef.current) {
                editorRef.current.layout();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Typography variant="h6" sx={{ marginLeft: 2, marginRight: 2 }}>
                            Code Runner
                        </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                    <FormControl variant="outlined" sx={{ mx: 1, minWidth: 120, my: 0.5 }}>
                        <InputLabel>Language</InputLabel>
                        <Select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            label="Language"
                        >
                            <MenuItem value="javascript">JavaScript</MenuItem>
                            <MenuItem value="python">Python</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Font Size"
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        inputProps={{ min: 10, max: 30, step: 1 }}
                        sx={{ width: 100, mx: 1, my: 1.5 }}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    <FormControlLabel
                        control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
                        label="Dark Mode"
                        sx={{ mx: 1 }}
                    />
                </Toolbar>
            </AppBar>
            <Box sx={{ display: 'flex', flexGrow: 1, mt: 2, mx: '10px', mb: '10px', gap: '10px' }}>
                <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Typography variant="h6">Code Input</Typography>
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        theme={darkMode ? 'vs-dark' : 'vs-light'}
                        onChange={(newValue) => setCode(newValue || '')}
                        options={{ fontSize }}
                        onMount={(editor) => {
                            editorRef.current = editor;
                        }}
                    />
                </Paper>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton color="primary" onClick={runCode} sx={{ border: '2px solid black' }} className="icon-button-hover">
                        <ArrowForwardIcon className="icon-animation" />
                    </IconButton>
                    <Typography variant="body1">Run!</Typography>
                </Box>
                <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', backgroundColor: darkMode ? '#333' : '#ddd', overflow: 'hidden' }}>
                    <Typography variant="h6">Output</Typography>
                    <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto', backgroundColor: darkMode ? '#444' : '#eee' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <pre>{result}</pre>
                        )}
                    </Box>
                    <Box sx={{ mt: 1 }}>
                        {executionTime !== null && <Typography>Execution Time: {executionTime.toFixed(2)} ms</Typography>}
                        {memoryUsed !== null && <Typography>Memory Used: {(memoryUsed / 1024).toFixed(2)} KB</Typography>}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default App;
