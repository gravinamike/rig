<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Space, Thing, ThingCohort } from "$lib/models/constructModels"
    import type { ThingDbModel } from "$lib/models/dbModels"
    import type { GraphWidgetStyle } from "../graph"

    // Import constants.
    import { offsetsByHalfAxisId, zoomBase } from "$lib/shared/constants"

    // Import stores.
    import { preventEditing, storeGraphDbModels, addGraphIdsNeedingViewerRefresh } from "$lib/stores"

    // Import UI components.
    import { Tooltip } from "$lib/widgets/layoutWidgets"
    
    // Import API functions.
    import { updateThingPerspectiveExpansions } from "$lib/db/makeChanges"
    
    


    export let parentThing: Thing
    export let directionId: number | "Space" | "all"
    export let halfAxisId: HalfAxisId | null
    export let thingCohorts: ThingCohort[]
    export let thingSize: number | null
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
        (!isExpanded && numberOfUnshownRelations === 0)
        || (isExpanded && $preventEditing)
    )


    // Basic indicator geometry.
    $: offSetSize = isExpanded ? 10 : 15
    $: xOffset =
        thingSize === null ? 0 :
        (0.5 * thingSize + offSetSize) * offsetsByHalfAxisId[halfAxisId || 0][0]
    $: yOffset =
        thingSize === null ? 0 :
        (0.5 * thingSize + offSetSize) * offsetsByHalfAxisId[halfAxisId || 0][1]
    const baseIndicatorSize = inOutline ? 15 : 20
    $: indicatorSize = isExpanded ? baseIndicatorSize * 0.75 : baseIndicatorSize

    // Indicator background color.
    $: indicatorColor =
        isExpanded ? "white" :
        numberOfUnshownRelations < 10 ? "white" :
        numberOfUnshownRelations < 100 ? "grey" :
        "black"

    // Relation symbol (pip) color.
    $: symbolColor =
        isExpanded ? "grey" :
        numberOfUnshownRelations < 10 ? "grey" :
        numberOfUnshownRelations < 100 ? "gainsboro" :
        "white"


    // How many relations the parent Thing has in this Direction.
    $: numberOfRelations =
        parentThing.b_relationships
            .filter(
                relationship => {return (
                    relationship.direction === directionId
                    || directionId === "all"
                    || (
                        directionId === "Space"
                        && (parentThing.space as Space).directions
                            .map(direction => direction.id)
                            .includes(relationship.direction)
                    ) ? true :
                    false
                )}
            )
            .length

    // How many of those relations are shown.
    $: numberOfShownRelations =
        thingCohorts.map(
            (thingCohort) => {
                // If the Thing Cohort for this half-axis is within the Graph's Depth, or if the half-axis
                // is expanded,
                return (
                    thingCohort.address.generationId <= (parentThing.graph as Graph).depth
                    || isExpanded
                ) ?
                    // All the relations are shown.
                    thingCohort.members.length :

                    // Otherwise, only those relations with the "alreadyRendered" flag set are shown.
                    thingCohort.members.filter(member => member.alreadyRendered).length
            }
        ).reduce((a, b) => a + b, 0)
        
    // How many of those relations are unshown.
    $: numberOfUnshownRelations = numberOfRelations - numberOfShownRelations



    // The number of relation symbols (pips) to show is based on the number of unshown relations.
    // Pips represent single relations if the number is less than 10, tens of relations if the
    // number is between 10 and 99, and hundreds of relations if the number is above that.
    $: numberOfSymbolsToShow =
        numberOfUnshownRelations < 10 ? numberOfUnshownRelations :
        numberOfUnshownRelations < 100 ? Math.floor(numberOfUnshownRelations / 10) :
        Math.floor(numberOfUnshownRelations / 100)


    
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
        {
            directionId === "Space" ? "bottom: 3px; left: 3px;" :
            directionId === "all" ? "bottom: 3px; left: 24px;" :
            `left: calc(50% + ${xOffset}px); top: calc(50% + ${yOffset}px); transform: translate(-50%, -50%);`
        }
        
        width: {indicatorSize}px;
        height: {indicatorSize}px;
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
                class:hidden={symbolId > numberOfSymbolsToShow}
                
                style="background-color: {symbolColor};"
            />
        {/each}
    
    <!-- Otherwise format the indicator as a collapse button. -->
    {:else}
        <div
            class="perspective-expansion-collapser-button"
            style="
                transform: rotate({
                    halfAxisId === 1 ? 180 :
                    halfAxisId === 2 ? 0 :
                    halfAxisId === 3 ? 90 :
                    270
                }deg);
            "
        >
            <div class="collapse-icon">
                v
            </div>
        </div>
    {/if}

    <!-- Tooltip. -->
    {#key [isExpanded, numberOfUnshownRelations]}
        <Tooltip
            text={
                isExpanded ? "Collapse relations." :
                `${$preventEditing ? "" : "Show "}${directionId === "all" ? "all " : ""}${numberOfUnshownRelations} collapsed ${directionId === "Space" ? "in-Space " : ""}relation${numberOfUnshownRelations > 1 ? "s" : ""}.`
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

        position: absolute;
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

        opacity: 0;

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
        width: 100%;
        height: 100%;
    }

    .collapse-icon {
        margin: auto;
        width: 100%;
        height: 100%;
        transform: scale(1.45, 0.85) translate(-0.35px, -3px);

        text-align: center;
        font-weight: 600;
        color: grey;
    }
</style>