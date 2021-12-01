<script lang="ts" context="module">
	export const TABS = {}
</script>

<script lang="ts">
	import { setContext, onDestroy } from "svelte"
	import { writable } from "svelte/store"

	
	const tabFlaps: {}[] = []
	const tabBodies: {}[] = []
	const activeTabFlap = writable(null as {} | null)
	const activeTabBody = writable(null as {} | null)

	setContext(TABS, {
		activeTabFlap,
		activeTabBody,

		registerTabFlap: function(tabFlap: {}): void {
			tabFlaps.push(tabFlap);
			activeTabFlap.update(current => current || tabFlap)
			
			onDestroy(() => {
				const i = tabFlaps.indexOf(tabFlap)
				tabFlaps.splice(i, 1)
				activeTabFlap.update(
					current => (
						current === tabFlap ?
						( tabFlaps[i] || tabFlaps[tabFlaps.length - 1] ) :
						current
					)
				)
			})
		},

		registerTabBody: function(tabBody: {}): void {
			tabBodies.push(tabBody);
			activeTabBody.update(current => current || tabBody)
			
			onDestroy(() => {
				const i = tabBodies.indexOf(tabBody)
				tabBodies.splice(i, 1)
				activeTabBody.update(
					current => (
						current === tabBody ?
						(tabBodies[i] || tabBodies[tabBodies.length - 1]) :
						current
					)
				)
			})
		},

		activateTabFlap: function(tabFlap: {}): void {
			const i = tabFlaps.indexOf(tabFlap)
			activeTabFlap.set(tabFlap)
			activeTabBody.set(tabBodies[i])
		}
	})
</script>


<div class="tab-block">
	<slot></slot>
</div>


<style>
	.tab-block {
		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;

		overflow: hidden;
	}
</style>