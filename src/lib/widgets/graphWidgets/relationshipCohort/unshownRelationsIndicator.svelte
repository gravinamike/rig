<script lang="ts">
    // Import types.
    import type { HalfAxisId, PerspectiveExpansions } from "$lib/shared/constants"
    import type { Thing, ThingCohort } from "$lib/models/constructModels"

    import { offsetsByHalfAxisId, zoomBase } from "$lib/shared/constants"
    import { Tooltip } from "$lib/widgets/layoutWidgets"
    import { removeItemFromArray } from "$lib/shared/utility"
    // Import API functions.
    import { updateThingPerspectiveExpansions } from "$lib/db/makeChanges"
    import type { GraphWidgetStyle } from "../graph";
    import { addGraphIdsNeedingViewerRefresh, preventEditing, storeGraphDbModels } from "$lib/stores";
    import type { ThingDbModel } from "$lib/models/dbModels";


    export let parentThing: Thing
    export let directionId: number
    export let halfAxisId: HalfAxisId
    export let thingCohort: ThingCohort
    export let thingSize: number
    export let graphWidgetStyle: GraphWidgetStyle







    const indicatorSize = 20



    $: xOffset = (0.5 * thingSize + 15) * offsetsByHalfAxisId[halfAxisId || 0][0]
    $: yOffset = (0.5 * thingSize + 15) * offsetsByHalfAxisId[halfAxisId || 0][1]



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






    async function onClick() {
        if ($preventEditing) return

        const perspectiveThing = parentThing.graph?.perspectiveThing as Thing
        const perspectiveThingId = perspectiveThing.id as number

        const updatedPerspectiveExpansions = updatePerspectiveExpansions(
            perspectiveThing,
            parentThing.id as number,
            directionId
        )
    
        console.log(
            perspectiveThingId,
            updatedPerspectiveExpansions
        )

        await updateThingPerspectiveExpansions(
            perspectiveThingId,
            updatedPerspectiveExpansions
        )

        await storeGraphDbModels<ThingDbModel>("Thing", perspectiveThingId as number, true)
        await parentThing.graph?.build()
        addGraphIdsNeedingViewerRefresh(parentThing.graph?.id as number)
    }





    

    function updatePerspectiveExpansions(
        perspectiveThing: Thing,
        thingId: number,
        directionId: number
    ) {

        console.log("STARTING WITH:", perspectiveThing.perspectiveexpansions)
        const perspectiveExpansionsString = perspectiveThing.perspectiveexpansions
        const spaceId = perspectiveThing.space?.id as number

        const perspectiveExpansions = JSON.parse(perspectiveExpansionsString) as PerspectiveExpansions

        if (!(String(spaceId) in perspectiveExpansions)) {
            perspectiveExpansions[spaceId] = {}
        }

        if (!(String(thingId) in perspectiveExpansions[spaceId])) {
            perspectiveExpansions[spaceId][thingId] = []
        }

        if (!(perspectiveExpansions[spaceId][thingId].includes(directionId))) {
            perspectiveExpansions[spaceId][thingId].push(directionId)
        } else {
            removeItemFromArray(perspectiveExpansions[spaceId][thingId], directionId, false)

            if (perspectiveExpansions[spaceId][thingId].length === 0) {
                delete perspectiveExpansions[spaceId][thingId]

                if (Object.keys(perspectiveExpansions[spaceId]).length === 0) {
                    delete perspectiveExpansions[spaceId]
                }
            }
        }

        return JSON.stringify(perspectiveExpansions)
    }




    
    const isExpanded = parentThing.graph?.directionFromThingIsExpanded(
        parentThing.id as number,
        directionId
    )
    



</script>


<div
    class="unshown-relations-indicator"
    class:hidden={numberOfUnshownRelations === 0}
    class:prevent-editing={$preventEditing}

    style="
        left: calc(50% + {xOffset}px);
        top: calc(50% + {yOffset}px);
        width: {indicatorSize}px;
        height: {indicatorSize}px;
        background-color: {indicatorColor};
    "

    on:click={onClick}
    on:keydown={()=>{}}
>
    {#key numberOfUnshownRelations}
        <Tooltip
            text={`${$preventEditing ? "" : "Show "}${numberOfUnshownRelations} collapsed relation${numberOfUnshownRelations > 1 ? "s" : ""}.`}
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

    <div class="expand-collapse-icon">
        {#if isExpanded}
            {"> <"}
        {:else}
            {"< >"}
        {/if}
    </div>
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

    .expand-collapse-icon {
        position: absolute;
        left: 0;
        top: 0;
        width: 200%;
        height: 100%;
        transform: rotate(90deg) translate(0, 64%) scale(100%, 155%) ;

        text-align: center;
        font-weight: 600;

        pointer-events: none;
    }

    .unshown-relations-indicator:not(:hover) .expand-collapse-icon {
        display: none;
    }
</style>