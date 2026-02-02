
const fs = require('fs');
const fsPromises = require('fs').promises;
require("dotenv").config();

let args = [];

if (fs.existsSync('args.json')) {
    try {
        const jsonData = JSON.parse(fs.readFileSync('args.json', 'utf8'));
        if (jsonData.args && Array.isArray(jsonData.args)) args = jsonData.args;
    } catch (error) {
        console.error('Error reading args.json:', error.message);
    }
}

args = args.concat(process.argv.slice(2));

const Discord = require("discord.js-selfbot-v13");

const client = new Discord.Client({ checkUpdate: false });

let opts = { 
    logToConsole: true,
    privacyMode: false,
    phrasesFilePath: 'list/phrases',
    hangupFilePath: 'list/hangup',
    namesFilePath: 'list/names',
    disableNameLogging: false,
    autoSkipMasks: true,
    masksFilePath: 'list/masks',
    typingDelay: false
};

for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (!arg.startsWith('-')) continue;

    if (arg === '-h') {
        console.log(
`payphone-bot 2000 manual
-p  Privacy mode
-l  Disable console logging
-n  Disable name logging
-m  Disable auto skipping masked users
-D  Human-like typing delay
-P <file>  Phrases file
-H <file>  Hangup file
-N <file>  Names file
-M <file>  Masked names file`
        );
        process.exit();
    }

    if (['-P','-H','-N','-M'].includes(arg)) {
        if (!args[i + 1] || args[i + 1].startsWith('-')) {
            console.error("Error: Path flags require a value.");
            process.exit(1);
        }
        if (arg === '-P') opts.phrasesFilePath = args[++i];
        if (arg === '-H') opts.hangupFilePath = args[++i];
        if (arg === '-N') opts.namesFilePath = args[++i];
        if (arg === '-M') opts.masksFilePath = args[++i];
        continue;
    }

    for (const c of arg.slice(1)) {
        if (c === 'p') opts.privacyMode = true;
        if (c === 'l') opts.logToConsole = false;
        if (c === 'n') opts.disableNameLogging = true;
        if (c === 'm') opts.autoSkipMasks = false;
        if (c === 'D') opts.typingDelay = true;
    }
}

const pMessages = fs.readFileSync(opts.phrasesFilePath, 'utf8').split(/\r?\n/).filter(Boolean);
const endCallMessages = fs.readFileSync(opts.hangupFilePath, 'utf8').split(/\r?\n/).filter(Boolean);
const maskNames = fs.readFileSync(opts.masksFilePath, 'utf8').split(/\r?\n/).filter(Boolean);

const conf = JSON.parse(fs.readFileSync('c.json', 'utf8'));
const channelId = String(conf.cI);
if (!channelId) {
    console.error("channelId missing. Run setup.");
    process.exit(1);
}
const ignoreUserIds = Array.isArray(conf.iUI) ? conf.iUI : [];
const callMessage = conf.callMsg;
const hangupMessage = conf.hangupMsg;
const phoneBotName = conf.phoneBotName;
const hangupDelay = (conf.autoSkipDelay || 30) * 1000;
let lastMessageTime = Date.now();

setInterval(async () => {
    const ch = client.channels.cache.get(channelId);
    if (!ch) return;

    const now = Date.now();
    if (now - lastMessageTime >= hangupDelay) {
        await ch.send(hangupMessage).catch(() => {});
        await ch.send(callMessage).catch(() => {});
        lastMessageTime = Date.now(); // reset after hangup
    }
}, 1000);

async function updateFile(message, filePath) {
    try {
        let data = "";
        try { data = await fsPromises.readFile(filePath, "utf8"); } catch (e) { if (e.code !== "ENOENT") throw e; }
        const map = new Map(data.split("\n").filter(Boolean).map(l => { const [n,c] = l.split(":"); return [n, Number(c)]; }));
        const name = message.author.username;
        map.set(name, (map.get(name) || 0) + 1);
        await fsPromises.writeFile(filePath, [...map.entries()].map(([n,c]) => `${n}:${c}`).join("\n") + "\n");
    } catch (e) { console.error("Name log error:", e.message); }
}

let delay = 0;
let reactionDelay = 0;
async function humanDelayWithTyping(channel, text) {
    if (!opts.typingDelay) return;
    let intervalId;
    const approxTotal = text.length * 150;
    reactionDelay = 1000 + Math.random() * 2000;
    await new Promise(r => setTimeout(r, reactionDelay));
    if (approxTotal > 7000) intervalId = setInterval(() => { channel.sendTyping().catch(() => {}); }, 7000);
    await channel.sendTyping().catch(() => {});
    delay = 0;
    for (let i = 0; i < text.length; i++) delay += 25 + Math.random()*100;
    await new Promise(r => setTimeout(r, delay));
    if (intervalId) clearInterval(intervalId);
}

client.on("ready", () => {
    console.log("Bot is now online!");
    console.log(`Channel: ${client.channels.cache.get(channelId)?.name}`);
    console.log(`Feel free to make merge requests of any new phrases you may have thought of to add to the bot!`)
});

client.on("messageCreate", async (message) => {
    if (message.channel.id !== channelId) return;
    if (ignoreUserIds.includes(message.author.id)) return;
    if (message.author.id === client.user.id) return;
    lastMessageTime = Date.now();
    if (maskNames.includes(message.author.username) && opts.autoSkipMasks) {
        await message.reply(hangupMessage);
        return;
    }

    if (endCallMessages.includes(message.content) && message.author.username === phoneBotName) {
        await message.reply(callMessage);
        return;
    }

    if (message.author.username === phoneBotName && message.content.includes("TIP")) return;

    hangupDelay = conf.hangupDelay;

    const reply = pMessages[Math.floor(Math.random() * pMessages.length)];

    if (opts.typingDelay) await humanDelayWithTyping(message.channel, reply);

    await message.channel.send(reply).catch(() => {});

    if (!opts.logToConsole) return;

    const name = opts.privacyMode ? message.author.username.slice(0,2)+".." : message.author.username;
    console.log(`${name}: ${message.content} > ${reply} @ ${Math.round(delay)/1000} + ${Math.round(reactionDelay)/1000}s`);

    if (!opts.disableNameLogging && !opts.privacyMode) updateFile(message, opts.namesFilePath);
});

if (process.platform === "win32") console.log("Windows detected — dev branch recommended.");

client.login(process.env.token).catch(err => console.error("Login failed:", err));
