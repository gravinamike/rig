<script lang="ts">
    // Import types.
    import type { DirectionDbModel } from "$lib/models/dbModels"

    // Import SvelteKit framework resources.
    import { onMount } from "svelte"

    // Import constants.
    import { directionWidgetCircularDiameter } from "$lib/shared/constants"

    // Import stores.
    import {
        directionDbModelsStore, getGraphConstructs, directionSelectionInfoStore, closeDirectionSelectionDropdownMenu
    } from "$lib/stores"

    
    
    // HTML element handles.
    let dropdown: Element
    let dropdownWidth = 1
    let dropdownHeight = 1


    // Local proxies for information in the Direction-selection info store.
    $: direction = $directionSelectionInfoStore.startingDirection
    $: directionWidget = $directionSelectionInfoStore.directionWidget
    $: optionClickedFunction = $directionSelectionInfoStore.optionClickedFunction
    $: optionHoveredFunction = $directionSelectionInfoStore.optionHoveredFunction
    $: exitOptionHoveredFunction = $directionSelectionInfoStore.exitOptionHoveredFunction


    // Whether the Direction widget that this dropdown is associated with is formatted as a circle
    // or a rectangle.
    $: circularOrRectangularDirectionWidget = (
        directionWidget?.classList.contains("rectangular") ? "rectangular" :
        "circular"
    ) as "circular" | "rectangular"

    // Inward offfset (both x and y) of the dropdown widget towards its Direction widget, if the
    // Direction widget is formatted as a circle.
    const dropdownOffsetForCircularDirectionWidget = directionWidgetCircularDiameter / 10

    // The position of the "origin" of the drop-down (usually the top-left corner, assuming it
    // wouldn't overflow the screen).
    $: dropdownOriginPosition =
        directionWidget === null ? {x: 0, y: 0} :
        circularOrRectangularDirectionWidget === "circular" ? {
            x: directionWidget.getBoundingClientRect().right - dropdownOffsetForCircularDirectionWidget,
            y: directionWidget.getBoundingClientRect().bottom - dropdownOffsetForCircularDirectionWidget
        } :
        {
            x: directionWidget.getBoundingClientRect().left,
            y: directionWidget.getBoundingClientRect().bottom - 1
        }

    // Whether the dropdown would overflow the screen if the top-left corner is set to the origin.
    $: overflowsScreenToRight =
        mounted ? dropdownOriginPosition.x + dropdownWidth > window.innerWidth :
        false
    $: overflowsScreenToBottom =
        mounted ? dropdownOriginPosition.y + dropdownHeight > window.innerHeight :
        false

    // The actual position of the top-left corner of the menu, after any possible correction for
    // screen overflow.
    $: dropdownPosition = {
        // The x-coordinate is...
        x:
            // ...(if the Direction widget is circular and the dropdown overflows the screen to the
            // right), the dropdown's origin x, minus the Direction widget's and dropdown's widths,
            // plus the inward offset for a circular Direction widget...
            circularOrRectangularDirectionWidget === "circular" && overflowsScreenToRight ?
                dropdownOriginPosition.x - directionWidgetCircularDiameter - dropdownWidth + dropdownOffsetForCircularDirectionWidget:
            // ...otherwise the dropdown's origin x.
            dropdownOriginPosition.x,
        // If the dropdown overflows the screen to the bottom,
        y: overflowsScreenToBottom ?
            (
                // If the Direction widget is circular, the y coordinate is the dropdown's origin
                // y, minus the Direction widget's and dropdown's heights, plus the inward offset
                // for a circular Direction widget...
                circularOrRectangularDirectionWidget === "circular" ?
                    dropdownOriginPosition.y - dropdownHeight - directionWidgetCircularDiameter + 2 * dropdownOffsetForCircularDirectionWidget :
                // ...otherwise the dropdown's origin y minus the Direction widget's and dropdown's
                // heights, plus 1 (so the borders of the Direction widget and dropdown "merge").
                dropdownOriginPosition.y - (directionWidget?.getBoundingClientRect().height || 0) - dropdownHeight + 1
                
            ) :
            // Otherwise the dropdown's y-coordinate is its origin y.
            dropdownOriginPosition.y
    }


    /**
     * On-option-hovered method.
     * 
     * When an option is hovered, calls the externally-supplied option-hovered function based on
     * that option's information.
     * @param optionId - The ID of the hovered dropdown option.
     * @param option - The DirectionDbModel associated with the hovered dropdown option.
     */
    function onOptionHovered(optionId: number, option: DirectionDbModel) {
        direction = getGraphConstructs("Direction", Number(option.id))
        if (direction) optionHoveredFunction(optionId, direction)
    }
    
    /**
     * On-option-clicked method.
     * 
     * When an option is clicked, calls the externally-supplied option-clicked function based on
     * that option's information.
     * @param optionId - The ID of the hovered dropdown option.
     * @param option - The DirectionDbModel associated with the hovered dropdown option.
     */
    function onOptionClicked(optionId: number, option: DirectionDbModel) {
        direction = getGraphConstructs("Direction", Number(option.id))
        if (direction) optionClickedFunction(direction, optionId, direction)
        closeDirectionSelectionDropdownMenu()
    }

    /**
     * Handle-possible-outside-click method.
     * 
     * If a click or touch happens outside the dropdown menu, closes the menu.
     * @param event - The mouse or touch interaction that caused this method to be called.
     */
    function handlePossibleOutsideClick(event: MouseEvent | TouchEvent) {
		if (event.target !== dropdown && !dropdown?.contains(event.target as Node)) {
            closeDirectionSelectionDropdownMenu()
		}
	}


    // Set up a flag to indicate whether the component is mounted yet.
    let mounted = false
    onMount(async () => {
        mounted = true
    })
</script>


<!-- When clicking outside the widget, unless the user is being prompted to choose a Direction, close the drop-down menu. -->
<svelte:body
    on:mouseup={handlePossibleOutsideClick}
    on:touchend={handlePossibleOutsideClick}
/>


{#if $directionSelectionInfoStore.show}
    <!-- Direction widget dropdown. -->
    <div
        class="direction-widget-dropdown"

        bind:this={dropdown}
        bind:clientWidth={dropdownWidth}
        bind:clientHeight={dropdownHeight}

        style="
            left: {dropdownPosition.x}px;
            top: {dropdownPosition.y}px;
            {
                circularOrRectangularDirectionWidget === "circular" ? "" :
                `width: ${directionWidget?.getBoundingClientRect().width || 0}px;`
            }
        "

        on:mouseleave={() => {
            if ($directionSelectionInfoStore.show) exitOptionHoveredFunction()
        }}
        on:wheel|stopPropagation={()=>{}}
        on:touchmove|stopPropagation
    >
        <!-- Direction widget dropdown options. -->
        {#each Object.entries($directionDbModelsStore) as [optionId, option]}
            <div
                class="option"
                on:mouseenter={() => onOptionHovered(Number(optionId), option)}
                on:click|stopPropagation={() => onOptionClicked(Number(optionId), option)}
                on:keypress={()=>{}}
                on:touchmove|stopPropagation
            >
                {option.text}
            </div>
        {/each}
    </div>
{/if}


<style>
    .direction-widget-dropdown {
        border-radius: 3px;
        border: solid 1px lightgrey;
		box-shadow: 4px 4px 4px -2px lightgray;

        position: absolute;
        box-sizing: border-box;
        left: 0%;
        top: 100% - 1px;
        z-index: 6;
        max-height: 250px;
        max-width: 250px;
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