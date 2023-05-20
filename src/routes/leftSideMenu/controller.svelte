<script lang="ts">
    // Import types.
    import type { MenuName } from "$lib/shared/constants"

    // Import stores and utility functions.
    import { devMode, hideMenusStore, loadingState } from "$lib/stores"
    import { onMobile } from "$lib/shared/utility"
    
    
    export let height: number

    export let subMenuInfos: { name: MenuName, icon: string }[][]
    export let leftMenuOpen: boolean
    export let defaultOpenSubMenuName: string
    export let useTabbedLayout: boolean
    export let rightMenuOpen: boolean
    export let closeLeftMenu: () => void
    export let closeRightMenu: () => void = () => {}



    /** Menus. */

    // Configuration for left side-menu.
    $: subMenuInfos = [
        [
            {
                name: "File",
                icon: "file"
            },
            $loadingState === "graphLoaded" && $devMode ?
                {
                    name: "Dev",
                    icon: "dev"
                } :
                null,
            $loadingState === "graphLoaded" ?
                {
                    name: "Settings",
                    icon: "settings"
                } :
                null,
            $loadingState === "graphLoaded" ?
                {
                    name: "Space",
                    icon: "space"
                } :
                null,
            $loadingState === "graphLoaded" ?
                {
                    name: "Thing",
                    icon: "thing"
                } :
                null
        ].filter(
            info => info !== null
            && !($hideMenusStore || []).includes(info.name as MenuName)
        ) as { name: MenuName, icon: string }[]
    ].filter(infoBlock => infoBlock !== null) as ({ name: MenuName, icon: string }[])[]
    
    // Which sub-menu to open after loading.
    $: defaultOpenSubMenuName = $loadingState === "graphLoaded" ? "Thing" : "File"
    
    // Whether to use the tabbed menu layout for small screens.
    $: useTabbedLayout = height < 500

    // When on mobile with narrow viewport, set up each side-menu to close if
    // the other is open.
    $: if (onMobile() && window.innerWidth < 600 && leftMenuOpen) closeRightMenu()
    $: if (onMobile() && window.innerWidth < 600 && rightMenuOpen) closeLeftMenu()
</script>