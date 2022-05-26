<script lang="ts">
    import type { SearchOption } from "./types"

    export let unfilteredArray: string[]
    export let placeholderText: string
    export let submitMethod: (selectedItem: SearchOption | null, matchedItems: SearchOption[]) => void


    
    
    let filtered: SearchOption[] = []

    let thingSearchbox: Element
    let inputText = ""
    let matchedItems: SearchOption[] = []
    let selectedItem: SearchOption | null = null

    let showFiltered = false

    function substringIndex(substring: string): number | null {
        const substringIndex = substring.toLowerCase().indexOf(inputText.toLowerCase())
        return substringIndex !== -1 ? substringIndex : null
    }

    async function handleInput() {
        await filter()
        matchedItems = []
        console.log("FILTERED", filtered)
        for (const filteredItem of filtered) {
            if (substringIndex(filteredItem.text)) matchedItems.push(filteredItem)
        }
    }

    async function filter() {
        filtered = []
        unfilteredArray.forEach(
            item => {
                const index = substringIndex(item)
                if ( index ) {
                    const matchedText = item.substring(index, index + inputText.length)
                    const highlightedItem = item.replace(matchedText, `<strong>${matchedText}</strong>`);
                    filtered.push( { text: item, highlightedText: highlightedItem } )
                }
            }
        )
        showFiltered = filtered.length ? true : false
        console.log(filtered)
    }

    function handleEnter() {
        submitMethod(selectedItem, matchedItems)
    }

    function submit() {
        submitMethod(selectedItem, matchedItems)
    }

    function handlePossibleOutsideClick(event: MouseEvent) {
		if (event.target !== thingSearchbox && !thingSearchbox.contains(event.target as Node)) {
            selectedItem = null
            inputText = ""
			showFiltered = false
		}
	}
</script>


<!-- When clicking outside the widget, close the drop-down menu. -->
<svelte:body
    on:mouseup={handlePossibleOutsideClick}
/>


<div
    class="search-widget"
    bind:this={thingSearchbox}
>
    <input
        class="input-field {showFiltered ? "filtered-open" : ""}" 
        type="text" 
        placeholder={placeholderText}
        bind:value={inputText}
        on:input={handleInput}
        on:keypress={ (event) => { if (event.key === "Enter") handleEnter() } }
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
                        selectedItem = filteredItem
                        inputText = selectedItem.text
                        submit()
                    }}
                >
                    {@html filteredItem.highlightedText}
                </div>
            {/each}
        </div>
    {/if}
</div>


<style>
    .search-widget {
        position: relative;
    }

    .input-field {
        border-radius: 6px;
        border: solid 1px grey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 100%;
        background-color: white;

        padding: 0.25rem 0.3rem 0.35rem 0.3rem;

        font-size: 0.75rem;
    }

    .input-field:focus {
        outline: solid 2px black;
    }

    .input-field.filtered-open {
        border-radius: 6px 6px 0 0;
        outline: solid 1px black;
        outline-offset: -1px;
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