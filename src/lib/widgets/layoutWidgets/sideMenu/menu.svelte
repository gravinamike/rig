<script lang="ts">
    import { tweened } from "svelte/motion"
    import { cubicOut } from "svelte/easing"
    import { sleep } from "$lib/shared/utility"

    
    export let sideMenuInfos: { name: string, icon: string }[]
    export let openedSideMenuName: string | null
    export let openWidth = 200
    export let openTime = 200
    export let overlapPage = false
    export let slideDirection: "right" | "left" = "right"



    let open = !!openedSideMenuName

    const percentOpen = tweened( 0.0, { duration: openTime, easing: cubicOut } )
    $: percentOpen.set( open ? 1.0 : 0.0 )
    $: width = openWidth * $percentOpen


    const buttonSize = 30


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

        style="border-radius: {buttonSize / 2}px;"
    >

        {#each sideMenuInfos as info}
            <div
                class="button"
                class:opened-menu={openedSideMenuName !== null && openedSideMenuName === info.name}

                on:click={ async () => {
                    if (openedSideMenuName !== null && openedSideMenuName !== info.name) {
                        openedSideMenuName = info.name
                    } else if (openedSideMenuName === null) {
                        openedSideMenuName = info.name
                        open = true
                    } else {
                        open = false
                        await sleep(openTime)
                        openedSideMenuName = null
                    }
                } }
            >
                <img
                    src="./icons/{info.icon}.png"
                    alt={info.name}
                    width="{buttonSize}px"
                    height="{buttonSize}px"
                >
            </div>
        {/each}

    </div>

</div>


<style>
    .button {
		outline: solid 1px lightgrey;
		outline-offset: -1px;
		border-radius: 50%;

		box-sizing: border-box;
		background-color: white;
        opacity: 0.1;

		display: flex;
		justify-content: center;
		align-items: center;
        padding: 5px;

		cursor: default;
	}

	.button.opened-menu {
        outline: solid 1px grey;
        opacity: 0.75;

        background-color: white;
    }

    .button:hover {
        outline: solid 1px grey;

        background-color: gainsboro;
    }

    .button:active {
        background-color: lightgrey;
    }









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
        margin: 5px;

        position: absolute;
        bottom: 0;
        z-index: 1;

        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .side-menu-buttons.slide-right {
        left: 100%;
    }

    .side-menu-buttons.slide-left {
        right: 100%;
    }

    .side-menu-buttons:hover .button {
        opacity: 0.75;
    }
</style>