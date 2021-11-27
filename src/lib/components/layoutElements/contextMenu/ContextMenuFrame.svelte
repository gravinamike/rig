<script lang="ts" context="module">
	export const MENU = {}
</script>

<script lang="ts">
	import { setContext, createEventDispatcher } from "svelte"

	// The menu...
	let menu: Element

	function constrainMenuBox(x: number, y: number): position {
		if (menu) {
			const rect = menu.getBoundingClientRect()
			menuPosition.x = Math.min(window.innerWidth - rect.width, menuPosition.x)
			if (menuPosition.y > window.innerHeight - rect.height) menuPosition.y -= rect.height
		}

		//return { x: x, y: y }
		return { x: 0, y: 0 }
	}


	interface position { x: number, y: number }
	let menuPosition: position =  { x: 0, y: 0 }
	let showMenu = false

	export async function openContextMenu(event: MouseEvent) {
		menuPosition = { x: event.clientX, y: event.clientY }
		showMenu = true
	}

	$: menuPosition = constrainMenuBox(menuPosition.x, menuPosition.y)
	
	
	// Events...
	const dispatch = createEventDispatcher()
	setContext(
		MENU,
		{ dispatchClick: () => dispatch('click') }
	)

	function handlePossibleOutsideClick(event: MouseEvent) {
		if (menu && !(
			menu === event.target ||
			menu.contains(event.target as Node))
		) {
			showMenu = false
		}
	}
</script>


<svelte:body on:click={handlePossibleOutsideClick} />

{#if showMenu}
	<div
		class="menu"
		bind:this={menu}
		style="left: {menuPosition.x}px; top: {menuPosition.y}px;"
	>
		<slot />
	</div>
{/if}


<style>
	.menu {
		border: solid 1px black;
		
		position: fixed;
		background: white;

		display: grid;
	}
</style>