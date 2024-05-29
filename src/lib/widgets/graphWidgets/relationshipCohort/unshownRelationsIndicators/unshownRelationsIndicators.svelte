<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Space, Thing, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "../../graph"

    // Import constants.
    import { offsetsByHalfAxisId } from "$lib/shared/constants"
    
    // Import related components.
    import UnshownRelationsIndicator from "./unshownRelationsIndicator.svelte"
    import { addGraphIdsNeedingViewerRefresh, preventEditing, storeGraphDbModels } from "$lib/stores"

    // Import API functions.
    import { updateThingPerspectiveExpansions } from "$lib/db/makeChanges"
    import type { ThingDbModel } from "$lib/models/dbModels";
    



    export let parentThing: Thing
    export let directionId: number | "outline"
    export let halfAxisId: HalfAxisId | null
    export let thingCohorts: ThingCohort[]
    export let thingSize: number | null
    export let graphWidgetStyle: GraphWidgetStyle




    // Offsets from parent element.
    const offSetSize = 15
    $: xOffset =
        thingSize === null ? 0 :
        (0.5 * thingSize + offSetSize) * offsetsByHalfAxisId[halfAxisId || 0][0]
    $: yOffset =
        thingSize === null ? 0 :
        (0.5 * thingSize + offSetSize) * offsetsByHalfAxisId[halfAxisId || 0][1]













    





    interface IndicatorInfo {
        directionId: number | "Space" | "all"
        relationsCount: number
        shownRelationsCount: number
        unshownRelationsCount: number
        symbolsToShowCount: number
        isExpanded: boolean
        show: boolean
    }

    let indicatorInfos: IndicatorInfo[] = []

    function buildIndicatorInfos() {
        indicatorInfos = []
        
        const directionIds: (number | "Space" | "all")[] =
            directionId === "outline" ? ["Space", "all"] :
            [directionId]

        for (const id of directionIds) {

            // Whether the indicator (and by extension, the half-axis it models) is expanded or not.
            const isExpanded = parentThing.graph?.directionFromThingIsExpanded(
                parentThing.id as number,
                id
            ) ?? false

            // How many relations the parent Thing has in this Direction.
            const relationsCount =
                parentThing.b_relationships
                    .filter(
                        // Filter out retrograde Relations.
                        relationship => {return !(
                            parentThing?.parentThing
                            && relationship.thingbid === parentThing.parentThing.id
                        )}
                    )
                    .filter(
                        relationship => {return (
                            (
                                relationship.direction === id
                                || id === "all"
                                || (
                                    id === "Space"
                                    && (parentThing?.graph?.startingSpace as Space).includesDirectionId(relationship.direction)
                                )
                            ) ? true :
                            false
                        )}
                    )
                    .length

            // How many of those relations are shown.
            const shownRelationsCount = 
                thingCohorts
                    .filter(
                        // Filter out retrograde Thing Cohorts.
                        thingCohort => {return !thingCohort.isRetrograde}
                    )
                    .map(
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
            const unshownRelationsCount = relationsCount - shownRelationsCount

            // The number of relation symbols (pips) to show is based on the number of unshown relations.
            // Pips represent single relations if the number is less than 10, tens of relations if the
            // number is between 10 and 99, and hundreds of relations if the number is above that.
            const symbolsToShowCount =
                unshownRelationsCount < 10 ? unshownRelationsCount :
                unshownRelationsCount < 100 ? Math.floor(unshownRelationsCount / 10) :
                Math.floor(unshownRelationsCount / 100)

            const indicatorInfo = {
                directionId: id,
                relationsCount,
                shownRelationsCount,
                unshownRelationsCount,
                symbolsToShowCount,
                isExpanded,
                show: true
            }

            indicatorInfos.push(indicatorInfo)
        }

        for (const [i, indicatorInfo] of indicatorInfos.entries()) {
            if (
                !indicatorInfo.isExpanded
                && (
                    (
                        indicatorInfo.unshownRelationsCount <= 0
                    )
                    || (
                        i === 0
                        && indicatorInfos.length > 1
                        && indicatorInfos[1].isExpanded
                    )
                    || (
                        i === 1
                        && indicatorInfo.unshownRelationsCount === indicatorInfos[0].unshownRelationsCount
                    )
                )
            ) {
                indicatorInfo.show = false
            }
        }
        
        
    }



    $: {
        thingCohorts

        buildIndicatorInfos()
    }
    





    /**
     * On-click method.
     * 
     * Toggles the Perspective Expansion of the corresponding half-axis.
     */
    async function onIndicatorClick(directionId: number | "Space" | "all") {
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


<!-- Unshown-relations indicators. -->
<div
    class="unshown-relations-indicators"

    style={
        directionId === "outline" ? "bottom: 3px; left: 3px;" :
        `left: calc(50% + ${xOffset}px); top: calc(50% + ${yOffset}px); transform: translate(-50%, -50%);`
    }
>
    {#each indicatorInfos as indicatorInfo}
        {#if indicatorInfo.show}
            <UnshownRelationsIndicator
                directionId={indicatorInfo.directionId}
                {halfAxisId}
                unshownRelationsCount={indicatorInfo.unshownRelationsCount}
                symbolsToShowCount={indicatorInfo.symbolsToShowCount}
                bind:isExpanded={indicatorInfo.isExpanded}
                {graphWidgetStyle}
                onClick={() => {onIndicatorClick(indicatorInfo.directionId)}}
            />
        {/if}
    {/each}
</div>


<style>
    .unshown-relations-indicators {
        position: absolute;

        display: flex;
        flex-direction: row;
        gap: 4px;
    }
</style>