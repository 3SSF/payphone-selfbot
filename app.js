const args = process.argv.slice(2);
const { count } = require("console");
const Discord = require("discord.js-selfbot-v13");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const client = new Discord.Client();

let opts = { 
    logToConsole: true,       // -l
    privacyMode: false,       // -p
    phrasesFilePath: null,    // -P
    hangupFilePath: null,     // -H 
    namesFilePath: "names",   // -N
    disableNameLogging: false // -n 
};

for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    
    if (arg.startsWith('-')) {
        if (arg === '-h') {
            console.log('payphone-bot 2000 manual\narguments:\n\t-p - Privacy mode: hides full username, only displaying first 2 letters of username in console\n\t-l - Log to console: whether or not the messages, and responses should be logged to console\n\t-P <file> - Custom file path for phrases\n\t-H <file> - Custom file path for hangup\n\t-n - Disable name logging\n\t-N <file> - Custom file path for names');
            process.exit();
        }

        else if (arg === '-H' || arg === '-P' || arg === '-N') {
            if (i + 1 < args.length && args[i + 1].startsWith('-')) {
                console.error(`Error: Path flags (-P, -H, -N) cannot be stacked with other flags.`);
                process.exit(1);
            }
            if (arg === '-H') {
                opts.hangupFilePath = args[i + 1];
            } else if (arg === '-P') {
                opts.phrasesFilePath = args[i + 1];
            } else if (arg === '-N') {
                opts.namesFilePath = args[i + 1];
            }
            i++;
        }

        else if (arg.includes('p') || arg.includes('l') || arg.includes('n')) {
            if (arg.includes('P') || arg.includes('H') || arg.includes('N')) {
                console.error(`Error: Path flags (-P, -H, -N) cannot be stacked with other flags.`);
                process.exit(1);
            }
            
            for (let char of arg.slice(1)) {
                if (char === 'p') opts.privacyMode = true;
                else if (char === 'l') opts.logToConsole = true;
                else if (char === 'n') opts.disableNameLogging = true;
            }
        } else {
            console.error(`Invalid argument: ${arg}. Cannot stack arguments.`);
            process.exit(1);
        }
    }
}

let fc = fs.readFileSync(opts.phrasesFilePath || 'phrases', 'utf8');
const pMessages = fc.split(/\r?\n/);

fc = fs.readFileSync(opts.hangupFilePath || 'hangup', 'utf8');
const endCallMessages = fc.split(/\r?\n/);

fc = fs.readFileSync('c.json', 'utf-8');
const conf = JSON.parse(fc);

const channelId = String(conf.cI);

const ignoreUserIds = Array.isArray(conf.iUI) ? conf.iUI : [];

let timer = 30;

async function updateFile(message, namesFilePath) {
    try {
        let fileData = '';
        try {
            fileData = await fsPromises.readFile(namesFilePath, 'utf-8');
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }

        const lines = fileData.split('\n').filter(Boolean);
        
        const userMap = new Map(lines.map(line => {
            const [name, number] = line.split(':');
            return [name, parseInt(number, 10)];
        }));

        const username = message.author.username;
        const currentCount = userMap.get(username) || 0;
        userMap.set(username, currentCount + 1);

        const updatedData = Array.from(userMap).map(([name, number]) => `${name}:${number}`).join('\n');
        await fsPromises.writeFile(namesFilePath, updatedData + '\n', 'utf-8');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

(async () => {
    setInterval(async () => {
        if (timer <= 0){
            await client.channels.cache.get(channelId).send('p.h');
            await client.channels.cache.get(channelId).send('p.c');
        }
        timer--;
    }, 1000);
})();

if (process.platform == "win32") {
    console.log("Hey, we see you're running windows, we haven't completed compatibility, it may be buggy. Please do report any and every issue you find, on the github page by creating an issue, so we can better solve compatibility issues!");
 }

client.on("messageCreate", async (message) => {
    if ((message.channel.id === channelId && !ignoreUserIds.includes(message.author.id)) && message.author.id !== client.user.id) {
        if (endCallMessages.includes(message.content) && message.author.username == "Payphone"){
            await message.reply("p.c");
            return;
        }
        if (message.author.username == "Payphone" && message.content.includes("TIP")) return;

        timer = 30;

        randomIndex = Math.floor(Math.random() * pMessages.length);
        await message.reply(pMessages[randomIndex]).catch((err) => console.error("Failed to send reply:", err));
        
        if (!opts.logToConsole) return;
        if (!opts.privacyMode) {
            console.log(`${message.author.username} : `, message.content, " > ", pMessages[randomIndex]);
            if (!opts.disableNameLogging) {
                updateFile(message, opts.namesFilePath);
            }
        } else {
            console.log(`${message.author.username[0]}${message.author.username[1]}.. : `, message.content, " > ", pMessages[randomIndex]);
        }
    }
});

client.on("ready", () => {
    console.log("Bot is now online!");
});

require("dotenv").config();
const token = process.env.token;
client.login(token).catch((err) => {
    console.error("Failed to log in:", err);
});

