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
    import { DirectionWidget } from "$lib/widgets/spaceWidgets"


    export let thingCohort: ThingCohort
    export let directionWidgetIsRotated = true
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle


    // Handles for HTML element dimensions.
    let directionWidgetWidth = 1
    let directionWidgetHeight = 1


    // Attributes managed by widget controller.
    let direction: Direction
    let halfAxisId: HalfAxisId | null


    // Rotation and translation of the Direction widget.
    $: directionWidgetRotation = directionWidgetIsRotated ? -90 : 0
    $: directionWidgetTranslation = directionWidgetIsRotated ? directionWidgetWidth : 0

    
    // Set up flag for whether the component has finished mounting. 
    let mounted = false
    onMount(async () => { mounted = true })
</script>


<!-- Widget controller. -->
<RelationshipCohortWidgetController
    {thingCohort}
    {graph}
    {graphWidgetStyle}
    
    bind:direction
    bind:halfAxisId
/>


{#if mounted}
    <!-- Relationships Outline Widget. -->
    <div
        class="relationships-outline-widget"
        class:off-axis={graph.offAxis}
    >
        <!-- Direction text. -->
        <div
            class="direction-widget-container"

            bind:clientWidth={directionWidgetWidth}
            bind:clientHeight={directionWidgetHeight}

            style="
                transform:
                    rotate({directionWidgetRotation}deg)
                    translate(-{directionWidgetTranslation}px, 0px)
            "
        >
            {#if direction}
                <DirectionWidget
                    startingDirection={direction}
                    {halfAxisId}
                    {graphWidgetStyle}
                    partOpaque={true}
                    interactionDisabled={true}
                    optionClickedFunction={(_, __, ___) => {}}
                />
            {/if}
        </div>
    </div>
{/if}


<style>
    .relationships-outline-widget {
        padding: 3px;
    }

    .relationships-outline-widget.off-axis {
        padding: 3px 0 3px 3px;
    }

    .direction-widget-container {
        transform-origin: top left;
    }
</style>