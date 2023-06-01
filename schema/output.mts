export type Output = {
  spinner: OutSpinner;
  /**
   * @maxItems 1000
   */
  objects: OutObject[];
};
export type OutSpinner = {
  /**
   * @maxItems 25
   */
  vertices: OutVector[];
};
export type OutVector = {
  x: number;
  y: number;
};
export type OutObject = OutRectangle | OutCircle | OutPolygon;
export type OutRectangle = {
  type: "rectangle";
  width: OutFloat;
  height: OutFloat;
  fill: OutColor;
  stroke: OutColor;
  strokeWidth: OutFloat;
};
export type OutCircle = {
  type: "circle";
  radius: OutFloat;
  fill: OutColor;
  stroke: OutColor;
  strokeWidth: OutFloat;
};
export type OutPolygon = {
  type: "polygon";
  sides: OutInt;
  radius: OutFloat;
  fill: OutColor;
  stroke: OutColor;
  strokeWidth: OutFloat;
};
export type OutInt = number;
export type OutFloat = number | PeriodicNumber;
export type PeriodicNumber = {
  /**
   * @max 30
   */
  frequency: number;
  angle: number;
  offset: OutFloat;
  amplitude: OutFloat;
};
export type OutColor = string | OutRGB | OutHSL;
export type OutRGB = {
  type: "rgb";
  r: OutFloat;
  g: OutFloat;
  b: OutFloat;
};
export type OutHSL = {
  type: "hsl";
  h: OutFloat;
  s: OutFloat;
  l: OutFloat;
};
