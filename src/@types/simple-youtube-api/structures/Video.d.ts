import Channel = require("./Channel");
import YouTube = require("simple-youtube-api");

type Thumbnail = {
    url: string;
    width: number;
    height: number;
};


export = Video;
declare class Video {
    static extractID(url: string): string | null;
    constructor(youtube: any, data: Object);
    youtube: YouTube;
    type: string;
    _patch(data: any): Video | undefined;
    raw: object;
    full: boolean;
    kind: string;
    id: any;
    title: string;
    description: string;
    thumbnails: Object;
    publishedAt: Date;
    channel: Channel;
    duration: DurationObject | null;
    get maxRes(): any;
    get url(): string;
    get shortURL(): string;
    get durationSeconds(): number;
    fetch(options?: any): Video;
}

type DurationObject = {
    hours?: number;
    minutes?: number;
    seconds?: number;
};
