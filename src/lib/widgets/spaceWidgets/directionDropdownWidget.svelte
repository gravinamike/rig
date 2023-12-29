<!-- svelte-ignore a11y-click-events-have-key-events -->

<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { Direction } from "$lib/models/constructModels"

    // Import constants and stores.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"
    import { directionDbModelsStore, getGraphConstructs, readOnlyMode } from "$lib/stores"

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
    export let optionClickedFunction: (direction: Direction | null, optionId: number, option: Direction) => void = (_: Direction | null, __: number, ___: Direction) => {/* Placeholder. */}
    export let optionHoveredFunction: (optionId: number, option: Direction) => void = () => {}
    export let exitOptionHoveredFunction: () => void = () => {}

    
    let direction = startingDirection
    let directionWidget: Element

    // Formatting-related information.
    const relationshipColor = halfAxisId ? relationshipColorByHalfAxisId[halfAxisId] : "grey"

    // State-related information.
    let showOptions = askingForDirection ? true : false

    function handlePossibleOutsideClick(event: MouseEvent | TouchEvent) {
		if (event.target !== directionWidget && !directionWidget.contains(event.target as Node)) {
			if (!askingForDirection) showOptions = false
		}
	}
</script>


<!-- When clicking outside the widget, unless the user is being prompted to choose a Direction, close the drop-down menu. -->
<svelte:body
    on:mouseup={handlePossibleOutsideClick}
    on:touchend={handlePossibleOutsideClick}
/>


<!-- Direction Widget. -->
<div
    class="direction-widget {showOptions ? "options-open" : ""}"
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

        on:click={() => { showOptions = !showOptions }}
        on:keypress={()=>{}}
    >
        <TextFittingDiv
            text={direction ? direction.text || "" : "Choose Direction..."}
            defaultFontSize={fontSize ? fontSize : graphWidgetStyle.relationshipTextSize}
        />
    </div>
    
    <!-- Drop-down menu to select Direction. -->
    {#if showOptions}
        <div
            class="direction-widget-options"
            on:mouseleave={() => {
                if (showOptions) exitOptionHoveredFunction()
            }}
            on:wheel|stopPropagation={()=>{}}
            on:touchmove|stopPropagation
        >
            {#each Object.entries($directionDbModelsStore) as [optionId, option]}
                <div
                    class="option"
                    on:click|stopPropagation={() => {
                        direction = getGraphConstructs("Direction", Number(option.id))
                        showOptions = false
                        if (direction) optionClickedFunction(direction, Number(optionId), direction)
                    }}
                    on:mouseenter={() => {
                        direction = getGraphConstructs("Direction", Number(option.id))
                        if (direction) optionHoveredFunction(Number(optionId), direction)
                    }}
                    on:keypress={()=>{}}
                    on:touchmove|stopPropagation
                >
                    {option.text}
                </div>
            {/each}
        </div>
    {/if}
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

    .direction-widget.options-open {
        border-radius: 8px 8px 0 0;
        outline: solid 1px black;
        outline-offset: -1px;
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

    .direction-widget-text-container {
        position: relative;
        left: 5%;
        top: 5%;
        width: 90%;
        height: 90%;
    }

    .direction-widget-options {
        outline: solid 1px black;
        outline-offset: -1px;

        position: absolute;
        box-sizing: border-box;
        left: 0%;
        top: 100% - 1px;
        z-index: 2;
        min-width: 100%;
        max-height: 100px;
        background-color: white;

        overflow-x: hidden;
        overflow-y: scroll;
        scrollbar-width: thin;
    }

    .option {
        padding: 0.25rem;

        white-space: nowrap;

        cursor: default;
    }

    .option:hover {
        background-color: whitesmoke;
    }

    .option:active {
        background-color: lightgrey;
    }
</style>