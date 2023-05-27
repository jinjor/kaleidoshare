import { Body, Bodies } from "matter-js";
import {
  Byte,
  Color,
  Count,
  Degree,
  Frequency,
  Length,
  Percent,
  Settings,
  Shape,
} from "./settings";
import {
  OutCircle,
  OutColor,
  OutFloat,
  OutPolygon,
  OutRectangle,
  OutShape,
} from "./output";

export function generateSpinner(options: {
  size: number;
  spinnerRadiusRatio: number;
}): Body {
  const { size, spinnerRadiusRatio } = options;
  const spinnerRadius = size * spinnerRadiusRatio;
  return Bodies.fromVertices(
    0,
    0,
    [
      [
        posFromAngle((Math.PI / 6) * 1, spinnerRadius * 1.3),
        posFromAngle((Math.PI / 6) * 5, spinnerRadius * 1.3),
        posFromAngle((Math.PI / 6) * 9, spinnerRadius * 1.3),
        posFromAngle((Math.PI / 6) * 0.999, spinnerRadius * 1.3),
        posFromAngle((Math.PI / 6) * 0.999, spinnerRadius),
        posFromAngle((Math.PI / 6) * 9, spinnerRadius),
        posFromAngle((Math.PI / 6) * 5, spinnerRadius),
        posFromAngle((Math.PI / 6) * 1, spinnerRadius),
      ],
    ],
    {
      isStatic: true,
      render: { fillStyle: "#eea" },
    }
  );
}
export function generateObjects(settings: Settings): OutShape[] {
  const objects: OutShape[] = [];
  for (const generator of settings.generators) {
    for (let i = 0; i < generateInt(generator.count); i++) {
      objects.push(generateShape(generator.shape));
    }
  }
  objects.sort(() => Math.random() - 0.5);
  return objects;
}
function generateShape(shape: Shape): OutShape {
  if (shape.type === "circle") {
    const circle: OutCircle = {
      type: "circle",
      radius: generateLength(shape.radius),
      fill: shape.fill != null ? generateColor(shape.fill) : "transparent",
      stroke:
        shape.stroke != null ? generateColor(shape.stroke) : "transparent",
      strokeWidth:
        shape.strokeWidth != null ? generateLength(shape.strokeWidth) : 0,
    };
    return circle;
  } else if (shape.type === "rectangle") {
    const rectangle: OutRectangle = {
      type: "rectangle",
      width: generateLength(shape.width),
      height: generateLength(shape.height),
      fill: shape.fill != null ? generateColor(shape.fill) : "transparent",
      stroke:
        shape.stroke != null ? generateColor(shape.stroke) : "transparent",
      strokeWidth:
        shape.strokeWidth != null ? generateLength(shape.strokeWidth) : 0,
    };
    return rectangle;
  } else {
    const polygon: OutPolygon = {
      type: "polygon",
      sides: generateInt(shape.sides),
      radius: generateLength(shape.radius),
      fill: shape.fill != null ? generateColor(shape.fill) : "transparent",
      stroke:
        shape.stroke != null ? generateColor(shape.stroke) : "transparent",
      strokeWidth:
        shape.strokeWidth != null ? generateLength(shape.strokeWidth) : 0,
    };
    return polygon;
  }
}
function generateInt(int: Count | Byte | Degree | Percent): number {
  if (typeof int === "number") {
    return int;
  } else {
    return randomInt(int.min, int.max);
  }
}
function generateLength(length: Length): OutFloat {
  if (typeof length === "number") {
    return length;
  } else if ("frequency" in length) {
    return {
      frequency: generateFrequency(length.frequency),
      angle: randomFloat(0, Math.PI * 2),
      offset: generateLength(length.offset),
      amplitude: generateLength(length.amplitude),
    };
  } else {
    return randomFloat(length.min, length.max);
  }
}
function generateFrequency(frequency: Frequency): number {
  if (typeof frequency === "number") {
    return frequency;
  } else {
    return randomFloat(frequency.min, frequency.max);
  }
}
// TODO: OutColor
export function generateColor(color: Color): string {
  if (typeof color === "string") {
    return color;
  } else if (Array.isArray(color)) {
    return generateColor(color[Math.floor(Math.random() * color.length)]);
  } else if (color.type === "rgb") {
    return `rgb(${generateInt(color.r)},${generateInt(color.g)},${generateInt(
      color.b
    )})`;
  } else if (color.type === "hsl") {
    return `hsl(${generateInt(color.h)}deg,${generateInt(
      color.s
    )}%,${generateInt(color.l)}%)`;
  } else {
    return `rgb(${Math.floor(Math.random() * 256)},${Math.floor(
      Math.random() * 256
    )},${Math.floor(Math.random() * 256)})`;
  }
}
function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function posFromAngle(angle, radius) {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}
