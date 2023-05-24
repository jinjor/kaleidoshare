export type Settings = {
  background?: Color;
  generators: Generator[];
};
export type Generator = {
  count: Count;
  shape: Shape;
};
export type Shape = Circle | Rectangle;
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
export type Length = FixedLength | RandomLength;
/**
 * @exclusiveMinimum 0
 */
export type FixedLength = number;
export type RandomLength = {
  min: FixedLength;
  max: FixedLength;
};
export type Color = FixedColor | RandomColor;
export type FixedColor = string;
/**
 * @minItems 1
 */
export type RandomColor = string[];
