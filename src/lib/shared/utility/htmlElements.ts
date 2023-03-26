/**
 * Class representing a rectangle.
 */
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

/**
 * Descendant-elements method.
 * 
 * Retrieves an array of all the HTML elements that are descended from a given
 * HTML element.
 * @param element - The HTML element from which to determine descendants.
 * @param descendants - A pre-existing list of descendants to add to, to allow the method to work recursively.
 * @returns - An array of elements that are descended from the element.
 */
export function descendantElements(
    element: Element,
    excludeSubGraphChildren: boolean,
    descendants?: Element[]
): Element[] {
    // If the children of sub-Graphs (such as in the off-axis-relations widget)
    // are to be excluded, and the element is such a widget, return an empty
    // array.
    if (
        excludeSubGraphChildren
        && typeof element.className === "string"
        && element.className.includes("off-axis-relations-widget")
    ) {
        return []
    }

    // Start from an empty array if this is the top-level call, otherwise start
    // from the array that was passed into the function.
    if ( descendants === undefined ) descendants = []

    // Add all the element's children, and (recursively), all *their* children,
    // and so on.
    for (let i = 0; i < element.children.length; i++) {
        descendants.push(element.children[i])
        descendantElements(element.children[i], true, descendants)
    }

    // Return the array of descendants.
    return descendants
}

/**
 * Element-group-edges method.
 * 
 * Provides the edge coordinates of the bounding rectangle that surrounds a group of HTML elements.
 * @param elementGroup - The group of elements that you need bounding-rectangle edges for.
 * @returns - An object containing rop, right, bottom and left edge coordinates.
 */
export function elementGroupEdges(elementGroup: Element[]): {top: number, right: number, bottom: number, left: number} {
    // Initialize an object of edges with default values of 0.
    const edges = {top: 0, right: 0, bottom: 0, left: 0}

    // If there are any elements in the group, push out the edges to include
    // them.
    if (elementGroup.length) {
        edges.top = Math.min( ...elementGroup.map((element) => {return element.getBoundingClientRect().top}) )
        edges.right = Math.max( ...elementGroup.map((element) => {return element.getBoundingClientRect().right}) )
        edges.bottom = Math.max( ...elementGroup.map((element) => {return element.getBoundingClientRect().bottom}) )
        edges.left = Math.min( ...elementGroup.map((element) => {return element.getBoundingClientRect().left}) )
    }

    // Return the object of edges.
    return edges
}

/**
 * Rectangle-of-Thing-widget-by-Thing-ID method.
 * 
 * Returns the bounding rectangle for a specific Thing widget (or null if no
 * such widget exists for the provided Graph and Thing ID).
 * @param graphId - The Graph that the Thing is in.
 * @param thingId - The ID of the Thing the widget represents.
 * @returns - The bounding rectangle of the Thing widget (or null if none).
 */
export function rectOfThingWidgetByThingId(graphId: number, thingId: number): DOMRect | null {
    const thingWidget = document.getElementById(`graph#${graphId}-thing#${thingId}`)
    return thingWidget ? thingWidget.getBoundingClientRect() : null
}