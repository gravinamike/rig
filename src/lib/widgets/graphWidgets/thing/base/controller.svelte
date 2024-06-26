<script lang="ts">
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets" 

    /**
     * Create a Thing Base Widget Model.
     * @param {number | null} thingId - The ID of the Thing the widget is based on
     * @param {GraphWidgetModel} graphWidgetModel - The model of the Graph that the widget is in.
     */
    export let thing: Thing | null = null
    export let graphWidgetStyle: GraphWidgetStyle

    export let encapsulatingDepth: number
    export let thingSize: number = 0
    export let thingWidth: number = 0
    export let thingHeight: number = 0
    export let xYElongation: {x: number, y: number} = {x: 1, y: 1}
    export let cohortSize: number = 0

    export let halfAxisId: HalfAxisId | null = null
    export let elongationCategory: "vertical" | "horizontal" | "neutral" = "neutral"
    export let encapsulatingPadding: number = 0

    
    /* --------------- Output attributes. --------------- */

    /**
     * Encapsulating depth.
     * 
     * The number of layers of encapsulation of the Thing. For example, if the
     * Thing is encapsulated by its parent Thing, and that parent Thing is
     * encapsulated by its parent Thing (which is not encapulated again), then
     * the encapsulation depth is 2.
     * 
     * Encapsulation depth is taken from the same attribute on the Thing's
     * parent Thing Cohort (or is 0 by default).
     */
    $: encapsulatingDepth = thing?.parentThingCohort?.encapsulatingDepth || 0

    /**
     * Thing size.
     * 
     * The base size of the Thing is the default Thing size for the Graph, plus
     * the by-encapsulation-depth padding times the encapsulation depth.
     */
    $: thingSize = (
        graphWidgetStyle.thingSize
        + encapsulatingPadding * encapsulatingDepth
    )

    /**
     * Thing width.
     * 
     * The width of the base Thing size times the X component of the
     * elongation factor.
     */
    $: thingWidth = thingSize * xYElongation.x

    /**
     * Thing height.
     * 
     * For non-negative encapsulation depths, this is the base Thing size times
     * the Y component of the elongation factor. For negative encapsulation
     * depths, that is used as the starting point, which is then divided by the
     * number of Things in the Cohort, and then a small padding is subtracted.
     */
    $: thingHeight =
        encapsulatingDepth >= 0 ? thingSize * xYElongation.y :
        thingSize * xYElongation.y / cohortSize - 2

    /**
     * X and Y elongation.
     * 
     * This object provides elongation factors for the X and Y axes, based on
     * whether the elongation category is vertical, horizontal, or neutral.
     */
    $: xYElongation = 
        // If elongation category is vertical, elongate along the Y axis.
        elongationCategory === "vertical" ? {x: 1, y: elongation} :
        // If elongation category is horizontal, elongate along the X axis.
        elongationCategory === "horizontal" ? {x: elongation, y: 1} :
        // If elongation category is neutral, elongate along both the X and Y axes.
        {x: elongation, y: elongation}

    /**
     * Thing Cohort Size.
     * 
     * The number of Things in the Thing Cohort containing this Thing. Defaults
     * to 1 if there is no Thing specified, since "empty" Thing Cohort Widgets
     * are still formatted as if they take up space.
     */
    $: cohortSize = thing?.parentThingCohort?.members.length || 1

    /**
     * Thing.
     * 
     * If a Thing ID is specified, the Thing is retrieved from the store.
     * Otherwise, the default is null.
     */
    //$: thing = typeof thingId === "number" ? getGraphConstructs<Thing>("Thing", thingId) : null

    /**
     * Half-axis ID.
     * 
     * This is taken from the Thing's parent Thing Cohort, with 0 as default if
     * no Thing ID is specified.
     */
    $: halfAxisId = thing?.parentThingCohort?.halfAxisId || (0 as HalfAxisId)

    /**
     * Elongation category.
     * 
     * Thing Widgets on the vertical axis are enlongated vertically, while Thing
     * Widgets on the horizontal axis are enlongated horizontally. Thing Widgets
     * on other axes are "neutral", meaning enlongated both ways.
     */
    $: elongationCategory =
        halfAxisId && [1, 2].includes(halfAxisId) ? "vertical" :
        halfAxisId && [3, 4].includes(halfAxisId) ? "horizontal" :
        "neutral"

    /**
     * Encapsulation padding.
     * 
     * The amount of space to place between encapsulation levels. For outward
     * encapsulation levels, the padding is 40 pixels. For inward encapsulation
     * levels, it is 20 pixels.
     */
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20


    /* --------------- Supporting attributes. --------------- */

    /**
     * Elongation.
     * 
     * The axial elongation factor of the Thing Widget, taken from the parent
     * Thing Cohort if the Thing ID is specified. Otherwise, the default is 1
     * (no elongation).
     */
    $: elongation = thing?.parentThingCohort?.axialElongation || 1
</script>