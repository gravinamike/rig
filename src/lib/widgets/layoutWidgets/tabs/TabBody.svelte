<script lang="ts">
	import { getContext } from "svelte"
    import type { Writable } from "svelte/store";
	import { TABS } from "./TabBlock.svelte"
	const { registerTabBody, activeTabBody } = getContext<{registerTabBody: (tabBody: {})=>void, activeTabBody: Writable<{} | null>}>(TABS)

	const tabBody = {}

	registerTabBody(tabBody)
</script>

{#if tabBody === $activeTabBody}
	<div class="tab-body">
		<slot />
	</div>
{/if}

<style>
	.tab-body {
		flex: 1 1 auto;
		
		min-height: 0;

		overflow-x: hidden;
		overflow-y: auto;
	}
</style>