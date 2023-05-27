export type OutShape = OutRectangle | OutCircle | OutPolygon;
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
  frequency: number;
  angle: number;
  offset: number;
  amplitude: number;
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
