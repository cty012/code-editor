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
console.log(results);

// Some useful functions
function execute(command, timeout=null) {
    try {
        let stdout = childProcess.execSync(command, timeout=timeout).toString();
        let message = stdout.length == 0 ? "[Completed without output]" : stdout;
        return {"status": 0, "msg": message};
    } catch (e) {
        let message = e.stdout.toString() + e.stderr.toString()
        if (e.signal == "SIGTERM") message += "[Program timed out]";
        return {"status": e.status, "msg": message};
    }
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
    result1 = execute(`${SETTINGS[lang + "c"]} ${filePath} -d ${folderPath}`);
    if (result1.status != 0) {
        res.send(replaceAll(result1.msg, filePath, fileName));
    } else {
        result2 = execute(
            `${SETTINGS["java"]} -Djava.security.manager -cp ${folderPath} ${lang == "java" ? "Main" : "MainKt"}`,
            timeout=SETTINGS["timeout"]);
        res.send(result2.msg);
    }

    // Remove temp folder
    fs.rmdirSync(folderPath, { recursive: true });
});
