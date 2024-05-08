<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Space, Thing, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "../../graph"

    // Import constants.
    import { offsetsByHalfAxisId } from "$lib/shared/constants"
    
    // Import related components.
    import UnshownRelationsIndicator from "./unshownRelationsIndicator.svelte"
    



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
    }

    let indicatorInfos: IndicatorInfo[] = []

    function buildIndicatorInfos() {
        
        const directionIds: (number | "Space" | "all")[] =
            directionId === "outline" ? ["Space", "all"] :
            [directionId]

        for (const [i, id] of directionIds.entries()) {

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
                            relationship.direction === id
                            || id === "all"
                            || (
                                id === "Space"
                                && (parentThing?.graph?.startingSpace as Space).includesDirectionId(relationship.direction)
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
                symbolsToShowCount
            }

            if (!(i === 1 && indicatorInfo.unshownRelationsCount === indicatorInfos[0].unshownRelationsCount)) {
                indicatorInfos.push(indicatorInfo)
            }
        }


        
    }


    buildIndicatorInfos()







    





    



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
        <UnshownRelationsIndicator
            {parentThing}
            directionId={indicatorInfo.directionId}
            {halfAxisId}
            relationsCount={indicatorInfo.relationsCount}
            shownRelationsCount={indicatorInfo.shownRelationsCount}
            unshownRelationsCount={indicatorInfo.unshownRelationsCount}
            symbolsToShowCount={indicatorInfo.symbolsToShowCount}
            {graphWidgetStyle}
        />
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