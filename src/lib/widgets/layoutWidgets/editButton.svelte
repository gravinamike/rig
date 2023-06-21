<script lang="ts">
    // Import related widgets.
    import { Tooltip } from "$lib/widgets/layoutWidgets"


    export let interactionMode: "display" | "editing" | "create"
    export let tooltipText: string | null = null
    export let onClick: () => void
</script>


<div class="container button-container">
    <button
        class="button"
        class:editing={interactionMode === "editing"}
        class:create={interactionMode === "create"}
        tabindex=0

        on:click={onClick}
    >
        {#if interactionMode === "display"}
            <img src="./icons/edit.png" alt="Edit Direction" width=15px height=15px  style="pointer-events: none;" />
        {:else if interactionMode === "editing"}
            ✓
        {:else}
            +
        {/if}

        {#if tooltipText}
            <Tooltip
                text={tooltipText}
                direction={"up"}
                lean={"left"}
            />
        {/if}
    </button>
</div>


<style>
    .container {
        position: relative;

        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 5px;
    }

    .button-container {
        position: relative;
        width: 15px;
        height: 15px;
    }

    .button {
        border: none;
        border-radius: 5px;
        box-shadow: 1px 1px 2px 1px grey;
        
        width: 15px;
        height: 15px;

        display: flex;
        justify-content: center;
        align-items: center;

        font-size: 0.75rem;
        font-weight: 600;

        cursor: pointer;
    }

    .button:hover, .button:focus {
        box-shadow: 2px 2px 5px 1px grey;

        background-color: lightgrey;
    }

    .button:active {
        outline: solid 1px grey;
        box-shadow: 1px 1px 2px 1px grey;

        background-color: grey;
    }

    .button.editing {
        outline-color: #d0f0c0;
        background-color: #d0f0c0;
        color: green;
    }

    .button.editing:hover, .button.editing:focus {
        outline-color: #ace1af;
        background-color: #ace1af;
    }

    .button.editing:active {
        outline-color: #8fbc8f;
        background-color: #8fbc8f;
    }

    .button.create {
        outline-color: #fac3ae;
        background-color: #fac3ae;

        font-size: 1rem;
        color: darkred;
    }

    .button.create:hover, .button.create:focus {
        outline-color: #ffa07a;
        background-color: #ffa07a;
    }

    .button.create:active {
        outline-color: #fa8072;
        background-color: #fa8072;
    }
  </style>