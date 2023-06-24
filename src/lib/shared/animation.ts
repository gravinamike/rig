/**
 * Scroll-element-to-element method.
 * 
 * Smooth-scrolls one element to center another element that is its
 * descendant. Unlike the native element.scrollTo() method, this method
 * allows the duration of scrolling to be modified.
 * @param scrollingElement - The element to scroll.
 * @param targetElement - The element to center by scrolling.
 * @param duration - How long the scroll should last, in milliseconds.
 */
export async function scrollElementToElement(
    scrollingElement: Element,
    targetElement: Element,
    duration=1000
): Promise< void > {
    // Get center coordinates of the scrolling element and the target element.
    const [scrollingElementX, scrollingElementY] = getElementCenterPosition(scrollingElement)
    const [targetElementX, targetElementY] = getElementCenterPosition(targetElement)

    // Calculate the x and y components of the translation that must happen to
    // center the scrolling element on the target element.
    const xChange = targetElementX - scrollingElementX
    const yChange = targetElementY - scrollingElementY

    // Get the starting time and coordinates of the scroll.
    let startTime: number
    const startScrollLeft = scrollingElement.scrollLeft
    const startScrollTop = scrollingElement.scrollTop
    
    // Recursively call the scroll-element-by-distance-over-duration method
    // until the scroll is complete.
    requestAnimationFrame( function(timestamp: number){
        // If the browser doesn't supply a timestamp to the
        // requestAnimationFrame() method, get one.
        startTime = timestamp || new Date().getTime()
        const currentTime = timestamp || new Date().getTime()

        // Call the scroll-element-by-distance-over-duration method.
        scrollElementByDistanceOverDuration(
            scrollingElement,
            startTime,
            currentTime,
            startScrollLeft,
            startScrollTop,
            xChange,
            yChange,
            duration
        )
    } )
}

/**
 * Get-element-center-position method.
 * 
 * Get the x and y screen coordinates of the center of the specified element.
 */
function getElementCenterPosition(element: Element): [number, number] {
    const boundingRect = element.getBoundingClientRect()
    const x = (boundingRect.left + boundingRect.right) / 2
    const y = (boundingRect.top + boundingRect.bottom) / 2
    return [x, y]
}

/**
 * Scroll-element-by-distance-over-duration method.
 * 
 * Scroll an element an X and Y distance over a specified duration.
 * @param scrollingElement - The element to scroll.
 * @param startTime - The start time of the scroll.
 * @param currentTime - The time when this method is called.
 * @param startScrollLeft - The starting horizontal scroll position of the element.
 * @param startScrollTop - The starting vertical scroll position of the element.
 * @param distanceX - The horizontal distance to scroll, in pixels.
 * @param distanceY - The vertical distance to scroll, in pixels.
 * @param duration - How long the scroll should last, in milliseconds.
 */
function scrollElementByDistanceOverDuration(
    scrollingElement: Element,
    startTime: number,
    currentTime: number,
    startScrollLeft: number,
    startScrollTop: number,
    distanceX: number,
    distanceY: number,
    duration: number
){
    // If the browser doesn't supply a timestamp to the
    // requestAnimationFrame() method, get one.
    currentTime = currentTime || new Date().getTime()

    // Get the total time elapsed since the start of the scroll.
    const timeElapsed = currentTime - startTime

    // Get the progress towards completing the scroll as a ratio of the time
    // elapsed and the total duration.
    const progress = timeElapsed / duration
    const easedProgress = cubicEasing(progress)

    // Set the element's scroll position.
    scrollingElement.scrollLeft = startScrollLeft + distanceX * easedProgress
    scrollingElement.scrollTop = startScrollTop + distanceY * easedProgress

    // If the duration hasn't completed yet, call the method again recursively.
    if (timeElapsed < duration){
        requestAnimationFrame(function(timestamp: number){
            // If the browser doesn't supply a timestamp to the
            // requestAnimationFrame() method, get one.
            const currentTime = timestamp || new Date().getTime()

            // Call the method.
            scrollElementByDistanceOverDuration(
                scrollingElement,
                startTime,
                currentTime,
                startScrollLeft,
                startScrollTop,
                distanceX,
                distanceY,
                duration
            )
        })
    }
}

/**
 * Quart-easing function.
 * 
 * Smooths out the start and end of an animated transition according to a
 * cubic function.
 * @param progress - The proportion of the time elapsed to the total time of the transition.
 * @returns - A smoothed version of the progress.
 */
function cubicEasing(progress: number) {
    progress = progress * 2
    if (progress < 1) return progress ** 3 / 2
    progress = progress - 2
    return (progress ** 3 + 2) / 2
}