import React, { useEffect, useRef } from "react";

import { Engine, Render, Runner, Body, Composite, Common } from "matter-js";
import decomp from "poly-decomp";
import { generateObjects, generateSpinner } from "../domain/generate";
import { Settings } from "../domain/settings";

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

const World = React.memo(function World(props: {
  options: WorldOptions;
  onReady: (world: World) => void;
}) {
  const { options, onReady } = props;

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
