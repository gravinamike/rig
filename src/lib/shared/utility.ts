export function sleep(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time))
}

/** Class representing a rectangle. */
export class Rectangle {
    x = 0
    y = 0
    width = 0
    height = 0
    top = 0
    right = 0
    bottom = 0
    left = 0
}

export function descendantElements(element: Element, descendants?: Element[]): Element[] {
    if ( descendants === undefined ) descendants = []
    for (let i = 0; i < element.children.length; i++) {
        descendants.push(element.children[i])
        descendantElements(element.children[i], descendants)
    }
    return descendants
}

export function elementGroupEdges(elementGroup: Element[]): {top: number, right: number, bottom: number, left: number} {

    const edges = {top: 0, right: 0, bottom: 0, left: 0}

    if (elementGroup.length) {
        edges.top = Math.min( ...elementGroup.map((element) => {return element.getBoundingClientRect().top}) )
        edges.right = Math.max( ...elementGroup.map((element) => {return element.getBoundingClientRect().right}) )
        edges.bottom = Math.max( ...elementGroup.map((element) => {return element.getBoundingClientRect().bottom}) )
        edges.left = Math.min( ...elementGroup.map((element) => {return element.getBoundingClientRect().left}) )
    }

    return edges
}

export function unique<Type>(array: Type[]): Type[] {
    return [...new Set(array)]
}

export function hexToRgba(hex: string, alpha=1.0): string {
    const red = parseInt(hex.slice(1, 3), 16)
    const green = parseInt(hex.slice(3, 5), 16)
    const blue = parseInt(hex.slice(5, 7), 16)
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function rectOfThingWidgetByThingId(graphId: number, thingId: number): DOMRect | null {
    const thingWidget = document.getElementById(`graph#${graphId}-thing#${thingId}`)
    return thingWidget ? thingWidget.getBoundingClientRect() : null
}

export function removeItemFromArray<Type>( array: Type[], item: Type ): void {
    const index = array.indexOf(item)
    if (index !== -1) array.splice(index, 1)
}




export function changeIndexInArray<Type>(array: Type[], currentIndex: number, newIndex: number): Type[] | void {
    if ( newIndex < 0 || array.length <= newIndex ) return
    const newArray = [...array]

    const extractedElement = newArray.splice(currentIndex, 1)[0]
    newArray.splice(newIndex, 0, extractedElement)
    return newArray
}



export function clampNumber(inputValue: number, lowerBound: number, upperBound: number): number {
    const clampedNumber = 
        inputValue < lowerBound ? lowerBound :
        inputValue > upperBound ? upperBound :
        inputValue
    return clampedNumber
}


// Function includes a fallback for case where keys are
// numbers, for legacy support.
export function legacyPerspectiveThingsParse(jsonString: string): {[thingId: string]: string} {
    let output: {[thingId: string]: string} = {}

    try {

        output = JSON.parse(jsonString)

    } catch {
        
        jsonString = jsonString.substring(1, jsonString.length - 1)
        const split = jsonString.split(",")
        for (const s of split) {
            const split2 = s.split(": ")
            const key = split2[0]
            const value = split2[1].substring(1, split2[1].length - 1)
            output[key] = value
        }

    }    
    
    return output
}