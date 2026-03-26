const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const chalk = require('chalk');

// ====== NASTAVENÍ ======
const ALERT_USER_ID = "USER_ID";   // ID druhého účtu
const ALERT_KEYWORDS = ["ahoj", "ping", "nějaké slovo"];
const LOG_FILE = "/home/linuxmint/Desktop/log.txt"; // cesta k logu

// ====== VYTVOŘENÍ CLIENTA ======
const client = new Client({
    checkUpdate: false // selfbot-specifická volba
});

// ====== READY EVENT ======
client.once("ready", () => {
    console.log(`${client.user.tag} je připraven!`);
});

// ====== MESSAGE EVENT ======
client.on("messageCreate", async (message) => {
    // IGNORUJ VLASTNÍ ZPRÁVY A BOTS
    if (message.author.id === client.user.id || message.author.bot) return;

    // zjištění serveru a kanálu
    const guildName = message.guild ? message.guild.name : "DM";
    const channelName = message.channel.name ? message.channel.name : "DM";

    // ====== LOGOVÁNÍ DO SOUBORU S ČÍSLEM ŘÁDKU ======
    const timestamp = new Date().toISOString();

    // načti existující řádky pro číslování
    let lineNumber = 1;
    if (fs.existsSync(LOG_FILE)) {
        const existingLines = fs.readFileSync(LOG_FILE, 'utf-8').split('\n');
        lineNumber = existingLines.filter(l => l.trim() !== '').length + 1;
    }

    // zkontroluj, jestli je alert
    const isAlert = ALERT_KEYWORDS.some(word =>
        message.content.toLowerCase().includes(word.toLowerCase())
    );

    // vytvoř řádek logu
    const logLine = `[${lineNumber}] [${timestamp}]${isAlert ? ' [ALERT]' : ''} [${guildName} -> ${channelName}] ${message.author.tag}: ${message.content}\n`;

    // zapiš do souboru (vlastní zprávy už jsou ignorované)
    fs.appendFileSync(LOG_FILE, logLine);

    // ====== ALERT V KONZOLI A DM ======
    if (isAlert) {
        console.log(chalk.red(logLine.trim()));

        try {
            const user = await client.users.fetch(ALERT_USER_ID);
            await user.send(`⚠️ Alert! Zaznělo slovo.\nServer: ${guildName}\nKanál: ${channelName}\nObsah zprávy: ${message.content}`);
        } catch (err) {
            console.error("Nepodařilo se poslat alert:", err);
        }
    }
});

// ====== LOGIN ======
client.login('TOKEN');
