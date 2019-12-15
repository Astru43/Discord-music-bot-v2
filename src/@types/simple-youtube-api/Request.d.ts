export = Request;
declare class Request {
    constructor(youtube: any);
    youtube: any;
    make(endpoint: string, qs?: any): Promise<any>;
    getResource(type: string, qs?: any): Promise<any>;
    getResourceByID(type: string, id: string, qs?: any): Promise<any>;
    getVideo(id: string, options?: any): Promise<any>;
    getPlaylist(id: string, options?: any): Promise<any>;
    getChannel(id: string, options?: any): Promise<any>;
    getPaginated(endpoint: string, count?: number | undefined, options?: Object | undefined, fetched?: any[] | undefined, pageToken?: string | null | undefined): Promise<any[]>;
}
