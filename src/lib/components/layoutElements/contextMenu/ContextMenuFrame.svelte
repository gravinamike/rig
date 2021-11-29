<script lang="ts" context="module">
	export const MENU = {}
</script>

<script lang="ts">
	import { setContext, createEventDispatcher } from "svelte"

	interface position { x: number, y: number }


	let menu: Element
	let menuPosition: position
	let showMenu = false

	export async function openContextMenu(event: MouseEvent) {
		const rect = (event.currentTarget as Element).getBoundingClientRect()
		menuPosition = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		}
		
		showMenu = true
	}
	
	// Handling outside clicks.
	const dispatch = createEventDispatcher()
	setContext(
		MENU,
		{ dispatchClick: () => dispatch('click') }
	)
	function handlePossibleOutsideClick(event: MouseEvent) {
		if (menu && !(menu === event.target)) {
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
		
		position: absolute;
		width: 10rem;
		background: white;

		display: grid;
	}
</style>