import type { GenerationMember } from "$lib/models/graphModels"


export function getCohortMembersWithIndices(members: GenerationMember[]): { index: number, member: GenerationMember }[] {
    const cohortMembersWithIndices: { index: number, member: GenerationMember }[] = []
    members.forEach(
        (member, index) => cohortMembersWithIndices.push({ index: index, member: member })
    )
    return cohortMembersWithIndices
}

export function rectOfThingWidgetByThingId(graphId: number, thingId: number): DOMRect | null {
    const thingWidget = document.getElementById(`graph#${graphId}-thing#${thingId}`)
    return thingWidget ? thingWidget.getBoundingClientRect() : null
}