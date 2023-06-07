<script lang="ts">
    export let buttonFunction: () => void
    export let size = 16
    export let caution = false
    export let trashIcon = false
</script>


<div
    class="x-button"
    class:trash-icon={trashIcon}
    on:click|stopPropagation={buttonFunction}
    on:keydown={()=>{}}
>
    <svg
        class="x-button {caution ? "caution" : ""}"
        style="width: {size}px; height: {size}px; stroke-width: {size * 0.1};"
    >
        <circle cx={size * 0.5} cy={size * 0.5} r={size * 0.45} />
        {#if !trashIcon}
            <line x1={size * 0.3} y1={size * 0.3} x2={size * 0.7} y2={size * 0.7} />
            <line x1={size * 0.7} y1={size * 0.3} x2={size * 0.3} y2={size * 0.7} />
        {/if}
    </svg>

    {#if trashIcon}
        <img
            src="./icons/trash.png"
            alt="Delete"
            width={0.95 * size}px
            height={0.95 * size}px
        >
    {/if}
</div>


<style>
    .x-button {
        position: relative;
    }

    svg {
        stroke: grey;
        fill: white;

        cursor: pointer;
    }

    .x-button.trash-icon svg {
        stroke: whitesmoke;
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

    .x-button.trash-icon svg.caution {
        fill: orange;
    }

    svg.caution:hover {
        fill: orangered;
    }

    .x-button.trash-icon svg.caution:hover {
        fill: orangered;
    }

    svg.caution:active {
        fill: crimson;
    }

    .x-button.trash-icon svg.caution:active {
        fill: crimson;
    }

    circle {
        stroke-width: 1;
    }

    .x-button.trash-icon circle {
        stroke-width: 0.5;
    }

    img {
        position: absolute;
        top: 2%;
        left: 4%;
        opacity: 75%;

        pointer-events: none;
    }   
</style>