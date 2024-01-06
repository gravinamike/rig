<script lang="ts">
    // Import types.
    import type { SearchOption } from "./types"

    // Import basic framework resources.
    import { onMount } from "svelte"

    // Import utility functions.
    import { clampNumber, htmlToPlaintext, onMobile } from "$lib/shared/utility"

    // Import related widgets.
    import EditButton from "$lib/widgets/layoutWidgets/editButton.svelte"


    /**
     * @param unfilteredArray - The array of items to search.
     * @param placeholderText - Instructive text to show if nothing has been entered yet.
     * @param startingText - Text to enter automatically when the widget is initialized.
     * @param maxHeight - The maximum height that the list of filtered items can be.
     * @param useSubmitButton - Whether to override the usual submission behavior and submit using a button instead.
     * @param startFocused - Whether to put focus on the search field when it is first rendered.
     * @param focused - Whether the search field is currently in focus.
     * @param focusMethod - Method to call when a filtered item is hovered/focused.
     * @param submitMethod - Method to call when a filtered item is clicked.
     */
    export let unfilteredArray: {id: number, thingText: string, noteText: string | null}[]
    export let placeholderText: string
    export let startingText: string | null = null
    export let maxHeight: number | null = 100
    export let useSubmitButton = false
    export let startFocused = false
    export let focused = false
    export let focusMethod: (focusedItem: SearchOption | null) => void
    export let submitMethod: (selectedItem: SearchOption | null, matchedItems: SearchOption[]) => void

    
    // HTML element handlers.
    let thingSearchbox: HTMLElement
    let inputField: HTMLElement
    

    // Search type (Thing or Note).
    let searchType: "thing" | "note"
    $: searchType = unfilteredArray.length && unfilteredArray[0].noteText ? "note" : "thing"

    // The text currently input in the search field.
    let inputText = startingText || ""

    // Arrays of items filtered by, and matched exactly to, the input text.
    let filteredItems: SearchOption[] = []
    let matchedItems: SearchOption[] = []

    // Information about the currently focused or selected items.
    let focusedOptionIndex: number | null = null
    let selectedItem: SearchOption | null = null

    // Whether to show or hide the filtered items in the UI.
    let showFiltered = false

    // Font size of the search field and items.
    const fontSize = onMobile() ? 0.6 : 0.75
    

    /**
     * Handle-input method.
     * 
     * When the search input is changed, filter the search list and assemble
     * the list of items that matches the search input exactly.
     */
    async function handleInput() {
        await filter(searchType === "note" ? 3 : null)
        matchedItems = []
        for (const filteredItem of filteredItems) {
            if (
                stringMatchesInput(filteredItem.noteText ? filteredItem.noteText : filteredItem.thingText)
            ) matchedItems.push(filteredItem)
        }
    }

    /**
     * Handle-keyboard-event method.
     * 
     * Enables up-and-down arrow key navigation of the filtered items dropdown.
     * @param event - The keyboard event that activated this method.
     */
    function handleKeyboardEvent(event: KeyboardEvent) {
        // For down- or up-arrow keypresses when the dropdown is open and
        // focused,
        if (showFiltered && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault()

            // Move the focus forward or backward 1 item.
            incrementFocusedOption(event.key === "ArrowDown" ? 1 : -1)

            // If an option is in focus,
            if (focusedOptionIndex) {
                // Set the corresponding item as the selected item.
                if (filteredItems[focusedOptionIndex]) selectedItem = filteredItems[focusedOptionIndex]

                // Put the focus on that option.
                focusOnOptionElement(focusedOptionIndex)

                // Call the specified focus method on that option.
                focusMethod(filteredItems[focusedOptionIndex])
            }
        }
    }

    /**
     * Handle-option-mouse-enter method.
     * 
     * Handles actions that should happen when the mouse hovers over a drop-
     * down option.
     * @param optionIndex - The index of the hovered option.
     */
    function handleOptionMouseEnter(optionIndex: number) {
        // Set the option's item as the selected item.
        if (filteredItems[optionIndex]) selectedItem = filteredItems[optionIndex]

        // Set the option's index as the focused option index.
        focusedOptionIndex = optionIndex

        // Focus the option's element.
        focusOnOptionElement(optionIndex)

        // Unless the submit-button setup is in use, call the supplied focus-
        // item method.
        if (!useSubmitButton) {
            focusMethod(selectedItem)
        }
    }

    /**
     * Handle-option-click method.
     * 
     * Handles actions that should happen when a drop-down option is clicked.
     * @param optionIndex - The index of the clicked option.
     */
    function handleOptionClick(filteredItem: SearchOption) {
        // Hide the drop-down options.
        showFiltered = false

        // Set the clicked item as the selected item.
        selectedItem = filteredItem

        // Set the input field's text to the text of the clicked item.
        inputText = selectedItem.noteText || selectedItem.thingText

        // If the submit-button setup is in use, call the supplied focus-item
        // method.
        if (useSubmitButton) {
            focusMethod(selectedItem)

        // Otherwise, submit the search.
        } else {
            submit()
        }
    }

    /**
     * Handle-possible-outside-click method.
     * 
     * If the event's target was anything other than the search widget, reset
     * the interface.
     * @param event - The mouse or touch event that activated this method.
     */
    function handlePossibleOutsideClick(event: MouseEvent | TouchEvent) {
		if (event.target !== thingSearchbox && !thingSearchbox.contains(event.target as Node)) {
            selectedItem = null
            inputText = ""
			showFiltered = false
		}
	}

    /**
     * Filter-search-array method.
     * 
     * Narrows the search array to only those items that contain the input
     * string as a substring.
     */
    async function filter(minimumInputLength: number | null = null) {
        // Reset the filtered-items array.
        filteredItems = []

        // If a minimum input length was specified and hasn't been reached yet,
        // return with filtered items list empty.
        if (minimumInputLength && inputText.length < minimumInputLength) return

        // For each item in the unfiltered-items array,
        unfilteredArray.forEach(
            item => {
                // Get the text (either from the Notes, if available, or from
                // the Thing).
                const text = item.noteText ? htmlToPlaintext(item.noteText) : item.thingText


                // If the search input is empty,
                if ( inputText.length === 0 ) {
                    // Add an item to the filtered-items array.
                    const processedItem = text.replace(/\n/g, "<br>")
                    filteredItems.push( {
                        id: item.id,
                        thingText: item.thingText,
                        highlightedThingText: !item.noteText ? processedItem : null,
                        noteText: item.noteText,
                        highlightedNoteText: item.noteText ? processedItem : null
                    } )

                    return
                }

                
                // Find the index of the item in the search input, if any.
                const index = substringIndex(text)

                // If the item is a substring in the search input,
                if ( index !== null ) {

                    // Get the matching substring.
                    const matchedText = text.substring(index, index + inputText.length)

                    // Trim the item text to specified maximum padding around
                    // the matching substring.
                    const trimPadding = 50
                    const trimStartIndex = Math.max(index - trimPadding, 0)
                    const trimEndIndex = Math.min(index + inputText.length + trimPadding, text.length)
                    const trimmedText = text.substring(trimStartIndex, trimEndIndex)

                    // Add an item to the filtered-items array, with the input
                    // string highlighted in bold text.
                    const highlightedItem = trimmedText
                        .replace(
                            matchedText,
                            searchType === "thing" ? `<strong>${matchedText}</strong>` :
                            `<span style="background-color: yellow;">${matchedText}</span>`
                        )
                        .replace(/\n/g, "<br>")
                    filteredItems.push( {
                        id: item.id,
                        thingText: item.thingText,
                        highlightedThingText: !item.noteText ? highlightedItem : null,
                        noteText: item.noteText,
                        highlightedNoteText: item.noteText ? highlightedItem : null
                    } )
                }
            }
        )
        
        // Reset the index of the focused option.
        focusedOptionIndex = null

        // Show the filtered items in the UI only if there are any to show.
        showFiltered = filteredItems.length ? true : false
    }

    /**
     * Submit method.
     * 
     * Call the provided submit method, then reset the input text and
     * hide the filtered item list.
     */
    function submit() {
        submitMethod(selectedItem, matchedItems)
        inputText = ""
        showFiltered = false
    }

    /**
     * Focus-on-option-element method.
     * 
     * Puts the focus on the option specified by index, and scrolls to that
     * option.
     * @param optionIndex - The index of the option to focus.
     */
    function focusOnOptionElement(optionIndex: number) {
        // Get the option element by ID.
        const optionElement = document.getElementById(`search-option-${optionIndex}`)

        // If such an element exists, focus it and scroll to it.
        if (optionElement) {
            optionElement.focus()
            optionElement.scrollIntoView({block: "nearest"})
        }
    }

    /**
     * Increment-focused-option method.
     * 
     * Moves the focus forward or backward a number of options equal to the
     * specified increment.
     * @param increment - The number of options by which to move forward or backward.
     */
    function incrementFocusedOption(increment: 1 | -1) {
        // Determine the index of the last item in the filtered-items array.
        const endIndex = filteredItems.length - 1

        // If there is no option in focus,
        if (focusedOptionIndex === null) {
            // Put the focus either on the first option or the last option,
            // depending on whether the increment was positive or negative.
            focusedOptionIndex = increment === 1 ? 0 : endIndex

        // Otherwise,
        } else {
            // Detemine the new index after incrementing.
            const incrementedIndex = focusedOptionIndex + increment

            // Set the index (clamping it between the bounds of the array).
            focusedOptionIndex = clampNumber(incrementedIndex, 0, endIndex)
        }
    }

    /**
     * Substring-index method.
     * 
     * Gets the index of the first letter of a substring in the input text, and
     * can be made case-sensitive or case-insensitive.
     * @param substring - The substring to find the index of.
     * @param caseSensitive - Whether to take letter case into account.
     */
    function substringIndex(substring: string, caseSensitive=false): number | null {
        const substringIndex = caseSensitive ?
            substring.indexOf(inputText) :
            substring.toLowerCase().indexOf(inputText.toLowerCase())
        return substringIndex !== -1 ? substringIndex : null
    }

    /**
     * String-matches-input method.
     * 
     * Determines whether a specified string matches the current search input,
     * in either a case-sensitive or case-insensitive manner.
     * @param string - The string to match.
     * @param caseSensitive - Whether to take letter case into account.
     */
    function stringMatchesInput(string: string, caseSensitive=false) {
        const matched = caseSensitive ?
            htmlToPlaintext(string, false, false) === inputText :
            htmlToPlaintext(string, false, false).toLowerCase() === inputText.toLowerCase()
        return matched
    }


    // When the widget is initialized, put focus on the text input field.
    onMount(async () => {
        if (startFocused) inputField.focus()
    })
</script>


<!-- When clicking outside the widget, close the drop-down menu. -->
<svelte:body
    on:mouseup={handlePossibleOutsideClick}
    on:touchend={handlePossibleOutsideClick}
/>


<!-- Search widget. -->
<div
    class="search-widget"
    bind:this={thingSearchbox}

    on:keypress={ (event) => { if (event.key === "Enter") submit() } }
>
    <!-- Search input field. -->
    <input
        class="input-field {showFiltered ? "filtered-open" : ""}" 
        type="text" 
        placeholder={placeholderText}
        bind:this={inputField}
        bind:value={inputText}

        style={`font-size: ${fontSize}rem;`}

        on:focus={() => {focused = true; handleInput()}}
        on:blur={() => {focused = false}}
        on:input={handleInput}
        on:keydown={handleKeyboardEvent}
    />

    <!-- Submit button (if submit-button setup is in use). -->
    {#if useSubmitButton && selectedItem}
        <div class="submit-button-container">
            <EditButton
                interactionMode={"editing"}
                onClick={() => submitMethod(selectedItem, matchedItems)}
            />
        </div>
    {/if}

    <!-- Drop-down list of filtered search items. -->
    {#if showFiltered}
        <div
            class="filtered-items"

            style="
                {
                    maxHeight ? `position: absolute; top: calc(100% - 3px); max-height: ${maxHeight}px;` :
                    "flex: 1 1 0; position: relative; top: -1px;"
                }
                {`font-size: ${fontSize}rem;`}
            "

            on:wheel|stopPropagation={()=>{}}
        >
            <!-- Filtered search items. -->
            {#each filteredItems as filteredItem, i}
                <div
                    id="search-option-{i}"
                    class="filtered-item"
                    class:note={searchType === "note"}
                    class:focusedOption={i === focusedOptionIndex}

                    on:mouseenter={() => handleOptionMouseEnter(i)}
                    on:click={() => handleOptionClick(filteredItem)}
                    on:keydown={()=>{}}
                >
                    {#if filteredItem.noteText}
                        <div class="note-thing-text">
                            {@html filteredItem.thingText}
                        </div>
                        <div class="note-text">
                            {@html filteredItem.highlightedNoteText}
                        </div>
                    {:else}
                        <div class="thing-text">
                            {@html filteredItem.highlightedThingText}
                        </div>
                    {/if}
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
        border: solid 1px white;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 100%;
        background-color: white;

        padding: 0.25rem 0.3rem 0.35rem 0.3rem;
    }

    .input-field:focus {
        outline: solid 2px silver;
    }

    .input-field.filtered-open {
        border-radius: 6px 6px 0 0;
        outline: solid 1px silver;
        outline-offset: -1px;
    }

    .submit-button-container {
        position: absolute;
        right: 5px;
        top: 4px;
    }

    .filtered-items {
        z-index: 1;

        outline: solid 1px silver;
        outline-offset: -1px;

        box-sizing: border-box;
        left: 0%;
        width: 100%;
        background-color: white;

        overflow-x: hidden;
        overflow-y: scroll;
        scrollbar-width: thin;

        text-align: left;
    }

    .filtered-item {
        cursor: default;
    }

    .filtered-item.focusedOption {
        background-color: whitesmoke;
    }

    .filtered-item:active {
        background-color: lightgrey;
    }

    :global(.filtered-item *) {
        pointer-events: none;
    }

    .filtered-item.note.focusedOption {
        box-sizing: border-box;
        outline-offset: -1px;
        outline: solid 1px grey;
    }

    .thing-text, .note-thing-text, .note-text {
        padding: 0.25rem;
    }

    .thing-text, .note-thing-text {
        white-space: nowrap;
    }

    .note-thing-text {
        background-color: lightgrey;
    
        font-weight: 600;
    }
  </style>