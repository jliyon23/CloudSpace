const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const chokidar = require('chokidar');
const os = require('node:os');
const pdf = require('pdf-parse');
const mammoth = require("mammoth");
const axios = require('axios');
const FormData = require('form-data');

require('dotenv').config();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

let textModel;
let visionModel;

let MONITORED_DIRECTORIES = [`${os.homedir()}/Downloads`];
const AGENT_TOKEN_FILE = path.join(app.getPath('userData'), 'agentToken.txt');

const FILE_PROMPTS = {
    ".txt": "Return a JSON object ONLY.  Do NOT include any other text. The JSON should have a 'summary' key with a summary of this text document and an 'importanceScore' key with a score from 1 to 10(more importance to identity documents, invoices, certificates, letters etc).",
    ".pdf": "Return a JSON object ONLY.  Do NOT include any other text. The JSON should have a 'summary' key with a summary of this PDF document and an 'importanceScore' key with a score from 1 to 10.(more importance to identity documents, invoices, certificates, letters etc).",
    ".docx": "Return a JSON object ONLY.  Do NOT include any other text. The JSON should have a 'summary' key with a summary of this Word document, highlighting key themes, and an 'importanceScore' key with a score from 1 to 10(more importance to identity documents, invoices, certificates, letters etc).",
    ".jpg": "Return a JSON object ONLY. Do NOT include any other text. The JSON object should have a 'description' key with a description of this image, an 'assessment' key with assessment of the images relevance, and an 'importanceScore' key with a score from 1 to 10(more importance to identity documents, invoices, certificates, letters etc).",
    ".jpeg": "Return a JSON object ONLY. Do NOT include any other text. The JSON object should have a 'description' key with a description of this image, an 'assessment' key with assessment of the images relevance, and an 'importanceScore' key with a score from 1 to 10(more importance to identity documents, invoices, certificates, letters etc).",
    ".png": "Return a JSON object ONLY. Do NOT include any other text. The JSON object should have a 'description' key with a description of this image, an 'assessment' key with assessment of the images relevance, and an 'importanceScore' key with a score from 1 to 10(more importance to identity documents, invoices, certificates, letters etc).",
};

async function sendFileToLocalhost(filePath, agentToken) {
    try {
        const fileBuffer = await fs.readFile(filePath);
        const formData = new FormData();
        formData.append('file', fileBuffer, path.basename(filePath));
        formData.append('agentToken', agentToken);

        const response = await axios.post('http://localhost:5500/api/file/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        console.log(`File uploaded successfully: ${JSON.stringify(response.data)}`);

        if (mainWindow) {
            mainWindow.webContents.send('log-message', `File uploaded: ${filePath}. Server response: ${JSON.stringify(response.data)}`);
            mainWindow.webContents.send('file-uploaded', response.data.googleDrive);
        }

    } catch (error) {
        console.error(`Error uploading file ${filePath}:`, error.message);
        if (mainWindow) {
            let errorMessage = `Error uploading file: ${filePath} - ${error.message}`;
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = `Error uploading file: ${filePath} - Server: ${error.response.data.message}`;
            }
            mainWindow.webContents.send('log-message', errorMessage, true);
        }
    }
}

// --- File Analysis Function ---
async function analyzeFileContent(filePath) {
    try {
        const fileExtension = path.extname(filePath).toLowerCase();
        if (!FILE_PROMPTS[fileExtension]) return { error: "Unsupported file type." };

        let model = textModel;
        let fileContent;

        if ([".txt", ".pdf", ".docx"].includes(fileExtension)) {
            try {
                if (fileExtension === ".txt") {
                    fileContent = await fs.readFile(filePath, "utf-8");
                } else if (fileExtension === ".pdf") {
                    const dataBuffer = await fs.readFile(filePath);
                    const pdfData = await pdf(dataBuffer);
                    fileContent = pdfData.text;
                } else if (fileExtension === ".docx") {
                    const result = await mammoth.extractRawText({ path: filePath });
                    fileContent = result.value;
                }

                if (fileContent.length > 25000) {
                    fileContent = fileContent.substring(0, 25000) + "\n... (truncated)";
                }
            } catch (readError) {
                console.error(`Error reading file ${filePath}:`, readError);
                return { error: `Error reading file: ${readError.message}` };
            }
        } else if ([".jpg", ".jpeg", ".png"].includes(fileExtension)) {
            model = visionModel;
            try {
                const { default: imageType } = await import('image-type');
                const imageData = await fs.readFile(filePath);
                const imgType = await imageType(imageData);
                if (!imgType) return { error: "Unsupported image format." };
                fileContent = { inlineData: { data: imageData.toString("base64"), mimeType: imgType.mime } };

            } catch (imageError) {
                console.error(`Error processing image ${filePath}:`, imageError);
                return { error: `Error processing image: ${imageError.message}` };
            }
        } else {
            return { error: "Unsupported file type." };
        }

        const prompt = FILE_PROMPTS[fileExtension];
        const parts = [prompt];
        if (typeof fileContent === 'string') {
            parts.push(fileContent);
        } else {
            parts.push(fileContent);
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();
        return text;

    } catch (error) {
        console.error("Error analyzing file:", error);
        return { error: `Error: ${error.message}` };
    }
}

// --- Score Extraction Function ---
function extractScore(analysisResult) {
    try {
        let cleanedResult = analysisResult.trim();
        if (cleanedResult.startsWith("```")) {
            cleanedResult = cleanedResult.substring(3, cleanedResult.length - 3).trim();
            if (cleanedResult.toLowerCase().startsWith("json")) {
                cleanedResult = cleanedResult.substring(4).trim();
            }
        }

        try {
            const parsedResult = JSON.parse(cleanedResult);
            if (parsedResult && typeof parsedResult.importanceScore === 'number') {
                return parsedResult.importanceScore;
            }
        } catch (jsonError) {
            console.error("JSON parsing failed, attempting plain text extraction:", jsonError);
            const match = cleanedResult.match(/(\d+)/);
            if (match && match[1]) {
                const score = parseInt(match[1], 10);
                if (!isNaN(score)) {
                    return score;
                }
            }
        }

        const match = analysisResult.match(/importanceScore["']?:?\s*(\d+)/i);
        if (match && match[1]) {
            const score = parseInt(match[1], 10);
            if (!isNaN(score)) {
                return score;
            }
        }
        console.log("Could not extract importance score from:", analysisResult);
        return -1;

    } catch (error) {
        console.error("Unexpected error in extractScore:", error);
        return -1;
    }
}

// --- File Monitoring ---
let watcher;
let agentToken = null;

async function startMonitoring() {
    if (!GOOGLE_API_KEY) {
        console.error("Error: Please set your KEY in a .env file.");
        if (mainWindow) {
            mainWindow.webContents.send('log-message', "Error: Please set your KEY in a .env file.", true);
        }
        return;
    }

    if (watcher) {
        watcher.close();
    }

    watcher = chokidar.watch(MONITORED_DIRECTORIES, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true,
        usePolling: true,
        interval: 1000,
    });

    watcher.on('add', async (filePath) => await handleFileEvent(filePath, 'added'));
    watcher.on('change', async (filePath) => await handleFileEvent(filePath, 'modified'));
    watcher.on('unlink', (filePath) => {
        if (mainWindow) {
            mainWindow.webContents.send('log-message', `File deleted: ${filePath}`);
        }
    });

    watcher.on('error', error => {
        console.error('Watcher error:', error);
        if (mainWindow) {
            mainWindow.webContents.send('log-message', `Watcher error: ${error}`, true);
        }
    });

    if (mainWindow) {
        mainWindow.webContents.send('log-message', 'Monitoring started...');
    }
}

// --- File Event Handler (with Debouncing) ---
let analysisTimeout = null;
const DEBOUNCE_DELAY = 2000;

async function handleFileEvent(filePath, eventType) {
    const fileExtension = path.extname(filePath).toLowerCase();
    if (!FILE_PROMPTS[fileExtension]) return;

    if (mainWindow) {
        mainWindow.webContents.send('log-message', `File ${eventType}: ${filePath}`);
    }

    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(async () => {
        const analysisResult = await analyzeFileContent(filePath);
        if (mainWindow) {
            mainWindow.webContents.send('analysis-result', { filePath, result: analysisResult });
        }

        let importanceScore = -1;
        if (typeof analysisResult === 'string') {
            try {
                importanceScore = extractScore(analysisResult);
            } catch (parseError) {
                console.error("Error extracting score:", parseError);
            }
        }

        if (importanceScore >= 6 && importanceScore <= 10) {
            if (mainWindow) {
                mainWindow.webContents.send('log-message', `Importance score is ${importanceScore}. Uploading ${filePath} to localhost...`);
            }
            await sendFileToLocalhost(filePath, agentToken);
        } else {
            if (mainWindow && importanceScore !== -1) {
                mainWindow.webContents.send('log-message', `Importance score for ${filePath} is ${importanceScore}, not uploading.`);
            }
        }
    }, DEBOUNCE_DELAY);
}

// --- Agent Token Handling ---

async function loadAgentToken() {
    try {
        const token = await fs.readFile(AGENT_TOKEN_FILE, 'utf-8');
        return token.trim();
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Agent token file not found.');
        } else {
            console.error('Error loading agent token:', error);
        }
        return null;
    }
}

async function saveAgentToken(token) {
    try {
        await fs.writeFile(AGENT_TOKEN_FILE, token, 'utf-8');
        console.log('Agent token saved.');
    } catch (error) {
        console.error('Error saving agent token:', error);
    }
}

// --- Electron App Setup ---

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });
    mainWindow.loadFile('index.html');
    // Commented out: mainWindow.webContents.openDevTools();
    global.mainWindow = mainWindow;
}

// Update the app.whenReady section to log token status
app.whenReady().then(async () => {
    createWindow();

    textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    agentToken = await loadAgentToken();
    if (agentToken) {
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('log-message', 'Agent token found, monitoring starting...');
            startMonitoring();
        });
    } else {
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('request-agent-token');
        });
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    if (watcher) {
        watcher.close();
    }
});

// --- IPC Event Handlers ---

ipcMain.handle('get-monitored-directories', async () => {
    return MONITORED_DIRECTORIES;
});

ipcMain.handle('add-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const newDir = result.filePaths[0];
        if (!MONITORED_DIRECTORIES.includes(newDir)) {
            MONITORED_DIRECTORIES.push(newDir);
             if (agentToken) {
                startMonitoring();
            }
            return newDir;
        }
    }
    return null;
});

ipcMain.handle('remove-directory', async (event, dirToRemove) => {
    MONITORED_DIRECTORIES = MONITORED_DIRECTORIES.filter(dir => dir !== dirToRemove);
    if (agentToken) {
        startMonitoring();
    }
    return MONITORED_DIRECTORIES;
});



ipcMain.handle('get-saved-token', async () => {
    try {
        return await loadAgentToken();
    } catch (error) {
        console.error('Error loading agent token:', error);
        return null;
    }
});

// Update the submit-agent-token handler to also log to the UI
ipcMain.handle('submit-agent-token', async (event, token) => {
    try {
        await saveAgentToken(token);
        agentToken = token;
        if (mainWindow) {
            mainWindow.webContents.send('log-message', 'Agent token saved successfully');
        }
        startMonitoring();
        return true;
    } catch (error) {
        console.error('Error saving agent token:', error);
        if (mainWindow) {
            mainWindow.webContents.send('log-message', `Error saving agent token: ${error.message}`, true);
        }
        return false;
    }
});
