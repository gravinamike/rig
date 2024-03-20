export function htmlToPlaintext(htmlString: string, replaceWithSimilar=true, scriptAndStyleTags=true): string {
    let plaintextString =
        replaceWithSimilar ? htmlString
            // Replace closing div tags with line breaks.
            .replace(/<\/div>/gi, "\n")
            // Replace closing list item tags with line breaks.
            .replace(/<\/li>/gi, "\n")
            // Replace opening list item tags with asterixes.
            .replace(/<li>/gi, " * ")
            // Replace closing ordered list tags with line breaks.
            .replace(/<\/ol>/gi, "\n")
            // Replace closing unordered list tags with line breaks.
            .replace(/<\/ul>/gi, "\n")
            // Replace closing paragraph tags with line breaks.
            .replace(/<\/p>/gi, "\n")
            // Replace closing line break tags with line breaks.
            .replace(/<br\s*[/]?>/gi, "\n")
            // Remove all other tags.
            .replace(/<[^>]+>/g, "") :
        
        // Remove all tags.
        htmlString.replace(/<[^>]+>/g, "")
            
    if (scriptAndStyleTags) {
        plaintextString = plaintextString
            // Remove script tags.
            .replace(/<script([\s\S]*?)<\/script>/gi, "")
            // Remove style tags.
            .replace(/<style([\s\S]*?)<\/style>/gi, "")
    }

    return plaintextString
}

export function capitalizeFirstLetter(stringToCapitalize: string) {
    const capitalizedString = stringToCapitalize.charAt(0).toUpperCase() + stringToCapitalize.slice(1)
    return capitalizedString
}

export function htmlToPlainText(htmlString: string) {
    const divElement = document.createElement("div")
    divElement.innerHTML = htmlString
        .replace(/<br>/g, "\n")
        .replace(/<\/p>/g, "\n")
        .replace(/<li>/g, "\n")
        .replace(/<\/ul>/g, "\n")
        .replace(/<\/ol>/g, "\n")
    const plainText = divElement.innerText || ""
    return plainText
}

/**
 * Write-plain-text-to-clipboard method.
 * 
 * Writes a string to the system clipboard as plain text. To be used as a fallback option when
 * the Clipboard API isn't supported.
 * @param text - The plain text to write to the clipboard.
 */
export function writePlainTextToClipboard(text: string) {
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    document.execCommand("copy")
    document.body.removeChild(textArea)
}

export function incrementDownHeaderTags(html: string) {
    return html
        .replace(/<h6>/g, "<strong>")
        .replace(/<\/h6>/g, "</strong>")
        .replace(/<h5>/g, "<h6>")
        .replace(/<\/h5>/g, "</h6>")
        .replace(/<h4>/g, "<h5>")
        .replace(/<\/h4>/g, "</h5>")
        .replace(/<h3>/g, "<h4>")
        .replace(/<\/h3>/g, "</h4>")
        .replace(/<h2>/g, "<h3>")
        .replace(/<\/h2>/g, "</h3>")
        .replace(/<h1>/g, "<h2>")
        .replace(/<\/h1>/g, "</h2>")
}