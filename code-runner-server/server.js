const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/run', (req, res) => {
    const { code, language } = req.body;
    const tempFileName = `temp-${uuidv4()}.${language === 'python' ? 'py' : 'js'}`;
    const tempFilePath = path.join(__dirname, tempFileName);

    fs.writeFile(tempFilePath, code, (err) => {
        if (err) {
            res.json({ error: 'Failed to write code to file.' });
            return;
        }

        const command = language === 'python' ? `python "${tempFilePath}"` : `node "${tempFilePath}"`;

        const startTime = process.hrtime();
        const startMemory = process.memoryUsage().heapUsed;

        exec(command, (error, stdout, stderr) => {
            const endTime = process.hrtime(startTime);
            const endMemory = process.memoryUsage().heapUsed;
            const executionTime = endTime[0] * 1000 + endTime[1] / 1e6;
            const memoryUsed = endMemory - startMemory;

            fs.unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) console.error('Failed to delete temp file:', unlinkErr);
            });

            if (error) {
                res.json({ error: stderr || error.message, executionTime, memoryUsed });
                return;
            }

            res.json({ output: stdout, executionTime, memoryUsed });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
