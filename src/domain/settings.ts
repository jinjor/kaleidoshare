/**
 * @exclusiveMinimum 0
 * @maximum 500
 * @asType integer
 */
export type FixedCount = number;
/**
 * @exclusiveMinimum 0
 * @maximum 30
 */
export type FixedFrequency = number;
/**
 * @exclusiveMinimum 0
 */
export type FixedLength = number;
/**
 * @mininum 0
 * @maximum 255
 * @asType integer
 */
export type FixedByte = number;
export type FixedDegree = number;
/**
 * @minimum 0
 * @maximum 100
 */
export type FixedPercent = number;

/**
 * @minItems 1
 * @maxItems 500
 */
export type EnumValue<T> = T[];
export type RandomValue<T> = {
  min: T;
  max: T;
};
export type CanBeRandom<T> = T | RandomValue<T>;

export type Frequency = CanBeRandom<FixedFrequency>;
export type PeriodicValue<T> = {
  frequency: Frequency;
  // TODO: angle 指定したいかも
  offset: T;
  amplitude: T;
};
export type CanBePeriodic<T> = T | PeriodicValue<T>;

export type Count = CanBeRandom<FixedCount>;
export type Length = CanBePeriodic<CanBeRandom<FixedLength>>;
export type Byte = CanBePeriodic<CanBeRandom<FixedByte>>;
export type RGB = {
  type: "rgb";
  r: Byte;
  g: Byte;
  b: Byte;
};
export type Degree = CanBePeriodic<CanBeRandom<FixedDegree>>;
export type Percent = CanBePeriodic<CanBeRandom<FixedPercent>>;
export type HSL = {
  type: "hsl";
  h: Degree;
  s: Percent;
  l: Percent;
};
export type SingleColor = string | RGB | HSL;
export type Color = SingleColor | EnumValue<SingleColor>;

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
export type Shape = Circle | Rectangle | Polygon;

export type Object = {
  count: Count;
  shape: Shape;
};
export type Settings = {
  background?: string; // TODO: Color にしたい
  /**
   * @maxItems 100
   */
  objects: Object[];
};
