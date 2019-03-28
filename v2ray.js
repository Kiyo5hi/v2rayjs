const fs = require('fs');
const uuid = require('uuid/v4');
const shell = require('shelljs');

const PATH = '/etc/v2ray/config.json';
const THIRTY_DAYS = 2592000;
const THREE_DAYS = 259200;

let configFile = readConfigFile();
let clients = getClients();
let uid = clients.length;

function getTime() {
    return Math.round(Date.now() / 1000);
}

function readConfigFile() {
    let data = JSON.parse(fs.readFileSync(PATH));
    return data;
}

function getClients() {
    if (!configFile) configFile = readConfigFile();
    return configFile.inbounds[0].settings.clients;
}

function newClient(email) {
    return {
        "id": uuid(),
        "level": 1,
        "alterId": 64,
        "security": "auto",
        "email": email,
        "uid": ++uid,
        "expire": getTime() + THREE_DAYS
    }
}

function addClient(client) {
    clients.push(client);
}

// TODO: Need to improve this method.
function removeClient(uid) {
    clients.forEach(client => {
        if (client.uid == uid)
            client.level = 0;
    });
}

function addThirtyDays(uid) {
    clients.forEach(client => {
        if (client.uid == uid)
            client.expire = getTime() + THIRTY_DAYS;
    });
}

/* Always remember to call this function in order to
apply changes to the config file and restart 
V2ray service */
function writeConfigFile() {
    configFile.inbounds[0].settings.clients = clients;
    fs.writeFileSync(PATH, JSON.stringify(configFile), 'utf-8');
    shell.exec('service v2ray restart');
}

exports.newClient = newClient;
exports.addClient = addClient;
exports.addThirtyDays = addThirtyDays;
// exports.removeClient = removeClient;
exports.writeConfigFile = writeConfigFile;