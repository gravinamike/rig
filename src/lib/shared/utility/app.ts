/**
 * On-mobile flag method.
 * 
 * Indicates whether the app is being viewed on a mobile device.
 * @returns - True if the app is being viewed on a mobile device, otherwise false.
 */
export function onMobile(): boolean {
    if (typeof navigator === "undefined") return false
    const onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    return onMobile
}

/**
 * Sleep method.
 * 
 * Is used to wait a predefined number of milliseconds before continuing, if
 * called with `await`.
 * @param time - The number of milliseconds to wait.
 */
export function sleep(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time))
}