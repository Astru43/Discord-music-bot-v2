import * as Discord from 'discord.js'
import { VoiceChannel, Message, PartialMessage, VoiceConnection, TextChannel, Guild } from 'discord.js';
import ytdl from 'ytdl-core';
import {TOKEN, prefix, GOOGLE_API_KEY} from './config';
import YouTube from 'simple-youtube-api'
import Video from './@types/simple-youtube-api/structures/Video';
import Playlist from './@types/simple-youtube-api/structures/Playlist';

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
    songs: Song[],
    connection: VoiceConnection | null,
    voiceChannel: VoiceChannel,
    textChannel: TextChannel,
    playing: boolean,
    volume: number,
    autoplaylist: boolean,
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
        /*case "stop":
            var ServerQueue = queue.get((msg.guild?.id as string));
            if (!ServerQueue) return msg.channel?.send(`Not playing anything.`);
            else if (!ServerQueue.songs) return msg.channel?.send(`Queue dosen't have any songs.`);
            
            break;*/
        case "pause":
            var ServerQueue = queue.get((msg.guild?.id as string));
            if (!ServerQueue) return msg.channel?.send(`Not playing anything.`);
            if (!ServerQueue.playing) return msg.channel?.send(`Already paused, type \`\`${prefix}play\`\` to continue.`);
            ServerQueue.playing = false;
            ServerQueue.connection?.dispatcher.pause(true);
            break;
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
        case "s":
        case "skip":    
            var ServerQueue = queue.get((msg.guild?.id as string));
            if (!ServerQueue) return msg.channel?.send(`There is nothing to skip.`);
            ServerQueue.connection?.dispatcher.end();
            break;
        case "p":
        case "play":
            var ServerQueue = queue.get((msg.guild?.id as string));
            if (ServerQueue && !args[0]) {
                if (ServerQueue.playing) break;
                else {
                    ServerQueue.playing = true;
                    ServerQueue.connection?.dispatcher.resume();
                    return;
                }
            }


            if (!msg.member?.voice.channel) return msg.channel?.send(`You need to be in a voice channel.`);
            var vc: VoiceChannel = msg.member?.voice.channel;
            var video: Video | null = null;
            var playlist: Playlist | null = null;

            let i = 0;
            while (args[i]) {
                switch(args[i]) {
                    case "-p":
                    case "-playlist":
                        i++
                        while (args[i]) {
                            if (args[i].startsWith('-')) break;
                            try {
                                var playlist = await yt.getPlaylistByID(args[i]);
                            } catch (error) {
                                try {
                                    var playlist = await yt.getPlaylist(args[i]);
                                } catch (error) {
                                    console.error(args[i]);
                                    console.error(error);
                                    msg.channel?.send("Can't find playlist specified");
                                }
                            }
                            playlist_handler((playlist as Playlist), msg, vc);
                            i++
                        }
                        break;
                    case "-v":
                    case "-video":
                        i++
                        while (args[i]) {
                            if (args[i].startsWith('-')) break;
                            try {
                                var video = await yt.getVideoByID(args[i]);
                            } catch (error) {
                                try {
                                    var video = await yt.getVideo(args[i]);
                                } catch (error) {
                                    console.error(args[i]);
                                    console.error(error);
                                    msg.channel?.send("Can't find video specified");
                                }
                            }
                            video_handler((video as Video), msg, vc);
                            i++
                        }
                        break;
                    case ""://Auto Playlist
                        auto_playlist_handler(msg, vc);
                        break;
                    default:
                        while (args[i]) {
                            if (args[i].startsWith('-')) break;
                            try {
                                var video = await yt.getVideoByID(args[i]);
                            } catch (error) {
                                try {
                                    var video = await yt.getVideo(args[i]);
                                } catch (error) {
                                    console.error(args[i]);
                                    console.error(error);
                                    msg.channel?.send("Can't find video specified");
                                }
                            }
                            video_handler((video as Video), msg, vc);
                            i++
                        }
                        break;
                }          
            }
            break;
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

async function auto_playlist_handler(msg: Message | PartialMessage, vc: VoiceChannel) {
    //Not implomented yet
}

async function playlist_handler(playlist: Playlist, msg: Message | PartialMessage, vc: VoiceChannel) {
    var serverQueue = queue.get((msg.guild?.id as string));
    if (!serverQueue) {
        var queueConstruct: ServerQueue = {
            textChannel: (msg.channel as TextChannel),
            voiceChannel: vc,
            playing: true,
            connection: null,
            volume: 0.6,
            autoplaylist: false,
            songs: Array<Song>()
        }
        var videos = await playlist.getVideos();
        videos.forEach(video => {
            var song: Song = {
                id: video.id,
                title: video.title,
                dur: video.duration,
                url: `https://youtube.com/watch?v=${video.id}`,
            }

            queueConstruct.songs.push(song);
        });
        queue.set((msg.guild?.id as string), queueConstruct)
        try {
            queueConstruct.connection = await vc.join();
            Play((msg.guild?.id as string), queueConstruct.songs[0]);
        } catch (error) {
            msg.channel?.send(`Can't join voice channel.`);
            queue.delete((msg.guild?.id as string));
            return console.error(error);
        }
    } else {
        var videos = await playlist.getVideos();
        videos.forEach(video => {
            var song: Song = {
                id: video.id,
                title: video.title,
                dur: video.duration,
                url: `https://youtube.com/watch?v=${video.id}`,
            }

            serverQueue?.songs.push(song);
        });
        console.log(`[${serverQueue.songs.length}]`);
        console.log(`Added ${playlist.length} videos from ${playlist.title}`);
    }
}

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
            autoplaylist: false,
        }
        queue.set((msg.guild?.id as string), queueConstruct);
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
        if (dispatcher?.streamTime) console.log(Math.floor((dispatcher.streamTime / 1000) / 60) + ':' + Math.floor((dispatcher.streamTime / 1000) % 60));
        serverQueue?.songs.shift();
        Play(guild, serverQueue?.songs[0]);
    });
    dispatcher?.on("error", error => console.error("Error: " + error));
    dispatcher?.setVolumeLogarithmic(serverQueue.volume / 5);
    
    console.log(`[${serverQueue.songs.length}]`);
    serverQueue.textChannel.send(`Now starting **${serverQueue.songs[0].title}**`);
}

bot.login(TOKEN);
