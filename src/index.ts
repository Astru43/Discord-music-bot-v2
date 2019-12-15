import * as Discord from 'discord.js'
import { VoiceChannel, Message, VoiceConnection, TextChannel, Guild } from 'discord.js';
import ytdl from 'ytdl-core-discord';
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
    songs?: [Song],
    connection: VoiceConnection | null,
    voiceChannel: VoiceChannel,
    textChannel: TextChannel,
    playing: boolean,
};

var queue: Map<string, ServerQueue> = new Map<string, ServerQueue>();

bot.on("ready", () => console.log("I am ready"));

bot.on("message", async msg => {
    if (msg.author == bot.user) return;
    if (!msg.content.toLowerCase().startsWith(prefix)) return;
    //if (!msg.member.roles.some(r => ["Dev", "DJ", "Owner"].includes(r.name))) return msg.channel.send(`You don't have premission to use this bot.`);
    //if (msg.author.id != msg.guild.ownerID) return msg.channel.send(`You don't have premission to use this bot.`);

    var command = msg.content.toLowerCase().substring(prefix.length).split(' ')[0];
    var args = msg.content.substring(prefix.length + command.length + 1).split(' ');
    
    switch(command) {
        case "play":
            if (!msg.member.voiceChannel) return msg.channel.send(`You need to be in a voice channel.`);
            var vc: VoiceChannel = msg.member.voiceChannel;
            var video: Video | null = null;
            //if (args[0] != "playlist") {
                try {
                    var video = await yt.getVideoByID(args[0]);
                    msg.channel.send(video?.id + " 1");
                } catch (error) {
                    try {
                        var video = await yt.getVideo(args[0]);
                        msg.channel.send(video?.id + " 2");
                    } catch (error) {
                        console.error(args[0]);
                        console.error(error);
                        return msg.channel.send("Can't find video specified");
                    }
                }
            //} else {
                //yt.getPlaylist(args[1]);
            return video_handler((video as Video), msg, vc);
        case "test":
            msg.channel.send("Test succeeded.");
            if (args.length == 1 && args[0] == '') break;
            else msg.channel.send(msg.content.substring(prefix.length + command.length + 1));
            break;
        case "clear":
                queue.delete(msg.guild.id);
                break;
    }
});

async function video_handler(video: Video , msg: Message, vc: VoiceChannel) {
    var serverQueue = queue.get(msg.guild.id);
    var song: Song = {
        id: video.id,
        title: video.title,
        dur: video.duration,
        url: `https://youtube.com/watch?v=${video.id}`,
    }

    if (!serverQueue) {
        var queueConstruct: ServerQueue/*{
            songs?: [Song];
            connection: VoiceConnection | null,
            voiceChannel: VoiceChannel,
            textChannel: typeof msg.channel,
            playing: boolean,
        }*/ = {
            textChannel: (msg.channel as TextChannel),
            voiceChannel: vc,
            playing: true,
            connection: null,
        }
        queue.set(msg.guild.id, queueConstruct);
        queueConstruct.songs = [song];
        console.log(`[${queueConstruct.songs.length}]`);
        try {
            queueConstruct.connection = await vc.join();
            Play(msg.guild.id, queueConstruct.songs[0]);
        } catch (error) {
            msg.channel.send(`Can't join voice channel.`);
            queue.delete(msg.guild.id);
            return console.error(error);
        }
    } else {
        serverQueue.songs?.push(song);
        console.log(`[${serverQueue.songs?.length}]`);
    }
}

function Play(guild: Guild["id"], song: Song) {

}

bot.login(TOKEN);
