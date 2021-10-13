<script lang="ts">
    import { onMount } from 'svelte';
    import { storeSpaces, storeThings } from '$lib/shared/stores'
    import SpacesStoreView from "$lib/components/viewers/spacesStoreView.svelte"
    import ThingsStoreView from "$lib/components/viewers/thingsStoreView.svelte"
    import GraphPortal from "$lib/components/viewers/graphPortal.svelte"

    const pThingIds = [251]

    onMount(async () => {
        storeSpaces()
        storeThings(pThingIds)
	});
</script>


<main>
    <SpacesStoreView />
    <ThingsStoreView />
    <GraphPortal
        thingIds={pThingIds}
    />
</main>


<style>
    main {
        height: calc( 100% - 3.2rem );
        display: flex;
        flex-direction: row;
    }
</style>