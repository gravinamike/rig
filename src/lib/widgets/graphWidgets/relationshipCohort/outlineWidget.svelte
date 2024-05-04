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
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let outlineScrollAreaTop = 0
    export let outlineScrollTime: Date | null = null


    // Handles for HTML element dimensions.
    let directionWidgetWidth = 1
    let directionWidgetHeight = 1


    // Attributes managed by widget controller.
    let direction: Direction
    let halfAxisId: HalfAxisId | null

    
    // Set up flag for whether the component has finished mounting. 
    let mounted = false
    onMount(async () => { mounted = true })











    let relationshipsOutlineWidget: HTMLElement | null = null

    let directionWidgetContainerStickyOffset = 0




    function getDirectionWidgetContainerStickyOffset() {
        const relationshipsOutlineWidgetTop = relationshipsOutlineWidget?.getBoundingClientRect().top ?? 0
        const directionWidgetContainerStickyOffset =
            Math.min(
                Math.max(
                    outlineScrollAreaTop - relationshipsOutlineWidgetTop + (
                        // Allowance for Thing name widget.
                        20 * ((thingCohort.generation?.id ?? 0) - 1)
                    ),
                    0
                ),
                (relationshipsOutlineWidget?.parentElement?.getBoundingClientRect().height ?? 0) - 46
            )

        return directionWidgetContainerStickyOffset
    }

    $: {
        outlineScrollTime

        directionWidgetContainerStickyOffset = getDirectionWidgetContainerStickyOffset()
    }

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

        bind:this={relationshipsOutlineWidget}
    >
        <!-- Direction text. -->
        <div
            class="direction-widget-container"

            style="position: relative; top: {directionWidgetContainerStickyOffset}px;"

            bind:clientWidth={directionWidgetWidth}
            bind:clientHeight={directionWidgetHeight}
        >
            {#if direction}
                <DirectionWidget
                    startingDirection={direction}
                    {halfAxisId}
                    {graphWidgetStyle}
                    diameter={40}
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