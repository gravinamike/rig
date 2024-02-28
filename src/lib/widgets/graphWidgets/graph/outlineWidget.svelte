<script lang="ts">
    // Import types.
    import type { Editor } from "@tiptap/core"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import SvelteKit framework resources.
    import { onDestroy } from "svelte"

    // Import stores.
    import { addGraph, landscapeOrientation, removeGraph, titleFontStore, titleFontWeightStore, uITrimColorStore, addGraphIdsNeedingViewerRefresh } from "$lib/stores"

    // Import utility functions.
    import { onMobile } from "$lib/shared/utility"

    // Import related widgets.
    import { defaultGraphWidgetStyle, ThingCohortOutlineWidget } from "$lib/widgets/graphWidgets"
    import NotesToolbar from "$lib/viewers/notesViewers/notesToolbar.svelte"

    // Import API functions.
    import { markThingsVisited } from "$lib/db/makeChanges"
    


    export let space: Space
    export let pThingIds: (number | null)[]
    export let depth: number
    export let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    export let offAxis = false
    export let fullSize: boolean
    export let rePerspectToThingId: (thingId: number) => Promise<void>



    // Outline title (root Thing text).
    $: title =
        graph === null ? "" :
        graph.rootCohort?.members[0].thing?.text ?? "THING NOT FOUND IN STORE"













    let editor: Editor | null





    /**
     * Focus-editor method.
     * 
     * Gives the Tiptap editor keyboard focus.
     */
    function focusEditor() {
        if (!editor) return

        const editorElement = editor.view.dom as HTMLElement
        if (editorElement !== document.activeElement) editorElement.focus()
    }

    /**
     * Is-Thing-link method.
     * 
     * Determines if the currently-selected text is a link to a Thing in the current Graph.
     */
    function isThingLink(): boolean {
        return (
            editor !== null
            && editor.isActive('link')
            && editor.getAttributes("link").href.startsWith("graph://")
        )
    }

















    let graph: Graph | null = null




    /**
     * Build-and-refresh method.
     * Replaces any existing Graph with a new one, builds the new Graph, then
     * refreshes the viewers.
     */
    async function buildAndRefresh() {
        // Close any existing Graph.
        if (graph) {
            removeGraph(graph)
            graph = null
        }
        
        // Open and build the new Graph.
        graph = await addGraph(pThingIds as number[], depth, null, true, offAxis, space)
        graphWidgetStyle = {...defaultGraphWidgetStyle}

        // Configure style for off-axis styling, if applicable.
        graph.offAxis = offAxis
        if (offAxis) {
            graphWidgetStyle.excludePerspectiveThing = true
            graphWidgetStyle.excludeCartesianAxes = true
            graphWidgetStyle.excludeNonAxisThingCohorts = true
        }
        
        await markThingsVisited(pThingIds as number[])

        // Refresh the Graph viewers.
        addGraphIdsNeedingViewerRefresh(graph.id)
    }

    buildAndRefresh()



    

    onDestroy(() => {
        if (graph) removeGraph(graph)
    })
</script>


<!-- Graph outline widget. -->
<div
    class="graph-outline-widget"
    class:off-axis={offAxis}

    style={offAxis ? "" : `background-color: ${$uITrimColorStore};`}
>
    {#if !offAxis}
        <!-- Title. -->
        <div
            class="title"

            style="
                margin-left: {onMobile() && !$landscapeOrientation ? 60 : 8}px;
                margin-right: {onMobile() ? 45 : 0}px;
                {
                    onMobile() ? (
                        !$landscapeOrientation ? "position: relative; top: 5px; font-size: 0.9rem;" :
                        "position: relative; top: 5px; left: 4px; font-size: 0.9rem;"
                    ) :

                    ""
                }
                font-family: {$titleFontStore ?? "Arial"};
                font-weight: {$titleFontWeightStore ?? 600};
            "
        >
            <div>{title}</div>
        </div>
    {/if}

    <!-- Root Thing Cohort widget (from which the rest of the Graph Outline automatically "grows"). -->
    <div class="root-thing-cohort-container">
        {#if graph?.rootCohort}
            <ThingCohortOutlineWidget
                thingCohort={graph.rootCohort}
                {graph}
                {graphWidgetStyle}
                bind:activeNotesEditorForOutliner={editor}
                {rePerspectToThingId}
            />
        {/if}
    </div>

    {#if editor}
        <NotesToolbar
            {editor}
            {fullSize}
            focusEditorMethod={focusEditor}
            isThingLinkMethod={isThingLink}
        />
    {/if}
</div>


<style>
    .graph-outline-widget {
        box-sizing: border-box;
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 0.5rem;
        
        user-select: none;
    }

    .graph-outline-widget.off-axis {
        padding: 0rem;
    }

    .title {
        flex: 0 0 34px;

        height: 34px;

        display: flex;
        align-items: center;
    }

    .title div {
        margin: 0;

        text-align: left;
        font-size: 1.5rem;
        line-height: 1.5rem;
    }

    .root-thing-cohort-container {
        height: 100%;

        overflow-x: visible;
        overflow-y: auto; 
        scrollbar-width: thin;
    }
</style>