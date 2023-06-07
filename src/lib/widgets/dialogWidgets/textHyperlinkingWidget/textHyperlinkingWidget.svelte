<script lang="ts">
    import { onMobile } from "$lib/shared/utility";
      import { textHyperlinkingStore, updateTextHyperlinkingUrl, disableTextHyperlinking, landscapeOrientation } from "$lib/stores"

    let urlField: HTMLInputElement
    let showErrorMessage = false

    $: if (
        $textHyperlinkingStore.editor
        && !$textHyperlinkingStore.url
        && urlField
    ) {
        urlField.focus()
    }

    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") {
            if ($textHyperlinkingStore.focusEditorMethod) $textHyperlinkingStore.focusEditorMethod()
            disableTextHyperlinking()
        }
    }

    function handleEnter() {
        if (!(urlField.value.startsWith("http://") || urlField.value.startsWith("https://"))) {
            showErrorMessage = true
        } else {
            updateTextHyperlinkingUrl(urlField.value)
            $textHyperlinkingStore.editor?.chain().focus().setLink({ href: urlField.value, target: '_blank' }).run()
            if ($textHyperlinkingStore.focusEditorMethod) $textHyperlinkingStore.focusEditorMethod()
            disableTextHyperlinking()
        }
    }
</script>


{#if $textHyperlinkingStore.editor && !$textHyperlinkingStore.url }
    <div
        class="disabled-background"
        style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 1; background-color: grey; opacity: 0.5;"
        on:click|stopPropagation={() => {
            if ($textHyperlinkingStore.focusEditorMethod) $textHyperlinkingStore.focusEditorMethod()
            disableTextHyperlinking()
        }}
        on:wheel|preventDefault
        on:keydown={()=>{}}
    />

    <div
        class="text-hyperlinking-widget"
        on:click|stopPropagation
        on:keyup|stopPropagation={handleEscape}
    >
        <div
            class="inner-widget"
            class:portrait={onMobile() && !$landscapeOrientation}
        >
            <img src="./icons/link.png" alt="link" width=30px height=30px />
            <input
                type="text"
                placeholder="Enter URL..."
                bind:this={urlField}
                on:keypress={ (event) => { if (event.key === "Enter") handleEnter() } }
            />
        </div>

        {#if showErrorMessage}
            <div class="error-message">
                Valid links must start with <strong>http://</strong> or <strong>https://</strong> !
            </div>
        {/if}
    </div>
{/if}


<style>
    .text-hyperlinking-widget {
        border-radius: 10px;
        outline: solid 1px grey;
        outline-offset: -1px;
        box-shadow: 0 0 20px 10px whitesmoke;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        box-sizing: border-box;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 10px;
        gap: 10px;
    }

    .inner-widget {
        display: flex;
        flex-direction: row;
        gap: 10px;
    }

    input {
        border-radius: 6px;
        border: solid 1px grey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 500px;

        padding: 0.25rem 0.3rem 0.35rem 0.3rem;
    }

    .inner-widget.portrait input {
        width: 200px;
    }

    input:focus {
        outline: solid 2px black;
    }

    .error-message {
        color: red;
        text-align: center;
    }
</style>