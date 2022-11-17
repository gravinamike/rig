import type { Thing } from "$lib/models/constructModels"


export interface HistoryEntryWithThing {
    timestamp: Date,
    thingId: number,
    thing: Thing | null
}

export interface DateDivider {
    timestamp: Date
}


function addDaysToDate(date: Date, days: number): Date {
    const newDate = new Date(date.getTime())
    newDate.setDate(date.getDate() + days)
    return newDate
}

function endOfDay(inputDate: Date): Date {
    const newDate = new Date(inputDate.getTime())
    newDate.setHours(23, 59, 59)
    return newDate
}

export function getDatesBetweenTwoDates(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = []
    let currentDate = startDate
    while (currentDate <= endDate) {
        dates.push(endOfDay(currentDate))
        currentDate = addDaysToDate(currentDate, 1)
    }
    return dates
}