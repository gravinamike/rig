<script lang="ts">
    // Import basic framework resources.
    import { tweened } from "svelte/motion"
    import { cubicOut } from "svelte/easing"

    // Import utility functions.
    import { sleep } from "$lib/shared/utility"

    
    /**
     * @param subMenuInfos - Array of objects configuring the sub-menus.
     * @param openedSubMenuName - The name of the currently opened sub-menu.
     * @param openWidth - The width of the side menu when it is open.
     * @param openTime - The time (in milliseconds) it takes for the side-menu to open/close.
     * @param overlapPage - Whether the side-menu overlaps the page (or, alternatively, displaces it).
     * @param slideDirection - Whether the side-menu slides open towards the right or the left.
     */
    export let subMenuInfos: { name: string, icon: string }[]
    export let openedSubMenuName: string | null
    export let openWidth = 200
    export let openTime = 200
    export let overlapPage = false
    export let slideDirection: "right" | "left" = "right"


    // Size of the menu buttons.
    const buttonSize = 30

    // Initialize the "open" flag based on whether any sub-menu is open.
    let open = !!openedSubMenuName

    // The "width" attribute is derived from the base width and the tweened
    // "percentOpen" value.
    const percentOpen = tweened( 0.0, { duration: openTime, easing: cubicOut } )
    $: percentOpen.set( open ? 1.0 : 0.0 )
    $: width = openWidth * $percentOpen


    /**
     * Handle-button-click method.
     * 
     * Opens, closes and switches the sub-menus in response to clicks on the menu
     * buttons.
     * @param name - Name of the menu button that was clicked.
     */
    async function handleButtonClick(name: string) {
        // If there is a sub-menu currently open and a different sub-menu was
        // specified, switch to the new sub-menu.
        if (openedSubMenuName !== null && openedSubMenuName !== name) {
            openedSubMenuName = name

        // Else, if there is currently no sub-menu open, open the specified sub-
        // menu.
        } else if (openedSubMenuName === null) {
            openedSubMenuName = name
            open = true

        // Otherwise (if there is currently a sub-menu open and it's the same one
        // that was specified by the click), close the side-menu.
        } else {
            open = false
            await sleep(openTime) // Wait for the menu to close fully before hiding the content.
            openedSubMenuName = null
        }
    }
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

        {#each subMenuInfos as info}

            <!-- Menu button. -->
            <div
                class="button"
                class:opened-menu={openedSubMenuName !== null && openedSubMenuName === info.name}

                on:click={ () => { handleButtonClick(info.name) } }
                on:keydown={()=>{}}
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
        top: 0;
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
</style>