<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { Direction } from "$lib/models/constructModels"

    // Import SvelteKit framework resources.
    import { onMount } from "svelte"

    // Import constants and stores.
    import { directionWidgetCircularDiameter, relationshipColorByHalfAxisId } from "$lib/shared/constants"
    import { directionSelectionInfoStore, openDirectionSelectionDropdownMenu, readOnlyMode } from "$lib/stores"

    // Import related UI elements.
    import { TextFittingDiv } from "$lib/widgets/layoutWidgets"

    /**
     * @param  {Direction | null} startingDirection - The Direction this widget starts off representing.
     * @param  {HalfAxisId | null} halfAxisId - The Half-Axis that the Direction is being displayed on.
     * @param  {Graph} Graph - The Graph that the widget is part of.
     * @param  {boolean} askingForDirection - Whether or not the widget requires the user to select a Direction.
     * @param  {(direction: Direction | null, optionId: number, option: Direction) => void} optionClickedFunction - The function to execute when a Direction option is clicked.
     */
    export let startingDirection: Direction | null
    export let halfAxisId: HalfAxisId | null
    export let graphWidgetStyle: GraphWidgetStyle
    export let askingForDirection = false
    export let height = 26
    export let fontSize: number | null = null
    export let circularOrRectangular: "circular" | "rectangular" = "circular"
    export let partOpaque = false
    export let forceFullyOpaque = false
    export let interactionDisabled = false
    export let optionClickedFunction: (direction: Direction | null, optionId: number, option: Direction) => void = (_: Direction | null, __: number, ___: Direction) => {}
    export let optionHoveredFunction: (optionId: number, option: Direction) => void = () => {}
    export let exitOptionHoveredFunction: () => void = () => {}

    
    $: direction = startingDirection
    let directionWidget: Element


    $: directionDropdownOpen = $directionSelectionInfoStore.directionWidget === directionWidget

    $: fullyOpaque = forceFullyOpaque || directionDropdownOpen

    
    $: dropdownWillOverflowWindow =
        mounted && directionWidget?.getBoundingClientRect().bottom + 250 > window.innerHeight ? true :
        false
    
    $: squareBottomCorners =
        circularOrRectangular === "rectangular"
        && $directionSelectionInfoStore.directionWidget === directionWidget
        && !dropdownWillOverflowWindow


    $: squareTopCorners =
        circularOrRectangular === "rectangular"
        && $directionSelectionInfoStore.directionWidget === directionWidget
        && dropdownWillOverflowWindow
        





    // Formatting-related information.
    const relationshipColor = halfAxisId ? relationshipColorByHalfAxisId[halfAxisId] : "grey"




    let mounted = false
    onMount(async () => {
        mounted = true
    })
</script>


<!-- Direction Widget. -->
<div
    class="direction-widget"
    class:rectangular={circularOrRectangular === "rectangular"}
    class:dropdown-open={directionDropdownOpen}
    class:part-opaque={partOpaque}
    class:fully-opaque={fullyOpaque}
    class:square-bottom-corners={squareBottomCorners}
    class:square-top-corners={squareTopCorners}
    class:interaction-disabled={$readOnlyMode || interactionDisabled}
    
    bind:this={directionWidget}

    style="
        width: {circularOrRectangular === "circular" ? `${directionWidgetCircularDiameter}px`: "100%"};
        height: {circularOrRectangular === "circular" ? `${directionWidgetCircularDiameter}px`: `${height}px`};
    "
>
    <!-- Colored backfield. -->
    <div
        class="direction-widget-backfield"
    />

    <!-- Direction text. -->
    <div
        class="direction-widget-text-container"

        style="
            font-size: {fontSize ? fontSize : graphWidgetStyle.relationshipTextSize}px;
            {direction ? "" : "font-style: italic;"}
            color: {relationshipColor};
        "

        on:click={() => {
            openDirectionSelectionDropdownMenu(
                directionWidget,
                direction,
                askingForDirection,
                optionClickedFunction,
                optionHoveredFunction,
                exitOptionHoveredFunction
            )
        }}
        on:keypress={()=>{}}
    >
        <TextFittingDiv
            text={direction ? direction.text || "" : "Choose Direction..."}
            defaultFontSize={fontSize ? fontSize : graphWidgetStyle.relationshipTextSize}
        />
    </div>
</div>


<style>
    .direction-widget {
        box-sizing: border-box;
        position: relative;

        padding: 0.25rem;

        pointer-events: none;
    }

    .direction-widget:not(.interaction-disabled) {
        pointer-events: auto;
        cursor: pointer;
    }

    .direction-widget-backfield {
        border-radius: 50%;
        box-sizing: border-box;

        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: white;
        opacity: 0.25;
    }

    .direction-widget:active .direction-widget-backfield {
        background-color: whitesmoke;
    }

    .direction-widget:not(.rectangular):hover .direction-widget-backfield {
        box-shadow: 1px 1px 2px 1px grey;
        
        opacity: 100%;
    }

    .direction-widget:not(.rectangular).dropdown-open .direction-widget-backfield {
        box-shadow: 1px 1px 2px 1px grey;
        
        opacity: 100%;
    }

    .direction-widget.part-opaque .direction-widget-backfield {
        opacity: 0.75;
    }

    .direction-widget.fully-opaque .direction-widget-backfield {
        opacity: 100%;
    }


    .direction-widget.rectangular .direction-widget-backfield {
        border-radius: 7px;
        border: solid 1px lightgrey;
    }

    .direction-widget.square-bottom-corners .direction-widget-backfield {
        border-radius: 7px 7px 0 0;
    }

    .direction-widget.square-top-corners .direction-widget-backfield {
        border-radius: 0 0 7px 7px;
    }

    .direction-widget-text-container {
        position: relative;
        left: 5%;
        top: 5%;
        width: 90%;
        height: 90%;
        opacity: 0.33;
    }

    .direction-widget:not(.rectangular):hover .direction-widget-text-container {        
        opacity: 100%;
    }

    .direction-widget:not(.rectangular).dropdown-open .direction-widget-text-container {        
        opacity: 100%;
    }

    .direction-widget.part-opaque .direction-widget-text-container {
        opacity: 0.75;
    }

    .direction-widget.fully-opaque .direction-widget-text-container {
        opacity: 100%;
    }
</style>