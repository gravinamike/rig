<script lang="ts">
    export let buttonFunction: () => void
    export let size = 16
    export let square = false
    export let caution = false
</script>


<div
    class="x-button {caution ? "caution" : ""}"
    style="border-radius: {square ? size/5 : size/2}px; width: {size}px; height: {size}px;"
    on:click|stopPropagation={buttonFunction}
>

    <svg
        style="width: {size}px; height: {size}px; stroke-width: {size * 0.1};"
    >
        <line x1={size * 0.3} y1={size * 0.3} x2={size * 0.7} y2={size * 0.7} />
        <line x1={size * 0.7} y1={size * 0.3} x2={size * 0.3} y2={size * 0.7} />
    </svg>

</div>


<style>
    .x-button {
        outline: solid 1px grey;
        outline-offset: -1px;
        
        cursor: pointer;
    }

    .x-button:hover {
        background-color: gainsboro;
    }

    .x-button:active {
        background-color: lightgrey;
    }

    .x-button.caution {
        background-color: orange;
    }

    .x-button.caution:hover {
        background-color: orangered;
    }

    .x-button.caution:active {
        background-color: crimson;
    }

    svg {
        stroke: grey;
    }
</style>