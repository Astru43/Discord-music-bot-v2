declare module 'simple-youtube-api'{
    class YouTube {
        constructor(key: string);
        key: string | null;
        request: import("./Request");
        getVideo(url: string, options?: Object | undefined): Promise<import("./structures/Video") | null>;
        getVideoByID(id: string, options?: Object | undefined): Promise<import("./structures/Video") | null>;
        getPlaylist(url: string, options?: Object | undefined): Promise<import("./structures/Playlist") | null>;
        getPlaylistByID(id: string, options?: Object | undefined): Promise<import("./structures/Playlist") | null>;
        getChannel(url: string, options?: Object | undefined): Promise<import("./structures/Channel") | null>;
        getChannelByID(id: string, options?: Object | undefined): Promise<import("./structures/Channel") | null>;
        search(query: string, limit?: number | undefined, options?: Object | undefined): Promise<(import("./structures/Channel") | import("./structures/Video") | import("./structures/Playlist") | null)[]>;
        searchVideos(query: string, limit?: number | undefined, options?: Object | undefined): Promise<import("./structures/Video")[]>;
        searchPlaylists(query: string, limit?: number | undefined, options?: Object | undefined): Promise<import("./structures/Playlist")[]>;
        searchChannels(query: string, limit?: number | undefined, options?: Object | undefined): Promise<import("./structures/Channel")[]>;

        readonly Video: import("./structures/Video");
        readonly Playlist: import("./structures/Playlist");
        readonly Channel: import("./structures/Channel");
    }
    export = YouTube;
}
