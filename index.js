const Discord = require("discord.js");
const {TOKEN, prefix} = require("./config");

const discord = Discord;
const bot = new discord.Client();

bot.on("ready", () => console.log("I am ready"));

bot.on("message", msg => {
    if (msg.content.toLowerCase().startsWith(prefix)) var args = msg.content.toLowerCase().split(' ');
    
    switch(args[0]) {
        case "test":
            msg.channel.sendMessage("Test succeeded.");
            break;
    }
});

bot.login(TOKEN);