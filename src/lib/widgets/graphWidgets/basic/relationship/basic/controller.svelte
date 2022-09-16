<script lang="ts">
    import type { GenerationMember, Graph, ThingCohort } from "$lib/models/constructModels"

    import { mirroringByHalfAxisId, type HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "../../graph"
    import { rectOfThingWidgetByThingId } from "$lib/shared/utility"


    /**
     * Create a Relationship Widget Model.
     * @param {Object} cohortMemberWithIndex - Object referencing the Relationship and its index in the cohort.
     */
    export let cohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let scale: number
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }
    export let relationshipsLength: number
    export let midline: number
    export let halfAxisId: HalfAxisId
    export let thingHeight: number
    export let thingWidth: number
    export let sizeOfThingsAlongWidth: number

    export let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number }




    $: leafGeometry =
        cohortMemberWithIndex.member === null ? {
            bottom: relationshipsLength + 0.5 * sizeOfThingsAlongLength + 0.5 * offsetAlongLength * flip,
            top: relationshipsLength + 0.5 * sizeOfThingsAlongLength + 0.5 * offsetAlongLength * flip,
            bottomMidline: midline + 0.5 * offsetAlongWidth,
            topMidline: midline + 0.5 * offsetAlongWidth
        } :
        {
            bottom: relationshipsLength * 1/3,
            top: 0,
            bottomMidline: defaultLeafMidline,
            topMidline: defaultLeafMidline
        }





    $: sizeOfThingsAlongLength = (
        [1, 2].includes(halfAxisId) ? thingHeight :
        thingWidth
    )



    function getOffsetsOfRelatedThing(member: GenerationMember, scale: number): {x: number, y: number} {
        // Get location of parent Thing Widget.
        const parentDomRect = rectOfThingWidgetByThingId(graph.id, cohort.parentThingId as number)
        const parentRectX = parentDomRect === null ? 0 : parentDomRect.x
        const parentRectY = parentDomRect === null ? 0 : parentDomRect.y

        // Get posisition of related Thing Widget.
        const relatedRect = rectOfThingWidgetByThingId(graph.id, member.thingId)
        const relatedRectX = relatedRect === null ? 0 : relatedRect.x
        const relatedRectY = relatedRect === null ? 0 : relatedRect.y

        // Get the offset (the difference between the two).
        const offsetLengthX = (relatedRectX - parentRectX) / scale
        const offsetLengthY = (relatedRectY - parentRectY) / scale
        
        return {x: offsetLengthX, y: offsetLengthY}
    }



    $: offsetsOfRelatedThing = getOffsetsOfRelatedThing(cohortMemberWithIndex.member, scale)

    $: offsetAlongLength =
        [1, 2].includes(halfAxisId) ? offsetsOfRelatedThing.y :
        offsetsOfRelatedThing.x

    $: offsetAlongWidth =
        [1, 2].includes(halfAxisId) ? offsetsOfRelatedThing.x :
        offsetsOfRelatedThing.y

    $: flip =
        [1, 2].includes(halfAxisId) ? mirroringByHalfAxisId[halfAxisId] :
        -mirroringByHalfAxisId[halfAxisId]

    $: defaultLeafMidline = (
        0.5 * sizeOfThingsAlongWidth
        + (
            sizeOfThingsAlongWidth
            + graphWidgetStyle.betweenThingSpacing) * cohortMemberWithIndex.index
    )

</script>