<script lang="ts">
    import type { CommandButtonInfo } from "./types"
    import { commandPaletteInfoStore, closeContextCommandPalette } from "$lib/stores"
    import CommandPalette from "./commandPalette.svelte"
    

    let commandPaletteContainer: Element
    let show: boolean
    let positionX: number
    let positionY: number
    let commandButtonInfos: CommandButtonInfo[]

    $: if ($commandPaletteInfoStore) {
        show = $commandPaletteInfoStore.show;
        [positionX, positionY] = $commandPaletteInfoStore.position
        commandButtonInfos = $commandPaletteInfoStore.buttonInfos
    }

    // Handling outside clicks.
	function handlePossibleOutsideClick(event: MouseEvent) {
		if (show && event.target !== commandPaletteContainer && !commandPaletteContainer.contains(event.target as Node)) {
			closeContextCommandPalette()
		}
	}
</script>


<svelte:body on:click={handlePossibleOutsideClick} />


{#if show}
    <!-- Command Palette. -->
    <div
        class="command-palette-container"
        style="left: {positionX}px; top: {positionY}px;"
        bind:this={commandPaletteContainer}
    >
        <CommandPalette
            {commandButtonInfos}
            square={true}
            maxRowLength={4}
        />
    </div>
{/if}



<style>
    .command-palette-container {
        position: absolute;
        z-index: 1;
    }
</style>