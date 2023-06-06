export function elementUnderTouchEvent(event: TouchEvent): Element | null {
    const clientX = event.changedTouches.item(0)?.clientX || null
    const clientY = event.changedTouches.item(0)?.clientY || null

    const elementUnderTouchEvent = clientX && clientY ? document.elementFromPoint(clientX, clientY): null

    return elementUnderTouchEvent
}