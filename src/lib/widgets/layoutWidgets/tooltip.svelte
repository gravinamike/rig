<script lang="ts">
    import { onMobile, sleep } from "$lib/shared/utility"


    export let text: string
    export let direction: "left" | "right" | "up" | "down" = "down"
    export let lean: "left" | "right" | "up" | "down" | null = null
    export let offset = 12
    export let delay = 750


    let hovered = false
    let show = false

    async function onMouseEnter() {
        if (onMobile()) return

        hovered = true
        await sleep(delay)
        if (hovered) show = true
    }

    function onMouseLeave() {
        if (onMobile()) return
        
        hovered = false
        show = false
    }
</script>


<div
    class="tooltip-hover-zone"

    on:mouseenter={onMouseEnter}
    on:mouseleave={onMouseLeave}
    on:click={onMouseLeave}
    on:keydown={()=>{}}
/>

{#if show}
    <svg
        class="tooltip-pointer"

        style="{
                direction === "left" ? "right" :
                direction === "right" ? "left" :
                direction === "up" ? "bottom" :
                "top"
            }: calc(100% + 1px);

            {
                direction === "down" || direction === "up" ? "left: 50%;" :
                "top: 50%;"
            }
            width: {offset * 1.25}px;
            height: {offset}px;
            transform: 
            {
                direction === "down" || direction === "up" ? "translate(-50%, 0)" :
                "translate(0, -50%)"
            }
            rotate({
                direction === "left" ? 90 :
                direction === "right" ? 270 :
                direction === "up" ? 180 :
                0
            }deg);
        "
    >
        <polygon points="{offset * 1.25 / 2},1 0,{offset} {offset * 1.25},{offset}" />
    </svg>

    <div
        class="tooltip-bubble"

        style="
            {
                direction === "left" ? "right" :
                direction === "right" ? "left" :
                direction === "up" ? "bottom" :
                "top"
            }: calc(100% + {offset}px);
            {
                lean === "left" ? "right: -3px;" :
                lean === "right" ? "left: -3px;" :
                lean === "up" ? "bottom: -3px;" :
                lean === "down" ? "top: -3px;" :
                (
                    direction === "down" || direction === "up" ? "left: 50%; transform: translate(-50%, 0);" :
                    "top: 50%; transform: translate(0, -50%);"
                )
            }
        "
    >
        <strong>{text}</strong>
    </div>
{/if}


<style>
    .tooltip-hover-zone {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    .tooltip-pointer {
        position: absolute;
        z-index: 2;
        
        stroke: dimgrey;
        fill: dimgrey;

        pointer-events: none;
    }

    .tooltip-bubble {
        border-radius: 3px;
        outline: solid 1px dimgrey;

        position: absolute;
        z-index: 2;
        background-color: dimgrey;

        padding: 5px 7px 5px 7px;

        font-size: 10px !important;
        font-weight: 400 !important;
        color: white;
        white-space: pre;

        pointer-events: none;
    }
</style>