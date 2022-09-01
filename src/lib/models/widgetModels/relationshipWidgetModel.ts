import type { GenerationMember } from "$lib/models/graphModels"
import type { RelationshipCohortWidgetModel } from "./relationshipCohortWidgetModel"

import { mirroringByHalfAxisId } from "$lib/shared/constants"


/* Model specifying a Relationship Widget. */
export class RelationshipWidgetModel {
    kind = "relationshipWidgetModel" as const

    relationshipCohortWidgetModel: RelationshipCohortWidgetModel
    cohortMemberWithIndex: { index: number, member: GenerationMember }

    /**
     * Create a Relationship Widget Model.
     * @param {RelationshipCohortWidgetModel} relationshipCohortWidgetModel - The model specifying the Relationship's cohort.
     * @param {Object} cohortMemberWithIndex - Object referencing the Relationship and its index in the cohort.
     */
    constructor(
        relationshipCohortWidgetModel: RelationshipCohortWidgetModel,
        cohortMemberWithIndex: { index: number, member: GenerationMember }
    ) {
        this.relationshipCohortWidgetModel = relationshipCohortWidgetModel
        this.cohortMemberWithIndex = cohortMemberWithIndex
    }

    /**
     * Get geometry of the leaf.
     * @param {number} scale - The Relationship's index in the cohort.
     * 
     * @return {Object} - Object specifying the leaf's geometry.
     */
    leafGeometry( scale: number ): { bottom: number, top: number, bottomMidline: number, topMidline: number } {
        if (this.cohortMemberWithIndex.member === null) {

            const sizeOfThingsAlongLength = (
                [1, 2].includes(this.relationshipCohortWidgetModel.halfAxisId) ?
                    this.relationshipCohortWidgetModel.parentThingWidgetModel.thingHeight :
                    this.relationshipCohortWidgetModel.parentThingWidgetModel.thingWidth
            )

            const offsetsOfRelatedThing = this.relationshipCohortWidgetModel.getOffsetsOfRelatedThing(this.cohortMemberWithIndex.member, scale)

            const offsetAlongLength = [1, 2].includes(this.relationshipCohortWidgetModel.halfAxisId) ?
                    offsetsOfRelatedThing.y :
                    offsetsOfRelatedThing.x

            const offsetAlongWidth = [1, 2].includes(this.relationshipCohortWidgetModel.halfAxisId) ?
                    offsetsOfRelatedThing.x :
                    offsetsOfRelatedThing.y

            const flip = [1, 2].includes(this.relationshipCohortWidgetModel.halfAxisId) ?
                    mirroringByHalfAxisId[this.relationshipCohortWidgetModel.halfAxisId] :
                    -mirroringByHalfAxisId[this.relationshipCohortWidgetModel.halfAxisId]
                    

            return {
                bottom: this.relationshipCohortWidgetModel.relationshipsLength + 0.5 * sizeOfThingsAlongLength + 0.5 * offsetAlongLength * flip,
                top: this.relationshipCohortWidgetModel.relationshipsLength + 0.5 * sizeOfThingsAlongLength + 0.5 * offsetAlongLength * flip,
                bottomMidline: this.relationshipCohortWidgetModel.midline + 0.5 * offsetAlongWidth,
                topMidline: this.relationshipCohortWidgetModel.midline + 0.5 * offsetAlongWidth
            }


        } else {

            const defaultLeafMidline = (
                0.5 * this.relationshipCohortWidgetModel.sizeOfThingsAlongWidth
                + (this.relationshipCohortWidgetModel.sizeOfThingsAlongWidth + this.relationshipCohortWidgetModel.graphWidgetModel.graphWidgetStyle.betweenThingSpacing) * this.cohortMemberWithIndex.index
            )

            return {
                bottom: this.relationshipCohortWidgetModel.relationshipsLength * 1/3,
                top: 0,
                bottomMidline: defaultLeafMidline,
                topMidline: defaultLeafMidline
            }

        }
    }
}