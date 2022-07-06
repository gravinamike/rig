import {
    DirectionDbModel, SpaceDbModel,
    ThingDbModel, RelationshipDbModel,
    NoteDbModel, NoteToThingDbModel, FolderDbModel, FolderToThingDbModel,
    ThingSearchListItemDbModel
} from "$lib/models/dbModels"
import { Direction, Space, Thing, ThingSearchListItem } from "$lib/models/graphModels"


/*
 * Query Directions from the database.
 */
export async function queryDirections( directionIds: number ): Promise<null | Direction>;
export async function queryDirections( directionIds: number[] ): Promise<Direction[]>;
export async function queryDirections( directionIds: null, idsToExclude?: number[] ): Promise<Direction[]>;
export async function queryDirections( directionIds: number | number[] | null, idsToExclude?: number[] ): Promise<null | Direction | Direction[]> {
    
    // If a null ID is supplied,
    if (directionIds === null) {
        // If no IDs to exclude are supplied, query all Directions.
        if (!idsToExclude) {
            const queriedDirectionDbModels = await DirectionDbModel.query()
                .orderBy('id')

            const queriedDirections: Direction[] = []
            for (const model of queriedDirectionDbModels) {
                queriedDirections.push( new Direction(model) )
            }

            return queriedDirections
        // If IDs to exclude are supplied, query all Directions not matching those IDs.
        } else {
            const queriedDirectionDbModels = await DirectionDbModel.query()
                .where(
                    (builder) => builder.whereNotIn('id', idsToExclude)
                )
                .orderBy('id')

            const queriedDirections: Direction[] = []
            for (const model of queriedDirectionDbModels) {
                queriedDirections.push( new Direction(model) )
            }

            return queriedDirections
        }

    // If a single ID is supplied, query based on match to that ID (or return null if nothing is found).
    } else if (typeof directionIds === "number") {
        const queriedDirectionDbModels = await DirectionDbModel.query()
            .where("id", directionIds)
            .orderBy('id')

        const queriedDirections: Direction[] = []
        for (const model of queriedDirectionDbModels) {
            queriedDirections.push( new Direction(model) )
        }

        return queriedDirections.length ? queriedDirections[0] : null

    // If multiple IDs are supplied, query based on match to those IDs.
    } else if (directionIds.length) {
        const queriedDirectionDbModels = await DirectionDbModel.query()
            .where(
                (builder) => builder.whereIn('id', directionIds)
            )
            .orderBy('id')

        const queriedDirections: Direction[] = []
        for (const model of queriedDirectionDbModels) {
            queriedDirections.push( new Direction(model) )
        }

        return queriedDirections

    // If an empty array is supplied, return an empty array.
    } else {
        return []
    }
}


/*
 * Query Spaces from the database.
 */
export async function querySpaces( spaceIds: number ): Promise<null | Space>;
export async function querySpaces( spaceIds: number[] ): Promise<Space[]>;
export async function querySpaces( spaceIds: null, idsToExclude?: number[] ): Promise<Space[]>;
export async function querySpaces( spaceIds: number | number[] | null, idsToExclude?: number[] ): Promise<null | Space | Space[]> {
    
    // If a null ID is supplied,
    if (spaceIds === null) {
        // If no IDs to exclude are supplied, query all Spaces.
        if (!idsToExclude) {
            const queriedSpaceDbModels = await SpaceDbModel.query()
                .allowGraph('directions')
                .withGraphFetched('directions')
                .orderBy('id')

            const queriedSpaces: Space[] = []
            for (const model of queriedSpaceDbModels) {
                queriedSpaces.push( new Space(model) )
            }

            return queriedSpaces
        // If IDs to exclude are supplied, query all Spaces not matching those IDs.
        } else {
            const queriedSpaceDbModels = await SpaceDbModel.query()
                .where(
                    (builder) => builder.whereNotIn('id', idsToExclude)
                )
                .allowGraph('directions')
                .withGraphFetched('directions')
                .orderBy('id')

            const queriedSpaces: Space[] = []
            for (const model of queriedSpaceDbModels) {
                queriedSpaces.push( new Space(model) )
            }

            return queriedSpaces
        }

    // If a single ID is supplied, query based on match to that ID (or return null if nothing is found).
    } else if (typeof spaceIds === "number") {
        const queriedSpaceDbModels = await SpaceDbModel.query()
            .where("id", spaceIds)
            .allowGraph('directions')
            .withGraphFetched('directions')
            .orderBy('id')

        const queriedSpaces: Space[] = []
        for (const model of queriedSpaceDbModels) {
            queriedSpaces.push( new Space(model) )
        }

        return queriedSpaces.length ? queriedSpaces[0] : null

    // If multiple IDs are supplied, query based on match to those IDs.
    } else if (spaceIds.length) {
        const queriedSpaceDbModels = await SpaceDbModel.query()
            .where(
                (builder) => builder.whereIn('id', spaceIds)
            )
            .allowGraph('directions')
            .withGraphFetched('directions')
            .orderBy('id')

        const queriedSpaces: Space[] = []
        for (const model of queriedSpaceDbModels) {
            queriedSpaces.push( new Space(model) )
        }

        return queriedSpaces

    // If an empty array is supplied, return an empty array.
    } else {
        return []
    }
}

/*
 * Query Things from the database.
 */
export async function queryThings(thingIds: number): Promise<null | Thing>;
export async function queryThings(thingIds: number[]): Promise<Thing[]>;
export async function queryThings(thingIds: number | number[]): Promise<null | Thing | Thing[]> {

    // If a single ID is supplied, query based on match to that ID (or return null if nothing is found).
    if (typeof thingIds === "number") {
        const queriedThingDbModels = await ThingDbModel.query()
            .where("id", thingIds)
            .allowGraph('[a_relationships, b_relationships, note]')
            .withGraphFetched('[a_relationships, b_relationships, note, folder]')
            .orderBy('id')

        const queriedThing = queriedThingDbModels.length ?
            new Thing(queriedThingDbModels[0]) :
            null

        return queriedThing

    // If multiple IDs are supplied, query based on match to those IDs.
    } else {
        const queriedThingDbModels = await ThingDbModel.query()
            .where(
                (builder) => builder.whereIn('id', thingIds)
            )
            .allowGraph('[a_relationships, b_relationships, note, folder]')
            .withGraphFetched('[a_relationships, b_relationships, note, folder]')
            .orderBy('id')

        const queriedThings: Thing[] = []
        for (const model of queriedThingDbModels) {
            queriedThings.push( new Thing(model) )
        }

        return queriedThings
    }
}

/*
 * Query Things from the database based on GUID.
 */
export async function queryThingsByGuid(thingGuids: string): Promise<null | Thing>;
export async function queryThingsByGuid(thingGuids: string[]): Promise<Thing[]>;
export async function queryThingsByGuid(thingGuids: string | string[]): Promise<null | Thing | Thing[]> {

    // If a single GUID is supplied, query based on match to that ID (or return null if nothing is found).
    if (typeof thingGuids === "string") {
        const queriedThingDbModels = await ThingDbModel.query()
            .where("guid", thingGuids)
            .allowGraph('[a_relationships, b_relationships, note]')
            .withGraphFetched('[a_relationships, b_relationships, note, folder]')
            .orderBy('id')

        const queriedThing = queriedThingDbModels.length ?
            new Thing(queriedThingDbModels[0]) :
            null

        return queriedThing

    // If multiple IDs are supplied, query based on match to those IDs.
    } else {
        const queriedThingDbModels = await ThingDbModel.query()
            .where(
                (builder) => builder.whereIn('guid', thingGuids)
            )
            .allowGraph('[a_relationships, b_relationships, note, folder]')
            .withGraphFetched('[a_relationships, b_relationships, note, folder]')
            .orderBy('id')

        const queriedThings: Thing[] = []
        for (const model of queriedThingDbModels) {
            queriedThings.push( new Thing(model) )
        }

        return queriedThings.length ? queriedThings : null
    }
}

/*
 * Query Thing search list from the database.
 */
export async function queryThingSearchList( thingIds: number[] | null ): Promise<ThingSearchListItem[]> {
    const queriedThingSearchListDbModels = thingIds === null ?
        await ThingSearchListItemDbModel.query().orderBy('id') :
        await ThingSearchListItemDbModel.query()
            .where(
                (builder) => builder.whereIn('id', thingIds)
            )
            .orderBy('id')
    
    const queriedThingSearchList: ThingSearchListItem[] = []
    for (const dbModel of queriedThingSearchListDbModels) {
        queriedThingSearchList.push( new ThingSearchListItem(dbModel) )
    }

    return queriedThingSearchList
}

/*
 * Get the latest Graph constructs that were added to the database.
 */
export interface LatestConstructInfos {
    things: {id: number, text: string}[],
    relationships: {id: number, thingaid: number | null, thingbid: number | null}[],
    notes: {id: number}[],
    noteToThings: {id: number, noteid: number, thingid: number}[],
    folders: {id: number}[],
    folderToThings: {id: number, folderid: number, thingid: number}[]
}
export async function getLatestConstructs(): Promise<LatestConstructInfos> {
    // Get latest Things.
    const queriedThings = await ThingDbModel.query().orderBy("id", "desc").limit(10)
    // Get latest Relationships.
    const queriedRelationships = await RelationshipDbModel.query().orderBy("id", "desc").limit(10)
    // Get latest Notes.
    const queriedNotes = await NoteDbModel.query().orderBy("id", "desc").limit(10)
    // Get latest NoteToThings.
    const queriedNoteToThings = await NoteToThingDbModel.query().orderBy("id", "desc").limit(10)
    // Get latest Folders.
    const queriedFolders = await FolderDbModel.query().orderBy("id", "desc").limit(10)
    // Get latest FolderToThings.
    const queriedFolderToThings = await FolderToThingDbModel.query().orderBy("id", "desc").limit(10)

    // Return an object containing all the above.
    return {
        things: queriedThings.map(x => {return {id: x.id, text: x.text}}),
        relationships: queriedRelationships.map(x => {return {id: x.id, thingaid: x.thingaid, thingbid: x.thingbid}}),
        notes: queriedNotes.map(x => {return {id: x.id}}),
        noteToThings: queriedNoteToThings.map(x => {return {id: x.id, noteid: x.noteid, thingid: x.thingid}}),
        folders: queriedFolders.map(x => {return {id: x.id}}),
        folderToThings: queriedFolderToThings.map(x => {return {id: x.id, folderid: x.folderid, thingid: x.thingid}})
    }
}