<script lang="ts">
    // Import types.
    import type { MenuName } from "$lib/shared/constants"

    // Import stores and utility functions.
    import { devMode, hideMenusStore, landscapeOrientation, loadingState, openGraphStore, perspectiveThingIdStore } from "$lib/stores"
    import { onMobile } from "$lib/shared/utility"
    
    
    export let height: number

    export let subMenuInfos: { name: MenuName, icon: string, tooltipText: string | null }[][]
    export let defaultOpenSubMenuName: string
    export let useTabbedLayout: boolean
    export let usePortraitLayout: boolean
    export let closeLeftMenu: () => void



    /** Menus. */

    // Configuration for left side-menu.
    $: subMenuInfos = [
        [
            {
                name: "File",
                icon: "file",
                tooltipText: "File menu"
            },
            $loadingState === "graphLoaded" && $devMode ?
                {
                    name: "Dev",
                    icon: "dev",
                    tooltipText: "Developer menu"
                } :
                null,
            $loadingState === "graphLoaded" ?
                {
                    name: "Settings",
                    icon: "settings",
                    tooltipText: "Graph settings"
                } :
                null,
            $loadingState === "graphLoaded" ?
                {
                    name: "Space",
                    icon: "space",
                    tooltipText: "Spaces and Directions"
                } :
                null,
            $loadingState === "graphLoaded" ?
                {
                    name: "Thing",
                    icon: "thing",
                    tooltipText: "Thing navigation"
                } :
                null
        ].filter(
            info => info !== null
            && !($hideMenusStore || []).includes(info.name as MenuName)
        ) as { name: MenuName, icon: string }[]
    ].filter(infoBlock => infoBlock !== null) as ({ name: MenuName, icon: string, tooltipText: string | null }[])[]
    
    // Which sub-menu to open after loading.
    $: defaultOpenSubMenuName = $loadingState === "graphLoaded" ? "Thing" : "File"
    
    // Whether to use the tabbed menu layout for small screens.
    $: useTabbedLayout = height < 500

    // Whether to use the mobile portrait layout.
    $: usePortraitLayout = onMobile() && !$landscapeOrientation


    // In mobile portrait mode, close the left side-menu when the Graph is
    // loaded or re-Perspected.
    $: if (onMobile() && !$landscapeOrientation && $openGraphStore) closeLeftMenu()
    $: if (onMobile() && !$landscapeOrientation && $perspectiveThingIdStore) closeLeftMenu()
</script>