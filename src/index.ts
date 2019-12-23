import * as Discord from 'discord.js'
import { VoiceChannel, Message, PartialMessage, VoiceConnection, TextChannel, Guild } from 'discord.js';
import ytdl from 'ytdl-core';
import {TOKEN, prefix, GOOGLE_API_KEY} from './config';
import YouTube from 'simple-youtube-api'
import Video from './@types/simple-youtube-api/structures/Video';

const discord = Discord;
const bot = new discord.Client();
const yt = new YouTube(GOOGLE_API_KEY);

type Song = {
    id:Video["id"],
    title:Video["title"],
    dur:Video["duration"],
    url: string,    
};

type ServerQueue = {
    songs: [Song],
    connection: VoiceConnection | null,
    voiceChannel: VoiceChannel,
    textChannel: TextChannel,
    playing: boolean,
    volume: number,
};

var queue: Map<string, ServerQueue> = new Map<string, ServerQueue>();

bot.on("ready", () => console.log("I am ready"));

bot.on("message", async msg => {
    if (!msg.content) return;
    if (msg.author == bot.user) return;
    if (!msg.content?.toLowerCase().startsWith(prefix)) return;
    //if (!msg.member.roles.some(r => ["Dev", "DJ", "Owner"].includes(r.name))) return msg.channel.send(`You don't have premission to use this bot.`);
    //if (msg.author.id != msg.guild.ownerID) return msg.channel.send(`You don't have premission to use this bot.`);

    var command = msg.content.toLowerCase().substring(prefix.length).split(' ')[0];
    var args = msg.content.substring(prefix.length + command.length + 1).split(' ');
    
    switch(command) {
        case "vol":
        case "volume":
            if (!args[0]) {
                var curVol = queue.get((msg.guild?.id as string))?.volume;
                if (!curVol) return msg.channel?.send(`Not playing anything`);
                return msg.channel?.send(`Current volume is: ${curVol}`);
            } else if (!isNaN(Number(args[0]))){
                var ServerQueue = queue.get((msg.guild?.id as string));
                if (!ServerQueue) return msg.channel?.send(`Not playing anything.`);
                ServerQueue.volume = Number(args[0]);
                ServerQueue.connection?.dispatcher.setVolumeLogarithmic(ServerQueue.volume / 5);
                return msg.channel?.send(`Set volume to: ${args[0]}`);
            } else return msg.channel?.send(`Given value is not a number: ${args[0]}`);
        case "p":
        case "play":
            if (!msg.member?.voice.channel) return msg.channel?.send(`You need to be in a voice channel.`);
            var vc: VoiceChannel = msg.member?.voice.channel;
            var video: Video | null = null;
            //if (args[0] != "playlist") {
                try {
                    var video = await yt.getVideoByID(args[0]);
                } catch (error) {
                    try {
                        var video = await yt.getVideo(args[0]);
                    } catch (error) {
                        console.error(args[0]);
                        console.error(error);
                        return msg.channel?.send("Can't find video specified");
                    }
                }
            //} else {
                //yt.getPlaylist(args[1]);
            return video_handler((video as Video), msg, vc);
        case "test":
            msg.channel?.send("Test succeeded.");
            if (args.length == 1 && args[0] == '') break;
            else msg.channel?.send(msg.content.substring(prefix.length + command.length + 1));
            break;
        case "clear":
                if (!msg.member?.roles.some(r => ["Dev"].includes(r.name))) return msg.channel?.send(`You don't have premission to use this command.`);
                queue.delete((msg.guild?.id as string));
                msg.channel?.send("Deleted server queue");
                break;
    }
});

async function video_handler(video: Video , msg: Message | PartialMessage, vc: VoiceChannel) {
    var serverQueue = queue.get((msg.guild?.id as string));
    var song: Song = {
        id: video.id,
        title: video.title,
        dur: video.duration,
        url: `https://youtube.com/watch?v=${video.id}`,
    }

    if (!serverQueue) {
        var queueConstruct: ServerQueue = {
            textChannel: (msg.channel as TextChannel),
            voiceChannel: vc,
            playing: true,
            connection: null,
            songs: [song],
            volume: 0.6,
        }
        queue.set((msg.guild?.id as string), queueConstruct);
        console.log(`[${queueConstruct.songs.length}]`);
        try {
            queueConstruct.connection = await vc.join();
            Play((msg.guild?.id as string), queueConstruct.songs[0]);
        } catch (error) {
            msg.channel?.send(`Can't join voice channel.`);
            queue.delete((msg.guild?.id as string));
            return console.error(error);
        }
    } else {
        serverQueue.songs.push(song);
        console.log(`[${serverQueue.songs.length}]`);
        msg.channel?.send(`Song **${video.title}** added to queue.`);
    }
}

async function Play(guild: Guild["id"], song?: Song) {
    var serverQueue = queue.get(guild);

    if (!serverQueue) return console.error("Invalid server queue")
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild);
        return;
    }

    var dispatcher = serverQueue.connection?.play(ytdl(song.url, { filter: "audioonly" }), { bitrate: 192000, volume: true, highWaterMark: 256 });
    dispatcher?.on("finish", () => {
        serverQueue?.songs.shift();
        Play(guild, serverQueue?.songs[0]);
    });
    dispatcher?.on("error", error => console.error("Error: " + error));
    dispatcher?.setVolumeLogarithmic(serverQueue.volume / 5);
    
    serverQueue.textChannel.send(`Now starting **${serverQueue.songs[0].title}**`);
}

bot.login(TOKEN);
