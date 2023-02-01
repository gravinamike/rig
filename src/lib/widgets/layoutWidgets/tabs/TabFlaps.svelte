<script>
    import { uIBackgroundColorStore } from "$lib/stores"
</script>

<div
	class="tab-flaps"

	style="background-color: {$uIBackgroundColorStore};"
>
	<slot />
</div>

<style>
	.tab-flaps {
		flex: 0 0 auto;
		
		border-bottom: 1px solid black;
		border-radius: 5px 5px 0 0;

		display: flex;
		flex-direction: row;
	}
</style>