<script lang="ts">
    import type { SearchOption } from "./types"
    import { onMount } from "svelte"

    export let unfilteredArray: {id: number, name: string}[]
    export let placeholderText: string
    export let focusMethod: (focusedItem: SearchOption | null) => void
    export let submitMethod: (selectedItem: SearchOption | null, matchedItems: SearchOption[]) => void
    export let maxHeight: number | null = 100


    
    
    let filtered: SearchOption[] = []

    let thingSearchbox: HTMLElement
    let inputField: HTMLElement
    let inputText = ""
    let matchedItems: SearchOption[] = []
    let selectedItem: SearchOption | null = null

    let showFiltered = false

    function substringIndex(substring: string, caseSensitive=false): number | null {
        const substringIndex = caseSensitive ?
            substring.indexOf(inputText) :
            substring.toLowerCase().indexOf(inputText.toLowerCase())
        return substringIndex !== -1 ? substringIndex : null
    }

    function matched(string: string, caseSensitive=false) {
        const matched = caseSensitive ?
            string === inputText :
            string.toLowerCase() === inputText.toLowerCase()
        return matched
    }

    async function handleInput() {
        await filter()
        matchedItems = []
        for (const filteredItem of filtered) {
            if (matched(filteredItem.text)) matchedItems.push(filteredItem)
        }
    }

    async function filter() {
        filtered = []
        unfilteredArray.forEach(
            item => {
                const index = item.name ? substringIndex(item.name) : null
                if ( index !== null ) {
                    const matchedText = item.name.substring(index, index + inputText.length)
                    const highlightedItem = item.name.replace(matchedText, `<strong>${matchedText}</strong>`);
                    filtered.push( { id: item.id, text: item.name, highlightedText: highlightedItem } )
                }
            }
        )
        focusedOptionIndex = null
        showFiltered = filtered.length ? true : false
    }

    function handleEnter() {
        submitMethod(selectedItem, matchedItems)
        inputText = ""
		showFiltered = false
    }

    function submit() {
        submitMethod(selectedItem, matchedItems)
        inputText = ""
		showFiltered = false
    }

    function handlePossibleOutsideClick(event: MouseEvent) {
		if (event.target !== thingSearchbox && !thingSearchbox.contains(event.target as Node)) {
            selectedItem = null
            inputText = ""
			showFiltered = false
		}
	}








    let focusedOptionIndex: number | null = null


    function focusOnOptionElement(optionIndex: number) {
        const optionElement = document.getElementById(`search-option-${optionIndex}`)
        if (optionElement) {
            optionElement.focus()
            optionElement.scrollIntoView({block: "nearest"})
        }
    }

    function incrementFocusedOption(increment: 1 | -1) {
        const endIndex = filtered.length - 1

        if (focusedOptionIndex === null) {
            focusedOptionIndex = increment === 1 ? 0 : endIndex
        } else {
            const incrementedIndex = focusedOptionIndex + increment
            if (incrementedIndex < 0) {
                focusedOptionIndex = 0
            } else if (incrementedIndex > endIndex) {
                focusedOptionIndex = endIndex
            } else {
                focusedOptionIndex = incrementedIndex
            }
        }
    }



    onMount(async () => {
        inputField.focus()
	})
</script>


<!-- When clicking outside the widget, close the drop-down menu. -->
<svelte:body
    on:mouseup={handlePossibleOutsideClick}
/>


<div
    class="search-widget"
    bind:this={thingSearchbox}
    on:keypress={ (event) => { if (event.key === "Enter") handleEnter() } }
>
    <input
        class="input-field {showFiltered ? "filtered-open" : ""}" 
        type="text" 
        placeholder={placeholderText}
        bind:this={inputField}
        bind:value={inputText}
        on:input={handleInput}
        on:keydown={ (event) => {
            if (showFiltered && event.key === "ArrowDown") {
                event.preventDefault()
                incrementFocusedOption(1)
                if (focusedOptionIndex) {
                    if (filtered[focusedOptionIndex]) selectedItem = filtered[focusedOptionIndex]
                    focusOnOptionElement(focusedOptionIndex)
                    focusMethod(filtered[focusedOptionIndex])
                }
            } else if (showFiltered && event.key === "ArrowUp") {
                event.preventDefault()
                incrementFocusedOption(-1)
                if (focusedOptionIndex) focusOnOptionElement(focusedOptionIndex)
                if (focusedOptionIndex) {
                    if (filtered[focusedOptionIndex]) selectedItem = filtered[focusedOptionIndex]
                    focusOnOptionElement(focusedOptionIndex)
                    focusMethod(filtered[focusedOptionIndex])
                }
            }
        } }
    />

    {#if showFiltered}
        <div
            class="filtered-items"
            style="
                { maxHeight ? `position: absolute; top: calc(100% - 5px); max-height: ${maxHeight}px;` : "flex: 1 1 0; position: relative; top: -1px;" }
            "
            on:wheel|stopPropagation={()=>{}}
        >
            {#each filtered as filteredItem, i}
                <div
                    id="search-option-{i}"
                    class="filtered-item"
                    class:focusedOption={i === focusedOptionIndex}
                    on:mouseenter={() => {
                        if (filtered[i]) selectedItem = filtered[i]
                        focusedOptionIndex = i
                        focusOnOptionElement(i)
                        focusMethod(filteredItem)
                    }}
                    on:click={() => {
                        showFiltered = false
                        selectedItem = filteredItem
                        inputText = selectedItem.text
                        submit()
                    }}
                    on:keydown={()=>{}}
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
        height: 100%;

        display: flex;
        flex-direction: column;
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
        z-index: 1;

        outline: solid 1px black;
        outline-offset: -1px;

        box-sizing: border-box;
        left: 0%;
        width: 100%;
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

    .filtered-item.focusedOption {
        background-color: whitesmoke;
    }

    .filtered-item:active {
        background-color: lightgrey;
    }
  </style>