// @deno-types="npm:@types/matter-js@^0.18.3"
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

export function setupWorld(
  element: HTMLElement,
  options: {
    spinnerRadius: number;
    numBalls: number;
    ballRadius: number;
    ballRadiusVar: number;
  }
) {
  const { spinnerRadius, numBalls, ballRadius, ballRadiusVar } = options;
  const engine = Engine.create();

  const render = Render.create({
    element,
    engine: engine,
    options: {
      width: spinnerRadius * 2,
      height: spinnerRadius * 2,
      wireframes: false,
    },
  });

  const spinner = Bodies.fromVertices(
    0,
    0,
    [
      [
        posFromAngle((Math.PI / 6) * 1, spinnerRadius + 40),
        posFromAngle((Math.PI / 6) * 5, spinnerRadius + 40),
        posFromAngle((Math.PI / 6) * 9, spinnerRadius + 40),
        posFromAngle((Math.PI / 6) * 0.999, spinnerRadius + 40),
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
      Body.rotate(spinner, 0.01);
    },
    canvas: render.canvas as HTMLCanvasElement, // TODO: as 要らないはず
  };
}

function posFromAngle(angle, radius) {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}
