<script lang="ts">
    export let labelText: string
    export let boundValue: number
    export let minValue: number = 0
    export let maxValue: number = 10
    export let onChangeFunction: ()=>void = ()=>{}
</script>


<main class="setting-widget">
    {labelText}
    <div>
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
</main>


<style>
    main {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        text-align: left;
        font-size: 0.85rem;
    }

    div {
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