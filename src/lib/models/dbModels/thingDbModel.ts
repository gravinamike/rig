import type { RelationshipDbModel } from "./relationshipDbModel"
import type { FolderDbModel, FolderToThingDbModel } from "./folderDbModel"
import type { NoteDbModel, NoteToThingDbModel } from "./noteDbModel"


export interface ThingDbModel {
    id: string | number
    guid: string
    text: string
    whencreated: string | null
    whenmodded: string | null
    whenvisited: string | null
    defaultplane: number | null//CAN WE RENAME TO DEFAULTSPACEID?
    perspectiveexpansions: string// Default is "{}"
    perspectivetexts: string// Default is "{}"
    defaultcontentviewer: string

    note: NoteDbModel | null
    folder: FolderDbModel | null
    a_relationships: RelationshipDbModel[]
    b_relationships: RelationshipDbModel[]
    noteToThing: NoteToThingDbModel | null
    folderToThing: FolderToThingDbModel | null
}


export interface ThingSearchListItemDbModel {
    id: number
    guid: string
    text: string
}