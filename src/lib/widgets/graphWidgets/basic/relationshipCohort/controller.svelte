<script lang="ts">
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Direction, Space, GenerationMember, ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetModel } from "$lib/models/widgetModels"

    import {
        halfAxisOppositeIds, rotationByHalfAxisId, mirroringByHalfAxisId,
        offsetsByHalfAxisId, relationshipColorByHalfAxisId
    } from "$lib/shared/constants"
    import { retrieveGraphConstructs } from "$lib/stores"
    import { rectOfThingWidgetByThingId } from "$lib/shared/utility"



    /**
     * Create a Relationship Cohort Widget Model.
     * @param {Cohort} cohort - The Relationship Cohort that the widget represents.
     * @param {Space} space - The Space that the widget is rendered in.
     * @param {GraphWidgetModel} graphWidgetModel - Widget model of the Graph that the Cohort is in.
     */
    export let graphWidgetModel: GraphWidgetModel
    export let cohort: ThingCohort
    export let space: Space

    export let halfAxisId: HalfAxisId
    export let parentThing: Thing
    export let thingWidth: number
    export let thingHeight: number
    export let xOffset: number
    export let yOffset: number
    export let relationshipsWidth: number
    export let relationshipsLength: number
    export let widgetWidth: number
    export let widgetHeight: number
    export let xOffsetToGrandparentThing: number
    export let yOffsetToGrandparentThing: number
    export let midline: number
    export let stemBottom: number
    export let stemTop: number
    export let zIndex: number
    export let opacity: number
    export let mirroring: 1 | -1
    export let rotation: number
    export let direction: Direction
    
    


    $: parentThing = cohort.parentThing as Thing

    $: generationId = cohort.address?.generationId || 0

    $: directionId = cohort.address.directionId as number

    $: halfAxisId = cohort.halfAxisId ? cohort.halfAxisId : 0

    $: direction = retrieveGraphConstructs("Direction", directionId) as Direction

    $: planeId = cohort.plane?.id || 0

    $: rotation = rotationByHalfAxisId[halfAxisId]

    $: relationshipColor = relationshipColorByHalfAxisId[halfAxisId]










    




    





















    
    // Variables related to the x, y, and z position of this Relationships Widget (relative to parent Thing Widget).
    
    $: xOffset = 0.5 * graphWidgetModel.style.relationDistance * offsetsByHalfAxisId[halfAxisId][0]

    $: yOffset = 0.5 * graphWidgetModel.style.relationDistance * offsetsByHalfAxisId[halfAxisId][1]

    $: zIndex = (generationId * 2 - 1) * offsetsByHalfAxisId[halfAxisId][2]


    /* Variables related to the widths and heights of this Relationships Widget. */

    // The width across all the Relationships in the widget.
    $: relationshipsWidth =
        Math.max(cohort.members.length, 1)
        * (
            [1, 2].includes(halfAxisId) ? thingWidth :
            thingHeight
        )
        + (Math.max(cohort.members.length, 1) - 1)
        * graphWidgetModel.style.betweenThingSpacing

    // The edge-to-edge distance between two related Things.
    $: relationshipsLength =
        graphWidgetModel.style.relationDistance - (
            [1, 2].includes(halfAxisId) ? thingHeight :
            thingWidth
        ) * cohort.axialElongation


    $: widgetWidth =
        [1, 2].includes(halfAxisId) ? relationshipsWidth :
        relationshipsLength

    $: widgetHeight =
        [1, 2].includes(halfAxisId) ? relationshipsLength :
        relationshipsWidth



    /* Variables related to the geometries of the Widget's parts. */

    // X and Y offsets to grandparent Thing.
    // This means the distance from left and top edge of the Relationships Widget to the midline of the
    // Thing Widget that would duplicate, or "double back", the grandparent Thing.
    // If the grandparent Thing is not in the related Cohort, the offsets are 0.
    function offsetToGrandparentThing(): number {

        if (cohort.indexOfGrandparentThing === null || cohort.isInRelationshipsOnlyGeneration) {

            return 0

        } else {

            /* The offset between the Cohort's grandparent Thing if it is represented in the Cohort and the Cohort's parent Thing. */

            // The difference between the index of the grandparent Thing (as represented in the Cohort) and
            // the halfway index of the Cohort.
            const part1 = (
                (cohort.members.length - 1) / 2
                - cohort.indexOfGrandparentThing
            )
            // The sum of the dimension of one Thing plus the spacing between Things.
            * (
                (
                    [1, 2].includes(halfAxisId) ?
                        thingWidth :
                        thingHeight
                )
                + graphWidgetModel.style.betweenThingSpacing
            )

            /* The offset between the Cohort's parent Thing and the Cohort's grandparent Thing. */
            const part2 = (
                parentRelationshipsWidgetModel !== null
                && halfAxisId !== 0
                && parentRelationshipsWidgetModel.halfAxisId === halfAxisOppositeIds[halfAxisId] ?
                    (
                        (sizeOfThingsAlongWidth + graphWidgetModel.style.betweenThingSpacing)
                        * (parentThing as Thing).address.indexInCohort
                    ) :
                    0
            )

            const offsetToGrandparentThing = part1 + part2

            return offsetToGrandparentThing

        }

    }

    $: xOffsetToGrandparentThing =
        cohort.rowOrColumn() === "row" ? offsetToGrandparentThing() :
        0

    $: yOffsetToGrandparentThing =
        cohort.rowOrColumn() === "column" ? offsetToGrandparentThing() :
        0

    $: mirroring = mirroringByHalfAxisId[halfAxisId]


    // Construct a list of the related Things along with their indices.
    function cohortMembersWithIndices(): { index: number, member: GenerationMember }[] {
        const cohortMembersWithIndices: { index: number, member: GenerationMember }[] = []
        cohort.members.forEach(
            (member, index) => cohortMembersWithIndices.push({ index: index, member: member })
        )
        return cohortMembersWithIndices
    }


    


    // Formatting-related variables.
    $: distanceFromFocalPlane = planeId - graphWidgetModel.graph.planes.focalPlaneId
    
    $: opacity =
        1 / (
            1 + (
                distanceFromFocalPlane < 0 ?
                    1 :
                    (
                        distanceFromFocalPlane > 0 ?
                            2 :
                            0
                        )
                    ) * Math.abs(distanceFromFocalPlane)
        )





    // Variables related to Stem geometry.
    $: midline = relationshipsWidth * 0.5 - offsetToGrandparentThing()

    $: stemBottom = relationshipsLength

    $: stemTop = relationshipsLength * 2/3




    function getOffsetsOfRelatedThing(member: GenerationMember, scale: number): {x: number, y: number} {
        // Get location of parent Thing Widget.
        const parentDomRect = rectOfThingWidgetByThingId(graphWidgetModel.graph.id, cohort.parentThingId as number)
        const parentRectX = parentDomRect === null ? 0 : parentDomRect.x
        const parentRectY = parentDomRect === null ? 0 : parentDomRect.y

        // Get posisition of related Thing Widget.
        const relatedRect = rectOfThingWidgetByThingId(graphWidgetModel.graph.id, (member as Thing).id)
        const relatedRectX = relatedRect === null ? 0 : relatedRect.x
        const relatedRectY = relatedRect === null ? 0 : relatedRect.y

        // Get the offset (the difference between the two).
        const offsetLengthX = (relatedRectX - parentRectX) / scale
        const offsetLengthY = (relatedRectY - parentRectY) / scale
        
        return {x: offsetLengthX, y: offsetLengthY}
    }


    $: sizeOfThingsAlongWidth =
        (
            [1, 2].includes(halfAxisId) ?
                parentThingWidgetModel.thingWidth :
                parentThingWidgetModel.thingHeight
        )


    $: thingWidth = parentThingWidgetModel.thingWidth
    $: thingHeight = parentThingWidgetModel.thingHeight
</script>