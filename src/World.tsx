import React, { useEffect, useRef } from "react";

import {
  Engine,
  Render,
  Runner,
  Body,
  Bodies,
  Composite,
  Common,
} from "matter-js";

import decomp from "poly-decomp";

Common.setDecomp(decomp);

type World = {
  rotate: () => void;
  getImageURL: () => string;
};
export type WorldOptions = {
  size: number;
  spinnerRadiusRatio: number;
  clipRadiusRatio: number;
  settings: Settings;
};
export type Settings = {
  generators: Generator[];
};
type Generator = {
  count: number;
  shape: Shape;
};
type Shape = Circle | Rectangle;
type Circle = {
  type: "circle";
  radius: Length;
  color?: Color;
};
type Rectangle = {
  type: "rectangle";
  width: Length;
  height: Length;
  color?: Color;
};
type Length = number | RandomLength;
type RandomLength = {
  min: number;
  max: number;
};
type Color = string | string[];

const World = React.memo(function World(props: {
  options: WorldOptions;
  hidden: boolean;
  onReady: (world: World) => void;
}) {
  const { options, hidden, onReady } = props;

  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const worldElement = worldRef.current!;
    const { render, runner, rotate, getImageURL } = setupWorld(
      worldElement,
      options
    );
    onReady({ rotate, getImageURL });
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      worldElement.innerHTML = "";
    };
  }, [options]);

  return (
    <div
      style={{
        width: options.size,
        height: options.size,
        display: hidden ? "none" : undefined,
      }}
      ref={worldRef}
    ></div>
  );
});
export default World;

function setupWorld(element: HTMLElement, options: WorldOptions) {
  const { size, spinnerRadiusRatio, clipRadiusRatio } = options;

  const spinnerRadius = size * spinnerRadiusRatio;
  const clipRadius = size * clipRadiusRatio;

  const engine = Engine.create();
  const render = Render.create({
    element,
    engine: engine,
    options: {
      width: size,
      height: size,
      wireframes: false,
    },
  });
  const spinner = generateSpinner(options);
  const objects = generateObjects(options);
  Composite.add(engine.world, objects);
  Composite.add(engine.world, [spinner]);

  Render.run(render);
  Render.lookAt(render, {
    min: { x: -spinnerRadius, y: -spinnerRadius },
    max: { x: spinnerRadius, y: spinnerRadius },
  });
  const runner = Runner.create();
  Runner.run(runner, engine);

  return {
    render,
    runner,
    rotate: () => {
      Body.rotate(spinner, 0.02);
    },
    getImageURL: () => {
      const ctx = render.context;
      const imageData = ctx.getImageData(
        size / 2 - clipRadius,
        size / 2 - clipRadius,
        clipRadius * 2,
        clipRadius * 2
      );
      const canvas = document.createElement("canvas");
      canvas.width = clipRadius * 2;
      canvas.height = clipRadius * 2;
      const ctx2 = canvas.getContext("2d")!;
      ctx2.putImageData(imageData, 0, 0);
      return canvas.toDataURL();
    },
  };
}

function posFromAngle(angle, radius) {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}

function generateSpinner(options: WorldOptions): Body {
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
function generateObjects(options: WorldOptions): Body[] {
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
      fillStyle: shape.color != null ? generateColor(shape.color) : undefined,
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

function generateColor(color: Color): string {
  if (typeof color === "string") {
    return color;
  } else {
    return color[Math.floor(Math.random() * color.length)];
  }
}
