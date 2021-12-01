<script land="ts">
	import { getContext } from "svelte"
	import { TABS } from "./TabBlock.svelte"
	const { registerTabFlap, activateTabFlap, activeTabFlap } = getContext(TABS)

	const tabFlap = {}

	registerTabFlap(tabFlap)
</script>


<div
	class="tab-flap { $activeTabFlap === tabFlap ? "active" : "" }"
	on:click={ () => activateTabFlap(tabFlap) }
>
	<slot />
</div>


<style>
	.tab-flap {
		padding: 0.25rem;

		color:grey;

		cursor: default;
	}
	
	.active {
		border-bottom: 2px solid black;

		color: black;
	}
</style>