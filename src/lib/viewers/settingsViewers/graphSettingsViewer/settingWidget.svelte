<script lang="ts">
    export let labelText: string
    export let boundValue: number | boolean
    export let minValue: number = 0
    export let maxValue: number = 10
    export let onChangeFunction: () => void = () => {}
</script>


<div 
    class="setting-widget"

    style="flex-direction: {typeof boundValue === "boolean" ? "row" : "column"};"
>
    {labelText}

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
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;

        text-align: left;
        font-size: 0.85rem;
    }

    .inputs {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }

    .number-input {
        width: 33%;
    }

    .range-input {
        width: 66%;
    }
</style>