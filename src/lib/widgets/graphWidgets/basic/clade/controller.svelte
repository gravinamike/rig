<script lang="ts">
    // Import types.
    import type { Thing, ThingCohort, Note } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    /**
     * @param {Thing} rootThing - The Thing that forms the root of the Clade.
     * @param {GraphWidgetStyle} graphWidgetStyle - Controls the style of the Graph widget.
     * @param {string} overlapMarginStyleText - The CSS text to handle the overlap between the widgets.
     */
    export let rootThing: Thing
    export let graphWidgetStyle: GraphWidgetStyle
    
    export let overlapMarginStyleText: string


    /* --------------- Output attributes. --------------- */

    /**
     * Overlap-margin style text.
     * 
     * When Things are styled to overlap, the effect is accomplished through CSS
     * margins. This attribute provides the CSS text to style the Thing based
     * on its position in the Thing Cohort and whether the Thing Cohort is
     * arranged in a row or column.
     */
     $: overlapMarginStyleText =
        // If there is only 1 Thing in the Thing Cohort, use an empty string (no formatting).
        rootThing.parentCohort.members.length === 1 ? "" :
        // Else, if the Thing is the first in the Thing Cohort, use only a right or bottom overlap margin.
        rootThing.address.indexInCohort === 0 ? (
            rowOrColumn === "row" ? `margin-right: ${overlapMargin}px;` :
            `margin-bottom: ${overlapMargin}px;`
        ) :
        // Else, if the Thing is the last in the Thing Cohort, use only a left or top overlap margin.
        rootThing.address.indexInCohort === rootThing.parentCohort.members.length - 1 ? (
            rowOrColumn === "row" ? `margin-left: ${overlapMargin}px;` :
            `margin-top: ${overlapMargin}px;`
        // Else, use overlap margins on both sides (left/right or top/bottom).
        ) : (
            rowOrColumn === "row" ? `margin-left: ${overlapMargin}px; margin-right: ${overlapMargin}px;` :
            `margin-top: ${overlapMargin}px; margin-bottom: ${overlapMargin}px;`
        )

    
    /* --------------- Supporting attributes. --------------- */

    /**
     * Row-or-column attribute.
     * 
     * Indicates whether the root Thing's Thing Cohort is arranged as a row or a
     * column.
     */
    $: rowOrColumn = rootThing.parentCohort.rowOrColumn()
    
    /**
     * Overlap margin.
     * 
     * Provides the number of pixels by which the root Thing should overlap its
     * neighbors in the Thing Cohort.
     */
    $: overlapMargin = graphWidgetStyle.betweenThingOverlap / 2
</script>