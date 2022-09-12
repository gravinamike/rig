<script lang="ts">
    import type { GenerationMember } from "$lib/models/constructModels"
    import type { GraphWidgetModel } from "$lib/models/widgetModels"

    import { mirroringByHalfAxisId, type HalfAxisId } from "$lib/shared/constants"


    /**
     * Create a Relationship Widget Model.
     * @param {Object} cohortMemberWithIndex - Object referencing the Relationship and its index in the cohort.
     */
    export let graphWidgetModel: GraphWidgetModel
    export let scale: number
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }
    export let relationshipsLength: number
    export let midline: number
    export let halfAxisId: HalfAxisId
    export let thingHeight: number
    export let thingWidth: number

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


    $: offsetsOfRelatedThing = relationshipCohortWidgetModel.getOffsetsOfRelatedThing(cohortMemberWithIndex.member, scale)

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
        0.5 * relationshipCohortWidgetModel.sizeOfThingsAlongWidth
        + (
            relationshipCohortWidgetModel.sizeOfThingsAlongWidth
            + graphWidgetModel.style.betweenThingSpacing) * cohortMemberWithIndex.index
    )

</script>