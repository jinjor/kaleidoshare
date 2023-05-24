export type Settings = {
  background?: Color;
  generators: Generator[];
};
export type Generator = {
  count: number;
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
export type Length = number | RandomLength;
export type RandomLength = {
  min: number;
  max: number;
};
export type Color = string | string[];
