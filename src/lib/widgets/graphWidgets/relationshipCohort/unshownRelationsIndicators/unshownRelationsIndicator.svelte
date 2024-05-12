<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Thing } from "$lib/models/constructModels"
    import type { ThingDbModel } from "$lib/models/dbModels"
    import type { GraphWidgetStyle } from "../../graph"

    // Import constants.
    import { zoomBase } from "$lib/shared/constants"

    // Import stores.
    import { preventEditing, storeGraphDbModels, addGraphIdsNeedingViewerRefresh } from "$lib/stores"

    // Import UI components.
    import { Tooltip } from "$lib/widgets/layoutWidgets"
    
    // Import API functions.
    import { updateThingPerspectiveExpansions } from "$lib/db/makeChanges"
    
    


    export let parentThing: Thing
    export let directionId: number | "Space" | "all"
    export let halfAxisId: HalfAxisId | null
    export let unshownRelationsCount: number
    export let symbolsToShowCount: number
    export let graphWidgetStyle: GraphWidgetStyle





    const inOutline = (["Space", "all"] as (number | "Space" | "all")[]).includes(directionId)




    // Graph scale (for counter-scaling the tooltip).
    $: scale = inOutline ? 1 : zoomBase ** (graphWidgetStyle?.zoom || 1)
    

    // Whether the indicator (and by extension, the half-axis it models) is expanded or not.
    const isExpanded = parentThing.graph?.directionFromThingIsExpanded(
        parentThing.id as number,
        directionId
    ) ?? false

    // Whether the indicator is visually hidden. (This is the case for non-expanded half-axes with
    // no relations, and expanded half-axes when editing is disabled.)
    $: isHidden = (
        (!isExpanded && unshownRelationsCount === 0)
        || (isExpanded && $preventEditing)
    )


    // Basic indicator geometry.
    const baseIndicatorSize = inOutline ? 15 : 20
    $: indicatorSize = isExpanded && !inOutline ? baseIndicatorSize * 0.75 : baseIndicatorSize

    // Indicator background color.
    $: indicatorColor =
        isExpanded ? "white" :
        unshownRelationsCount < 10 ? "white" :
        unshownRelationsCount < 100 ? "grey" :
        "black"

    // Relation symbol (pip) color.
    $: symbolColor =
        isExpanded ? "grey" :
        unshownRelationsCount < 10 ? "grey" :
        unshownRelationsCount < 100 ? "gainsboro" :
        "white"


    


    
    /**
     * On-click method.
     * 
     * Toggles the Perspective Expansion of the corresponding half-axis.
     */
    async function onClick() {
        // If editing is disabled, abort.
        if ($preventEditing) return

        // Get info about the Perspective Thing.
        const perspectiveThing = parentThing.graph?.perspectiveThing as Thing
        const perspectiveThingId = perspectiveThing.id as number

        // Get the string representing the Perspective Expansions after the current Direction's
        // expansion state is toggled.
        const updatedPerspectiveExpansions = perspectiveThing.updatePerspectiveExpansions(
            parentThing.id as number,
            directionId
        )

        // Update the Perspective Expansions based on that string.
        await updateThingPerspectiveExpansions(
            perspectiveThingId,
            updatedPerspectiveExpansions
        )

        // Refresh the stores, Graph and Graph viewer.
        await storeGraphDbModels<ThingDbModel>("Thing", perspectiveThingId as number, true)
        await parentThing.graph?.build()
        addGraphIdsNeedingViewerRefresh(parentThing.graph?.id as number)
    }
</script>


<!-- Unshown-relations indicator. -->
<div
    class="unshown-relations-indicator"
    class:expanded={isExpanded}
    class:hidden={isHidden}
    class:prevent-editing={$preventEditing}

    style="
        width: {indicatorSize}px;
        height: {indicatorSize}px;
        {directionId === "Space" ? "z-index: 1;" : ""}
        background-color: {indicatorColor};
    "

    on:click={onClick}
    on:keydown={()=>{}}
>
    <!-- If the half-axis is not expanded, -->
    {#if !isExpanded}
        <!-- Show pips for unshown relations. -->
        {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as symbolId}
            <div
                class="nested-square"
                class:hidden={symbolId > symbolsToShowCount}
                
                style="background-color: {symbolColor};"
            />
        {/each}
    
    <!-- Otherwise format the indicator as a collapse button. -->
    {:else}
        <div
            class="perspective-expansion-collapser-button"
            style="
                transform: rotate({
                    halfAxisId === null || halfAxisId === 1 ? 180 :
                    halfAxisId === 2 ? 0 :
                    halfAxisId === 3 ? 90 :
                    270
                }deg);
            "
        >
            <svg class="collapse-icon">
                <path d="M 3 6.5 L 9 12.5 L 15 6.5" />
            </svg>
        </div>
    {/if}

    <!-- Tooltip. -->
    {#key [isExpanded, unshownRelationsCount]}
        <Tooltip
            text={
                isExpanded ? `Collapse ${directionId === "Space" ? "all " : "non-Space"}relations.` :
                `${$preventEditing ? "" : "Show "}${directionId === "all" ? "all " : ""}${unshownRelationsCount} collapsed ${directionId === "Space" ? "in-Space " : ""}relation${unshownRelationsCount > 1 ? "s" : ""}.`
            }
            direction={inOutline ? "right" : "up"}
            delay={1000}
            {scale}
        />
    {/key}
</div>


<style>
    .unshown-relations-indicator {
        outline: solid 1px lightgrey;
        border-radius: 10%;

        position: relative;
        opacity: 0.5;

        display: flex;
        flex-wrap: wrap;
        padding: 1.5px;
        gap: 1px;

        pointer-events: auto;
        cursor: pointer;
    }

    .unshown-relations-indicator.expanded {
        border-radius: 50%;

        opacity: 0.15;

        align-items: center;
        justify-content: center;
    }

    .unshown-relations-indicator.prevent-editing {
        cursor: default;
    }

    .unshown-relations-indicator.hidden {
        visibility: hidden;
    }

    .unshown-relations-indicator:hover {
        outline: solid 1px silver;
        opacity: 0.75;
    }

    .unshown-relations-indicator:active {
        outline: solid 2px silver;
        opacity: 1;
    }

    .nested-square {
        flex: 1 0 25%;
        
        border-radius: 20%;
    }

    .nested-square.hidden {
        visibility: hidden;
    }

    .perspective-expansion-collapser-button {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .collapse-icon {
        position: absolute;
        width: 100%;
        height: 100%;
        
        stroke: dimgrey;
        stroke-width: 3;
        fill: transparent;

        overflow: visible;
    }
</style>