<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { Direction } from "$lib/models/constructModels"

    // Import constants and stores.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"
    import { directionDbModelsStore, directionSelectionInfoStore, getGraphConstructs, openDirectionSelectionDropdownMenu, readOnlyMode } from "$lib/stores"

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
    export let fontSize: number | null = null
    export let interactionDisabled = false
    export let optionClickedFunction: (direction: Direction | null, optionId: number, option: Direction) => void = (_: Direction | null, __: number, ___: Direction) => {}
    export let optionHoveredFunction: (optionId: number, option: Direction) => void = () => {}
    export let exitOptionHoveredFunction: () => void = () => {}

    
    let direction = startingDirection
    let directionWidget: Element



    $: fullyOpaque = $directionSelectionInfoStore.directionWidget === directionWidget

    // Formatting-related information.
    const relationshipColor = halfAxisId ? relationshipColorByHalfAxisId[halfAxisId] : "grey"
</script>


<!-- Direction Widget. -->
<div
    class="direction-widget"
    class:fully-opaque={fullyOpaque}
    class:interaction-disabled={$readOnlyMode || interactionDisabled}
    
    bind:this={directionWidget}
>
    <!-- Colored backfield. -->
    <div class="direction-widget-backfield" />

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
        width: 60px;
        height: 60px;

        padding: 0.25rem;

        pointer-events: none;
    }

    .direction-widget:not(.interaction-disabled) {
        pointer-events: auto;
        cursor: pointer;
    }

    .direction-widget-backfield {
        border-radius: 50%;

        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: white;
        opacity: 0.66;
    }

    .direction-widget:hover .direction-widget-backfield {
        opacity: 100%;
    }

    .direction-widget.fully-opaque .direction-widget-backfield {
        opacity: 100%;
    }

    .direction-widget-text-container {
        position: relative;
        left: 5%;
        top: 5%;
        width: 90%;
        height: 90%;
    }
</style>