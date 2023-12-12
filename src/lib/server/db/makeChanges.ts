// Database-related imports.
import { Model } from "objection"
import { v4 as uuidv4 } from "uuid"
import { alterQuerystringForH2AndRun, logServerError } from "./utility"

// Graph-construct-related imports.
import {
    RawDirectionDbModel, RawThingDbModel, getNewThingInfo,
    RawRelationshipDbModel, getNewRelationshipInfo,
    RawNoteDbModel, getNewNoteInfo, RawNoteToThingDbModel,
    RawFolderDbModel, getNewFolderInfo, RawFolderToThingDbModel,
    RawSpaceDbModel, getNewSpaceInfo, RawDirectionToSpaceDbModel,
    getNewDirectionInfo
} from "$lib/server/models"
import { Direction, Space, Thing } from "$lib/models/constructModels"

// Filesystem-related imports.
import { createAttachmentsFolder } from "$lib/shared/fileSystem"

import { changeIndexInArray, legacyPerspectiveThingsParse } from "$lib/shared/utility"
import type { Knex } from "knex"
import type { OddHalfAxisId } from "$lib/shared/constants"


import { get } from "svelte/store"
import { loggerStore } from "$lib/stores"
const logger = get(loggerStore)




/*
 * Create a new Direction.
 */
export async function createDirection(
    graphName: string | null,
    relationshipText: string,
    objectText: string,
    oppositeDirectionId: number | null
): Promise<number | false> {
    try {
        // Construct and run SQL query.
        const knex = Model.knex()
        const newDirectionId = await knex.transaction(async (transaction: Knex.Transaction) => {
            // Determine id and order for new Direction.
            const queriedDirections = await RawDirectionDbModel.query()
            const directionIds = queriedDirections.map( model => {
                return model.id ? Number(model.id) : 0
            } )
            const maxDirectionId = directionIds.length ? Math.max(...directionIds) : -1
            const newDirectionId = maxDirectionId + 1
            const orders = queriedDirections.map( model => {
                return model.directionorder ? model.directionorder : 0
            } )
            const maxOrder = orders.length ? Math.max(...orders) : -1
            const newOrder = maxOrder + 1
            
            // Create new Direction.
            const newDirectionInfo = getNewDirectionInfo(
                newDirectionId,
                relationshipText,
                objectText,
                oppositeDirectionId,
                newOrder
            )
            const querystring1 = RawDirectionDbModel.query().insert(newDirectionInfo).toKnexQuery().toString()

            const newDirectionDbModel = await alterQuerystringForH2AndRun(querystring1, transaction, "", "Direction") as RawDirectionDbModel

            return newDirectionDbModel.id as number
        })

        logger.debug(
            {
                graphName: graphName,
                id: newDirectionId,
                oppositeId: oppositeDirectionId,
                relationshipText: relationshipText,
                objectText: objectText
            },
            `Created new Direction.`
        )
        return newDirectionId

    } catch(err) {
        logServerError(
            "An error occurred while attempting to create Direction.",
            {
                graphName: graphName,
                oppositeId: oppositeDirectionId,
                relationshipText: relationshipText,
                objectText: objectText
            },
            err as Error
        )
        return false
    }

}

/*
 * Update a Direction.
 */
export async function updateDirection(
    graphName: string | null,
    directionId: number,
    relationshipText: string,
    nameForObjects: string,
    oppositeId: number | null
): Promise<boolean> {
    try {
        // Construct and run SQL query.
        const knex = Model.knex()
        await knex.transaction(async (transaction: Knex.Transaction) => {
            // Update the Direction.
            await RawDirectionDbModel.query()
                .patch({
                    text: relationshipText,
                    nameforobjects: nameForObjects,
                    oppositeid: oppositeId
                })
                .where('id', directionId)
                .transacting(transaction)
            
            return
        })
        
        logger.debug(
            {
                graphName: graphName,
                id: directionId,
                oppositeId: oppositeId,
                relationshipText: relationshipText,
                objectText: nameForObjects
            },
            `Updated Direction.`
        )
        return true

    } catch(err) {
        logServerError(
            "An error occurred while attempting to update Direction.",
            {
                graphName: graphName,
                id: directionId,
                oppositeId: oppositeId,
                relationshipText: relationshipText,
                objectText: nameForObjects
            },
            err as Error
        )
        return false
    }
}



/*
 * Update the Orders of a set of Directions.
 */
export async function updateDirectionOrders(
    graphName: string | null,
    directionInfos: {directionId: number, newOrder: number}[]
): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        for (const info of directionInfos) {
            await RawDirectionDbModel.query()
                .patch({ directionorder: info.newOrder })
                .where('id', info.directionId)
                .transacting(transaction)
        }
    })

    // Report on the response.
    .then(function() {
        logger.debug(
            {
                graphName,
                directionInfos
            },
            `Updated orders of Directions.`
        )
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to update orders of Directions.",
            {
                graphName,
                directionInfos
            },
            err as Error
        )
    })
}

interface UpdateDirectionOrderInfo {
    directionId: number,
    newOrder: number
}

/**
 * Reorder-Direction method.
 * @param directionId - The ID of the Direction reordered.
 * @param newIndex - The new index of the Direction to be reordered.
 */
export async function reorderDirection(
    graphName: string | null,
    directionId: number,
    newIndex: number
): Promise<void> {
    // Get info on all Directions.
    const queriedDirections = await RawDirectionDbModel.query()

    // Create an array of objects containing ordering info for each Direction.
    const directionOrderingInfos: { directionId: number, order: number | null }[] = []
    queriedDirections.forEach( model => {
        directionOrderingInfos.push(
            {
                directionId: Number(model.id),
                order: model.directionorder,
            }
        )
    } )
    // Order the Direction infos according to their order attributes.
    const orderedDirectionOrderingInfos = directionOrderingInfos
        .sort((a, b) => (a.order ? a.order : 0) - (b.order ? b.order : 0))


    // Move the to-be-reordered Direction to the specified new index.
    const currentIndex = orderedDirectionOrderingInfos.findIndex(info => info.directionId === directionId)
    const reOrderedDirectionOrderingInfos = (
        changeIndexInArray(orderedDirectionOrderingInfos, currentIndex, newIndex) as
            {directionId: number, order: number | null}[]
    )
    // Construct an output array of Direction order information objects.
    const updateDirectionOrderInfos: UpdateDirectionOrderInfo[] = []
    reOrderedDirectionOrderingInfos.forEach( (info, i) => {
        updateDirectionOrderInfos.push(
            {
                directionId: info.directionId,
                newOrder: i
            }
        )
    } )

    // Update the orders of the Directions using the above array.
    await updateDirectionOrders(graphName, updateDirectionOrderInfos)
}

/*
 * Delete a Direction.
 */
export async function deleteDirection(
    graphName: string | null,
    directionId: number
): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Wherever a Direction has this Direction as its opposite, set to null
        // instead.
        await RawDirectionDbModel.query()
            .patch({ oppositeid: null })
            .where('oppositeid', directionId)
            .transacting(transaction)

        // Delete any Direction-to-Space linkers involving this Direction.
        await RawDirectionDbModel.relatedQuery('directionToSpaces').for([directionId]).delete().transacting(transaction)

        // Delete the Direction itself.
        await RawDirectionDbModel.query().delete().where("id", directionId).transacting(transaction)

        return
    })

    // Report on the response.
    .then(function() {
        logger.debug(
            {
                graphName,
                directionId
            },
            `Deleted Direction.`
        )
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to delete Direction.",
            {
                graphName,
                directionId
            },
            err as Error
        )
    })
}


/*
 * Create a new Space.
 */
export async function createSpace(
    graphName: string | null,
    spaceText: string,
    spaceBuildMethod: "radial" | "grid",
    halfAxisIdsAndDirections: [OddHalfAxisId, (Direction | null)][]
): Promise<number | false> {
    try {
        // Construct and run SQL query.
        const knex = Model.knex()
        const newSpaceId = await knex.transaction(async (transaction: Knex.Transaction) => {
            // Determine id and order for new Space.
            const queriedSpaces = await RawSpaceDbModel.query()
            const spaceIds = queriedSpaces.map( model => {
                return model.id ? Number(model.id) : 0
            } )
            const maxSpaceId = spaceIds.length ? Math.max(...spaceIds) : -1
            const newSpaceId = maxSpaceId + 1
            const orders = queriedSpaces.map( model => {
                return model.spaceorder ? model.spaceorder : 0
            } )
            const maxOrder = orders.length ? Math.max(...orders) : -1
            const newOrder = maxOrder + 1

            // Create new Space.
            const newSpaceInfo = getNewSpaceInfo(newSpaceId, spaceText, newOrder, spaceBuildMethod)
            const querystring1 = RawSpaceDbModel.query().insert(newSpaceInfo).toKnexQuery().toString()
            const newSpaceDbModel = await alterQuerystringForH2AndRun(querystring1, transaction, "", "Space") as RawSpaceDbModel

            // Determine starting ID for new Direction linkers.
            const queriedDirectionToSpaces = await RawDirectionToSpaceDbModel.query()
            const directionToSpaceIds = queriedDirectionToSpaces.map( model => {
                return model.id ? Number(model.id) : 0
            } )
            const maxDirectionToSpaceId = directionToSpaceIds.length ? Math.max(...directionToSpaceIds) : -1
            const newStartingDirectionToSpaceId = maxDirectionToSpaceId + 1
            
            // Create new Direction linkers.
            for (const [index, halfAxisIdAndDirection] of halfAxisIdsAndDirections.entries()) if (halfAxisIdAndDirection[1]?.id) {
                const halfAxisId = halfAxisIdAndDirection[0]
                const directionId = halfAxisIdAndDirection[1].id
                const querystring = newSpaceDbModel
                    .$relatedQuery('directions')
                    .relate({id: directionId, linkerid: newStartingDirectionToSpaceId + index, halfaxisid: halfAxisId})
                    .toKnexQuery().toString()
                await alterQuerystringForH2AndRun(querystring, transaction, "", "DirectionToSpace")
            }

            return newSpaceDbModel.id as number
        })

        logger.debug(
            {
                graphName: graphName,
                text: spaceText,
                buildMethod: spaceBuildMethod,
                halfAxisIdsAndDirections: halfAxisIdsAndDirections
            },
            `Created Space.`
        )
        return newSpaceId

    } catch(err) {
        logServerError(
            "An error occurred while attempting to create Space.",
            {
                graphName: graphName,
                text: spaceText,
                buildMethod: spaceBuildMethod,
                halfAxisIdsAndDirections: halfAxisIdsAndDirections
            },
            err as Error
        )
        return false
    }

}

/*
 * Update a Space.
 */
export async function updateSpace(
    graphName: string | null,
    spaceId: number,
    spaceText: string,
    spaceBuildMethod: "radial" | "grid",
    halfAxisIdsAndDirections: [OddHalfAxisId, (Direction | null)][]
): Promise<boolean> {
    try {
        // Construct and run SQL query.
        const knex = Model.knex()
        await knex.transaction(async (transaction: Knex.Transaction) => {
            // Update the Space text.
            await RawSpaceDbModel.query()
                .patch({
                    text: spaceText,
                    buildmethod: spaceBuildMethod
                })
                .where('id', spaceId)
                .transacting(transaction)

            // Delete existing Direction linkers.
            await RawSpaceDbModel.relatedQuery('directionToSpaces').for([spaceId]).delete().transacting(transaction)

            // Create new Direction linkers.
            const spaceToAddDirectionsTo = await RawSpaceDbModel.query().findById(spaceId) as RawSpaceDbModel
            for (const halfAxisIdAndDirection of halfAxisIdsAndDirections) if (halfAxisIdAndDirection[1]?.id) {
                const halfAxisId = halfAxisIdAndDirection[0]
                const directionId = halfAxisIdAndDirection[1].id
                const querystring = spaceToAddDirectionsTo
                    .$relatedQuery('directions')
                    .relate({id: directionId,  halfaxisid: halfAxisId})
                    .toKnexQuery().toString()
                await alterQuerystringForH2AndRun(querystring, transaction, "", "DirectionToSpace")
            }

            return
        })
        
        logger.debug(
            {
                graphName: graphName,
                id: spaceId,
                text: spaceText,
                buildMethod: spaceBuildMethod,
                halfAxisIdsAndDirections: halfAxisIdsAndDirections
            },
            `Updated Space.`
        )
        return true

    } catch(err) {
        logServerError(
            "An error occurred while attempting to update Space.",
            {
                graphName: graphName,
                id: spaceId,
                text: spaceText,
                buildMethod: spaceBuildMethod,
                halfAxisIdsAndDirections: halfAxisIdsAndDirections
            },
            err as Error
        )
        return false
    }
}

/*
 * Update the Orders of a set of Spaces.
 */
export async function updateSpaceOrders(
    graphName: string | null,
    spaceInfos: {spaceId: number, newOrder: number}[]
): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        for (const info of spaceInfos) {
            await RawSpaceDbModel.query()
                .patch({ spaceorder: info.newOrder })
                .where('id', info.spaceId)
                .transacting(transaction)
        }
    })

    // Report on the response.
    .then(function() {
        logger.debug(
            {
                graphName,
                spaceInfos
            },
            `Updated orders of Spaces.`
        )
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to update orders of Spaces.",
            {
                graphName,
                spaceInfos
            },
            err as Error
        )
    })
}

interface UpdateSpaceOrderInfo {
    spaceId: number,
    newOrder: number
}

/**
 * Reorder-Space method.
 * @param spaceId - The ID of the Space reordered.
 * @param newIndex - The new index of the Space to be reordered.
 */
export async function reorderSpace(
    graphName: string | null,
    spaceId: number,
    newIndex: number
): Promise<void> {
    // Get info on all Spaces.
    const queriedSpaces = await RawSpaceDbModel.query()

    // Create an array of objects containing ordering info for each Space.
    const spaceOrderingInfos: { spaceId: number, order: number | null }[] = []
    queriedSpaces.forEach( model => {
        spaceOrderingInfos.push(
            {
                spaceId: Number(model.id),
                order: model.spaceorder,
            }
        )
    } )
    // Order the Space infos according to their order attributes.
    const orderedSpaceOrderingInfos = spaceOrderingInfos
        .sort((a, b) => (a.order ? a.order : 0) - (b.order ? b.order : 0))


    // Move the to-be-reordered Space to the specified new index.
    const currentIndex = orderedSpaceOrderingInfos.findIndex(info => info.spaceId === spaceId)
    const reOrderedSpaceOrderingInfos = (
        changeIndexInArray(orderedSpaceOrderingInfos, currentIndex, newIndex) as
            {spaceId: number, order: number | null}[]
    )
    // Construct an output array of Space order information objects.
    const updateSpaceOrderInfos: UpdateSpaceOrderInfo[] = []
    reOrderedSpaceOrderingInfos.forEach( (info, i) => {
        updateSpaceOrderInfos.push(
            {
                spaceId: info.spaceId,
                newOrder: i
            }
        )
    } )

    // Update the orders of the Spaces using the above array.
    await updateSpaceOrders(graphName, updateSpaceOrderInfos)
}




/*
 * Delete a Space.
 */
export async function deleteSpace(
    graphName: string | null,
    spaceId: number
): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Wherever a Thing has this Space as its default Space, set to null
        // instead.
        await RawThingDbModel.query()
            .patch({ defaultplane: null })
            .where('defaultplane', spaceId)
            .transacting(transaction)

        // Delete existing Direction linkers.
        await RawSpaceDbModel.relatedQuery('directionToSpaces').for([spaceId]).delete().transacting(transaction)

        // Delete the Space itself.
        await RawSpaceDbModel.query().delete().where("id", spaceId).transacting(transaction)

        return
    })

    // Report on the response.
    .then(function() {
        logger.debug(
            {
                graphName,
                spaceId
            },
            `Deleted Space.`
        )
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to delete Space.",
            {
                graphName,
                spaceId
            },
            err as Error
        )
    })
}












/*
 * From a starting Thing, create a related Thing.
 */
export async function createNewRelatedThing(
    graphName: string | null,
    thingIdToRelateFrom: number,
    directionId: number,
    text: string,
    defaultSpace: Space
): Promise<Thing | false> {
    try {    
        // Get parameters for SQL query.
        const whenCreated = (new Date()).toISOString()

        // Construct and run SQL query.
        const knex = Model.knex()
        const newRelatedThing = await knex.transaction(async (transaction: Knex.Transaction) => {
            // Create new Thing.
            const newThingInfo = getNewThingInfo(text, whenCreated, defaultSpace.id as number)
            const querystring1 = RawThingDbModel.query().insert(newThingInfo).toKnexQuery().toString()
            const newRelatedThingDbModel = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Thing") as RawThingDbModel
            
            // Determine order for new Relationship.
            const queriedRelationshipsInSameCohort = await RawRelationshipDbModel.query()
                .where("thingaid", thingIdToRelateFrom)
                .where("direction", directionId)
            const orders = queriedRelationshipsInSameCohort.map( model => {
                return model.relationshiporder ? model.relationshiporder : 0
            } )
            const maxOrder = orders.length ? Math.max(...orders) : -1
            const newOrder = maxOrder + 1

            // Get Direction info.
            const direction = (await RawDirectionDbModel.query().where("id", directionId))[0]
            const oppositeDirectionId = direction.oppositeid as number

            // Create new Relationship.
            const newARelationshipInfo = getNewRelationshipInfo(
                thingIdToRelateFrom,
                Number(newRelatedThingDbModel.id),
                whenCreated,
                directionId,
                newOrder
            )
            const querystring2 = RawRelationshipDbModel.query().insert(newARelationshipInfo).toKnexQuery().toString()
            const newBRelationshipInfo = getNewRelationshipInfo(
                Number(newRelatedThingDbModel.id),
                thingIdToRelateFrom,
                whenCreated,
                oppositeDirectionId,
                null
            )
            const querystring3 = RawRelationshipDbModel.query().insert(newBRelationshipInfo).toKnexQuery().toString()
            await Promise.all([
                alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "Relationship"),
                alterQuerystringForH2AndRun(querystring3, transaction, whenCreated, "Relationship")
            ])

            const newRelatedThing = new Thing(newRelatedThingDbModel)

            return newRelatedThing
        })

        logger.debug(
            {
                graphName,
                thingIdToRelateFrom,
                directionId,
                text,
                defaultSpace
            },
            "Created Thing."
        )
        return newRelatedThing as Thing

    } catch(err) {
        logServerError(
            "An error occurred while attempting to create Thing.",
            {
                graphName,
                thingIdToRelateFrom,
                directionId,
                text,
                defaultSpace
            },
            err as Error
        )
        return false
    }
}

/*
 * Update a Thing's text.
 */
export async function updateThingText(
    graphName: string | null,
    thingId: number,
    text: string
): Promise<boolean> {
    try { 
        // Get parameters for SQL query.
        const whenModded = (new Date()).toISOString()

        // Construct and run SQL query.
        const knex = Model.knex()
        await knex.transaction(async (transaction: Knex.Transaction) => {
            // Update the Note.
            await RawThingDbModel.query()
                .patch({ text: text, whenmodded: whenModded })
                .where('id', thingId)
                .transacting(transaction)
            
            return
        })
        
        logger.debug(
            {
                graphName,
                thingId,
                text
            },
            "Thing text updated."
        )
        return true

    } catch(err) {
        logServerError(
            "An error occurred while attempting to update Thing text.",
            {
                graphName,
                thingId,
                text
            },
            err as Error
        )
        return false
    }
}

/*
 * Update a Thing's Perspective text.
 */
export async function updateThingPerspectiveText(
    graphName: string | null,
    pThingId: number,
    thingId: number,
    text: string
): Promise<boolean> {
    try { 
        // Get parameters for SQL query.
        const whenModded = (new Date()).toISOString()

        const queriedPThings = await RawThingDbModel.query().where("id", pThingId)
        if (!queriedPThings.length) {

            return false

        } else {
            const perspectiveTextsString = queriedPThings[0].perspectivetexts
            const perspectiveTexts = legacyPerspectiveThingsParse(perspectiveTextsString)

            if (text === "") {
                delete perspectiveTexts[String(thingId)]
            } else {
                perspectiveTexts[String(thingId)] = text
            }

            const newPerspectiveTextsString = JSON.stringify(perspectiveTexts)

            // Construct and run SQL query.
            const knex = Model.knex()
            await knex.transaction(async (transaction: Knex.Transaction) => {
                // Update the Note.
                await RawThingDbModel.query()
                    .patch({ perspectivetexts: newPerspectiveTextsString, whenmodded: whenModded })
                    .where('id', pThingId)
                    .transacting(transaction)
                
                return
            })
            
            logger.debug(
                {
                    graphName,
                    pThingId,
                    thingId,
                    text
                },
                "Thing Perspective text updated."
            )
            return true

        }

    } catch(err) {
        logServerError(
            "An error occurred while attempting to update Thing Perspective text.",
            {
                graphName,
                pThingId,
                thingId,
                text
            },
            err as Error
        )
        return false
    }
}

/*
 * Update a Thing's default Space.
 */
export async function updateThingDefaultSpace(
    graphName: string | null,
    thingId: number,
    spaceId: number
): Promise<boolean> {
    try { 
        // Get parameters for SQL query.
        const whenModded = (new Date()).toISOString()

        // Construct and run SQL query.
        const knex = Model.knex()
        await knex.transaction(async (transaction: Knex.Transaction) => {
            // Update the Note.
            await RawThingDbModel.query()
                .patch({ defaultplane: spaceId, whenmodded: whenModded })
                .where('id', thingId)
                .transacting(transaction)
            
            return
        })
        
        logger.debug(
            {
                graphName,
                thingId,
                spaceId
            },
            "Thing's default Space updated."
        )
        return true

    } catch(err) {
        logServerError(
            "An error occurred while attempting to update Thing default Space.",
            {
                graphName,
                thingId,
                spaceId
            },
            err as Error
        )
        return false
    }
}

/*
 * Add a Note to a Thing.
 */
export async function addNoteToThingOrGetExistingNoteId(
    graphName: string | null,
    thingId: number
): Promise<number | false> {

    const queriedNotes = await RawThingDbModel.relatedQuery('note').for([thingId])
    if (queriedNotes.length) {
        return Number(queriedNotes[0].id)
    }

    let newNoteId: number | false = false

    // Get parameters for SQL query.
    const whenCreated = (new Date()).toISOString()

    // Construct and run SQL query.
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Create the Note.
        const newNoteInfo = getNewNoteInfo(whenCreated)
        const querystring1 = RawNoteDbModel.query().insert(newNoteInfo).toKnexQuery().toString()
        const newAddedNote = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Note") as RawNoteDbModel

        // Create the linker between the Note and its Thing.
        const thingToAddNoteTo = await RawThingDbModel.query().findById(thingId) as RawThingDbModel
        const querystring2 = thingToAddNoteTo.$relatedQuery('note').relate(newAddedNote.id).toKnexQuery().toString()
        await alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "NoteToThing") as RawNoteToThingDbModel

        return Number(newAddedNote.id)
    })

    // Report on the response.
    .then(function(noteId) {
        logger.debug(
            {
                graphName,
                thingId
            },
            "Added Note to Thing (or got ID of existing Note)."
        )
        newNoteId = noteId
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to add Note to Thing (or get ID of existing Note).",
            {
                graphName,
                thingId
            },
            err as Error
        )
    })

    return newNoteId
}

/*
 * Update the text of a Note.
 */
export async function updateNote(
    graphName: string | null,
    noteId: number,
    text: string
): Promise< boolean | Error > {
    let success: boolean | Error = false

    // Get parameters for SQL query.
    const whenModded = (new Date()).toISOString()

    // Construct and run SQL query.
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Update the Note.
        await RawNoteDbModel.query().patch({ text: text, whenmodded: whenModded }).where('id', noteId).transacting(transaction)
        
        return
    })

    // Report on the response.
    .then(function() {
        logger.debug(
            {
                graphName,
                noteId,
                text
            },
            "Updated Note."
        )
        success = true
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to update Note.",
            {
                graphName,
                noteId,
                text
            },
            err as Error
        )
        success = err
    })

    return success
}

/*
 * Add a Folder to a Thing.
 */
export async function addFolderToThing(
    graphName: string | null,
    thingId: number
): Promise<void> {
    // Get parameters for SQL query.
    const whenCreated = (new Date()).toISOString()
    const folderGuid = uuidv4()

    // Construct and run SQL query.
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Create the Folder.
        const newFolderInfo = getNewFolderInfo(whenCreated, folderGuid)
        const querystring1 = RawFolderDbModel.query().insert(newFolderInfo).toKnexQuery().toString()
        const newAddedFolder = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Folder") as RawFolderDbModel

        // Create the linker between the Folder and its Thing.
        const thingToAddFolderTo = await RawThingDbModel.query().findById(thingId) as RawThingDbModel
        const querystring2 = thingToAddFolderTo.$relatedQuery('folder').relate(newAddedFolder.id).toKnexQuery().toString()
        await alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "FolderToThing") as RawFolderToThingDbModel
        
        return
    })

    // Report on the response and create a folder in the filesystem.
    .then(function() {
        try {
            createAttachmentsFolder(folderGuid)

            logger.debug(
                {
                    graphName,
                    thingId,
                },
                "Added attachments folder to Thing."
            )
        } catch(err) {
            logServerError(
                "An error occurred while attempting to add attachments folder to Thing.",
                {
                    graphName,
                    thingId
                },
                err as Error
            )
        }
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to add attachments folder to Thing.",
            {
                graphName,
                thingId
            },
            err as Error
        )
    })
}

/*
 * Delete a Thing.
 */
export async function deleteThing(
    graphName: string | null,
    thingId: number
): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Get associated Notes (before linkers are gone).
        const notesToDelete = await RawThingDbModel.relatedQuery('note').for([thingId])
        const noteIdsToDelete = notesToDelete.map(note => note.id)
        // Delete associated Note linkers.
        await RawThingDbModel.relatedQuery('noteToThing').for([thingId]).delete().transacting(transaction)
        // Delete associated Notes.
        await RawNoteDbModel.query().delete().whereIn("id", noteIdsToDelete).transacting(transaction)

        // Get associated Folders (before linkers are gone).
        const foldersToDelete = await RawThingDbModel.relatedQuery('note').for([thingId])
        const folderIdsToDelete = foldersToDelete.map(note => note.id)
        // Delete associated Folder linkers.
        await RawThingDbModel.relatedQuery('folderToThing').for([thingId]).delete().transacting(transaction)
        // Delete associated Folders.
        await RawFolderDbModel.query().delete().whereIn("id", folderIdsToDelete).transacting(transaction)

        // Delete associated Relationships.
        await RawThingDbModel.relatedQuery('a_relationships').for([thingId]).delete().transacting(transaction)
        await RawThingDbModel.relatedQuery('b_relationships').for([thingId]).delete().transacting(transaction)

        // Delete the Thing itself.
        await RawThingDbModel.query().delete().where("id", thingId).transacting(transaction)

        return
    })

    // Report on the response.
    .then(function() {
        logger.debug(
            {
                graphName,
                thingId,
            },
            "Deleted Thing."
        )
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to delete Thing.",
            {
                graphName,
                thingId
            },
            err as Error
        )
    })
}



/*
 * Create a new Relationship.
 */
export async function createNewRelationship(
    graphName: string | null,
    sourceThingId: number,
    destThingId: number,
    directionId: number
): Promise<void> {  
    // Get Direction info.
    const direction = (await RawDirectionDbModel.query().where("id", directionId))[0]
    const oppositeDirectionId = direction.oppositeid as number

    // Verify the Relationship does not yet exist.
    const queriedARelationships = await RawRelationshipDbModel.query()
        .where("thingaid", destThingId)
        .where("thingbid", sourceThingId)
        .where("direction", oppositeDirectionId)
    const queriedBRelationships = await RawRelationshipDbModel.query()
        .where("thingaid", sourceThingId)
        .where("thingbid", destThingId)
        .where("direction", directionId)
    const relationshipAlreadyExists = queriedARelationships.length > 0 || queriedBRelationships.length > 0

    if (relationshipAlreadyExists) {

        logger.error({
            msg: "To-be-created Relationship would duplicate an existing Relationship. Aborting operation.",
            graphName,
            sourceThingId,
            destThingId,
            directionId
        })
    
    } else if (sourceThingId === destThingId) {

        logger.error({
            msg: "To-be-created Relationship would relate a Thing to itself. Aborting operation.",
            graphName,
            sourceThingId,
            destThingId,
            directionId
        })

    } else {

        // Get parameters for SQL query.
        const whenCreated = (new Date()).toISOString()
        
        // Construct and run SQL query.
        const knex = Model.knex()
        await knex.transaction(async (transaction: Knex.Transaction) => {

            // Delete any existing Relationships between source and dest Things in *other* Directions.
            await RawRelationshipDbModel.query().delete().where("thingaid", destThingId).where("thingbid", sourceThingId).transacting(transaction)
            await RawRelationshipDbModel.query().delete().where("thingaid", sourceThingId).where("thingbid", destThingId).transacting(transaction)

            // Get Direction info.
            const direction = (await RawDirectionDbModel.query().where("id", directionId))[0]
            const oppositeDirectionId = direction.oppositeid as number

            // Create new Relationship.
            const newARelationshipInfo = getNewRelationshipInfo(sourceThingId, destThingId, whenCreated, directionId)
            const querystring1 = RawRelationshipDbModel.query().insert(newARelationshipInfo).toKnexQuery().toString()
            const newBRelationshipInfo = getNewRelationshipInfo(destThingId, sourceThingId, whenCreated, oppositeDirectionId)
            const querystring2 = RawRelationshipDbModel.query().insert(newBRelationshipInfo).toKnexQuery().toString()
            const [newARelationship, newBRelationship] = await Promise.all([
                alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Relationship"),
                alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "Relationship")
            ])

            return [newARelationship, newBRelationship]
        })

        // Report on the response.
        .then(function() {
            logger.debug(
                { 
                    graphName,
                    sourceThingId,
                    destThingId,
                    directionId
                },
                "Created Relationship."
            )
        })
        .catch(function(err: Error) {
            logServerError(
                "An error occurred while attempting to create Relationship.",
                { 
                    graphName,
                    sourceThingId,
                    destThingId,
                    directionId
                },
                err as Error
            )
        })

    }
}


/*
 * Update the Directions of a set of Relationships.
 */
export async function updateRelationships(
    graphName: string | null,
    relationshipInfos: {sourceThingId: number, destThingId: number, directionId: number}[]
): Promise<void> {
    // Get parameters for SQL query.
    const whenModded = (new Date()).toISOString()

    let relationshipsOk = true
    for (const info of relationshipInfos) {
        // Get Direction info.
        const direction = (await RawDirectionDbModel.query().where("id", info.directionId))[0]
        const oppositeDirectionId = direction.oppositeid as number

        // Verify the change won't duplicate an existing Relationship.
        const forwardDuplicates = await RawRelationshipDbModel.query()
            .where('thingaid', info.sourceThingId)
            .where('thingbid', info.destThingId)
            .whereIn("direction", [info.directionId, oppositeDirectionId])
        const reverseDuplicates = await RawRelationshipDbModel.query()
            .where('thingaid', info.sourceThingId)
            .where('thingbid', info.destThingId)
            .whereIn("direction", [info.directionId, oppositeDirectionId])

        if (forwardDuplicates.length || reverseDuplicates.length) relationshipsOk = false
    }

    if (relationshipsOk) {
        
        const knex = Model.knex()
        await knex.transaction(async (transaction: Knex.Transaction) => {

            for (const info of relationshipInfos) {

                const direction = (await RawDirectionDbModel.query().where("id", info.directionId))[0]
                const oppositeDirectionId = direction.oppositeid as number

                await RawRelationshipDbModel.query()
                    .patch({ direction: info.directionId, whenmodded: whenModded })
                    .where('thingaid', info.sourceThingId)
                    .where('thingbid', info.destThingId)
                    .transacting(transaction)

                await RawRelationshipDbModel.query()
                    .patch({ direction: oppositeDirectionId, whenmodded: whenModded })
                    .where('thingaid', info.destThingId)
                    .where('thingbid', info.sourceThingId)
                    .transacting(transaction)
            }

            return
        })

        // Report on the response.
        .then(function() {
            logger.debug(
                {
                    graphName,
                    relationshipInfos
                },
                "Updated Relationships."
            )
        })
        .catch(function(err: Error) {
            logServerError(
                "An error occurred while attempting to update Relationships.",
                {
                    graphName,
                    relationshipInfos
                },
                err as Error
            )
        })

    } else {

        logger.error({
            msg: "The specified change to this Relationship's Direction would duplicate an existing Relationship.",
            graphName,
            relationshipInfos
        })

    }    
}


/*
 * Delete a Relationship.
 */
export async function deleteRelationship(
    graphName: string | null,
    sourceThingId: number,
    destThingId: number
): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {

        // Delete Relationship (both forward and reverse).
        await RawRelationshipDbModel.query().delete().where("thingaid", sourceThingId).where("thingbid", destThingId).transacting(transaction)
        await RawRelationshipDbModel.query().delete().where("thingbid", sourceThingId).where("thingaid", destThingId).transacting(transaction)

        return
    })

    // Report on the response.
    .then(function() {
        logger.debug(
            {
                graphName,
                sourceThingId,
                destThingId
            },
            "Deleted Relationship."
        )
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to delete Relationship.",
            {
                graphName,
                sourceThingId,
                destThingId
            },
            err as Error
        )
    })
}



/*
 * Mark Things as visited.
 */
export async function markThingsVisited(
    graphName: string | null,
    thingIds: number[]
): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        const timestamp = (new Date()).toISOString()
        await RawThingDbModel.query().whereIn("id", thingIds).patch({whenvisited: timestamp}).transacting(transaction)

        return
    })

    // Report on the response.
    .then(function() {
        logger.trace(
            {
                graphName,
                thingIds
            },
            "Thing modification time(s) recorded."
        )
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to record Thing modification time(s).",
            {
                graphName,
                thingIds
            },
            err as Error
        )
    })
}


/*
 * Mark Notes as modified.
 */
export async function markNotesModified(
    graphName: string | null,
    noteIds: number[]
): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        const timestamp = (new Date()).toISOString()
        await RawNoteDbModel.query().whereIn("id", noteIds).patch({whenmodded: timestamp}).transacting(transaction)

        return
    })

    // Report on the response.
    .then(function() {
        logger.trace(
            {
                graphName,
                noteIds
            },
            "Note modification time(s) recorded."
        )
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to record Note modification time(s).",
            {
                graphName,
                noteIds
            },
            err as Error
        )
    })
}


/*
 * Update the Orders of a set of Relationships.
 */
export async function updateRelationshipOrders(
    graphName: string | null,
    relationshipInfos: {sourceThingId: number, destThingId: number, directionId: number, newOrder: number}[]
): Promise<void> {
    // Get parameters for SQL query.
    const whenModded = (new Date()).toISOString()

    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        for (const info of relationshipInfos) {
            await RawRelationshipDbModel.query()
                .patch({ relationshiporder: info.newOrder, whenmodded: whenModded })
                .where('thingaid', info.sourceThingId)
                .where('thingbid', info.destThingId)
                .where('direction', info.directionId)
                .transacting(transaction)
        }
    })

    // Report on the response.
    .then(function() {
        logger.debug(
            {
                graphName,
                relationshipInfos
            },
            "Updated Relationship orders."
        )
    })
    .catch(function(err: Error) {
        logServerError(
            "An error occurred while attempting to update Relationship orders.",
            {
                graphName,
                relationshipInfos
            },
            err as Error
        )
    })
}


interface UpdateRelationshipOrderInfo {
    sourceThingId: number,
    destThingId: number,
    directionId: number,
    newOrder: number
}


/**
 * Reorder-Relationship method.
 * @param sourceThingId - The ID of the source Thing of the Relationship to be reordered.
 * @param destThingId - The ID of the destination Thing of the Relationship to be reordered.
 * @param destThingDirectionId - The ID of the Direction of the destination Thing of the Relationship to be reordered.
 * @param newIndex - The new index of the Relationship to be reordered.
 */
export async function reorderRelationship(
    graphName: string | null,
    sourceThingId: number,
    destThingId: number,
    destThingDirectionId: number,
    newIndex: number
): Promise<void> {
    // Get info on the Relationships in the Cohort.
    const queriedBRelationships = await RawRelationshipDbModel.query()
        .where("thingaid", sourceThingId)
        .where("direction", destThingDirectionId)

    // Create an array of objects containing ordering info for each Relationship.
    const relationshipOrderingInfos: { destThingId: number, order: number | null }[] = []
    queriedBRelationships.forEach( model => {
        relationshipOrderingInfos.push(
            {
                destThingId: model.thingbid as number,
                order: model.relationshiporder,
            }
        )
    } )
    // Order the Relationship infos according to their order attributes.
    const orderedRelationshipOrderingInfos = relationshipOrderingInfos
        .sort((a, b) => (a.order ? a.order : 0) - (b.order ? b.order : 0))


    // Move the to-be-reordered Relationship to the specified new index.
    const currentIndex = orderedRelationshipOrderingInfos.findIndex(info => info.destThingId === destThingId)
    const reOrderedRelationshipOrderingInfos = (
        changeIndexInArray(orderedRelationshipOrderingInfos, currentIndex, newIndex) as
            {destThingId: number, order: number | null}[]
    )
    // Construct an output array of Relationship order information objects.
    const updateRelationshipOrderInfos: UpdateRelationshipOrderInfo[] = []
    reOrderedRelationshipOrderingInfos.forEach( (info, i) => {
        updateRelationshipOrderInfos.push(
            {
                sourceThingId: sourceThingId,
                destThingId: info.destThingId,
                directionId: destThingDirectionId,
                newOrder: i
            }
        )
    } )

    // Update the orders of the Relationships using the above array.
    await updateRelationshipOrders(graphName, updateRelationshipOrderInfos)
}