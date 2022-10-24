import { writable, get } from "svelte/store"


interface mousePositionRecord {
    position: [number, number]
    timestamp: Date
}

// Mouse position Store.
// Holds the current screen coordinates of the mouse.
const mousePositionStore = writable(
    {
        position: [0, 0],
        timestamp: new Date()
    } as mousePositionRecord
)

// Last mouse position Store.
// Holds the previous screen coordinates of the mouse.
const lastMousePositionStore = writable(
    {
        position: [0, 0],
        timestamp: new Date()
    } as mousePositionRecord
)


export function updateMousePosition( position: [number, number] ): void {
    lastMousePositionStore.set(get(mousePositionStore))
    mousePositionStore.set(
        {
            position: position,
            timestamp: new Date()
        }
    )
}

export function mouseSpeed(): number {
    const currentMousePosition = get(mousePositionStore)
    const lastMousePosition = get(lastMousePositionStore)

    const diagonalDistance = Math.hypot(
        currentMousePosition.position[0] - lastMousePosition.position[0],
        currentMousePosition.position[1] - lastMousePosition.position[1]
    )

    const deltaSeconds = currentMousePosition.timestamp.getTime()/1000 - lastMousePosition.timestamp.getTime()/1000

    const speed = diagonalDistance / deltaSeconds

    return speed
}