import type { Editor } from "@tiptap/core"
import type { RemoteRelatingInfo, TextHyperlinkingInfo, ThingLinkingInfo } from "$lib/widgets/dialogWidgets"
import type { Direction, Graph, Thing, ThingCohort } from "$lib/models/constructModels"
import type { GraphWidgetStyle, RelationshipBeingCreatedInfo } from "$lib/widgets/graphWidgets"

import { writable, derived } from "svelte/store"
import { nullRelationshipBeingCreatedInfo } from "$lib/widgets/graphWidgets"
import { nullRemoteRelatingInfo, nullTextHyperlinkingInfo, nullThingLinkingInfo } from "$lib/widgets/dialogWidgets"
import { getGraphConstructs } from "./graphConstructStores"
import type { HalfAxisId } from "$lib/shared/constants"


export const relationshipBeingCreatedInfoStore = writable(
    {
        graph: null,
        graphWidgetStyle: null,
        sourceThingId: null,
        sourceThingOpacity: null,
        sourceHalfAxisId: null,
        sourceDirection: null,
        destThingId: null,
        trackingMouse: false,
        startPosition: [0, 0],
        endPosition: [0, 0],
        selectedDirection: null
    } as RelationshipBeingCreatedInfo
)

/**
 * Enable the Relationship-being-created Widget.
 */
export function enableRelationshipBeingCreated(
    graph: Graph,
    graphWidgetStyle: GraphWidgetStyle,
    sourceThingId: number,
    sourceThingOpacity: number,
    sourceHalfAxisId: HalfAxisId,
    sourceDirection: Direction,
    position: [number, number]
): void {
    relationshipBeingCreatedInfoStore.set(
        {
            graph: graph,
            graphWidgetStyle: graphWidgetStyle,

            sourceThingId: sourceThingId,
            sourceThingOpacity: sourceThingOpacity,
            sourceHalfAxisId: sourceHalfAxisId,
            sourceDirection: sourceDirection,

            startPosition: position,
            endPosition: position,
            trackingMouse: true,

            destThingId: null,
            destHalfAxisId: null,
            destDirection: null,

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

export function setRelationshipBeingCreatedDestThingId(destThingId: number | null): void {
    relationshipBeingCreatedInfoStore.update( current => {
        current.destThingId = destThingId
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
    null as (Thing | ThingCohort | null)
)

export const inferredRelationshipBeingCreatedDirection = derived(
    relationshipBeingCreatedInfoStore,
    $relationshipBeingCreatedInfoStore => {
        let direction: Direction | null

        if (
            $relationshipBeingCreatedInfoStore.sourceThingId
            && $relationshipBeingCreatedInfoStore.sourceDirection
        ) {
            direction = $relationshipBeingCreatedInfoStore.sourceDirection

        } else if (
            $relationshipBeingCreatedInfoStore.destThingId
            && $relationshipBeingCreatedInfoStore.destDirection
        ) {
            direction = (
                $relationshipBeingCreatedInfoStore.destDirection.oppositeid ?
                    getGraphConstructs(
                        "Direction",
                        $relationshipBeingCreatedInfoStore.destDirection.oppositeid
                    ) :
                    null
            )

        } else {
            direction = $relationshipBeingCreatedInfoStore.selectedDirection
        }

        return direction
    }
)






export const remoteRelatingInfoStore = writable(
    {
        sourceThingId: null
    } as RemoteRelatingInfo
)

export function enableRemoteRelating(sourceThingId: number): void {
    remoteRelatingInfoStore.set(
        {
            sourceThingId: sourceThingId
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