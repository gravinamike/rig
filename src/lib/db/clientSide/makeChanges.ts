export async function createNewRelatedThing(thingIdToRelateFrom: number, directionId: number, text: string): Promise<boolean> {
    const res = await fetch(
        `api/graphManipulation/createNewRelatedThing`,
        {
            method: "POST",
            body: JSON.stringify({
                thingIdToRelateFrom: thingIdToRelateFrom,
                directionId: directionId,
                text: text
            })
        }
    )

    // If the response is ok,
    if (res.ok) {
        return true

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

export async function deleteThing(thingIdToDelete: number): Promise<boolean> {
    const res = await fetch(
        `api/graphManipulation/deleteThing`,
        {
            method: "POST",
            body: JSON.stringify({
                thingIdToDelete: thingIdToDelete
            })
        }
    )

    // If the response is ok,
    if (res.ok) {
        return true

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}