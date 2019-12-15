import Channel = require("./Channel");
import YouTube = require("simple-youtube-api");
import Video = require("./Video");

type Thumbnail = {
    url: string;
    width: number;
    height: number;
};

export = Playlist;
declare class Playlist {
    static extractID(url: string): string | null;
    constructor(youtube: any, data: Object);
    youtube: YouTube;
    type: string;
    videos: Array<Video>;
    _patch(data: any): Playlist | undefined;
    raw: any;
    channel: Channel;
    id: any;
    title: string | null;
    description: string | null;
    publishedAt: Date | null;
    thumbnails: {
        [x: string]: Thumbnail;
    } | null;
    channelTitle: string | null;
    defaultLanguage: string | null;
    localized: {
        title: string;
        description: string;
    } | null;
    privacy: string;
    length: number;
    embedHTML: string;
    get url(): string;
    fetch(options?: any): Playlist;
    getVideos(limit?: number | undefined, options?: Object | undefined): Promise<import("./Video")[]>;
}