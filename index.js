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

// obtain IPv4
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

// file system
class AppManager {
    constructor(path) {
        this.root = path;
    }
    readFile(relPath) {
        return fs.readFileSync(path.join(this.root, relPath), {encoding: "utf8"});
    }
    getFiles(relPath) {
        return fs.readdirSync(path.join(this.root, relPath)).filter(file => file != ".DS_Store");
    }
    getAppList() {
        return this.getFiles("/");
    }
    getInfo(id) {
        return JSON.parse(this.readFile(path.join(id, "/info.json")));
    }
    getDescription(id) {
        return this.readFile(path.join(id, "/description.html"));
    }
    getNumImgs(id) {
        return this.getFiles(path.join(id, "/carousel")).filter(file => file.toLowerCase().endsWith(".png")).length;
    }
}

// var appManager = new AppManager(path.join(__dirname, "/public/resources/app"));

function execute(command) {
    try {
        let stdout = childProcess.execSync(command, timeout=SETTINGS["timeout"]).toString();
        let message = stdout.length == 0 ? "[Completed without output]" : stdout;
        return {"status": 0, "msg": message};
    } catch (e) {
        let message = e.stdout.toString() + e.stderr.toString()
        if (e.signal == "SIGTERM") message += "[Program timed out]";
        return {"status": e.status, "msg": message};
    }
}

// Deal with GET request
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/views/index.html"));
});

app.post("/submission/java", (req, res) => {
    // calculate paths
    folderName = `${(new Date()).getTime()}`;
    folderPath = path.join(SETTINGS["temp-folder"], folderName);
    filePath = path.join(folderPath, "Main.java");

    // setup environment
    fs.mkdirSync(folderPath);
    fs.writeFileSync(filePath, req.body);

    // execute command
    result1 = execute(`javac ${filePath} -d ${folderPath}`);
    if (result1.status != 0) {
        res.send("Line " + result1.msg.substring(filePath.length + 1));
    } else {
        result2 = execute(`java -Djava.security.manager -cp ${folderPath} Main`);
        res.send(result2.msg);
    }

    // remove temp folder
    fs.rmdirSync(folderPath, { recursive: true });
});
