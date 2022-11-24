<script lang="ts">
    import { tweened } from "svelte/motion"
    import { cubicOut } from "svelte/easing"


    export let openWidth = 200
    export let overlapPage = false
    export let slideDirection: "right" | "left" = "right"


    let open = false

    const percentOpen = tweened( 0.0, { duration: 200, easing: cubicOut } )
    $: percentOpen.set( open ? 1.0 : 0.0 )

    $: width = openWidth * $percentOpen
</script>


<!-- Side menu. -->
<div
    class="side-menu"
    class:overlap-page={overlapPage}
    class:slide-left={slideDirection === "left"}

    style="width: {width}px;"
>
    
    <!-- Menu content. -->
    {#if width > 0}
        <div
            class="content"
            class:overlap-page={overlapPage}

            style="width: {openWidth}px;"
        >
            <slot />
        </div>
    {/if}


    <button
        style="
            position: absolute;
            left: 100%;
            top: 0;
            z-index: 1;
        "
        on:click={() => {open = !open}}
    >MENU</button>
</div>


<style>
    .side-menu {
        position: relative;
        height: 100%;
    }

    .side-menu.overlap-page {
        position: absolute;
        z-index: 1;
    }

    .side-menu.overlap-page.slide-left {
        right: 0;
    }

    .content {
        position: absolute;
        height: 100%;
        overflow: hidden;
    }

    .content.overlap-page {
        right: 0px;
    }
</style>