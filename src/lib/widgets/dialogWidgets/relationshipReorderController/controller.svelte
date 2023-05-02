<script lang="ts">
    import { reorderingInfoStore, disableReordering, setReorderingIndex, storeGraphDbModels } from "$lib/stores"
    import { changeIndexInArray, clampNumber } from "$lib/shared/utility"
    import { reorderRelationship } from "$lib/db"
    import type { ThingCohort } from "$lib/models/constructModels";
    import { zoomBase } from "$lib/shared/constants";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets";
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide";



    // Derive the tweenedScale.

    $: scale = zoomBase ** ($reorderingInfoStore.graphWidgetStyle?.zoom || 1)
    const tweenedScale = tweened( 1, { duration: 100, easing: cubicOut } )
    $: tweenedScale.set(scale)   




    // Derive the new index.

    // Delta index is the change in the index from its current value.
    let deltaIndex: number | null = null
    // Derive the new value from the current and the delta. (This assumes no
    // "clamping" yet to prevent indices outside the allowed range.)
    $: currentPlusDeltaIndex =
        $reorderingInfoStore.startIndex === null ? null :
        $reorderingInfoStore.startIndex + (deltaIndex || 0)
    // Clamp the new value between the Relationships Cohort's beginning and end
    // indices.
    $: newIndex = 
        $reorderingInfoStore.thingCohort === null || currentPlusDeltaIndex === null ? null :
        clampNumber(currentPlusDeltaIndex, 0, $reorderingInfoStore.thingCohort.members.length - 1)


    // When a new index has been determined, record it in the Relationship-
    // reordering store.
    $: if (newIndex !== null) setReorderingIndex(newIndex)


    /**
     * Handle-body-mouse-move method.
     * 
     * Handles tasks that should be executed when the mouse is moved over the
     * page body (including setting the delta-index based on drag distance).
     * @param event - The Mouse event that triggers this method.
     */
    function handleBodyMouseMove(event: MouseEvent) {
        // If no drag has been started, return.
        if (!($reorderingInfoStore.dragStartPosition)) return

        // Otherwise, update the delta-index.

        // Determine the X and Y components of the distance the mouse moved.
        const dragChangeX = event.clientX - $reorderingInfoStore.dragStartPosition[0]
        const dragChangeY = event.clientY - $reorderingInfoStore.dragStartPosition[1]
        // The change in index is...
            deltaIndex = Math.floor(
                // ...the component of the drag parallel to the Relationship
                // Cohort's long axis...
                (
                    ($reorderingInfoStore.thingCohort as ThingCohort).rowOrColumn() === "row" ? dragChangeX :
                    dragChangeY
                )
                // ...divided by the distance between Relationship Leaves...
                / 
                (
                    (
                        ($reorderingInfoStore.graphWidgetStyle as GraphWidgetStyle).betweenThingSpacing
                        + ($reorderingInfoStore.graphWidgetStyle as GraphWidgetStyle).thingSize
                    )
                    * $tweenedScale
                )
                // ...plus 0.5. (This is to shift the "zones" for each possible
                // destination position left so that, instead of extending off to
                // the right of the position, they are centered on it.)
                + 0.5
            )
    }


    /**
     * Handle-body-mouse-up method.
     * 
     * Handles tasks that should be executed when the mouse is released over
     * the page body (including finishing and disabling the reordering
     * operation).
     * @param event - The Mouse event that triggers this method.
     */
    async function handleBodyMouseUp(event: MouseEvent) {
        if (event.button === 0) {
            // If the Relationship reordering operation actually calls for a
            // new index,
            const copiedReorderingInfo =
                (
                    $reorderingInfoStore.newIndex !== null
                    && $reorderingInfoStore.newIndex !== $reorderingInfoStore.startIndex
                ) ?
                    // Copy info in store before disabling the user interaction.
                    {...$reorderingInfoStore} as {
                        dragStartPosition: [number, number]
                        reorderInProgress: true

                        graphWidgetStyle: GraphWidgetStyle
                        thingCohort: ThingCohort
                        destThingId: number

                        startIndex: number
                        newIndex: number
                    } :
                    null

            // Disable the user interaction and set delta-index to null.
            disableReordering()
            deltaIndex = null

            
            if (copiedReorderingInfo !== null) {
                // Reorder the Relationship and Thing widgets accordingly. 
                const reorderedMembers = changeIndexInArray(
                    copiedReorderingInfo.thingCohort.members,
                    copiedReorderingInfo.startIndex as number,
                    copiedReorderingInfo.newIndex
                )
                if (reorderedMembers) {
                    (copiedReorderingInfo.thingCohort as ThingCohort).members = reorderedMembers
                }

                // Reorder the Relationships in the db accordingly.
                await reorderRelationship(
                    copiedReorderingInfo.thingCohort?.parentThingId as number,
                    copiedReorderingInfo.thingCohort?.address.directionId as number,
                    copiedReorderingInfo.destThingId as number,
                    copiedReorderingInfo.newIndex
                )

                // Construct an array of IDs for Things connected to these
                // Relationships (which will need to be refreshed client-side).
                const associatedThingIds =
                    [ copiedReorderingInfo.thingCohort.parentThingId ].concat(
                        copiedReorderingInfo.thingCohort.members.map(member => member.thingId)
                    ) as number[]

                // Refresh those Thing IDs in the ThingDBModel store.
                await storeGraphDbModels<ThingDbModel>("Thing", associatedThingIds, true)
            }
        }
    }

    
    // Once done with that, clean up the view and terminals and refactor all changed files (including Relationship Cohort and Thing Cohort widgets).




</script>


<svelte:body lang="ts"
    on:mousemove={handleBodyMouseMove}
    on:mouseup={handleBodyMouseUp}
/>