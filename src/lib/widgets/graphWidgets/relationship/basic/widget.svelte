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
    import RelationshipFanSegmentWidget from "./fanSegment.svelte"
    import RelationshipLeafWidget from "./leaf.svelte"
    

    /**
     * @param cohortMemberWithIndex: Object containing the index and the Generation Member the widget is based on.
     * @param cohort: The Thing Cohort containing the destination Thing that the Relationship is associated with.
     * @param graph - The Graph that the Relationship is in.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param midline - The horizontal mid-line position of the Relationship stem.
     * @param stemTop - The vertical position of the top of the Relationship stem.
     * @param thingIdOfHoveredRelationship - The ID of the Thing associated with the currently-hovered Relationship.
     * @param halfAxisId - The ID of the half-axis the Relationship is on.
     * @param thingWidth - The width of a Thing widget.
     * @param thingHeight - The height of a Thing widget.
     * @param relationshupsLength - The edge-to-edge distance between the Relationship's source and destination Things.
     * @param sizeOfThingsALongWidth - The size of a Thing widget along the side-to-side dimension of the Relationship Cohort widget.
     * @param relationshipColor - The color of the Relationship widget, based on the half-axis.
     * @param mirroring - Whether to flip the Relationship Cohort widget relative to the Graph centerline.
     * @param rotation - The rotation of the Relationship Cohort widget, based on the half-axis.
     * @param direction - The Direction of the Relationship.
     */
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }
    export let cohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let midline: number
    export let stemTop: number
    export let thingIdOfHoveredRelationship: number | null
    export let halfAxisId: HalfAxisId
    export let thingWidth: number
    export let thingHeight: number
    export let relationshipsLength: number
    export let sizeOfThingsAlongWidth: number
    export let relationshipColor: string
    export let mirroring: -1 | 1
    export let rotation: number
    export let direction: Direction | null = null


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
    
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
</script>


<!-- Widget controller. -->
<RelationshipWidgetController
    {cohortMemberWithIndex}
    {cohort}
    {graph}
    {graphWidgetStyle}
    {midline}
    {halfAxisId}
    {thingWidth}
    {thingHeight}
    {relationshipsLength}
    {sizeOfThingsAlongWidth}

    bind:leafGeometry
    bind:tweenedScale
/>


<!-- Relationship leaf widget. -->
<RelationshipLeafWidget
    bind:graph
    bind:thingIdOfHoveredRelationship
    tweenedScale={$tweenedScale}
    leafGeometry={leafGeometry}
    cohortMemberWithIndex={cohortMemberWithIndex}
    {relationshipColor}
    {mirroring}
    {rotation}
    {direction}
    {halfAxisId}
    {graphWidgetStyle}
/>

<!-- Relationship fan segment widget -->
<RelationshipFanSegmentWidget
    bind:thingIdOfHoveredRelationship
    tweenedScale={$tweenedScale}
    {midline}
    {stemTop}
    leafGeometry={leafGeometry}
    cohortMemberWithIndex={cohortMemberWithIndex}
    {relationshipColor}
/>