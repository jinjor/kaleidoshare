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
  OutCircle,
  OutColor,
  OutFloat,
  OutPolygon,
  OutRectangle,
  OutObject,
  Output,
  OutSpinner,
  Angle,
  OutShape,
  Object,
  Spinner,
  OutVector,
  Sides,
} from "../../schema/schema.js";

export function generate(settings: Settings): Output {
  const spinner = generateSpinner(settings.spinner);
  const objects = generateObjects(settings.objects);
  return {
    spinner,
    objects,
  };
}

function generateSpinner(spinner: Spinner | undefined): OutSpinner {
  const vertices: OutVector[] = [];
  const sides = generateInt(spinner?.sides ?? 6);
  const angle = (Math.PI * 2) / sides;
  const radius = 0.5 / Math.cos(angle / 2);
  const outerRadius = radius * 1.3;
  for (let i = 0; i < sides; i++) {
    vertices.push(posFromAngle(angle * i, outerRadius));
  }
  vertices.push(posFromAngle(-0.001, outerRadius));
  vertices.push(posFromAngle(-0.001, radius));
  for (let i = sides - 1; i >= 0; i--) {
    vertices.push(posFromAngle(angle * i, radius));
  }
  return {
    speed: spinner?.speed != null ? generateFrequency(spinner.speed) : 0.1,
    vertices,
  };
}
function generateObjects(objects: Object[]): OutObject[] {
  const out: OutObject[] = [];
  for (const object of objects) {
    for (let i = 0; i < generateInt(object.count); i++) {
      out.push(generateObject(object));
    }
  }
  out.sort(() => Math.random() - 0.5);
  return out;
}
function generateObject(object: Object): OutObject {
  const shape = generateShape(object.shape);
  const fill = object.fill != null ? generateColor(object.fill) : "transparent";
  const stroke =
    object.stroke != null ? generateColor(object.stroke) : "transparent";
  const strokeWidth =
    object.strokeWidth != null ? generateFloat(object.strokeWidth) : 0;
  const weight = object.weight != null ? generateFloat(object.weight) : 1;
  return { shape, fill, stroke, strokeWidth, weight };
}
function generateShape(shape: Shape): OutShape {
  if (shape.type === "circle") {
    const circle: OutCircle = {
      type: "circle",
      radius: generateFloat(shape.radius),
    };
    return circle;
  } else if (shape.type === "rectangle") {
    const rectangle: OutRectangle = {
      type: "rectangle",
      width: generateFloat(shape.width),
      height: generateFloat(shape.height),
    };
    return rectangle;
  } else {
    const polygon: OutPolygon = {
      type: "polygon",
      sides: generateInt(shape.sides),
      radius: generateFloat(shape.radius),
    };
    return polygon;
  }
}
function generateInt(value: Count | Sides): number {
  if (typeof value === "number") {
    return value;
  } else {
    return randomInt(value.min, value.max);
  }
}
function generateFloat(value: Length | Byte | Degree | Percent): OutFloat {
  if (typeof value === "number") {
    return value;
  } else if ("frequency" in value) {
    return {
      frequency: generateFrequency(value.frequency),
      angle: generateAngle(value.angle),
      offset: generateFloat(value.offset),
      amplitude: generateFloat(value.amplitude),
    };
  } else {
    return randomFloat(value.min, value.max);
  }
}
function generateFrequency(frequency: Frequency): number {
  if (typeof frequency === "number") {
    return frequency;
  } else {
    return randomFloat(frequency.min, frequency.max);
  }
}
function generateAngle(angle: Angle | undefined): number {
  if (angle == null) {
    return randomFloat(0, Math.PI * 2);
  } else if (typeof angle === "number") {
    return angle * ((2 * Math.PI) / 360);
  } else {
    return randomFloat(angle.min, angle.max) * ((2 * Math.PI) / 360);
  }
}
export function generateColor(color: Color): OutColor {
  if (typeof color === "string") {
    return color;
  } else if (Array.isArray(color)) {
    return generateColor(color[Math.floor(Math.random() * color.length)]);
  } else if (color.type === "rgb") {
    return {
      type: "rgb",
      r: generateFloat(color.r),
      g: generateFloat(color.g),
      b: generateFloat(color.b),
    };
  } else if (color.type === "hsl") {
    return {
      type: "hsl",
      h: generateFloat(color.h),
      s: generateFloat(color.s),
      l: generateFloat(color.l),
    };
  } else {
    return {
      type: "rgb",
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
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
