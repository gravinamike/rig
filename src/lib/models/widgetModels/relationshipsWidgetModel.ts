import type { HalfAxisId } from "$lib/shared/constants"
import type { DirectionDbModel, SpaceDbModel } from "$lib/models/dbModels"
import type { Graph, GenerationMember, Cohort } from "$lib/models/graphModels"
import type { ThingWidgetModel } from "./index"

import {
    halfAxisOppositeIds,
    rotationByHalfAxisId, mirroringByHalfAxisId,
    offsetsByHalfAxisId, relationshipColorByHalfAxisId
} from "$lib/shared/constants"
import { retrieveGraphConstructs } from "$lib/stores"
import { rectOfThingWidgetByThingId } from "$lib/shared/utility"


export class RelationshipsWidgetModel {
    kind = "relationshipsWidgetModel" as const

    cohort: Cohort
    space: SpaceDbModel
    graph: Graph

    parentThingWidgetModel: ThingWidgetModel
    generationId: number
    halfAxisId: HalfAxisId | 0
    directionId: number
    direction: DirectionDbModel
    planeId: number
    rotation: number
    relationshipColor: string

    constructor(cohort: Cohort, space: SpaceDbModel, graph: Graph) {
        this.cohort = cohort
        this.space = space
        this.graph = graph
    
        this.parentThingWidgetModel = this.cohort.address.parentThingWidgetModel as ThingWidgetModel
        this.generationId = cohort.address?.generationId || 0
        this.halfAxisId = cohort.address && cohort.address.halfAxisId ? cohort.address.halfAxisId : 0
        this.directionId = space.directionIdByHalfAxisId[this.halfAxisId] as number
        this.direction = retrieveGraphConstructs("Direction", this.directionId) as DirectionDbModel
        this.planeId = this.cohort.plane?.id || 0
        this.rotation = rotationByHalfAxisId[this.halfAxisId]
        this.relationshipColor = relationshipColorByHalfAxisId[this.halfAxisId]
    }

    
    // Variables related to the x, y, and z position of this Relationships Widget (relative to parent Thing Widget).
    
    get xOffset(): number {
        return 0.5 * this.graph.graphWidgetStyle.relationDistance * offsetsByHalfAxisId[this.halfAxisId][0]
    }

    get yOffset(): number {
        return 0.5 * this.graph.graphWidgetStyle.relationDistance * offsetsByHalfAxisId[this.halfAxisId][1]
    }

    get zIndex(): number {
        return (this.generationId * 2 - 1) * offsetsByHalfAxisId[this.halfAxisId][2]
    }


    /* Variables related to the widths and heights of this Relationships Widget. */

    // The width across all the Relationships in the widget.
    get relationshipsWidth(): number {
        return Math.max(this.cohort.members.length, 1) * (
            [1, 2].includes(this.halfAxisId) ?
                this.parentThingWidgetModel.thingWidth :
                this.parentThingWidgetModel.thingHeight
        ) + (Math.max(this.cohort.members.length, 1) - 1) * this.graph.graphWidgetStyle.betweenThingSpacing
    }

    // The edge-to-edge distance between two related Things.
    get relationshipsLength(): number {
        return this.graph.graphWidgetStyle.relationDistance - ([1, 2].includes(this.halfAxisId) ?
            this.parentThingWidgetModel.thingHeight :
            this.parentThingWidgetModel.thingWidth) * this.cohort.axialElongation
    }


    get widgetWidth(): number {
        return [1, 2].includes(this.halfAxisId) ? this.relationshipsWidth : this.relationshipsLength
    }

    get widgetHeight(): number {
        return [1, 2].includes(this.halfAxisId) ? this.relationshipsLength : this.relationshipsWidth
    }


    get parentRelationshipsWidgetModel(): RelationshipsWidgetModel | null {
        if (this.parentThingWidgetModel.parentThingWidgetModel !== null) {
            const grandParentThingWidgetModel = this.parentThingWidgetModel.parentThingWidgetModel
            const parentThingHalfAxisId = this.parentThingWidgetModel.address.halfAxisId as number
            const parentRelationshipsWidgetModel = grandParentThingWidgetModel.relationshipsWidgetModel(parentThingHalfAxisId)
            return parentRelationshipsWidgetModel
        } else {
            return null
        }
    }


    /* Variables related to the geometries of the Widget's parts. */

    // X and Y offsets to grandparent Thing.
    // This means the distance from left and top edge of the Relationships Widget to the midline of the
    // Thing Widget that would duplicate, or "double back", the grandparent Thing.
    // If the grandparent Thing is not in the related Cohort, the offsets are 0.
    get offsetToGrandparentThing(): number {

        if (this.cohort.indexOfGrandparentThing === null || this.cohort.isInRelationshipsOnlyGeneration) {

            return 0

        } else {

            /* The offset between the Cohort's grandparent Thing if it is represented in the Cohort and the Cohort's parent Thing. */

            // The difference between the index of the grandparent Thing (as represented in the Cohort) and
            // the halfway index of the Cohort.
            const part1 = (
                (this.cohort.members.length - 1) / 2
                - this.cohort.indexOfGrandparentThing
            )
            // The sum of the dimension of one Thing plus the spacing between Things.
            * (
                (
                    [1, 2].includes(this.halfAxisId) ?
                        this.parentThingWidgetModel.thingWidth :
                        this.parentThingWidgetModel.thingHeight
                )
                + this.graph.graphWidgetStyle.betweenThingSpacing
            )

            /* The offset between the Cohort's parent Thing and the Cohort's grandparent Thing. */
            const part2 = (
                this.parentRelationshipsWidgetModel !== null
                && this.halfAxisId !== 0
                && this.parentRelationshipsWidgetModel.halfAxisId === halfAxisOppositeIds[this.halfAxisId] ?
                    (
                        (this.sizeOfThingsAlongWidth + this.graph.graphWidgetStyle.betweenThingSpacing)
                        * this.parentThingWidgetModel.address.indexInCohort
                    ) :
                    0
            )

            const offsetToGrandparentThing = part1 + part2

            return offsetToGrandparentThing

        }

    }

    get xOffsetToGrandparentThing(): number {
        return this.cohort.rowOrColumn() === "row" ?
            this.offsetToGrandparentThing :
            0
    }

    get yOffsetToGrandparentThing(): number {
        return this.cohort.rowOrColumn() === "column" ?
            this.offsetToGrandparentThing :
            0
    }

    get mirroring(): 1 | -1 {
        return mirroringByHalfAxisId[this.halfAxisId]
    }


    // Construct a list of the related Things along with their indices.
    get cohortMembersWithIndices(): { index: number, member: GenerationMember }[] {
        const cohortMembersWithIndices: { index: number, member: GenerationMember }[] = []
        this.cohort.members.forEach(
            (member, index) => cohortMembersWithIndices.push({ index: index, member: member })
        )
        return cohortMembersWithIndices
    }


    


    // Formatting-related variables.
    get distanceFromFocalPlane(): number {
        return this.planeId - this.graph.focalPlaneId
    }
    
    get opacity(): number {
        return 1 / (
            1 + (
                this.distanceFromFocalPlane < 0 ?
                    1 :
                    (
                        this.distanceFromFocalPlane > 0 ?
                            2 :
                            0
                        )
                    ) * Math.abs(this.distanceFromFocalPlane)
        )
    }





    // Variables related to Stem geometry.
    get midline(): number {
        return this.relationshipsWidth * 0.5 - this.offsetToGrandparentThing
    }

    get stemBottom(): number {
        return this.relationshipsLength
    }

    get stemTop(): number {
        return this.relationshipsLength * 2/3
    }




    getOffsetsOfRelatedThing(member: GenerationMember, scale: number): {x: number, y: number} {
        // Get location of parent Thing Widget.
        const parentDomRect = rectOfThingWidgetByThingId(this.graph.id, this.cohort.parentThingId as number)
        const parentRectX = parentDomRect === null ? 0 : parentDomRect.x
        const parentRectY = parentDomRect === null ? 0 : parentDomRect.y

        // Get posisition of related Thing Widget.
        const relatedRect = rectOfThingWidgetByThingId(this.graph.id, member.thingId as number)
        const relatedRectX = relatedRect === null ? 0 : relatedRect.x
        const relatedRectY = relatedRect === null ? 0 : relatedRect.y

        // Get the offset (the difference between the two).
        const offsetLengthX = (relatedRectX - parentRectX) / scale
        const offsetLengthY = (relatedRectY - parentRectY) / scale
        
        return {x: offsetLengthX, y: offsetLengthY}
    }


    get sizeOfThingsAlongWidth(): number {
        return (
            [1, 2].includes(this.halfAxisId) ?
                this.parentThingWidgetModel.thingWidth :
                this.parentThingWidgetModel.thingHeight
        )
    }


    defaultLeafMidline(index: number): number {
        return (
            0.5 * this.sizeOfThingsAlongWidth
            + (this.sizeOfThingsAlongWidth + this.graph.graphWidgetStyle.betweenThingSpacing) * index
        )


        //(this.graph.graphWidgetStyle.thingSize + this.graph.graphWidgetStyle.betweenThingSpacing)
        //* this.cohort.address.parentThingWidgetModel.address.indexInCohort



    }


    leavesGeometries(scale: number): { bottom: number, top: number, bottomMidline: number, topMidline: number }[] {
        const leavesGeometries = this.cohortMembersWithIndices.map(
            memberWithIndex => {

                if (memberWithIndex.member.kind === "thingBaseWidgetModel") {

                    const sizeOfThingsAlongLength = (
                        [1, 2].includes(this.halfAxisId) ?
                            this.parentThingWidgetModel.thingHeight :
                            this.parentThingWidgetModel.thingWidth
                    )

                    const offsetsOfRelatedThing = this.getOffsetsOfRelatedThing(memberWithIndex.member, scale)

                    const offsetAlongLength = [1, 2].includes(this.halfAxisId) ?
                            offsetsOfRelatedThing.y :
                            offsetsOfRelatedThing.x

                    const offsetAlongWidth = [1, 2].includes(this.halfAxisId) ?
                            offsetsOfRelatedThing.x :
                            offsetsOfRelatedThing.y

                    const flip = [1, 2].includes(this.halfAxisId) ?
                            mirroringByHalfAxisId[this.halfAxisId] :
                            -mirroringByHalfAxisId[this.halfAxisId]
                            

                    return {
                        bottom: this.relationshipsLength + 0.5 * sizeOfThingsAlongLength + 0.5 * offsetAlongLength * flip,
                        top: this.relationshipsLength + 0.5 * sizeOfThingsAlongLength + 0.5 * offsetAlongLength * flip,
                        bottomMidline: this.midline + 0.5 * offsetAlongWidth,
                        topMidline: this.midline + 0.5 * offsetAlongWidth
                    }


                } else {

                    return {
                        bottom: this.relationshipsLength * 1/3,
                        top: 0,
                        bottomMidline: this.defaultLeafMidline(memberWithIndex.index),
                        topMidline: this.defaultLeafMidline(memberWithIndex.index)
                    }

                }

            }
        )
        return leavesGeometries
    }

}