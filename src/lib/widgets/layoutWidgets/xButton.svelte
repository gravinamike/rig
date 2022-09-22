<script lang="ts">
    export let buttonFunction: () => void
    export let size = 16
    export let caution = false
</script>


<svg
    class="x-button {caution ? "caution" : ""}"
    on:click|stopPropagation={buttonFunction}
    style="width: {size}px; height: {size}px; stroke-width: {size * 0.1};"
>
    <circle cx={size * 0.5} cy={size * 0.5} r={size * 0.45} />
    <line x1={size * 0.3} y1={size * 0.3} x2={size * 0.7} y2={size * 0.7} />
    <line x1={size * 0.7} y1={size * 0.3} x2={size * 0.3} y2={size * 0.7} />
</svg>


<style>
    svg {
        stroke: grey;
        fill: white;

        cursor: pointer;
    }

    svg:hover {
        fill: gainsboro;
    }

    svg:active {
        fill: lightgrey;
    }

    svg.caution {
        fill: orange;
    }

    svg.caution:hover {
        background-color: orangered;
    }

    svg.caution:active {
        background-color: crimson;
    }

    circle {
        stroke-width: 1;
    }
</style>