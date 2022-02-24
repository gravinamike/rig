<script lang="ts">
	import type { CommandButtonInfo } from "./types"
	import CommandButton from "./commandButton.svelte"
	
	export let commandButtonInfos: CommandButtonInfo[]


	const rowLength = Math.max(Math.ceil(Math.sqrt(commandButtonInfos.length)), 4)
	const rowsTall = Math.ceil(commandButtonInfos.length / rowLength)

	let hoveredCommandText = ""
	function setHoveredCommandText(text: string) { hoveredCommandText = text }
</script>


<div
	class="command-palette"
	style="width: {(30 + 5) * rowLength}px; height: {(30 + 5) * rowsTall + 20}px;"
>
	{#each commandButtonInfos as info}
		<CommandButton
			text={info.text}
			iconName={info.iconName}
			hoverMethod={setHoveredCommandText}
			clickedMethod={info.onClick}
		/>
	{/each}

	<div class="hovered-command-text">
		{hoveredCommandText}
	</div>
</div>


<style>
	.command-palette {
		border: solid 1px lightgrey;
		box-shadow: 4px 4px 4px -2px lightgray;

		background-color: white;

		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		padding-top: 5px;
		padding-left: 5px;
		gap: 5px;
	}

	.hovered-command-text {
		position: absolute;
		left: 5px;
		bottom: 5px;

		font-size: 0.75rem;
		white-space: nowrap;
	}
</style>