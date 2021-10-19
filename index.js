const bodyParser = require('body-parser');
const childProcess = require('child_process');
const express = require("express");
const fs = require("fs");
const { networkInterfaces } = require('os');
const process = require("process");
const path = require("path");

const SETTINGS = JSON.parse(fs.readFileSync("settings.json", {encoding: "utf8"}));

// Change working directory to /public
process.chdir(path.join(__dirname, "public"));

// Set up the server
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.text({ type: "text/plain" }));
app.listen(SETTINGS.port);

// Obtain IPv4
const nets = networkInterfaces();
const results = {}

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}
console.log("IPv4: " + results);
console.log("Node process pid: " + process.pid);

// Some useful functions
function executeSync(command, args, timeout=undefined, maxBuffer=1024*1024) {
    let proc = childProcess.spawnSync(command, args, { stdio: "pipe", timeout: timeout, maxBuffer: maxBuffer });
    let message = "";
    if (proc.signal == "SIGTERM") {
        // timeout
        message = proc.stdout.toString() + proc.stderr.toString();
        message += "[Program timed out]";
    } else if (proc.status == 0) {
        // success
        message = proc.stdout.toString()
        if (message.length == 0) message = "[Completed without output]";
    } else {
        // error
        message = proc.stdout.toString() + proc.stderr.toString();
    }
    return {"status": proc.status, "msg": message};
}

function replaceAll(str, target, replacement) {
    let oldStr = str;
    let newStr = str;
    do {
        oldStr = newStr;
        newStr = oldStr.replace(target, replacement);
    } while (oldStr != newStr);
    return oldStr;
}

// Deal with GET request
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/views/index.html"));
});

app.post("/submission/:language", async (req, res) => {
    // Check language
    let lang = req.params.language;
    if (["java", "kotlin"].includes()) {
        res.send(`ERROR: ${lang} is not a valid language`)
        return;
    }

    // Calculate paths
    folderName = `${(new Date()).getTime()}`;
    folderPath = path.join(SETTINGS["temp-folder"], folderName);
    fileName = (lang == "java" ? "Main.java" : "Main.kt")
    filePath = path.join(folderPath, fileName);

    // Setup environment
    fs.mkdirSync(folderPath);
    fs.writeFileSync(filePath, req.body);

    // Execute command
    let result1 = executeSync(SETTINGS[lang + "c"], [filePath, "-d", folderPath]);
    if (result1.status != 0) {
        res.send(replaceAll(result1.msg, filePath, fileName));
    } else {
        let result2 = executeSync(
            SETTINGS["java"],
            [
                "-cp",
                `${SETTINGS["security-manager-path"]};${folderPath}`,
                `-Djava.security.manager=${SETTINGS["security-manager"]}`,
                "-Djava.security.policy==/dev/null",
                lang == "java" ? "Main" : "MainKt"
            ],
            timeout=SETTINGS["timeout"],
            maxBuffer=SETTINGS["maxBuffer"]
        );
        res.send(result2.msg);
    }

    // Remove temp folder
    fs.rmdirSync(folderPath, { recursive: true });
});
