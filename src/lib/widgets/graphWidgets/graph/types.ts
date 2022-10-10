export interface GraphWidgetStyle {
    excludePerspectiveThing: boolean,
    excludeCartesianAxes: boolean,
    zoom: number,
    zoomPadding: number,
    animateZoomAndScroll: boolean,
    relationDistance: number,
    thingSize: number,
    thingSpacingPercent: number,
    betweenThingSpacing: number,
    betweenThingGap: number,
    betweenThingOverlap: number,
    relationshipTextSize: number,
    thingTextSize: number,
}

/*
 * Default Graph Widget Style.
 */
export const defaultGraphWidgetStyle: GraphWidgetStyle = {
    excludePerspectiveThing: false,
    excludeCartesianAxes: false,
    zoom: 0,
    zoomPadding: 100,
    animateZoomAndScroll: true,
    relationDistance: 250,
    thingSize: 100,
    thingSpacingPercent: 10,
    betweenThingSpacing: 0, // Reactively calculated.
    betweenThingGap: 0, // Reactively calculated.
    betweenThingOverlap: 0, // Reactively calculated.
    relationshipTextSize: 16,
    thingTextSize: 12
}