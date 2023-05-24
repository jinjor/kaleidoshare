export type Settings = {
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
  color?: Color;
};
export type Rectangle = {
  type: "rectangle";
  width: Length;
  height: Length;
  color?: Color;
};
export type Length = number | RandomLength;
export type RandomLength = {
  min: number;
  max: number;
};
export type Color = string | string[];
