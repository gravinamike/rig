<script lang="ts">
    import { tweened } from "svelte/motion"
    import { cubicOut } from "svelte/easing"
    import { sleep } from "$lib/shared/utility"

    
    export let sideMenuNames: string[]
    export let openedSideMenu: string | null
    export let openWidth = 200
    export let openTime = 200
    export let overlapPage = false
    export let slideDirection: "right" | "left" = "right"



    let open = !!openedSideMenu

    const percentOpen = tweened( 0.0, { duration: openTime, easing: cubicOut } )
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
    <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
        {#if width > 0}
            <div
                class="content"
                class:overlap-page={overlapPage}
                class:slide-right={slideDirection === "right"}
                class:slide-left={slideDirection === "left"}

                style="width: {openWidth}px;"
            >
                <slot />
            </div>
        {/if}
    </div>
    

    <!-- Menu buttons. -->
    <div
        class="side-menu-buttons"
        class:slide-right={slideDirection === "right"}
        class:slide-left={slideDirection === "left"}
    >

        {#each sideMenuNames as sideMenuName}
            <button
                class="side-menu-button"
                
                on:click={ async () => {
                    if (openedSideMenu !== null && openedSideMenu !== sideMenuName) {
                        openedSideMenu = sideMenuName
                    } else if (openedSideMenu === null) {
                        openedSideMenu = sideMenuName
                        open = true
                    } else {
                        open = false
                        await sleep(openTime)
                        openedSideMenu = null
                    }
                } }
            >
                {sideMenuName}
            </button>
        {/each}

    </div>

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
        background-color: #fafafa;

        overflow: hidden;
    }

    .content:not(.overlap-page).slide-left {
        right: 0;
    }

    .content.overlap-page.slide-right {
        right: 0px;
    }

    .content.overlap-page.slide-left {
        left: 0px;
    }

    .side-menu-buttons {
        position: absolute;
        bottom: 0;
        z-index: 1;

        display: flex;
        flex-direction: column;
        padding: 10px;
        gap: 10px;
    }

    .side-menu-buttons.slide-right {
        left: 100%;
    }

    .side-menu-buttons.slide-left {
        right: 100%;
    }
</style>