<script lang="ts">
	import type { CommandButtonInfo } from "./types"
	import CommandButton from "./commandButton.svelte"

	

	export let commandButtonInfos: CommandButtonInfo[]
	export let buttonSize = 30
	export let square = false
	export let maxRowLength: number | null = null
	export let startPadding: number | null = null
	export let showText = true
	export let separateRowForText = true
	export let textSide = "left"
	export let showBorder = true
	export let forceRows: number | null = null



	const numberOfButtonsAndPadding = commandButtonInfos.length + (startPadding ? startPadding : 0)

	$: rowLength = square ?
		(
			maxRowLength !== null ? 
				Math.max(Math.ceil(Math.sqrt(numberOfButtonsAndPadding)), maxRowLength) :
				Math.ceil(Math.sqrt(numberOfButtonsAndPadding))
		) :
		(
			maxRowLength !== null ? 
				Math.min(numberOfButtonsAndPadding, maxRowLength) :
				numberOfButtonsAndPadding
		)	
	$: rowsTall = Math.min(Math.ceil(numberOfButtonsAndPadding / rowLength), forceRows || 100)

	let hoveredCommandText = ""
	function setHoveredCommandText(text: string) { hoveredCommandText = text }
</script>


<div
	class="command-palette"
	class:show-border={showBorder}

	style="{
		square ? `width: ${(buttonSize + 5) * rowLength}px;` :
		""
	} height: {
		(buttonSize + 5) * rowsTall + (showText && separateRowForText ? 20 : 0)
	}px;"
>
	{#if startPadding}
		<div
			class="start-padding"
			style="width: {startPadding * buttonSize + 5 * (startPadding - 1)}px; height: {buttonSize}px;"
		/>
	{/if}

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

	{#if showText}
		<div
			class="hovered-command-text"
			class:text-on-left={textSide === "left"}
		>
			{hoveredCommandText}
		</div>
	{/if}
</div>


<style>
	.command-palette {
		position: relative;

		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		padding-top: 5px;
		padding-left: 5px;
		gap: 5px;
		align-content: flex-start;

		overflow: hidden;
	}

	.command-palette.show-border {
		border: solid 1px lightgrey;
		box-shadow: 4px 4px 4px -2px lightgray;

		background-color: white;
	}

	.hovered-command-text {
		position: absolute;
		bottom: 5px;

		font-size: 0.75rem;
		white-space: nowrap;
	}

	.hovered-command-text.text-on-left {
		left: 5px;
	}

	.hovered-command-text:not(.text-on-left) {
		right: 5px;
	}
</style>