<script lang="ts">
	import { closeContextCommandPalette } from "$lib/stores"
	
	export let text: string
	export let iconName: string
	export let hoverMethod: (text: string) => void
	export let clickedMethod: () => void


	// Events.
	function handleClick() {
		closeContextCommandPalette()
		clickedMethod()
	}
</script>

<div
	class="command-button"
	on:mouseenter={() => {hoverMethod(text)}}
	on:mouseleave={() => {hoverMethod("")}}
	on:click={handleClick}
>
	<img src="./icons/{iconName}.png" alt={text} width="25px" height="25px">
</div>


<style>
	.command-button {
		outline: solid 1px lightgrey;
		outline-offset: -1px;
		border-radius: 3px;

		box-sizing: border-box;
		width: 30px;
		height: 30px;
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