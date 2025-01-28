const args = process.argv.slice(2);
const { count } = require("console");
const Discord = require("discord.js-selfbot-v13");
const fs = require('fs');
const fs2 = require('fs').promises;
const path = require('path');
const client = new Discord.Client();

let opts = { 
    l : true,   // Logging flag
    p : false,  // Privacy mode flag
    P : null,   // Phrases file path
    H : null,    // Hangup file path
    N : "names",
};

const defaultDir = __dirname;

for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    
    if (arg.startsWith('-')) {
        if (arg === '-h') {
            console.log('payphone-bot 2000 manual\narguments:\n\t-p - Privacy mode: hides full username, only displaying first 2 letters of username in console\n\t-l - Log to console: whether or not the messages, and responses should be logged to console\n\t-P <file> - Custom file path for phrases\n\t-H <file> - Custom file path for hangup');
            process.exit();
        } else if (arg === '-H') {
            if (i + 1 < args.length) {
                opts.H = args[i + 1];
                i++;
            }
        } else if (arg === '-P') {
            if (i + 1 < args.length) {
                opts.P = args[i + 1];
                i++;
            }
        } else if (arg === '-p') {
            opts.p = true;
        } else if (arg === '-l') {
            opts.l = false;
        } else {
            console.error(`Invalid argument: ${arg}. Cannot stack arguments.`);
            process.exit(1);
        }
    }
}

let fc = fs.readFileSync(opts.P || 'phrases', 'utf8');
const pMessages = fc.split(/\r?\n/);

fc = fs.readFileSync(opts.H || 'hangup', 'utf8');
const endCallMessages = fc.split(/\r?\n/);


async function updateFile(message, N) {
    try {
        let fileData = '';
        try {
            fileData = await fs2.readFile(N, 'utf-8');
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
        await fs2.writeFile(N, updatedData + '\n', 'utf-8');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

client.on("messageCreate", async (message) => {
    if (endCallMessages.includes(message.content)) {
        message.reply("p.c");
        return;
    }

    if ((message.channel.id === "1332098431900057713" && message.author.id !== "1213820532328370227") || message.author.id === "1274838039499112520") {
        if (message.author.username == "Payphone" && message.content.includes("TIP")) return;

        randomIndex = Math.floor(Math.random() * pMessages.length);
        await message.reply(pMessages[randomIndex]).catch((err) => console.error("Failed to send reply:", err));
        
        if (!opts.l) return;
        if (!opts.p) {
            console.log(`${message.author.username} : `, message.content, " > ", pMessages[randomIndex]);
            updateFile(message, "names");
        } else {
            console.log(`${message.author.username[0]}${message.author.username[1]}.. : `, message.content, " > ", pMessages[randomIndex]);

        }
        
    }
});

client.on("ready", () => {
    console.log("Bot is now online!");
});

require("dotenv").config();
const token = process.env.token
// put your token in a file named .env
client.login(token).catch((err) => {
    console.error("Failed to log in:", err);
});