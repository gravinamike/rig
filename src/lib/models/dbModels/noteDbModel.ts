export interface NoteDbModel {
    id: string | number
    guid: string
    text: string
    whencreated: string | null
    whenmodded: string | null
}

export interface NoteToThingDbModel {
    id: string | number
    noteid: number
    thingid: number
}

export interface NoteSearchListItemDbModel {
    id: number
    guid: string
    text: string
    thingId: number | null
}