import * as Discord from 'discord.js'
import { VoiceChannel, Message } from 'discord.js';
import Youtube from 'simple-youtube-api'
import ytdl from 'ytdl-core-discord';
import {TOKEN, prefix} from './config';

const discord = Discord;
const bot = new discord.Client();
var queue: Map<string, object> = new Map<string, object>();

bot.on("ready", () => console.log("I am ready"));

bot.on("message", msg => {
    if (msg.author == bot.user) return;
    if (!msg.content.toLowerCase().startsWith(prefix)) return;

    var command = msg.content.toLowerCase().substring(prefix.length).split(' ')[0];
    var args = msg.content.toLowerCase().substring(prefix.length + command.length + 1).split(' ');
    console.info(command)
    console.info(args.length)
    
    switch(command) {
        case "play":
            if (!msg.member.voiceChannel) return msg.channel.send(`You need to be in a voice channel.`);
            //if (msg.member.roles.some(r => ["Dev", "DJ", "Owner"].includes(r.name))
            //if (msg.author.id != msg.guild.ownerID && !msg.member.roles.some(r => ["DJ", "Owner", "Dev"])) 
            var vc: VoiceChannel = msg.member.voiceChannel;
            


            break;
        case "test":
            msg.channel.send("Test succeeded.");
            if (args.length == 1 && args[0] == '') break;
            else msg.channel.send(msg.content.substring(prefix.length + command.length + 1));
            break;
    }
});

async function video_handler(video: Video , msg: Message, vc: VoiceChannel) {
    
}

bot.login(TOKEN);
