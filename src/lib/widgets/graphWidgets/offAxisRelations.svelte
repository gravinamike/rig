<script lang="ts">
    // Import types.
    import type { Graph, Space, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "./graph"

    // Import basic framework resources.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Import constants and stores.
    import { zoomBase } from "$lib/shared/constants"
    import { preventEditing } from "$lib/stores"

    // Import related widgets.
    import { GraphOutlineWidget, UnshownRelationsIndicator } from "$lib/widgets/graphWidgets"
    import { defaultGraphWidgetStyle } from "./graph"


    export let parentThing: Thing
    export let parentGraph: Graph
    export let parentGraphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    
    let graphWidgetStyle = {...defaultGraphWidgetStyle}
    graphWidgetStyle.excludePerspectiveThing = true
    graphWidgetStyle.excludeCartesianAxes = true
    graphWidgetStyle.excludeNonCartesianAxes = false
    graphWidgetStyle.excludeNonAxisThingCohorts = true
    
    
    // ID of the widget's parent Thing.
    $: parentThingId = parentThing.id as number

    // Information about related Things.
    $: numberOfOffAxisRelations = parentThing.offAxisRelatedThingIds((parentThing.space as Space)).length
    $: numberOfNonCartesianAxisRelations = parentThing.nonCartesianAxisRelatedThingIds((parentThing.space as Space)).length


    


    // Whether there are related Things in the non-Cartesian axes.
    const nonCartesianAxesContainThings = parentThing.childThingCohorts.filter(
        thingCohort => (
            [5, 6, 7, 8].includes(thingCohort.halfAxisId)
            && thingCohort.members.length
        )
    ).length !== 0


    /* Whole-widget-related attributes. */

    // Expanded/collapsed flag.
    let expanded = false

    // Start expanded if parent Thing is Generation 0 and has
    // non-Cartesian axis relations to display.
    if (parentThing.address?.generationId === 0 && nonCartesianAxesContainThings) {
        expanded = true
    }




    /* Off-axis toggle-related attributes. */

    // Off-axis toggle arrow geometry.
    const offAxisToggleSize = 25
    $: offAxisToggleDiagonal = Math.hypot(offAxisToggleSize, offAxisToggleSize)
    $: offAxisToggleDiagonalOverhang = (offAxisToggleDiagonal - offAxisToggleSize) / 2 + 4

    // Off-axis toggle state attributes.
    let offAxisToggleToggleHovered = false
    $: showOffAxisToggle = showOffAxisRelations
    $: offAxisToggleNoMouseEvents =
        (
            $preventEditing
            && !(numberOfNonCartesianAxisRelations + numberOfOffAxisRelations)
        )
        || (
            parentThing.address?.generationId === 0
            && nonCartesianAxesContainThings
        )

    // Scale-related attributes.
    $: scale = zoomBase ** parentGraphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)









    $: spaceToUse =
        parentGraph.startingSpace ? parentGraph.startingSpace :
        parentGraph.pThing?.space || null




    $: unshownRelationsCount = numberOfNonCartesianAxisRelations + numberOfOffAxisRelations

    $: symbolsToShowCount = 
        unshownRelationsCount < 10 ? unshownRelationsCount :
        unshownRelationsCount < 100 ? Math.floor(unshownRelationsCount / 10) :
        Math.floor(unshownRelationsCount / 100)

    















    let showIndicatorAsExpanded = false

    function onUnshownRelationsIndicatorClick() {

        console.log(graphWidgetStyle.excludeNonAxisThingCohorts)

        graphWidgetStyle.excludeNonAxisThingCohorts = !graphWidgetStyle.excludeNonAxisThingCohorts
        
        if (
            !(numberOfNonCartesianAxisRelations > 0)
            || (parentThing.address?.generationId ?? 0) > 0
        ) {
            expanded = !expanded
        }

        showIndicatorAsExpanded = !showIndicatorAsExpanded


        console.log(graphWidgetStyle.excludeNonAxisThingCohorts, numberOfOffAxisRelations)
    }




    // Whether there are any off-axis Relations that need showing.
    $: relationsNeedShowing = (
        (
            numberOfNonCartesianAxisRelations > 0
        )
        || (
            numberOfOffAxisRelations > 0
        )
    )

    // Whether to show the off-axis relations.
    $: showOffAxisRelations = relationsNeedShowing && expanded






</script>


<!-- Off-axis relations toggle. -->
<div
    class="off-axis-relations-toggle"
    class:expanded={relationsNeedShowing}
    class:no-mouse-events={offAxisToggleNoMouseEvents}

    style="width: {offAxisToggleSize}px; height: {offAxisToggleSize}px;"

    on:mouseenter={()=>{offAxisToggleToggleHovered = true}}
    on:mouseleave={()=>{offAxisToggleToggleHovered = false}}
>
    <!-- Visible toggle image. -->
    {#if showOffAxisToggle}
        <svg
            class="relationship-image"
            style="width: {offAxisToggleSize}px; height: {offAxisToggleSize}px;"
        >
            <line
                x1="{offAxisToggleSize / 2}" y1="{-offAxisToggleDiagonalOverhang}"
                x2="{offAxisToggleSize / 2}" y2="{offAxisToggleSize + offAxisToggleDiagonalOverhang - 6 / $tweenedScale}"
                style="stroke-width: {10 / $tweenedScale};"
            />
            <polygon
                points="
                    {offAxisToggleSize / 2 - 5 / $tweenedScale}, {offAxisToggleSize + offAxisToggleDiagonalOverhang - 8 / $tweenedScale}
                    {offAxisToggleSize / 2 + 5 / $tweenedScale}, {offAxisToggleSize + offAxisToggleDiagonalOverhang - 8 / $tweenedScale}
                    {offAxisToggleSize / 2}, {offAxisToggleSize + offAxisToggleDiagonalOverhang}
                "
                style="stroke-width: {3 / $tweenedScale};"
            />
        </svg>
    {/if}

    <!-- Number-of-off-axis-relations indicator. -->
    <UnshownRelationsIndicator
        directionId={"all"}
        halfAxisId={null}
        offAxis={true}
        {unshownRelationsCount}
        {symbolsToShowCount}
        {graphWidgetStyle}
        isExpanded={showIndicatorAsExpanded}
        onClick={onUnshownRelationsIndicatorClick}
    />
</div>


<!-- Off-axis-relations display. -->
{#if showOffAxisRelations}
    <div class="off-axis-relations-widget-and-unshown-indicator">
        <div
            class="off-axis-relations-widget"
            on:wheel|stopPropagation
        >
            <!-- Graph outline widget. -->
            {#if spaceToUse}
                <GraphOutlineWidget
                    space={spaceToUse}
                    pThingIds={[parentThingId]}
                    depth={parentGraph.depth}
                    fullSize={false}
                    offAxis={true}
                    {graphWidgetStyle}
                    {rePerspectToThingId}
                />
            {/if}
        </div>
    </div>
{/if}


<style>
    .off-axis-relations-toggle {
        position: absolute;
        left: 100%;
        top: 100%;

        font-size: 1.25rem;

        pointer-events: none;
    }

    .off-axis-relations-toggle:not(.no-mouse-events) {
        pointer-events: auto;
        cursor: pointer;
    }

    .relationship-image {
        position: absolute;
        z-index: -1;
        transform: rotate(-45deg);
        
        stroke: dimgrey;
        fill: dimgrey;
        opacity: 0.5;

        overflow: visible;
    }

    .off-axis-relations-widget-and-unshown-indicator {
        position: absolute;
        left: calc(100% + 25px);
        top: calc(100% + 25px);
        z-index: 1;

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .off-axis-relations-widget {
        width: 300px;
        max-height: 300px;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
        
        pointer-events: auto;
        cursor: default;
    }
</style>