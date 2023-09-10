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