<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Direction, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import basic framework resources.
    import { onMount } from "svelte"

    // Import widget controller.
    import RelationshipCohortWidgetController from "./controller.svelte"

    // Import related widgets.
    import { DirectionDropdownWidget } from "$lib/widgets/spaceWidgets"


    export let thingCohort: ThingCohort
    export let directionWidgetIsRotated = true
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle


    // Attributes managed by widget controller.
    let direction: Direction
    let halfAxisId: HalfAxisId | null



    $: directionWidgetRotation = directionWidgetIsRotated ? -90 : 0//////////////////// Put into controller.
    $: directionWidgetTranslation = directionWidgetIsRotated ? directionWidgetWidth : 0
    let directionWidgetWidth = 1
    let directionWidgetHeight = 1


    let mounted = false
    onMount(async () => {
        mounted = true
	})
</script>


<!-- Widget controller. -->
<RelationshipCohortWidgetController
    cohort={thingCohort}
    {graph}
    {graphWidgetStyle}
    
    bind:direction
    bind:halfAxisId
/>


{#if mounted}
    <!-- Relationships Outline Widget. -->
    <div
        class="relationships-outline-widget"

        style="
            width: {
                directionWidgetIsRotated ? directionWidgetHeight + 4 :
                directionWidgetWidth + 4
            }px;
        "
    />

    <!-- Direction text. -->
    <div
        class="direction-widget-container"
        bind:clientWidth={directionWidgetWidth}
        bind:clientHeight={directionWidgetHeight}

        style="
            width: 100px;
            transform-origin: top left;
            transform: rotate({directionWidgetRotation}deg) translate(-{directionWidgetTranslation}px, 0px);
        "
    >
        {#if direction}
            <DirectionDropdownWidget
                startingDirection={direction}
                {halfAxisId}
                {graphWidgetStyle}
                optionClickedFunction={(direction, _, option) => {console.log(direction, option)}}
            />
        {/if}
    </div>
{/if}


<style>
    .relationships-outline-widget {
        height: 100%;

        opacity: 0.25;
    }

    .relationships-outline-widget:hover {
        opacity: 0.5;
    }

    .relationships-outline-widget:active {
        opacity: 1.0;
    }

    .direction-widget-container {
        position: absolute;
        left: 4px;
        top: 4px;
        z-index: 1;
    }
</style>