<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Thing, ThingCohort } from "$lib/models/constructModels"

    import { offsetsByHalfAxisId } from "$lib/shared/constants"



    export let parentThing: Thing
    export let directionId: number
    export let halfAxisId: HalfAxisId
    export let thingCohort: ThingCohort
    export let thingSize: number








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
        box-sizing: border-box;
        border-radius: 10%;

        position: absolute;
        width: 10px;
        height: 10px;
        transform: translate(-50%, -50%);
        opacity: 0.5;

        display: flex;
        flex-wrap: wrap;
        padding: 1px;
        gap: 1px;

        pointer-events: auto;
        cursor: pointer;
    }

    .unshown-relations-indicator.hidden {
        visibility: hidden;
    }

    .unshown-relations-indicator:hover {
        opacity: 0.75;
    }

    .unshown-relations-indicator:active {
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