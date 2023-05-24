import { Body, Bodies } from "matter-js";
import { Color, Length, Settings, Shape } from "./settings";

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
export function generateObjects(options: {
  size: number;
  settings: Settings;
}): Body[] {
  const { size, settings } = options;
  const objects: Body[] = [];
  for (const generator of settings.generators) {
    for (let i = 0; i < generator.count; i++) {
      objects.push(generateShape(generator.shape, size));
    }
  }
  return objects;
}
function generateShape(shape: Shape, size: number): Body {
  const options = {
    render: {
      fillStyle: shape.fill != null ? generateColor(shape.fill) : "transparent",
      strokeStyle:
        shape.stroke != null ? generateColor(shape.stroke) : undefined,
      lineWidth:
        shape.strokeWidth != null
          ? generateLength(shape.strokeWidth) * size
          : undefined,
    },
  };
  if (shape.type === "circle") {
    return Bodies.circle(0, 0, generateLength(shape.radius) * size, options);
  } else {
    return Bodies.rectangle(
      0,
      0,
      generateLength(shape.width) * size,
      generateLength(shape.height) * size,
      options
    );
  }
}
function generateLength(length: Length): number {
  if (typeof length === "number") {
    return length;
  } else {
    return length.min + Math.random() * (length.max - length.min);
  }
}
export function generateColor(color: Color): string {
  if (typeof color === "string") {
    return color;
  } else {
    return color[Math.floor(Math.random() * color.length)];
  }
}

function posFromAngle(angle, radius) {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}
