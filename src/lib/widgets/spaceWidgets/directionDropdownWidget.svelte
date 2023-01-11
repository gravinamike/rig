<!-- svelte-ignore a11y-click-events-have-key-events -->

<script lang="ts">
    // Type imports.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { Direction } from "$lib/models/constructModels"

    // Constants and stores imports.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"
    import { directionDbModelsStore, getGraphConstructs, readOnlyMode } from "$lib/stores"

    /**
     * @param  {Direction | null} direction - The Direction currently being represented by this widget.
     * @param  {HalfAxisId | null} halfAxisId - The Half-Axis that the Direction is being displayed on.
     * @param  {Graph} Graph - The Graph that the widget is part of.
     * @param  {boolean} askingForDirection - Whether or not the widget requires the user to select a Direction.
     * @param  {(direction: Direction | null, optionId: number, option: Direction) => void} optionClickedFunction - The function to execute when a Direction option is clicked.
     */
    export let direction: Direction | null
    export let halfAxisId: HalfAxisId | null
    export let graphWidgetStyle: GraphWidgetStyle
    export let askingForDirection = false
    export let fontSize: number | null = null
    export let optionClickedFunction: (direction: Direction | null, optionId: number, option: Direction) => void = (_: Direction | null, __: number, option: Direction) => {console.log(option.text)}
    export let optionHoveredFunction: (optionId: number, option: Direction) => void = () => {}
    export let exitOptionHoveredFunction: () => void = () => {}


    let directionWidget: Element

    // Formatting-related information.
    const relationshipColor = halfAxisId ? relationshipColorByHalfAxisId[halfAxisId] : "grey"

    // State-related information.
    let showOptions = askingForDirection ? true : false

    function handlePossibleOutsideClick(event: MouseEvent) {
		if (event.target !== directionWidget && !directionWidget.contains(event.target as Node)) {
			if (!askingForDirection) showOptions = false
		}
	}
</script>


<!-- When clicking outside the widget, unless the user is being prompted to choose a Direction, close the drop-down menu. -->
<svelte:body
    on:mouseup={handlePossibleOutsideClick}
/>


<!-- Direction Widget. -->
<div
    class="direction-widget {showOptions ? "options-open" : ""}"
    class:read-only-mode={$readOnlyMode}
    bind:this={directionWidget}
>
    <!-- Direction text. -->
    <div
        style="
            font-size: {fontSize ? fontSize : graphWidgetStyle.relationshipTextSize}px;
            {direction ? "" : "font-style: italic;"}
            color: {relationshipColor};
        "
        on:click={() => { showOptions = !showOptions }}
        on:keypress={()=>{}}
    >
        {direction ? direction.text : "Choose Direction..."}
    </div>
    
    <!-- Drop-down menu to select Direction. -->
    {#if showOptions}
        <div
            class="direction-widget-options"
            on:mouseleave={() => {
                if (showOptions) exitOptionHoveredFunction()
            }}
            on:wheel|stopPropagation={()=>{}}
        >
            {#each Object.entries($directionDbModelsStore) as [optionId, option]}
                <div
                    class="option"
                    on:click={() => {
                        direction = getGraphConstructs("Direction", Number(option.id))
                        showOptions = false
                        if (direction) optionClickedFunction(direction, Number(optionId), direction)
                    }}
                    on:mouseenter={() => {
                        direction = getGraphConstructs("Direction", Number(option.id))
                        if (direction) optionHoveredFunction(Number(optionId), direction)
                    }}
                    on:keypress={()=>{}}
                >
                    {option.text}
                </div>
            {/each}
        </div>
    {/if}
</div>


<style>
    .direction-widget {
        border-radius: 8px;

        box-sizing: border-box;
        position: relative;
        background-color: white;

        padding: 0.25rem;

        pointer-events: none;
    }

    .direction-widget:not(.read-only-mode) {
        pointer-events: auto;
        cursor: pointer;
    }

    .direction-widget.options-open {
        border-radius: 8px 8px 0 0;
        outline: solid 1px black;
        outline-offset: -1px;
    }

    .direction-widget-options {
        outline: solid 1px black;
        outline-offset: -1px;

        position: absolute;
        box-sizing: border-box;
        left: 0%;
        top: 100% - 1px;
        z-index: 1;
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