const express = require('express');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

const app = express();
const git = simpleGit();

// Allow larger json payloads to transfer base64 webcam images safely
app.use(express.json({ limit: '50mb' }));
// Serve all vanilla HTML, CSS, and JS files from the public folder [cite: 8, 9]
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/login.html');
});
const DATA_FILE = path.join(__dirname, 'database.json');

// Helper function to read the local JSON database safely
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
        return {};
    }
    try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(fileContent || '{}');
    } catch (e) {
        return {};
    }
}

// Helper function to write updates back to the JSON database
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 1. STUDENT LOGIN ENDPOINT (Captures Profile & Local Desk Time)
app.post('/api/login', (req, res) => {
    const { name, email, contact, loginTime, photo } = req.body;
    let data = readData();

    // Initialize or map student record profile [cite: 5]
    if (!data[email]) {
        data[email] = {
            profile: { name, email, contact, photo },
            sessions: [],
            progress: []
        };
    } else {
        // Keep profile info updated [cite: 5]
        data[email].profile = { name, email, contact, photo };
    }

    // Append a new session tracking block using student's local desk time
    data[email].sessions.push({
        loginTime: loginTime,
        logoutTime: null,
        duration: null
    });

    writeData(data);
    res.json({ success: true, message: "Login captured successfully!" });
});

// 2. MANUAL PORTAL PROGRESS ENDPOINT (Pushes textual update file to Admin GitHub repo)
app.post('/api/progress', async (req, res) => {
    const { email, workDone, timestamp } = req.body;
    let data = readData();

    if (!data[email]) {
        return res.status(404).json({ success: false, error: "Student profile not found." });
    }

    // Record the completed task details locally [cite: 6]
    data[email].progress.push({ timestamp, workDone });
    writeData(data);

    try {
        // Automatically write/append an text config update file [cite: 13, 33]
        const syncFile = path.join(__dirname, 'github_sync.txt');
        const updateLog = `Student: ${email}\nTimestamp: ${timestamp}\nCompleted Work: ${workDone}\n\n`;
        fs.appendFileSync(syncFile, updateLog);

        // Automate simple-git staging, committing, and pushing to repo [cite: 14, 31, 34]
        await git.add(syncFile);
        await git.commit(`Manual progress log synchronization for ${email}`);
        await git.push('origin', 'main');
    } catch (err) {
        console.error("Git backup sync error (Make sure your local directory is an initialized Git tracking repo):", err.message);
    }

    res.json({ success: true, message: "Progress logged and backed up." });
});

// 3. STUDENT LOGOUT ENDPOINT (Calculates Attendance Duration)
app.post('/api/logout', (req, res) => {
    const { email, logoutTime } = req.body;
    let data = readData();

    if (!data[email] || data[email].sessions.length === 0) {
        return res.status(400).json({ success: false, error: "No active session found for this student." });
    }

    // Grab the last active running session entry
    let activeSession = data[email].sessions[data[email].sessions.length - 1];
    activeSession.logoutTime = logoutTime;

    // Compute duration in minutes using local desk time boundaries [cite: 5, 6]
    const start = new Date(activeSession.loginTime);
    const end = new Date(logoutTime);
    const diffMs = end - start;
    const diffMins = Math.max(0, Math.round(diffMs / 60000)); 

    activeSession.duration = `${diffMins} minutes`;
    writeData(data);

    res.json({ success: true, duration: activeSession.duration });
});

// 4. DYNAMIC GITHUB WEBHOOK ENDPOINT (Catches automated student code pushes)
app.post('/api/github-webhook', (req, res) => {
    const payload = req.body;

    if (payload && payload.commits) {
        const pusherEmail = payload.pusher.email; // Identify student matching their GitHub email commit log
        const repoName = payload.repository.name;
        
        // Map all incoming push commits [cite: 3]
        const updates = payload.commits.map(commit => ({
            message: commit.message,
            timestamp: commit.timestamp,
            url: commit.url
        }));

        let data = readData();

        if (data[pusherEmail]) {
            updates.forEach(update => {
                data[pusherEmail].progress.push({
                    timestamp: new Date(update.timestamp).toString(),
                    workDone: `[GitHub Push in ${repoName}]: ${update.message} (Commit: ${update.url})`
                });
            });
            writeData(data);
            console.log(`Dynamic real-time updates added via GitHub Webhook for: ${pusherEmail}`);
        } else {
            console.log(`Webhook triggered: Commits made by unknown email '${pusherEmail}'. Register first with this email.`);
        }
    }
    res.status(200).send('Webhook Processed');
});

// 5. ADMIN API ENDPOINT (Feeds Admin UI panel monitoring view)
app.get('/api/admin/dashboard', (req, res) => {
    res.json(readData());
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 System Online at: http://localhost:${PORT}`));
// Add this route inside your server.js to catch the Google Meet console data
app.post('/api/attendance', (req, res) => {
    const { students } = req.body;
    let data = readData();
    const timestamp = new Date().toString();

    students.forEach(name => {
        // Create a profile automatically if they don't exist yet
        if (!data[name]) {
            data[name] = {
                profile: { name: name, email: "Unknown", contact: "N/A", photo: "" },
                sessions: [],
                progress: []
            };
        }
        
        // Log their attendance session stamp automatically
        data[name].sessions.push({
            loginTime: timestamp,
            logoutTime: "Class Session Live",
            duration: "Tracked via Meet"
        });
    });

    writeData(data);
    res.send("Attendance logged from Google Meet panel!");
});