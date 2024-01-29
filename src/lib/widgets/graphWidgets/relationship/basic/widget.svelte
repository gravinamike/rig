<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { Direction, Graph, GenerationMember, ThingCohort } from "$lib/models/constructModels"

    // Import basic framework resources.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Import widget controller.
    import RelationshipWidgetController from "./controller.svelte"

    // Import related widgets.
    import { RelationshipFanSegmentWidget } from "./fanSegment"
    import { RelationshipLeafWidget } from "./leaf"
    

    /**
     * @param thingCohortMemberWithIndex: Object containing the index and the Generation Member the widget is based on.
     * @param thingCohort: The Thing Cohort containing the destination Thing that the Relationship is associated with.
     * @param graph - The Graph that the Relationship is in.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param midline - The horizontal mid-line position of the Relationship stem.
     * @param fanBottom - The vertical position of the bottom of the Relationship fan.
     * @param thingIdOfHoveredRelationship - The ID of the Thing associated with the currently-hovered Relationship.
     * @param halfAxisId - The ID of the half-axis the Relationship is on.
     * @param thingWidth - The width of a Thing widget.
     * @param thingHeight - The height of a Thing widget.
     * @param relationshipsLength - The edge-to-edge distance between the Relationship's source and destination Things.
     * @param sizeOfThingsAlongWidth - The size of a Thing widget along the side-to-side dimension of the Relationship Cohort widget.
     * @param relationshipColor - The color of the Relationship widget, based on the half-axis.
     * @param mirroring - Whether to flip the Relationship Cohort widget relative to the Graph centerline.
     * @param rotation - The rotation of the Relationship Cohort widget, based on the half-axis.
     * @param direction - The Direction of the Relationship.
     * @param relatableForCurrentDrag - Whether the widget is a valid end target for an in-progress drag-relate operation.
     */
    export let thingCohortMemberWithIndex: { index: number, member: GenerationMember }
    export let thingCohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let midline: number
    export let fanBottom: number
    export let thingIdOfHoveredRelationship: number | null
    export let halfAxisId: HalfAxisId
    export let thingWidth: number
    export let thingHeight: number
    export let relationshipsLength: number
    export let sizeOfThingsAlongWidth: number
    export let thingCohortExpanded: boolean
    export let relationshipColor: string
    export let mirroring: -1 | 1
    export let rotation: number
    export let direction: Direction | null = null
    export let relatableForCurrentDrag = false

    

    // Attributes handled by the widget controller.
    let leafGeometry: {
        bottom: number,
        top: number,
        bottomMidline: number,
        topMidline: number
    } = {
        bottom: 0,
        top: 0,
        bottomMidline: 0,
        topMidline: 0
    }
    let showFanSegment = false
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    let openCommandPalette: (event: MouseEvent) => void
    let deleteRelationship: () => void
</script>


<!-- Widget controller. -->
<RelationshipWidgetController
    {thingCohortMemberWithIndex}
    {thingCohort}
    {graph}
    {graphWidgetStyle}
    {midline}
    {halfAxisId}
    {thingWidth}
    {thingHeight}
    {relationshipsLength}
    {sizeOfThingsAlongWidth}
    {thingCohortExpanded}

    bind:leafGeometry
    bind:showFanSegment
    bind:tweenedScale
    bind:openCommandPalette
    bind:deleteRelationship
/>


<!-- Relationship leaf widget. -->
<RelationshipLeafWidget
    bind:graph
    {thingCohort}
    bind:thingIdOfHoveredRelationship
    tweenedScale={$tweenedScale}
    leafGeometry={leafGeometry}
    {thingCohortMemberWithIndex}
    {relationshipColor}
    {mirroring}
    {rotation}
    {direction}
    {halfAxisId}
    {graphWidgetStyle}
    {relatableForCurrentDrag}
    {openCommandPalette}
/>

<!-- Relationship fan segment widget -->
{#if showFanSegment}
    <RelationshipFanSegmentWidget
        bind:thingIdOfHoveredRelationship
        tweenedScale={$tweenedScale}
        {midline}
        {fanBottom}
        leafGeometry={leafGeometry}
        {thingCohortMemberWithIndex}
        {relationshipColor}
        {relatableForCurrentDrag}
        {openCommandPalette}
        {deleteRelationship}
    />
{/if}