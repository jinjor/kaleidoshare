import React, { useEffect, useRef } from "react";

import { Engine, Render, Runner, Body, Composite, Common } from "matter-js";
import decomp from "poly-decomp";
import { generateObjects, generateSpinner } from "../domain/generate";
import { Settings } from "../domain/settings";

Common.setDecomp(decomp);

type World = {
  rotate: () => void;
  getImage: () => HTMLImageElement;
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
    const { render, runner, rotate, getImage } = setupWorld(
      worldElement,
      options
    );
    onReady({ rotate, getImage });
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
  const createCanvas = (width: number, height: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.oncontextmenu = () => false;
    canvas.onselectstart = () => false;
    // willReadFrequently は canvas を作って最初に getContext() するときに設定する必要がある
    // Render.create() に canvas を生成させると内部で getContext() してしまうので、
    // ここで canvas を生成して getContext() する必要がある
    // https://stackoverflow.com/questions/74101155/chrome-warning-willreadfrequently-attribute-set-to-true/74136040
    canvas.getContext("2d", { willReadFrequently: true });
    return canvas;
  };
  const render = Render.create({
    element,
    canvas: createCanvas(size, size),
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
    getImage: () => {
      const src = render.canvas;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.width = src.width;
      image.height = src.height;
      image.src = src.toDataURL();
      return image;
    },
  };
}
