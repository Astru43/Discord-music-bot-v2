import YouTube = require("simple-youtube-api");

type Thumbnail = {
    url: string;
    width: number;
    height: number;
};

export = Channel;
declare class Channel {
    static extractID(url: string): string | null;
    constructor(youtube: any, data: Object);
    youtube: YouTube;
    type: string;
    _patch(data: any): Channel | undefined;
    raw: object;
    full: boolean;
    kind: string;
    id: any;
    title: any;
    description: string | null;
    customURL: string | null;
    publishedAt: Date | null;
    thumbnails: {
        [x: string]: Thumbnail;
    } | null;
    defaultLanguage: string | null;
    localized: {
        title: string;
        description: string;
    } | null;
    country: string | null;
    relatedPlaylists: Object | null;
    viewCount: number | null;
    commentCount: number | null;
    subscriberCount: number | null;
    hiddenSubscriberCount: boolean | null;
    videoCount: number | null;
    fetch(options?: any): Channel;
    get url(): string;
}
