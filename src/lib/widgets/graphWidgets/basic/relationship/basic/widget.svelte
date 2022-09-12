<script context="module" lang="ts">
    // Type imports.
    import type { GraphWidgetModel } from "$lib/models/widgetModels"

    // Basic UI imports.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Constant and utility imports.
    import { zoomBase } from "$lib/shared/constants"

    // Widget imports.
    import RelationshipFanSegmentWidget from "./fanSegment.svelte"
    import RelationshipLeafWidget from "./leaf.svelte"
</script>

<script lang="ts">
    import type { GenerationMember } from "$lib/models/constructModels"
    import RelationshipWidgetController from "./controller.svelte"

    /**
     * @param  {Graph} graph - The Graph that the Relationships are in.
     */
    export let midline: number
    export let stemTop: number
    export let thingIdOfHoveredRelationship: number | null
    export let graphWidgetModel: GraphWidgetModel

    let cohortMemberWithIndex: { index: number, member: GenerationMember }
    let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number }
    
    
    // Graph-scale-related variables.
    $: scale = zoomBase ** graphWidgetModel.style.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)
</script>



<RelationshipWidgetController
    {graphWidgetModel}
    scale={$tweenedScale}
    {cohortMemberWithIndex}
    {relationshipsLength}
    {midline}
    {halfAxisId}
    {thingHeight}
    {thingWidth}
    {leafGeometry}
/>












    
                        
{#if cohortMemberWithIndex.member}
    <RelationshipLeafWidget
        bind:thingIdOfHoveredRelationship
        tweenedScale={$tweenedScale}
        leafGeometry={leafGeometry}
        cohortMemberWithIndex={cohortMemberWithIndex}
    />
{/if}

<RelationshipFanSegmentWidget
    bind:thingIdOfHoveredRelationship
    tweenedScale={$tweenedScale}
    {midline}
    {stemTop}
    leafGeometry={leafGeometry}
    cohortMemberWithIndex={cohortMemberWithIndex}
/>