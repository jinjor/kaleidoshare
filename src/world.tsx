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
type WorldOptions = {
  size: number;
  numBalls: number;
  spinnerRadiusRatio: number;
  clipRadiusRatio: number;
  ballRadiusRatio: number;
  ballRadiusVarRatio: number;
};

const World = React.memo(function World(props: {
  options: WorldOptions;
  hidden: boolean;
  onReady: (world: World) => void;
}) {
  const { options, hidden, onReady } = props;

  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const worldElement = worldRef.current!;
    const world = setupWorld(worldElement, options);
    onReady(world);
    return () => {
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

function setupWorld(element: HTMLElement, options: WorldOptions): World {
  const {
    size,
    numBalls,
    spinnerRadiusRatio,
    clipRadiusRatio,
    ballRadiusRatio,
    ballRadiusVarRatio,
  } = options;

  const spinnerRadius = size * spinnerRadiusRatio;
  const clipRadius = size * clipRadiusRatio;
  const ballRadius = size * ballRadiusRatio;
  const ballRadiusVar = size * ballRadiusVarRatio;

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

  const spinner = Bodies.fromVertices(
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

  const balls: Body[] = [];
  for (let i = 0; i < numBalls; i++) {
    balls.push(
      // Bodies.circle(
      //   0,
      //   0,
      //   ballRadius + (2 * Math.random() - 1) * ballRadiusVar
      // )
      Bodies.rectangle(
        0,
        0,
        (ballRadius + (2 * Math.random() - 1) * ballRadiusVar) * 1.5,
        (ballRadius + (2 * Math.random() - 1) * ballRadiusVar) * 3
      )
    );
  }
  Composite.add(engine.world, balls);
  Composite.add(engine.world, [spinner]);

  Render.run(render);
  Render.lookAt(render, {
    min: { x: -spinnerRadius, y: -spinnerRadius },
    max: { x: spinnerRadius, y: spinnerRadius },
  });
  const runner = Runner.create();
  Runner.run(runner, engine);
  return {
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
