<script lang="ts">
    // Import types.
    import type { Writable } from "svelte/store"
    import type { MenuName } from "$lib/shared/constants"

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
     * @param openExtension - The extension dimension of the side menu when it is open.
     * @param openTime - The time (in milliseconds) it takes for the side-menu to open/close.
     * @param overlapPage - Whether the side-menu overlaps the page (or, alternatively, displaces it).
     * @param slideDirection - Whether the side-menu slides open towards the right or the left.
     * @param stateStore - The store that records the state of this menu (if any).
     * @param closeOnOutsideClick - Whether to automatically close the menu when clicking outside it.
     * @param close - Method to close the side-menu.
     */
    export let subMenuInfos: { name: MenuName, icon: string }[][]
    export let defaultOpenSubMenuName: string
    export let openedSubMenuName: string | null
    export let open: boolean = false
    export let lockedOpen = false
    export let lockedSubMenuName: string | null = openedSubMenuName
    export let openExtension = 250
    export let openTime = 500
    export let overlapPage = false
    export let slideDirection: "right" | "left" | "down" | "up" = "right"
    export let stateStore: Writable<string | null> | null = null
    export let closeOnOutsideClick = false
    export let close: () => void


    // Orientation is based on slide direction.
    $: orientation =
        ["right", "left"].includes(slideDirection) ? "horizontal" :
        "vertical"
    
    // Size of the menu buttons.
    const buttonSize = 30

    // Initialize the open submenu to the default.
    openedSubMenuName = defaultOpenSubMenuName

    // Mouse-pressed flag tracks whether the mouse button is currently being held down.
    let mousePressed = false

    // Closing flag tracks whether the menu is currently in the process of
    // closing.
    let closing = false

    // The "width" attribute is derived from the base width and the tweened
    // "percentOpen" value.
    const percentOpen = tweened( 0.0, { duration: openTime, easing: cubicOut } )
    $: percentOpen.set( open ? 1.0 : 0.0 )
    $: extension = openExtension * $percentOpen

    // Attributes related to button formatting.
    let buttonSpacingPercent = tweened( -100, { duration: 100, easing: cubicOut } )
    $: buttonSpacingPercent.set( open ? 10 : -100 )
    $: betweenButtonSpacing = 0.01 * $buttonSpacingPercent * (buttonSize + 10)
    $: betweenButtonGap = Math.max(0, betweenButtonSpacing)
    $: betweenButtonOverlap = Math.min(0, betweenButtonSpacing)
    $: buttonOverlapMargin = betweenButtonOverlap / 2


    /**
     * Handle-mouse-enter method.
     * 
     * When the mouse enters the side menu or hover-open strip, the menu opens.
     */
    function handleMouseEnter() {
        if (!closing) open = true
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
        if (!closing) openedSubMenuName = name
    }

    /**
     * Close method.
     * 
     * Closes the side-menu and resets the submenu to the default.
     */
    close = async () => {
        closing = true
        open = false
        await sleep(openTime) // Wait for the menu to close fully before hiding the content.
        closing = false
    }





    let sideMenu: HTMLElement

    function handlePossibleOutsideClick(event: MouseEvent) {
		if (event.target !== sideMenu && !sideMenu.contains(event.target as Node)) {
			if (closeOnOutsideClick) close()
		}
	}

</script>


<!-- Mouse event handlers for document body. -->
<svelte:body
    on:click={handlePossibleOutsideClick}
    on:mousedown={() => {mousePressed = true}}
    on:mouseup={() => {mousePressed = false}}
/>


<!-- Side menu. -->
<div
    class="side-menu"
    class:overlap-page={overlapPage}
    class:slide-left={slideDirection === "left"}
    bind:this={sideMenu}

    style={
        orientation === "horizontal" ? `width: ${extension}px; height: 100%;` :
        `width: 100%; height: ${extension}px;`
    }

    on:mouseleave={handleMouseLeave}
>

    <!-- Menu content. -->
    <div
        style="position: relative; width: 100%; height: 100%; overflow: hidden;"

        on:mouseenter={handleMouseEnter}
    >
        {#if extension > 0}
            <div
                class="content"
                class:overlap-page={overlapPage}
                class:slide-right={slideDirection === "right"}
                class:slide-left={slideDirection === "left"}

                style={
                    orientation === "horizontal" ? `width: ${openExtension}px; height: 100%;` :
                    `width: 100%; height: ${openExtension}px;`
                }
            >
                <slot />
            </div>
        {/if}
    </div>

    <!-- Hover-open strip. -->
    {#if !onMobile() && extension === 0 && !mousePressed}
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
        class:buttons-on-left={slideDirection === "right"}
        class:buttons-on-right={slideDirection !== "right"}

        style="border-radius: {buttonSize / 2}px;"
    >

        <!-- Menu button groups. -->
        {#each subMenuInfos as buttonGroup}

            <div
                class="button-group"

                style="
                    padding: {slideDirection === "right" ? "5px 5px 5px 0.5rem" : "5px 0.5rem 5px 5px"};
                    gap: {betweenButtonGap}px;
                "
            >

                <!-- Menu button group. -->
                {#each buttonGroup as info, i}

                    <!-- Menu button. -->
                    <div
                        class="button"
                        class:opened-menu={openedSubMenuName !== null && openedSubMenuName === info.name}
                        class:locked-menu={lockedOpen && lockedSubMenuName === info.name}
                        class:menu-closed={!open}

                        style={
                            // If the button is the first in the button group, use only a
                            // right overlap margin.
                            i === 0 ? `margin-right: ${buttonOverlapMargin}px;` :
                            // Else, if the button is the last in the button group, use only a left overlap margin.
                            i === buttonGroup.length - 1 ? `margin-left: ${buttonOverlapMargin}px;` :
                            // Else, use overlap margins on both sides.
                            `margin-left: ${buttonOverlapMargin}px; margin-right: ${buttonOverlapMargin}px;`
                        }

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
    }

    .side-menu.overlap-page {
        position: absolute;
        z-index: 2;
    }

    .side-menu.overlap-page.slide-left {
        right: 0;
    }

    .content {
        position: absolute;
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

        display: flex;
        flex-direction: row;
        justify-content: space-between;

        pointer-events: none;
    }

    .side-menu-buttons.buttons-on-left {
        left: 0%;
    }

    .side-menu-buttons.buttons-on-right {
        right: 0%;
    }

    .button-group:hover .button {
        opacity: 0.75;
    }

    .button-group {
        display: flex;
        flex-direction: row;

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

        z-index: 1;
        background-color: white;
    }

    .button.menu-closed:not(.opened-menu) {
        opacity: 0;
    }

    .button:hover {
        outline: solid 1px grey;

        background-color: gainsboro;
    }

    .button:active {
        background-color: lightgrey;
    }
</style>