<script context="module" lang="ts">
    // Type imports.
    import type { Graph } from "$lib/models/graphModels"
    import type { RelationshipWidgetModel } from "$lib/models/widgetModels/relationshipWidgetModel"

    // Basic UI imports.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Constant and utility imports.
    import { zoomBase } from "$lib/shared/constants"

    // Widget imports.
    import RelationshipFanSegmentWidget from "./relationshipFanSegmentWidget.svelte"
    import RelationshipLeafWidget from "./relationshipLeafWidget.svelte"
</script>

<script lang="ts">
    /**
     * @param  {RelationshipWidgetModel} model - The Relationship Widget Model used to set up this Widget.
     * @param  {Graph} graph - The Graph that the Relationships are in.
     */
    export let model: RelationshipWidgetModel
    export let midline: number
    export let stemTop: number
    export let thingIdOfHoveredRelationship: number | null
    export let graph: Graph
    
    
    // Graph-scale-related variables.
    $: scale = zoomBase ** graph.graphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)
</script>
    
                        
{#if !(model.cohortMemberWithIndex.member.kind === "thingBaseWidgetModel")}
    <RelationshipLeafWidget
        relationshipWidgetModel={model}
        bind:thingIdOfHoveredRelationship
        tweenedScale={$tweenedScale}
        leafGeometry={model.leafGeometry($tweenedScale)}
        cohortMemberWithIndex={model.cohortMemberWithIndex}
    />
{/if}

<RelationshipFanSegmentWidget
    relationshipWidgetModel={model}
    bind:thingIdOfHoveredRelationship
    tweenedScale={$tweenedScale}
    {midline}
    {stemTop}
    leafGeometry={model.leafGeometry($tweenedScale)}
    cohortMemberWithIndex={model.cohortMemberWithIndex}
/>


<style>
</style>