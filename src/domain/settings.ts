export type Settings = {
  background?: Color;
  generators: Generator[];
};
export type Generator = {
  count: Count;
  shape: Shape;
};
export type Shape = Circle | Rectangle | Polygon;
export type Circle = {
  type: "circle";
  radius: Length;
  fill?: Color;
  stroke?: Color;
  strokeWidth?: Length;
};
export type Rectangle = {
  type: "rectangle";
  width: Length;
  height: Length;
  fill?: Color;
  stroke?: Color;
  strokeWidth?: Length;
};
export type Polygon = {
  type: "polygon";
  radius: Length;
  sides: Count;
  fill?: Color;
  stroke?: Color;
  strokeWidth?: Length;
};
export type Count = FixedCount | RandomCount;
/**
 * @exclusiveMinimum 0
 * @TJS-type integer
 */
export type FixedCount = number;
export type RandomCount = {
  min: FixedCount;
  max: FixedCount;
};
export type Length = FixedLength | PeriodicLength | RandomLength;
/**
 * @exclusiveMinimum 0
 */
export type FixedLength = number;
export type PeriodicLength = {
  /**
   * @minimum 0 // TODO: exclusive
   * @maximum 30
   */
  frequency: number; // TODO: fixed or random
  offset: FixedLength; // TODO: Length?
  amplitude: FixedLength; // TODO: Length?
};
export type RandomLength = {
  min: FixedLength;
  max: FixedLength;
};
export type Color = SingleColor | RandomEnumColor;
export type SingleColor = string | RGB | HSL;

export type RGB = {
  type: "rgb";
  r: Byte;
  g: Byte;
  b: Byte;
};
export type Byte = FixedByte | RandomByte;
/**
 * @mininum 0
 * @maximum 255
 * @TJS-type integer
 */
export type FixedByte = number;
export type RandomByte = {
  min: FixedByte;
  max: FixedByte;
};
export type HSL = {
  type: "hsl";
  h: Degree;
  s: Percent;
  l: Percent;
};
export type Degree = FixedDegree | RandomDegree;
export type FixedDegree = number;
export type RandomDegree = {
  min: FixedDegree;
  max: FixedDegree;
};
export type Percent = FixedPercent | RandomPercent;
/**
 * @minimum 0
 * @maximum 100
 */
export type FixedPercent = number;
export type RandomPercent = {
  min: FixedPercent;
  max: FixedPercent;
};
/**
 * @minItems 1
 */
export type RandomEnumColor = SingleColor[];
