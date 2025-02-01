// READ ME!!!!!
/// IF YOU ARE USING DOTENV, YOU **NEED** TO HAVE THIS NEXT LINE ABOVE IT. OR IT WILL ERROR OUT FOR SOME ODD FUCKING REASON
// require("dotenv").config()
// idk why this works, but we're keeping it

const args = process.argv.slice(2);
const { count } = require("console");
const Discord = require("discord.js-selfbot-v13");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const client = new Discord.Client();

console.log('You are currently using the Windows development branch, there is no guarantee this will work properly, or even work at all!');
console.log("Please note ignoring users doesn't work on this branch currently.")
require("dotenv").config()
if (!process.env.channelId)
{
    console.log("Please run setup.ps1 or manually set the values in .env.")
    process.exit()
}
let opts = { 
    logToConsole: true,       // -l
    privacyMode: false,       // -p
    phrasesFilePath: null,    // -P
    hangupFilePath: null,     // -H 
    namesFilePath: null,   // -N
    disableNameLogging: false, // -n 
    skipMasks: true // whether to automatically skip masks or not.
};

const masksPath = 'info/masks'; // change to change where u put masks.
let masks = []

function loadMasks() {
    fs.readFile(masksPath, 'utf8', (err, data) => {
        if (err) return console.error('Error reading file:', err);
        
        const masks = data.split('\n').map(line => line.trim());
        console.log(masks);
    });
}

if (opts.skipMasks) {
    loadMasks();
}


if (process.platform !== "win32") {
    console.log("!!! LINUX DETECTED !!!")
    console.log("You are running a non-windows OS, please note this will be VERY instable, and probably wont work, unless you are on the right distros.")
    console.log("Please use our main branch for better compatibility with Linux, and other OS's.")
    console.log("-------------------------------------------------------")
 }

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

let pMessages = fs.readFileSync(opts.phrasesFilePath || 'info/phrases', 'utf8').split(/\r?\n/);
const endCallMessages = fs.readFileSync(opts.hangupFilePath || 'info/hangup', 'utf8').split(/\r?\n/);



require("dotenv").config()
const channelId = String(process.env.channelId);
console.log(channelId)

const ignoreUserIds = Array.isArray(process.env.iUI) ? process.env.iUI : [];
ignoreUserIds.forEach(function(entry) {
    console.log(entry);
  });

let timer = 30;

async function updateFile(message) {
    try {
        let fileData = '';
        try {
            fileData = await fsPromises.readFile('info/names', 'utf-8');
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
        await fsPromises.writeFile('info/names', updatedData + '\n', 'utf-8');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

//(async () => {
  //  setInterval(async () => {
        //if (timer <= 0){
          //  await client.channels.cache.get(channelId).send('p.h');
        //    await client.channels.cache.get(channelId).send('p.c');
      //  }
    //    timer--;
  //  }, 1000);
//})();

client.on("messageCreate", async (message) => {
    if(message == "")
    {
        stop
    }
    if (ignoreUserIds.includes(message.author.id))
    {
        stop
    }
    
    if (message.channel.id === channelId && message.author.id !== client.user.id) {
        if (masks.includes(message.author.displayName)) {
            await message.reply("p.h");
            await message.reply("p.c");
            
        }
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
        
