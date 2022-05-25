<script lang="ts">
    const unfiltered = ["Abigail", "Boromir", "Caleb", "Daphne", "Ephraim", "Felicia", "Gus", "Hermoine"]
    let filtered: string[] = []

    let thingSearchbox: Element
    let inputText: ""

    let showFiltered = false

    async function filter() {
        filtered = []
        if (inputText) {
            unfiltered.forEach(
                item => {
                    const substringIndex = item.toLowerCase().indexOf(inputText.toLowerCase())
                    if ( substringIndex !== -1 ) {
                        const matchedText = item.substring(substringIndex, substringIndex + inputText.length)
                        const highlightedItem = item.replace(matchedText, `<strong>${matchedText}</strong>`);
                        filtered.push(highlightedItem)
                    }
                }
            )
        }
        showFiltered = filtered.length ? true : false
    }

    function handlePossibleOutsideClick(event: MouseEvent) {
		if (event.target !== thingSearchbox && !thingSearchbox.contains(event.target as Node)) {
            inputText = ""
			showFiltered = false
		}
	}
</script>


<!-- When clicking outside the widget, close the drop-down menu. -->
<svelte:body
    on:mouseup={handlePossibleOutsideClick}
/>

<div class="thing-searchbox-viewer">

    <div
        class="thing-searchbox"
        bind:this={thingSearchbox}
    >
        <input
            class="input-field {showFiltered ? "filtered-open" : ""}" 
            type="text" 
            placeholder="Search Things..." 
            bind:value={inputText} 
            on:input={filter}
        />

        {#if showFiltered}
            <div
                class="filtered-items"
                on:wheel|stopPropagation={()=>{}}
            >
                {#each filtered as filteredItem}
                    <div
                        class="filtered-item"
                        on:click={() => {
                            showFiltered = false
                        }}
                    >
                        {@html filteredItem}
                    </div>
                {/each}


            </div>
        {/if}
    </div>

</div>


<style>
    .thing-searchbox-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
    }

    .thing-searchbox {
        position: relative;
    }

    .input-field {
        border-radius: 6px;
        border: solid 1px grey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 100%;
        background-color: white;

        padding: 0.25rem;

        font-size: 0.75rem;
    }

    .input-field:focus {
        outline: solid 2px black;
    }

    .input-field.filtered-open {
        border-radius: 6px 6px 0 0;
        outline: solid 1px black;
        outline-offset: -1px;

        padding: 0.25rem 0.25rem 0.5rem 0.25rem;
    }

    .filtered-items {
        top: 100%;
        z-index: 1;

        outline: solid 1px black;
        outline-offset: -1px;

        position: absolute;
        box-sizing: border-box;
        top: calc(100% - 5px); 
        left: 0%;
        min-width: 100%;
        max-height: 100px;
        background-color: white;

        overflow-x: hidden;
        overflow-y: scroll;
        scrollbar-width: thin;

        text-align: left;
        font-size: 0.75rem;
    }

    .filtered-item {
        padding: 0.25rem;

        white-space: nowrap;

        cursor: default;
    }

    .filtered-item:hover {
        background-color: whitesmoke;
    }

    .filtered-item:active {
        background-color: lightgrey;
    }
  </style>