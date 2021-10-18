const express = require("express");
const { networkInterfaces } = require('os');
const process = require("process");
const path = require("path");
const fs = require("fs");

const SETTINGS = JSON.parse(fs.readFileSync("settings.json", {encoding: "utf8"}));

// Change working directory to /public
process.chdir(path.join(__dirname, "public"));

// Set up the server
const app = express();
app.use(express.static(path.join(__dirname, "public")));
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

// Deal with GET request
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/views/index.html"));
});
