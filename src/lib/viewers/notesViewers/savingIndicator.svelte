<script lang="ts">
    import { WaitingIndicator, Tooltip } from "$lib/widgets/layoutWidgets"

    export let saving = true
    export let error = false
</script>


<div class="saving-indicator-container">
    {#if saving || error}
        <div class="saving-indicator">
            {#if !error}
                <div class="waiting-indicator-container">
                    <WaitingIndicator
                        states={
                            {
                                waiting: {
                                    text: "",
                                    imageName: "waiting"
                                },
                            }
                        }
                        currentStateName={"waiting"}
                    />
                </div>
            {/if}

            <div class="icon-color"/>

            <img src="./icons/file.png" alt="New file" width=20px height=20px />

            {#if error}
                <svg>
                    <line
                        x1=10 y1=10
                        x2=30 y2=30
                    />

                    <line
                        x1=10 y1=30
                        x2=30 y2=10
                    />
                </svg>
            {/if}
        </div>

        <Tooltip
            text={
                error ? "Error while saving Notes!" : "Saving notes..." 
            }
            direction={"up"}
            lean={"left"}
            delay={100}
        />
    {/if}
</div>


<style>
    .saving-indicator-container {
        position: absolute;

        right: 7px;
        top: 5px;
        width: 40px;
        height: 40px;
    }

    .saving-indicator {
        width: 100%;
        height: 100%;
        opacity: 0.5;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-color {
        position: absolute;
        left: 13px;
        width: 15px;
        height: 15px;

        background-color: white;
    }

    img {
        margin-left: 1px;
        z-index: 1;
    }

    .waiting-indicator-container {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 40px;
        height: 40px;
        transform: translate(-49%, -50%) scale(1.2, 1.2);
        opacity: 0.5;

        display: flex;
        align-items: center;
        justify-content: center;

        padding-left: 10px;
    }

    svg {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 40px;
        height: 40px;
        transform: translate(-50%, -50%);

        stroke-width: 4px;
        stroke: red;
    }
</style>