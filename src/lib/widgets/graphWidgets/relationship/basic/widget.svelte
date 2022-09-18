<script lang="ts">
    // Basic UI imports.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Constant and utility imports.
    import { zoomBase, type HalfAxisId } from "$lib/shared/constants"

    // Widget imports.
    import RelationshipFanSegmentWidget from "./fanSegment.svelte"
    import RelationshipLeafWidget from "./leaf.svelte"
    import type { Direction, GenerationMember, Graph, ThingCohort } from "$lib/models/constructModels"
    import RelationshipWidgetController from "./controller.svelte"
    import type { GraphWidgetStyle } from "../../graph"

    
    /**
     * @param  {Graph} graph - The Graph that the Relationships are in.
     */
    export let cohort: ThingCohort
    export let graph: Graph
    export let midline: number
    export let stemTop: number
    export let thingIdOfHoveredRelationship: number | null
    export let graphWidgetStyle: GraphWidgetStyle
    export let halfAxisId: HalfAxisId
    export let thingWidth: number
    export let thingHeight: number
    export let relationshipsLength: number
    export let sizeOfThingsAlongWidth: number
    export let relationshipColor: string
    export let mirroring: -1 | 1
    export let rotation: number
    export let direction: Direction

    let cohortMemberWithIndex: { index: number, member: GenerationMember }
    let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number }
    
    
    // Graph-scale-related variables.
    $: scale = zoomBase ** graphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)
</script>



<RelationshipWidgetController
    {cohort}
    {graph}
    {graphWidgetStyle}
    scale={$tweenedScale}
    {cohortMemberWithIndex}
    {relationshipsLength}
    {midline}
    {halfAxisId}
    {thingHeight}
    {thingWidth}
    {sizeOfThingsAlongWidth}
    {leafGeometry}
/>












    
                        
{#if cohortMemberWithIndex.member}
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
{/if}

<RelationshipFanSegmentWidget
    bind:thingIdOfHoveredRelationship
    tweenedScale={$tweenedScale}
    {midline}
    {stemTop}
    leafGeometry={leafGeometry}
    cohortMemberWithIndex={cohortMemberWithIndex}
    {relationshipColor}
/>