<script lang="ts">
    // Import utility functions.
    import { onMobile } from "$lib/shared/utility"

    // Import related widgets.
    import { Tooltip } from "$lib/widgets/layoutWidgets"


    export let labelText: string
    export let boundValue: number | boolean
    export let minValue: number = 0
    export let maxValue: number = 10
    export let tooltipText: string | null = null
    export let onChangeFunction: () => void = () => {}
</script>


<div 
    class="setting-widget"
    class:on-mobile={onMobile()}

    style="flex-direction: {typeof boundValue === "boolean" ? "row" : "column"};"
>
    {labelText}

    {#if tooltipText}
        <Tooltip
            text={tooltipText}
            direction={"down"}
        />
    {/if}

    {#if typeof boundValue === "boolean"}

        <input
            type=checkbox
            bind:checked={boundValue}
            on:change={onChangeFunction}
        >

    {:else}

        <div class="inputs">
            <input class="number-input"
                type=number
                bind:value={boundValue}
                min={minValue}
                max={maxValue}
                on:change={onChangeFunction}
            >

            <input class="range-input"
                type=range
                bind:value={boundValue}
                min={minValue}
                max={maxValue}
                on:change={onChangeFunction}
            >
        </div>

    {/if}
</div>


<style>
    .setting-widget {
        position: relative;
        
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;

        text-align: left;
        font-size: 0.85rem;
    }

    .setting-widget.on-mobile {
        gap: 0.25rem;

        font-size: 0.7rem;
    }

    .inputs {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }

    input {
        z-index: 1;
    }

    .setting-widget.on-mobile input {
        font-size: 0.7rem;
    }

    .number-input {
        width: 33%;
    }

    .range-input {
        width: 66%;
    }
</style>