import type { ThingDbModel, ThingSearchListItemDbModel } from "$lib/models/dbModels/clientSide"
import {
    RawDirectionDbModel, RawSpaceDbModel,
    RawThingDbModel, RawRelationshipDbModel,
    RawNoteDbModel, RawNoteToThingDbModel, RawFolderDbModel, RawFolderToThingDbModel, RawThingSearchListItemDbModel,
    stripThingDbModels,
    stripRelationshipDbModels,
    stripNoteDbModels,
    stripNoteToThingDbModels,
    stripFolderDbModels,
    stripFolderToThingDbModels,
    stripThingSearchListItemDbModels,
    stripDirectionDbModels,
    stripSpaceDbModels,
    RawDirectionToSpaceDbModel,
    stripDirectionToSpaceDbModels,
} from "$lib/models/dbModels/serverSide"


/*
 * Query Directions from the database.
 */
export async function queryDirections( directionIds: number ): Promise<null | RawDirectionDbModel>;
export async function queryDirections( directionIds: number[] ): Promise<RawDirectionDbModel[]>;
export async function queryDirections( directionIds: null, idsToExclude?: number[] ): Promise<RawDirectionDbModel[]>;
export async function queryDirections( directionIds: number | number[] | null, idsToExclude?: number[] ): Promise<null | RawDirectionDbModel | RawDirectionDbModel[]> {
    
    // If a null ID is supplied,
    if (directionIds === null) {
        // If no IDs to exclude are supplied, query all Directions.
        if (!idsToExclude) {
            const queriedDirectionDbModels = await RawDirectionDbModel.query()
                .orderBy('id')
            return queriedDirectionDbModels
        // If IDs to exclude are supplied, query all Directions not matching those IDs.
        } else {
            const queriedDirectionDbModels = await RawDirectionDbModel.query()
                .where(
                    (builder) => builder.whereNotIn('id', idsToExclude)
                )
                .orderBy('id')
            return queriedDirectionDbModels
        }

    // If a single ID is supplied, query based on match to that ID (or return null if nothing is found).
    } else if (typeof directionIds === "number") {
        const queriedDirectionDbModels = await RawDirectionDbModel.query()
            .where("id", directionIds)
            .orderBy('id')
        return queriedDirectionDbModels.length ? queriedDirectionDbModels[0] : null

    // If multiple IDs are supplied, query based on match to those IDs.
    } else if (directionIds.length) {
        const queriedDirectionDbModels = await RawDirectionDbModel.query()
            .where(
                (builder) => builder.whereIn('id', directionIds)
            )
            .orderBy('id')
        return queriedDirectionDbModels

    // If an empty array is supplied, return an empty array.
    } else {
        return []
    }
}


/*
 * Query Spaces from the database.
 */
export async function querySpaces( spaceIds: number ): Promise<null | RawSpaceDbModel>;
export async function querySpaces( spaceIds: number[] ): Promise<RawSpaceDbModel[]>;
export async function querySpaces( spaceIds: null, idsToExclude?: number[] ): Promise<RawSpaceDbModel[]>;
export async function querySpaces( spaceIds: number | number[] | null, idsToExclude?: number[] ): Promise<null | RawSpaceDbModel | RawSpaceDbModel[]> {
    
    // If a null ID is supplied,
    if (spaceIds === null) {
        // If no IDs to exclude are supplied, query all Spaces.
        if (!idsToExclude) {
            const queriedSpaceDbModels = await RawSpaceDbModel.query()
                .allowGraph('directions')
                .withGraphFetched('directions')
                .orderBy('id')
            return queriedSpaceDbModels
        // If IDs to exclude are supplied, query all Spaces not matching those IDs.
        } else {
            const queriedSpaceDbModels = await RawSpaceDbModel.query()
                .where(
                    (builder) => builder.whereNotIn('id', idsToExclude)
                )
                .allowGraph('directions')
                .withGraphFetched('directions')
                .orderBy('id')
            return queriedSpaceDbModels
        }

    // If a single ID is supplied, query based on match to that ID (or return null if nothing is found).
    } else if (typeof spaceIds === "number") {
        const queriedSpaceDbModels = await RawSpaceDbModel.query()
            .where("id", spaceIds)
            .allowGraph('directions')
            .withGraphFetched('directions')
            .orderBy('id')
        return queriedSpaceDbModels.length ? queriedSpaceDbModels[0] : null

    // If multiple IDs are supplied, query based on match to those IDs.
    } else if (spaceIds.length) {
        const queriedSpaceDbModels = await RawSpaceDbModel.query()
            .where(
                (builder) => builder.whereIn('id', spaceIds)
            )
            .allowGraph('directions')
            .withGraphFetched('directions')
            .orderBy('id')
        return queriedSpaceDbModels

    // If an empty array is supplied, return an empty array.
    } else {
        return []
    }
}

/*
 * Query Things from the database.
 */
export async function queryThings(thingIds: number): Promise<null | RawThingDbModel>;
export async function queryThings(thingIds: number[]): Promise<RawThingDbModel[]>;
export async function queryThings(thingIds: number | number[]): Promise<null | RawThingDbModel | RawThingDbModel[]> {

    // If a single ID is supplied, query based on match to that ID (or return null if nothing is found).
    if (typeof thingIds === "number") {
        const queriedThingDbModels = await RawThingDbModel.query()
            .where("id", thingIds)
            .allowGraph('[a_relationships, b_relationships, note]')
            .withGraphFetched('[a_relationships, b_relationships, note, folder]')
            .orderBy('id')
        return queriedThingDbModels.length ?
            queriedThingDbModels[0] :
            null

    // If multiple IDs are supplied, query based on match to those IDs.
    } else {
        const queriedThingDbModels = await RawThingDbModel.query()
            .where(
                (builder) => builder.whereIn('id', thingIds)
            )
            .allowGraph('[a_relationships, b_relationships, note, folder]')
            .withGraphFetched('[a_relationships, b_relationships, note, folder]')
            .orderBy('id')
        return queriedThingDbModels
    }
}

/*
 * Query Things from the database based on GUID.
 */
export async function queryThingsByGuid(thingGuids: string): Promise<null | ThingDbModel>;
export async function queryThingsByGuid(thingGuids: string[]): Promise<ThingDbModel[]>;
export async function queryThingsByGuid(thingGuids: string | string[]): Promise<null | ThingDbModel | ThingDbModel[]> {

    // If a single GUID is supplied, query based on match to that ID (or return null if nothing is found).
    if (typeof thingGuids === "string") {
        const queriedThingDbModels = await RawThingDbModel.query()
            .where("guid", thingGuids)
            .allowGraph('[a_relationships, b_relationships, note]')
            .withGraphFetched('[a_relationships, b_relationships, note, folder]')
            .orderBy('id')
        return queriedThingDbModels.length ?
            stripThingDbModels(queriedThingDbModels)[0] :
            null

    // If multiple IDs are supplied, query based on match to those IDs.
    } else {
        const queriedThingDbModels = await RawThingDbModel.query()
            .where(
                (builder) => builder.whereIn('guid', thingGuids)
            )
            .allowGraph('[a_relationships, b_relationships, note, folder]')
            .withGraphFetched('[a_relationships, b_relationships, note, folder]')
            .orderBy('id')
        return stripThingDbModels(queriedThingDbModels)
    }
}

/*
 * Query Thing search list from the database.
 */
export async function queryThingSearchList( thingIds: number[] | null ): Promise<ThingSearchListItemDbModel[]> {
    const queriedThingSearchListDbModels = thingIds === null ?
        await RawThingSearchListItemDbModel.query().orderBy('id') :
        await RawThingSearchListItemDbModel.query()
            .where(
                (builder) => builder.whereIn('id', thingIds)
            )
            .orderBy('id')

    return stripThingSearchListItemDbModels(queriedThingSearchListDbModels)
}

/*
 * Get the latest Graph constructs that were added to the database.
 */
export interface LatestConstructInfos {
    directions: {id: string | number, oppositeid: string | number | null, text: string | null, nameforobjects: string | null}[],
    spaces: {id: string | number | null, text: string | null}[],
    directionToSpaces: {id: string | number | null, directionid: string | number | null, spaceid: string | number | null, halfaxisid: string | number | null}[],
    things: {id: string | number, text: string}[],
    relationships: {id: string | number, thingaid: number | null, thingbid: number | null}[],
    notes: {id: string | number}[],
    noteToThings: {id: string | number, noteid: number, thingid: number}[],
    folders: {id: string | number}[],
    folderToThings: {id: string | number, folderid: number, thingid: number}[]
}
export async function getLatestConstructs(): Promise<LatestConstructInfos> {
    // Get latest Directions.
    const rawQueriedDirections = await RawDirectionDbModel.query().orderBy("id", "desc").limit(10)
    const queriedDirections = stripDirectionDbModels(rawQueriedDirections)
    // Get latest Spaces.
    const rawQueriedSpaces = await RawSpaceDbModel.query().orderBy("id", "desc").limit(10)
    const queriedSpaces = stripSpaceDbModels(rawQueriedSpaces)
    // Get latest DirectionToSpaces.
    const rawQueriedDirectionToSpaces = await RawDirectionToSpaceDbModel.query().orderBy("id", "desc").limit(10)
    const queriedDirectionToSpaces = stripDirectionToSpaceDbModels(rawQueriedDirectionToSpaces)
    // Get latest Things.
    const rawQueriedThings = await RawThingDbModel.query().orderBy("id", "desc").limit(10)
    const queriedThings = stripThingDbModels(rawQueriedThings)
    // Get latest Relationships.
    const rawQueriedRelationships = await RawRelationshipDbModel.query().orderBy("id", "desc").limit(10)
    const queriedRelationships = stripRelationshipDbModels(rawQueriedRelationships)
    // Get latest Notes.
    const rawQueriedNotes = await RawNoteDbModel.query().orderBy("id", "desc").limit(10)
    const queriedNotes = stripNoteDbModels(rawQueriedNotes)
    // Get latest NoteToThings.
    const rawQueriedNoteToThings = await RawNoteToThingDbModel.query().orderBy("id", "desc").limit(10)
    const queriedNoteToThings = stripNoteToThingDbModels(rawQueriedNoteToThings)
    // Get latest Folders.
    const rawQueriedFolders = await RawFolderDbModel.query().orderBy("id", "desc").limit(10)
    const queriedFolders = stripFolderDbModels(rawQueriedFolders)
    // Get latest FolderToThings.
    const rawQueriedFolderToThings = await RawFolderToThingDbModel.query().orderBy("id", "desc").limit(10)
    const queriedFolderToThings = stripFolderToThingDbModels(rawQueriedFolderToThings)

    // Return an object containing all the above.
    return {
        directions: queriedDirections.map(x => {return {id: x.id, oppositeid: x.oppositeid, text: x.text, nameforobjects: x.nameforobjects}}),
        spaces: queriedSpaces.map(x => {return {id: x.id, text: x.text}}),
        directionToSpaces: queriedDirectionToSpaces.map(x => {return {id: x.id, directionid: x.directionid, spaceid: x.spaceid, halfaxisid: x.halfaxisid}}),
        things: queriedThings.map(x => {return {id: x.id, text: x.text}}),
        relationships: queriedRelationships.map(x => {return {id: x.id, thingaid: x.thingaid, thingbid: x.thingbid}}),
        notes: queriedNotes.map(x => {return {id: x?.id || "NULL"}}),
        noteToThings: queriedNoteToThings.map(x => {return {id: x?.id || "NULL", noteid: x?.noteid || 0, thingid: x?.thingid || 0}}),
        folders: queriedFolders.map(x => {return {id: x?.id || "NULL"}}),
        folderToThings: queriedFolderToThings.map(x => {return {id: x?.id || "NULL", folderid: x?.folderid || 0, thingid: x?.thingid || 0}})
    }
}