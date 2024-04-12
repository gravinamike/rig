<script lang="ts">
    // Import related widgets.
    import { Tooltip } from "$lib/widgets/layoutWidgets"


    export let depth: number
</script>


<div 
    class="depth-control"
>
    <div class="indicator-container">
        <img
            src="./icons/depth.png"
            alt="Depth indicator"
        >

        <div class="depth-number">
            <div class="depth-number-backfield" />
            <span>{depth}</span>
        </div>

        <Tooltip
            text="Adjust the depth of this Graph."
            direction={"up"}
        />
    </div>

    <input class="number-input"
        type=number
        min=0
        max=3

        bind:value={depth}
    >
</div>


<style>
    .depth-control {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 1px;
    }

    .indicator-container {
        position: relative;

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center; 
    }

    img {
        width: 22px;
        height: 22px;
        opacity: 75%;
    }

    .depth-number {
        position: absolute;
        right: 0px;
        top: 0;
        width: 11px;
        height: 12px;

        text-align: center;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .depth-number-backfield {
        width: 100%;
        height: 100%;
        background-color: white;
        opacity: 66%;
    }

    .depth-number span {
        position: absolute;
        left: 2px;
        top: -2px;
    }

    input {
        outline:none;
        border: none;

        width: 12px;
        background-color: transparent;
        
        cursor: pointer;
    }
</style>