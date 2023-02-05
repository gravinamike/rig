/**
 * String-represents-integer method.
 * 
 * Determines whether a given string represents an integer.
 * @param str - The string to check.
 * @returns - True if the string represents an integer, otherwise false.
 */
export function stringRepresentsInteger(str: string): boolean {
    return /^\d+$/.test(str)
}

/**
 * String-represents-hex-color method.
 * 
 * Determines whether a given string represents a hexidecimal code for a color.
 * @param str - The string to check.
 * @returns - True if the string represents a hex color code, otherwise false.
 */
export function stringRepresentsHexColor(str: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(str)
}

/**
 * Clamp-number method.
 * 
 * If the provided number is outside of the provided bounds, returns the
 * closest in-bounds value.
 * @param inputValue - The number to clamp between the provided bounds.
 * @param lowerBound - The lower bound of permissible values.
 * @param upperBound - The upper bound of permissible values.
 * @returns - The provided number if it was in bounds, otherwise the closest in-bounds value.
 */
export function clampNumber(inputValue: number, lowerBound: number, upperBound: number): number {
    const clampedNumber = 
        inputValue < lowerBound ? lowerBound :
        inputValue > upperBound ? upperBound :
        inputValue
    return clampedNumber
}

/**
 * Hex-to-RGBA method.
 * 
 * Converts a hexadecimal color string (and, optionally, an alpha value) to an
 * RGBA color string.
 * @param hex - A hexadecimal color string.
 * @param alpha - A float representing the alpha value.
 * @returns - An RGBA color string.
 */
export function hexToRgba(hex: string, alpha=1.0): string {
    const red = parseInt(hex.slice(1, 3), 16)
    const green = parseInt(hex.slice(3, 5), 16)
    const blue = parseInt(hex.slice(5, 7), 16)
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

// Function includes a fallback for case where keys are
// numbers, for legacy support.
/**
 * JSON-parse method for legacy use.
 * 
 * Works like JSON.parse, but processes the input string to fix idiosyncratic
 * syntax from older Graph files if necessary.
 * @param jsonString - The JSON string to parse.
 * @returns - A JSON object.
 */
export function legacyPerspectiveThingsParse(jsonString: string): {[thingId: string]: string} {
    let output: {[thingId: string]: string} = {}

    // First try to parse using JSON.parse.
    try {

        output = JSON.parse(jsonString)

    // If that doesn't work,
    } catch {
        
        // Modify the string to get rid of old syntax conventions that break
        // JSON.parse.
        const modifiedJsonString =
            jsonString
                // Convert `"` to `\"`.
                .replace(/"/g, `\\"`)
                // Convert `{N: ` to `{"N": `.
                .replace( /{\d+:\s/g, (match) => {return `{"${match.substring(1, match.length - 2)}": `} )
                // Convert `, N: ` to `, "N": `.
                .replace(/,\s\d+:\s/g, (match) => {return `, "${match.substring(2, match.length - 2)}": `})
                // Convert `": '` to `": "`.
                .replace(/":\s'/g, `": "`)
                // Convert `', "` to `", "`.
                .replace(/',\s"/g, `", "`)
                // Convert final `'}` to `"}`.
                .replace(/'}$/g, `"}`)
        
        // Parse the modified string.
        output = JSON.parse(modifiedJsonString)

    }    
    
    // Return the parsed string.
    return output
}