<script lang="ts">

    import { closeDirectionSelectionDropdownMenu, directionDbModelsStore, directionSelectionInfoStore, getGraphConstructs } from "$lib/stores"
    import { onMount } from "svelte"




    

    





    $: direction = $directionSelectionInfoStore.startingDirection
    $: directionWidget = $directionSelectionInfoStore.directionWidget
    $: optionClickedFunction = $directionSelectionInfoStore.optionClickedFunction
    $: optionHoveredFunction = $directionSelectionInfoStore.optionHoveredFunction
    $: exitOptionHoveredFunction = $directionSelectionInfoStore.exitOptionHoveredFunction



    function handlePossibleOutsideClick(event: MouseEvent | TouchEvent) {
		if (event.target !== dropdown && !dropdown?.contains(event.target as Node)) {
			if (!$directionSelectionInfoStore.askingForDirection) {
                closeDirectionSelectionDropdownMenu()
            }
		}
	}




    let dropdown: Element
    let dropdownWidth = 1
    let dropdownHeight = 1



    $: dropdownCornerPosition =
        directionWidget === null ? {x: 0, y: 0} :
        {
            x: directionWidget.getBoundingClientRect().right - 12,
            y: directionWidget.getBoundingClientRect().bottom - 12
        }


    $: overflowsScreenToRight =
        mounted ? dropdownCornerPosition.x + dropdownWidth > window.innerWidth :
        false
    $: overflowsScreenToBottom =
        mounted ? dropdownCornerPosition.y + dropdownHeight > window.innerHeight :
        false


    $: dropdownPosition = {
        x: overflowsScreenToRight ? dropdownCornerPosition.x - dropdownWidth - 68 : dropdownCornerPosition.x,
        y: overflowsScreenToBottom ? dropdownCornerPosition.y - dropdownHeight - 60 : dropdownCornerPosition.y,
    }


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
    <div
        class="direction-widget-options"

        bind:this={dropdown}
        bind:clientWidth={dropdownWidth}
        bind:clientHeight={dropdownHeight}

        style="left: {dropdownPosition.x}px; top: {dropdownPosition.y}px;"

        on:mouseleave={() => {
            if ($directionSelectionInfoStore.show) exitOptionHoveredFunction()
        }}
        on:wheel|stopPropagation={()=>{}}
        on:touchmove|stopPropagation
    >
        {#each Object.entries($directionDbModelsStore) as [optionId, option]}
            <div
                class="option"
                on:click|stopPropagation={() => {
                    direction = getGraphConstructs("Direction", Number(option.id))
                    if (direction) optionClickedFunction(direction, Number(optionId), direction)
                    closeDirectionSelectionDropdownMenu()
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
















<style>
    .direction-widget-options {
        border-radius: 3px;
        border: solid 1px lightgrey;
		box-shadow: 4px 4px 4px -2px lightgray;

        position: absolute;
        box-sizing: border-box;
        left: 0%;
        top: 100% - 1px;
        z-index: 2;
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