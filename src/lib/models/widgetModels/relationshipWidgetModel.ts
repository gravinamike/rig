import type { GenerationMember } from "$lib/models/graphModels"
import type { RelationshipCohortWidgetModel } from "./relationshipCohortWidgetModel"

import { mirroringByHalfAxisId } from "$lib/shared/constants"


export class RelationshipWidgetModel {
    kind = "relationshipWidgetModel" as const

    relationshipCohortWidgetModel: RelationshipCohortWidgetModel
    cohortMemberWithIndex: { index: number, member: GenerationMember }

    constructor(
        relationshipCohortWidgetModel: RelationshipCohortWidgetModel,
        cohortMemberWithIndex: { index: number, member: GenerationMember }
    ) {
        this.relationshipCohortWidgetModel = relationshipCohortWidgetModel
        this.cohortMemberWithIndex = cohortMemberWithIndex
    }

    leafGeometry( scale: number ): { bottom: number, top: number, bottomMidline: number, topMidline: number } {
        if (this.cohortMemberWithIndex.member.kind === "thingBaseWidgetModel") {

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

            return {
                bottom: this.relationshipCohortWidgetModel.relationshipsLength * 1/3,
                top: 0,
                bottomMidline: this.relationshipCohortWidgetModel.defaultLeafMidline(this.cohortMemberWithIndex.index),
                topMidline: this.relationshipCohortWidgetModel.defaultLeafMidline(this.cohortMemberWithIndex.index)
            }

        }
    }

}