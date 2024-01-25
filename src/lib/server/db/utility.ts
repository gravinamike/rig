// Import types.
import type { Knex } from "knex"

// Import SvelteKit framework resources.
import { get } from "svelte/store"

// Import stores.
import { loggerStore } from "$lib/stores"
const logger = get(loggerStore)

// Import ORM-related resources.
import { Model } from "objection"
import {
    RawSpaceDbModel, RawDirectionDbModel, RawThingDbModel, RawRelationshipDbModel,
    RawNoteDbModel, RawNoteToThingDbModel, RawFolderDbModel, RawFolderToThingDbModel
} from "$lib/server/models"

// Import API-related resources.
import { retrieveSessionSpecificCookie } from "$lib/db/sessionSpecificFetch"



/**
 * Get-Graph-name-on-server method.
 * 
 * Allows processes on the server to get the name of the Graph that is associated with a particular
 * request.
 * @param request - The request that the Graph is associated with.
 * @param params - The event params that are associated with the request, containing the session UUID.
 * @returns - The Graph name, or null if none was found.
 */
export function getGraphNameOnServer(request: Request, params: Partial<Record<string, string>>) {
    // If the params don't contain a session UUID, return null.
    if (!("sessionUuid" in params)) return null

    // Get the session UUID from 
	const sessionUuid = params.sessionUuid as string

    // Retrieve the name of the Graph file from the cookies.
    const graphName = retrieveSessionSpecificCookie(sessionUuid, request, "graphName")

    // Return the Graph name.
    return graphName
}


/**
 * Alter-querystring-for-H2-and-run method.
 * 
 * H2 doesn't mesh with Objection's PostgreSQL syntax naturally. This method is a temporary fix
 * until H2 is replaced with another database (assuming that is done in the future). It takes the
 * querystring, modifies it appropriately for H2 syntax, then runs it.
 * @param querystring - The original querystring produced by Objection.
 * @param transaction - The transaction that the altered querystring should be run as part of.
 * @param whenCreated - A dateime-of-creation string used to retrieve the newly created record.
 * @param constructName - The name of the Graph construct that the query is about.
 * @returns - The newly-created Graph construct as a raw model (still containing the Objection model).
 */
export async function alterQuerystringForH2AndRun(
    querystring: string,
    transaction: Knex.Transaction,
    whenCreated: string,
    constructName: "Direction" | "Space" | "DirectionToSpace" | "Thing" | "Relationship"
                   | "Note" | "NoteToThing" | "Folder" | "FolderToThing"
): Promise< RawDirectionDbModel | RawSpaceDbModel | RawThingDbModel | RawRelationshipDbModel | RawNoteDbModel | RawNoteToThingDbModel | RawFolderDbModel | RawFolderToThingDbModel | null > {
    // Remove the "returning" clause in the query string.
    querystring = querystring.replace(/ returning "\w+"/, "")

    // If there is a string value that contains a question mark, escape the question mark.
    const valueSubstringsContainingQuestionMarks = querystring.match(/(\('|', ').*?\?.*?('\)|', ')/g)
    if (valueSubstringsContainingQuestionMarks !== null) {
        for (const substring of valueSubstringsContainingQuestionMarks) {
            const correctedSubstring = substring.replace(/\?/g, "\\?")
            querystring = querystring.replace(substring, correctedSubstring)
        }
    }

    // Run the modified query string.
    const knex = Model.knex()
    await knex.raw(querystring).transacting(transaction)
    
    // Return the last-created construct of the specified type (which should
    // be the construct created by this transaction).
    if (constructName === "Direction") {
        const latestConstructResults = await RawDirectionDbModel.query().transacting(transaction)
        return latestConstructResults[latestConstructResults.length - 1]
    } else if (constructName === "Space") {
        const latestConstructResults = await RawSpaceDbModel.query()
            .allowGraph('directions')
            .withGraphFetched('directions')
            .transacting(transaction)
        return latestConstructResults[latestConstructResults.length - 1]
    } else if (constructName === "Thing") {
        const latestConstructResults = await RawThingDbModel.query().select("id").where({whencreated: whenCreated})
            .allowGraph('[a_relationships, b_relationships, note, folder]')
            .withGraphFetched('[a_relationships, b_relationships, note, folder]')
            .transacting(transaction)
        return latestConstructResults[0]
    } else if (constructName === "Relationship") {
        const latestConstructResults = await RawRelationshipDbModel.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
        return latestConstructResults[0]
    } else if (constructName === "Note") {
        const latestConstructResults = await RawNoteDbModel.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
        return latestConstructResults[0]
    } else if (constructName === "NoteToThing") {
        const latestConstructResults = await RawNoteToThingDbModel.query().select("id").transacting(transaction)
        return latestConstructResults[0]
    } else if (constructName === "Folder") {
        const latestConstructResults = await RawFolderDbModel.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
        return latestConstructResults[0]
    } else if (constructName === "FolderToThing") {
        const latestConstructResults = await RawFolderToThingDbModel.query().select("id").transacting(transaction)
        return latestConstructResults[0]
    } else {
        return null
    }
}


/**
 * Log-server-error method.
 * 
 * Logs a given error, its error stack, and its associated information using the assigned logger.
 * @param message - The message to be shown at the top level of the log entry.
 * @param infoObject - The object containing associated info for the error.
 * @param error - The error itself.
 */
export function logServerError(message: string, infoObject: object, error: Error) {
    // Initialize an object for the associated information.
    const logObject: {[keyName: string]: unknown} = {}

    // Populate that object with the supplied information and derived information about the error.
    for (const [key, value] of Object.entries(infoObject)) {
        logObject[key] = value
    }
    logObject["errorType"] = error.name
    logObject["errorMsg"] = error.message
    logObject["errorStack"] = error.stack

    // Log the error.
    logger.error(
        logObject,
        message
    )
}