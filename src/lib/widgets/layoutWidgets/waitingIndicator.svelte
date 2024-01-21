<script lang="ts">
    import type { WaitingIndicatorStates } from "$lib/shared/constants"

    export let states: WaitingIndicatorStates
    export let currentStateName = "start"
    export let showText = true
    
    $: currentState =
        !Object.keys(states).length ? { text: "", imageName: null } :
        currentStateName in states ? states[currentStateName] :
        { text: `WIDGET ERROR: STATE KEY "${currentStateName}" NOT DEFINED!`, imageName: "error" }
</script>


<div class="waiting-indicator">
    {#if currentState.imageName === "waiting"}
        <svg class="spinner">
            <circle class="orbit" cx=15 cy=15 r=11.33 />
            <circle class="planet" cx=25 cy=15 r=5 />
        </svg>
    {/if}

    {#if showText}
        <div
            class="text"
        >
            {@html currentState.text}
        </div>
    {/if}
</div>


<style>
    .waiting-indicator {
        margin: auto;

        display: flex;
        flex-direction: row;
        gap: 10px;
        align-items: center;
    }

    .spinner {        
        width: 30px;
        height: 30px;

        -webkit-animation: spin 2s linear infinite;
        animation: spin 2s linear infinite;
    }

    @-webkit-keyframes spin {
        0% { -webkit-transform: rotate(0deg); }
        100% { -webkit-transform: rotate(360deg); }
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .orbit {
        stroke-width: 2;
        stroke: grey;
        fill: none;
    }

    .planet {
        fill: grey;
    }

    .text {
        font-size: 1rem;
        font-weight: 600;
    }
</style>