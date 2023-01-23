<script lang="ts">
	import { getContext, createEventDispatcher } from "svelte"
	import { MENU } from "./ContextMenuFrame.svelte"
	const { dispatchClick, closeMenu } = getContext<{dispatchClick: ()=>void, closeMenu: ()=>void}>(MENU)
	
	export let text = ""
	export let disabled = false
	

	// Events.
	const dispatch = createEventDispatcher()
	function handleClick() {
		if (!disabled) {
			dispatch('click')
			dispatchClick()
			closeMenu()
		}
	}
</script>


<div 
  class="context-menu-option {disabled ? "disabled" : ""}"
  on:click|stopPropagation={handleClick}
  on:keydown={()=>{}}
>
	{#if text}
		{text}
	{:else}
		<slot />
	{/if}
</div>


<style>
	.context-menu-option {
		grid-gap: 5px;

		display: flex;
		padding: 0.25rem 0.5rem;
		align-items: center;

		font-size: 0.75rem;

		cursor: default;
	}

	.context-menu-option.disabled {
		color: lightgrey;
		
		pointer-events: none;
	}

	.context-menu-option:not(.disabled):hover {
		background: lightgrey;
	}
</style>
