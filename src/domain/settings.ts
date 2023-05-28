// TODO: ジェネリクスにしたら JSON Schema 生成がさらにキツくなるだろうか
export type Settings = {
  background?: string; // TODO: Color にしたい
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
 * @minimum 0
 * @exclusiveMinimum true
 * @asType integer
 */
export type FixedCount = number;
export type RandomCount = {
  min: FixedCount;
  max: FixedCount;
};
export type Length = FixedLength | PeriodicLength | RandomLength;
/**
 * @minimum 0
 * @exclusiveMinimum true
 */
export type FixedLength = number;
export type PeriodicLength = {
  frequency: Frequency;
  // TODO: angle 指定したいかも
  offset: FixedLength | RandomLength;
  amplitude: FixedLength | RandomLength;
};
export type Frequency = FixedFrequency | RandomFrequency;
/**
 * @minimum 0
 * @exclusiveMinimum true
 * @maximum 30
 */
export type FixedFrequency = number;
export type RandomFrequency = {
  min: FixedFrequency;
  max: FixedFrequency;
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
export type Byte = FixedByte | PeriodicByte | RandomByte;
/**
 * @mininum 0
 * @maximum 255
 * @asType integer
 */
export type FixedByte = number;
export type PeriodicByte = {
  frequency: Frequency;
  offset: FixedByte | RandomByte;
  amplitude: FixedByte | RandomByte;
};
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
export type Degree = FixedDegree | PeriodicDegree | RandomDegree;
export type FixedDegree = number;
export type PeriodicDegree = {
  frequency: Frequency;
  offset: FixedDegree | RandomDegree;
  amplitude: FixedDegree | RandomDegree;
};
export type RandomDegree = {
  min: FixedDegree;
  max: FixedDegree;
};
export type Percent = FixedPercent | PeriodicPercent | RandomPercent;
/**
 * @minimum 0
 * @maximum 100
 */
export type FixedPercent = number;
export type PeriodicPercent = {
  frequency: Frequency;
  offset: FixedPercent | RandomPercent;
  amplitude: FixedPercent | RandomPercent;
};
export type RandomPercent = {
  min: FixedPercent;
  max: FixedPercent;
};
/**
 * @minItems 1
 */
export type RandomEnumColor = SingleColor[];
