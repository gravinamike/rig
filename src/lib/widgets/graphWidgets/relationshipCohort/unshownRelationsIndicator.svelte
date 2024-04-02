<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Thing, ThingCohort } from "$lib/models/constructModels"

    import { offsetsByHalfAxisId, zoomBase } from "$lib/shared/constants"
    import { Tooltip } from "$lib/widgets/layoutWidgets"
    import type { GraphWidgetStyle } from "../graph";


    export let parentThing: Thing
    export let directionId: number
    export let halfAxisId: HalfAxisId
    export let thingCohort: ThingCohort
    export let thingSize: number
    export let graphWidgetStyle: GraphWidgetStyle







    const indicatorSize = 20



    $: xOffset = (0.5 * thingSize + 20) * offsetsByHalfAxisId[halfAxisId || 0][0]
    $: yOffset = (0.5 * thingSize + 20) * offsetsByHalfAxisId[halfAxisId || 0][1]





    $: numberOfRelations =
        parentThing.b_relationships
            .filter(relationship => relationship.direction === directionId)
            .length

    $: numberOfShownRelations = thingCohort.members.length
    $: numberOfUnshownRelations = numberOfRelations - numberOfShownRelations

    $: numberOfSymbolsToShow =
        numberOfUnshownRelations < 10 ? numberOfUnshownRelations :
        numberOfUnshownRelations < 100 ? Math.floor(numberOfUnshownRelations / 10) :
        Math.floor(numberOfUnshownRelations / 100)

    $: indicatorColor =
        numberOfUnshownRelations < 10 ? "white" :
        numberOfUnshownRelations < 100 ? "grey" :
        "black"

    $: symbolColor =
        numberOfUnshownRelations < 10 ? "grey" :
        numberOfUnshownRelations < 100 ? "gainsboro" :
        "white"
    

    $: scale = zoomBase ** (graphWidgetStyle?.zoom || 1)



</script>


<div
    class="unshown-relations-indicator"
    class:hidden={numberOfUnshownRelations === 0}

    style="
        left: calc(50% + {xOffset}px);
        top: calc(50% + {yOffset}px);
        width: {indicatorSize}px;
        height: {indicatorSize}px;
        background-color: {indicatorColor};
    "
>
    {#key numberOfUnshownRelations}
        <Tooltip
            text={`Show ${numberOfUnshownRelations} collapsed relation${numberOfUnshownRelations > 1 ? "s" : ""}.`}
            direction={"up"}
            delay={1000}
            {scale}
        />
    {/key}

    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as symbolId}
        <div
            class="nested-square"
            class:hidden={symbolId > numberOfSymbolsToShow}
            
            style="background-color: {symbolColor};"
        />
    {/each}
</div>


<style>
    .unshown-relations-indicator {
        outline: solid 1px lightgrey;
        border-radius: 10%;

        position: absolute;
        width: 10px;
        height: 10px;
        transform: translate(-50%, -50%);
        opacity: 0.5;

        display: flex;
        flex-wrap: wrap;
        padding: 1.5px;
        gap: 1px;

        pointer-events: auto;
        cursor: pointer;
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
</style>