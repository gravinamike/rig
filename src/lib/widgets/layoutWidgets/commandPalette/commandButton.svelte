<script lang="ts">
	import { closeContextCommandPalette } from "$lib/stores"
	
	export let text: string
	export let iconName: string | null
	export let iconHtml: string | null
	export let buttonSize: number
	export let hoverMethod: (text: string) => void
	export let isActive: boolean
	export let clickedMethod: () => void

	// Events.
	function handleClick() {
		closeContextCommandPalette()
		clickedMethod()
	}
</script>

<div
	class="command-button"
	class:active={isActive}
	style="width: {buttonSize}px; height: {buttonSize}px;"
	on:mouseenter={() => {hoverMethod(text)}}
	on:mouseleave={() => {hoverMethod("")}}
	on:click={handleClick}
>
	{#if iconName}
		<img src="./icons/{iconName}.png" alt={text} width="{buttonSize * 0.8}px" height="{buttonSize * 0.8}px">
	{:else}
		<div
			class="button-text"
			style="font-size: {buttonSize / 1.5}px;"
		>
			{@html iconHtml}
		</div>
	{/if}
</div>


<style>
	.command-button {
		outline: solid 1px lightgrey;
		outline-offset: -1px;
		border-radius: 3px;

		box-sizing: border-box;
		background-color: white;

		display: flex;
		justify-content: center;
		align-items: center;

		cursor: pointer;
	}

	.command-button:hover {
        outline: solid 1px black;
    }

    .command-button:active {
        background-color: lightgrey;
    }
</style>