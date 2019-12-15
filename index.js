const Discord =  require('discord.js');
const ytdl = require('ytdl-core-discord')
const {TOKEN, prefix, GOOGLE_API_KEY} = require('./config');
const YouTube = require('simple-youtube-api')

const discord = Discord;
const bot = new discord.Client();
const yt = new YouTube(GOOGLE_API_KEY);

var queue= new Map();

bot.on("ready", () => console.log("I am ready"));

bot.on("message", async msg => {
    if (msg.author == bot.user) return;
    if (!msg.content.toLowerCase().startsWith(prefix)) return;

    var command = msg.content.toLowerCase().substring(prefix.length).split(' ')[0];
    var args = msg.content.substring(prefix.length + command.length + 1).split(' ');
    console.info(command)
    console.info(args)
    
    switch(command) {
        case "play":
            if (!msg.member.voiceChannel) return msg.channel.send(`You need to be in a voice channel.`);
            //if (msg.member.roles.some(r => ["Dev", "DJ", "Owner"].includes(r.name))
            //if (msg.author.id != msg.guild.ownerID && !msg.member.roles.some(r => ["DJ", "Owner", "Dev"])) 
            var vc = msg.member.voiceChannel;
            var video = null;
            //let video: Video | null; 
            //if (args[0] != "playlist") {
                try {
                    var video = await yt.getVideo(args[0]);
                } catch (error) {
                    try {
                        console.info(video);
                        var video = await yt.getVideoByID(args[0]);
                    } catch (error) {
                        console.info(video);
                        console.error(args[0]);
                        console.error(error);
                        return msg.channel.send("Can't find video specified");
                    }
                }
            //} else {
                //yt.getPlaylist(args[1]);
            return video_handler(video, msg, vc);
        case "test":
            msg.channel.send("Test succeeded.");
            if (args.length == 1 && args[0] == '') break;
            else msg.channel.send(msg.content.substring(prefix.length + command.length + 1));
            break;
    }
});

async function video_handler(video, msg, vc) {
    var serverQueue = queue.get(msg.guild.id);
    var song = {
        id: video.id,
        title: video.title,
        dur: video.duration,
        url: `https://youtube.com/watch?v=${video.id}`,
    }

    if (!serverQueue) {
        var queueConstruct = {
            songs: [],
            textChannel: msg.channel,
            voiceChannel: vc,
            playing: true,
            connection: null,
        }
        queue.set(msg.guild.id, queueConstruct);
        queueConstruct.songs.push(song)
        console.log(queueConstruct.songs);
        queueConstruct.connection = await vc.join();

    }
}

bot.login(TOKEN);
