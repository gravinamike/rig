import type { Editor } from "@tiptap/core"
import type { RemoteRelatingInfo, TextHyperlinkingInfo, ThingLinkingInfo } from "$lib/widgets/dialogWidgets"
import type { Direction } from "$lib/models/constructModels"
import type { ThingWidgetModel, RelationshipCohortWidgetModel } from "$lib/models/widgetModels"
import type { RelationshipBeingCreatedInfo } from "$lib/widgets/graphWidgets"

import { writable, derived } from "svelte/store"
import { nullRelationshipBeingCreatedInfo } from "$lib/widgets/graphWidgets"
import { nullRemoteRelatingInfo, nullTextHyperlinkingInfo, nullThingLinkingInfo } from "$lib/widgets/dialogWidgets"
import { retrieveGraphConstructs } from "./graphConstructStores"


export const relationshipBeingCreatedInfoStore = writable(
    {
        sourceWidgetModel: null,
        destWidgetModel: null,
        startPosition: [0, 0],
        endPosition: [0, 0],
        trackingMouse: false,
        selectedDirection: null
    } as RelationshipBeingCreatedInfo
)

/**
 * Enable the Relationship-being-created Widget.
 */
export function enableRelationshipBeingCreated(sourceWidgetModel: ThingWidgetModel | RelationshipCohortWidgetModel, position: [number, number]): void {
    relationshipBeingCreatedInfoStore.set(
        {
            sourceWidgetModel: sourceWidgetModel,
            destWidgetModel: null,
            startPosition: position,
            endPosition: position,
            trackingMouse: true,
            selectedDirection: null
        }
    )
}

/**
 * 
 */
export function updateRelationshipBeingCreatedEndpoint(position: [number, number]): void {
    relationshipBeingCreatedInfoStore.update( current => {
        current.endPosition = current.trackingMouse ? position : current.endPosition
        return current
    } )
}

export function setRelationshipBeingCreatedDestWidgetModel(destWidgetModel: ThingWidgetModel | RelationshipCohortWidgetModel | null): void {
    relationshipBeingCreatedInfoStore.update( current => {
        current.destWidgetModel = destWidgetModel
        return current
    } )
}

export function setRelationshipBeingCreatedTrackingMouse(trackingMouse: boolean): void {
    relationshipBeingCreatedInfoStore.update( current => {
        current.trackingMouse = trackingMouse
        return current
    } )
}

/**
 * Disable the Relationship-being-created Widget.
 */
export function disableRelationshipBeingCreated(): void {
    relationshipBeingCreatedInfoStore.update( () => nullRelationshipBeingCreatedInfo )
}


export const hoveredRelationshipTarget = writable(
    null as (ThingWidgetModel | RelationshipCohortWidgetModel | null)
)

export const inferredRelationshipBeingCreatedDirection = derived(
    relationshipBeingCreatedInfoStore,
    $relationshipBeingCreatedInfoStore => {
        const sourceWidgetModel = $relationshipBeingCreatedInfoStore.sourceWidgetModel
        const destWidgetModel = $relationshipBeingCreatedInfoStore.destWidgetModel
        const selectedDirection = $relationshipBeingCreatedInfoStore.selectedDirection

        let direction: Direction | null
        if (sourceWidgetModel && sourceWidgetModel.kind === "relationshipCohortWidgetModel") {
            direction = sourceWidgetModel.direction
        } else if (destWidgetModel && destWidgetModel.kind === "relationshipCohortWidgetModel") {
            direction = (
                destWidgetModel.direction.oppositeid ?
                    retrieveGraphConstructs("Direction", destWidgetModel.direction.oppositeid) :
                    null
            )
        } else {
            direction = selectedDirection
        }

        return direction
    }
)






export const remoteRelatingInfoStore = writable(
    {
        sourceWidgetModel: null
    } as RemoteRelatingInfo
)

export function enableRemoteRelating(sourceWidgetModel: ThingWidgetModel | RelationshipCohortWidgetModel): void {
    remoteRelatingInfoStore.set(
        {
            sourceWidgetModel: sourceWidgetModel
        }
    )
}

export function disableRemoteRelating(): void {
    remoteRelatingInfoStore.update( () => nullRemoteRelatingInfo )
}














export const thingLinkingStore = writable(
    {
        editor: null,
        focusEditorMethod: null,
        url: null
    } as ThingLinkingInfo
)

/**
 * Enable the Thing-linking Widget.
 */
export function enableThingLinking(editor: Editor, focusEditorMethod: () => void ): void {
    thingLinkingStore.set(
        {
            editor: editor,
            focusEditorMethod: focusEditorMethod,
            url: null
        }
    )
}

export function updateThingLinkingUrl(url: string): void {
    thingLinkingStore.update( current => {
        current.url = url
        return current
    } )
}

export function disableThingLinking(): void {
    thingLinkingStore.update( () => nullThingLinkingInfo )
}








export const textHyperlinkingStore = writable(
    {
        editor: null,
        focusEditorMethod: null,
        url: null
    } as TextHyperlinkingInfo
)

/**
 * Enable the text-hyperlinking Widget.
 */
export function enableTextHyperlinking(editor: Editor, focusEditorMethod: () => void ): void {
    textHyperlinkingStore.set(
        {
            editor: editor,
            focusEditorMethod: focusEditorMethod,
            url: null
        }
    )
}

export function updateTextHyperlinkingUrl(url: string): void {
    textHyperlinkingStore.update( current => {
        current.url = url
        return current
    } )
}

export function disableTextHyperlinking(): void {
    textHyperlinkingStore.update( () => nullTextHyperlinkingInfo )
}