<script lang="ts">
	import type { CommandButtonInfo } from "./types"
	import CommandButton from "./commandButton.svelte"
	
	export let commandButtonInfos: CommandButtonInfo[]
	export let buttonSize = 30
	export let square = false
	export let maxRowLength: number | null = null


	const rowLength = square ?
		(
			maxRowLength !== null ? 
				Math.max(Math.ceil(Math.sqrt(commandButtonInfos.length)), maxRowLength) :
				Math.ceil(Math.sqrt(commandButtonInfos.length))
		) :
		(
			maxRowLength !== null ? 
				Math.max(commandButtonInfos.length, maxRowLength) :
				commandButtonInfos.length
		)	
	const rowsTall = Math.ceil(commandButtonInfos.length / rowLength)

	let hoveredCommandText = ""
	function setHoveredCommandText(text: string) { hoveredCommandText = text }
</script>


<div
	class="command-palette"
	style="{square ? `width: ${(buttonSize + 5) * rowLength}px;` : ""} height: {(buttonSize + 5) * rowsTall + 20}px;"
>
	{#each commandButtonInfos as info}
		<CommandButton
			text={info.text}
			iconName={info.iconName}
			iconHtml={info.iconHtml}
			{buttonSize}
			hoverMethod={setHoveredCommandText}
			isActive={info.isActive}
			clickedMethod={info.onClick}
		/>
	{/each}

	<div class="hovered-command-text">
		{hoveredCommandText}
	</div>
</div>


<style>
	.command-palette {
		position: relative;

		border: solid 1px lightgrey;
		box-shadow: 4px 4px 4px -2px lightgray;

		background-color: white;

		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		padding-top: 5px;
		padding-left: 5px;
		gap: 5px;
		align-content: flex-start;
	}

	.hovered-command-text {
		position: absolute;
		left: 5px;
		bottom: 5px;

		font-size: 0.75rem;
		white-space: nowrap;
	}
</style>