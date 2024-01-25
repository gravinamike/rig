// Import constants.
import { defaultUITrimColor, defaultMobileMenuTrimColor, defaultGraphBackgroundColor } from "$lib/shared/constants"

// Import SvelteKit framework resources.
import { writable, derived } from "svelte/store"

// Import utility functions.
import { clampNumber } from "$lib/shared/utility"



/* UI stores. */

// UI color stores hold the hex-strings for the UI's trim, background, header, mobile menu trim,
// and graph-background colors.
export const uITrimColorStore = writable( defaultUITrimColor )
export const uIBackgroundColorStore = derived(
    uITrimColorStore,
    ($uITrimColor) => lightenOrDarkenColorString($uITrimColor, "lighter", 95)
)
export const uIHeaderColorStore = derived(
    uITrimColorStore,
    ($uITrimColor) => lightenOrDarkenColorString($uITrimColor, "darker", 15)
)
export const mobileMenuTrimColorStore = writable( defaultMobileMenuTrimColor )
export const graphBackgroundColorStore = writable( defaultGraphBackgroundColor )

// Background image stores hold the paths for the Graph and Notes background images.
export const graphBackgroundImageStore = writable( null as string | null )
export const notesBackgroundImageStore = writable( null as string | null )

// Font stores hold the default and title fonts for the Graph.
export const defaultFontStore = writable( null as string | null )
export const titleFontStore = writable( null as string | null )
export const titleFontWeightStore = writable( 600 as number | null )



/**
 * Lighten-or-darken-colorstring-method.
 * 
 * Modifies a colorstring to represent a lighter or darker version of that color.
 * @param colorString - The starting colorstring.
 * @param lighterOrDarker - Whether to lighten or darken the color.
 * @param percentChange - How much to lighten or darken the color (as a percentage of the way to all-white or all-black).
 * @returns 
 */
export function lightenOrDarkenColorString(
    colorString: string,
    lighterOrDarker: "lighter" | "darker",
    percentChange: number
) {
    // Detect invalid hex color codes and return a fallback color.
    const isColorStringHexColor = /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i.test(colorString)
    if (!isColorStringHexColor) {
        console.log(`"${colorString}" is an invalid color hex code. Outputting white ("#ffffff") as a fallback.`)
        return "#ffffff"
    }

    // Clamp the percent-change in the color between 0% and 100%, and establish an upper or lower
    // possible bound on the color saturation.
    percentChange = clampNumber(percentChange, 0, 100)
    const changeLimit = lighterOrDarker === "lighter" ? 255 : 0

    // Get the colorstring as a hexadecimal integer.
    const colorStringWithoutHash = colorString.replace("#", "")
    const colorStringAsInteger = parseInt(colorStringWithoutHash, 16)
 
    // Calculate the new red component of the output color.
    const redComponent = ( colorStringAsInteger >> 16 )
    const redDistanceToLimit = changeLimit - redComponent
    const redAmountToChange = redDistanceToLimit * ( percentChange / 100 )
    const adjustedRedComponent = redComponent + redAmountToChange

    // Calculate the new blue component of the output color.
    const blueComponent = ( (colorStringAsInteger >> 8) & 0x00FF )
    const blueDistanceToLimit = changeLimit - blueComponent
    const blueAmountToChange = blueDistanceToLimit * ( percentChange / 100 )
    const adjustedBlueComponent = blueComponent + blueAmountToChange
 
    // Calculate the new green component of the output color.
    const greenComponent = ( colorStringAsInteger & 0x0000FF )
    const greenDistanceToLimit = changeLimit - greenComponent
    const greenAmountToChange = greenDistanceToLimit * ( percentChange / 100 )
    const adjustedGreenComponent = greenComponent + greenAmountToChange

    // Assemble and return the adjusted output color string.
    const adjustedColorString = `#${(
        adjustedGreenComponent | (adjustedBlueComponent << 8) | (adjustedRedComponent << 16)
    ).toString(16)}`
    return adjustedColorString
}