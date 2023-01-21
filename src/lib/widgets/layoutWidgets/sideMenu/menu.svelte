<script lang="ts">
    // Import types.
    import type { Writable } from "svelte/store"

    // Import basic framework resources.
    import { tweened } from "svelte/motion"
    import { cubicOut } from "svelte/easing"
    import { onMobile, sleep } from "$lib/shared/utility"
    import { saveGraphConfig } from "$lib/shared/config"
    import { openGraphStore } from "$lib/stores"

    
    /**
     * @param subMenuInfos - Nested array of objects configuring the sub-menus.
     * @param defaultOpenSubMenuName - The name of the sub-menu that is opened when the menu is opened.
     * @param openedSubMenuName - The name of the currently opened sub-menu.
     * @param openWidth - The width of the side menu when it is open.
     * @param openTime - The time (in milliseconds) it takes for the side-menu to open/close.
     * @param overlapPage - Whether the side-menu overlaps the page (or, alternatively, displaces it).
     * @param slideDirection - Whether the side-menu slides open towards the right or the left.
     * @param stateStore - The store that records the state of this menu (if any).
     * @param close - Method to close the side-menu.
     */
    export let subMenuInfos: { name: string, icon: string }[][]
    export let defaultOpenSubMenuName: string
    export let openedSubMenuName: string | null
    export let open: boolean = false
    export let lockedOpen = false
    export let lockedSubMenuName: string | null = openedSubMenuName
    export let openWidth = 250
    export let openTime = 500
    export let overlapPage = false
    export let slideDirection: "right" | "left" = "right"
    export let stateStore: Writable<string | null> | null = null
    export let close: () => void = () => {}


    // Size of the menu buttons.
    const buttonSize = 30

    // Initialize the open submenu to the default.
    openedSubMenuName = defaultOpenSubMenuName

    // Mouse-pressed flag tracks whether the mouse button is currently being held down.
    let mousePressed = false

    // The "width" attribute is derived from the base width and the tweened
    // "percentOpen" value.
    const percentOpen = tweened( 0.0, { duration: openTime, easing: cubicOut } )
    $: percentOpen.set( open ? 1.0 : 0.0 )
    $: width = openWidth * $percentOpen


    /**
     * Handle-mouse-enter method.
     * 
     * When the mouse enters the side menu or hover-open strip, the menu opens.
     */
    function handleMouseEnter() {
        open = true
    }

    /**
     * Handle-mouse-leave method.
     * 
     * When the mouse leaves the side menu, if the menu is locked open, it
     * switches back to the locked submenu. Otherwise, it closes.
     */
    async function handleMouseLeave() {
        if (lockedOpen) {
            openedSubMenuName = lockedSubMenuName
        } else {
            close()
        }
        
    }

    /**
     * Handle-button-click method.
     * 
     * Opens, closes and switches the sub-menus in response to clicks on the menu
     * buttons.
     * @param name - Name of the menu button that was clicked.
     */
    async function handleButtonClick(name: string) {

        if (lockedOpen && lockedSubMenuName === name && open) {
            lockedOpen = false
            lockedSubMenuName = null
            close()
        } else {
            openedSubMenuName = name
            lockedSubMenuName = name
            open = true
            lockedOpen = true
        }

        if (stateStore) {
            stateStore.set(lockedSubMenuName)
            if ($openGraphStore) saveGraphConfig()
        }
    }

    /**
     * Handle-mouse-enter-on-button method.
     * 
     * If the menu is already open, hovering over the button changes the current
     * submenu to the button's submenu.
     * @param name - Name of the menu button that was hovered.
     */
    function handleButtonMouseEnter(name: string) {
        if (open) openedSubMenuName = name
    }

    /**
     * Close method.
     * 
     * Closes the side-menu and resets the submenu to the default.
     */
    close = async () => {
        open = false
        await sleep(openTime) // Wait for the menu to close fully before hiding the content.
        openedSubMenuName = defaultOpenSubMenuName
    }
</script>


<!-- Mouse up/down handlers for document body. -->
<svelte:body
    on:mousedown={() => {mousePressed = true}}
    on:mouseup={() => {mousePressed = false}}
/>


<!-- Side menu. -->
<div
    class="side-menu"
    class:overlap-page={overlapPage}
    class:slide-left={slideDirection === "left"}

    style="width: {width}px;"

    on:mouseleave={handleMouseLeave}
>
    
    <!-- Menu content. -->
    <div
        style="position: relative; width: 100%; height: 100%; overflow: hidden;"

        on:mouseenter={handleMouseEnter}
    >
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

    <!-- Hover-open strip. -->
    {#if !onMobile()}
        <div
            class="hover-open-strip"
            class:slide-right={slideDirection === "right"}
            class:slide-left={slideDirection === "left"}
            class:no-pointer-events={mousePressed}

            style="width: {buttonSize + 20}px;"

            on:mouseenter={handleMouseEnter}
        />
    {/if}

    <!-- Menu buttons. -->
    <div
        class="side-menu-buttons"
        class:slide-right={slideDirection === "right"}
        class:slide-left={slideDirection === "left"}

        style="border-radius: {buttonSize / 2}px;"
    >

        <!-- Menu button groups. -->
        {#each subMenuInfos as buttonGroup}

            <div class="button-group">

                <!-- Menu button group. -->
                {#each buttonGroup as info}

                    <!-- Menu button. -->
                    <div
                        class="button"
                        class:opened-menu={openedSubMenuName !== null && openedSubMenuName === info.name}
                        class:locked-menu={lockedOpen && lockedSubMenuName === info.name}

                        on:mouseenter={ () => handleButtonMouseEnter(info.name) }
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

    .hover-open-strip {
        position: absolute;
        top: 0;
        z-index: 1;
        height: 100%;
    }

    .hover-open-strip.slide-right {
        left: 100%;
    }

    .hover-open-strip.slide-left {
        right: 100%;
    }

    .hover-open-strip.no-pointer-events {
        pointer-events: none;
    }

    .side-menu-buttons {
        box-sizing: border-box;
        position: absolute;
        top: 0;
        z-index: 1;
        height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: space-between;

        pointer-events: none;
    }

    .side-menu-buttons.slide-right {
        left: 100%;
    }

    .side-menu-buttons.slide-left {
        right: 100%;
    }

    .button-group:hover .button {
        opacity: 0.75;
    }

    .button-group {
        display: flex;
        flex-direction: column;
        padding: 5px;
        gap: 5px;

        pointer-events: auto;
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

    .button.locked-menu {
        outline: solid 1px grey;
        opacity: 0.33;
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