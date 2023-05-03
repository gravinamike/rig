export interface FolderDbModel {
    id: string | number
    whencreated: string | null
    path: string
}

export interface FolderToThingDbModel {
    id: string | number
    folderid: number
    thingid: number
}