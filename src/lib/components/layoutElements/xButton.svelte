<script lang="ts">
    export let buttonFunction: () => void
</script>


<div
    class="x-button"
    on:click|stopPropagation={buttonFunction}
>

    <svg>
        <line x1=5 y1=5 x2=11 y2=11 />
        <line x1=11 y1=5 x2=5 y2=11 />
    </svg>

</div>


<style>
    .x-button {
        border-radius: 8px;
        outline: solid 1px lightgrey;
        outline-offset: -1px;
        
        position: absolute;
        top: 1px;
        right: 1px;
        height: 16px;
        width: 16px;
        
        cursor: pointer;
    }

    .x-button:hover {
        background-color: whitesmoke;
    }

    .x-button:active {
        background-color: gainsboro;
    }

    svg {
        height: 16px;
        width: 16px;

        stroke-width: 1; 
        stroke: lightgrey;
        fill: lightgrey;
    }
</style>