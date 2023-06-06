// GitHub と同じルール
/**
 * @minLength 1
 * @maxLength 39
 * @pattern ^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$
 */
export type UserName = string;
export type User = {
  name: string;
};

/**
 * @minimum 0
 * @maximum 100
 * @asType integer
 */
export type FixedCount = number;
/**
 * @minimum -10
 * @maximum 10
 */
export type FixedWeight = number;
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
export type Angle = CanBeRandom<FixedDegree>;
export type PeriodicValue<T> = {
  frequency: Frequency;
  angle?: Angle;
  offset: T;
  amplitude: T;
};
export type CanBePeriodic<T> = T | PeriodicValue<T>;

export type Count = CanBeRandom<FixedCount>;
export type Weight = CanBePeriodic<CanBeRandom<FixedWeight>>;
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
};
export type Rectangle = {
  type: "rectangle";
  width: Length;
  height: Length;
};
export type Polygon = {
  type: "polygon";
  radius: Length;
  sides: Count;
};
export type Shape = Circle | Rectangle | Polygon;
export type Object = {
  count: Count;
  shape: Shape;
  fill?: Color;
  stroke?: Color;
  strokeWidth?: Length;
  weight?: Weight;
};
export type Settings = {
  background?: string; // TODO: Color にしたい
  /**
   * @maxItems 10
   */
  objects: Object[];
};

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
export type OutObject = {
  shape: OutShape;
  fill: OutColor;
  stroke: OutColor;
  strokeWidth: OutFloat;
  weight: OutFloat;
};
export type OutShape = OutRectangle | OutCircle | OutPolygon;
export type OutRectangle = {
  type: "rectangle";
  width: OutFloat;
  height: OutFloat;
};
export type OutCircle = {
  type: "circle";
  radius: OutFloat;
};
export type OutPolygon = {
  type: "polygon";
  sides: OutInt;
  radius: OutFloat;
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
/**
 * @maxLength 1000000
 */
export type Image = string;
export type Content = {
  id: string;
  author: string;
  settings: Settings;
  output: Output;
  image: Image;
  createdAt: string;
  updatedAt: string;
};
