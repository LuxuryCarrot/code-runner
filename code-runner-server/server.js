const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/run', (req, res) => {
    const { code, language } = req.body;
    const tempFileName = `temp-${uuidv4()}.${language === 'python' ? 'py' : language === 'powershell' ? 'ps1' : 'js'}`;
    const tempFilePath = path.join(__dirname, tempFileName);

    console.log(`Received code: ${code}`);
    console.log(`Writing code to: ${tempFilePath}`);

    fs.writeFile(tempFilePath, code, (err) => {
        if (err) {
            console.error('Failed to write code to file:', err);
            res.json({ error: 'Failed to write code to file.' });
            return;
        }

        let command;
        if (language === 'python') {
            command = `python3 "${tempFilePath}"`;
        } else if (language === 'powershell') {
            command = `powershell -ExecutionPolicy Bypass -File "${tempFilePath}"`;
        } else {
            command = `node "${tempFilePath}"`;
        }

        console.log(`Executing code with command: ${command}`);

        const startTime = process.hrtime();
        const startMemory = process.memoryUsage().heapUsed;

        exec(command, (error, stdout, stderr) => {
            const endTime = process.hrtime(startTime);
            const endMemory = process.memoryUsage().heapUsed;
            const executionTime = endTime[0] * 1000 + endTime[1] / 1e6; // Convert to milliseconds
            const memoryUsed = endMemory - startMemory; // Memory used in bytes

            fs.unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Failed to delete temp file:', unlinkErr);
                }
            });

            if (error) {
                console.error('Execution error:', error);
                res.json({ error: stderr || error.message, executionTime, memoryUsed });
                return;
            }

            console.log(`Execution output: ${stdout}`);
            res.json({ output: stdout, executionTime, memoryUsed });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
