<script lang="ts">
    // Import related widgets.
    import { Tooltip } from "$lib/widgets/layoutWidgets"

    
    export let toggled = false
    export let tooltipText: string | null = null
</script>


<div class="toggle {toggled ? "toggled" : ""}" on:click={() => {toggled = !toggled}} on:keydown={()=>{}}>
    <div class="slider {toggled ? "toggled" : ""}" />

    {#if tooltipText}
        <Tooltip
            text={tooltipText}
            direction={"down"}
            lean={"left"}
        />
    {/if}
</div>

  
<style>
    .toggle {
        border-radius: 10px;

        box-sizing: border-box;
        position: relative;
        width: 24px;
        height: 16px;
        background-color: lightgrey;

        padding: 2px;

        cursor: pointer;
    }

    .toggle.toggled {
        background-color: darkgrey;
    }

    .slider {
        border-radius: 6px;

        width: 12px;
        height: 12px;
        background-color: whitesmoke;

        transition: 0.25s;
    }

    .slider.toggled {
        transform: translateX(8px);
    }
</style>