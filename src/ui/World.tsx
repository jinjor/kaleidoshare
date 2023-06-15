import React, { useEffect, useRef } from "react";

import {
  Engine,
  Render,
  Runner,
  Body,
  Composite,
  Common,
  Bodies,
  Vertices,
  Vector,
  Gravity,
} from "matter-js";
import decomp from "poly-decomp";
import {
  OutColor,
  OutFloat,
  OutObject,
  OutSpinner,
  Output,
} from "../../schema/schema.js";

Common.setDecomp(decomp);

export type WorldApi = {
  getImage: () => HTMLImageElement;
  getBackgroundColor: () => string;
};
const spinnerRadiusRatio = 0.5;
const clipRadiusRatio = 0.25;

const World = React.memo(function World(props: {
  size: number;
  output: Output | undefined;
  onReady: (world: WorldApi) => void;
}) {
  const { size, output, onReady } = props;

  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (output == null) {
      return;
    }
    const worldElement = worldRef.current!;
    const { render, runner, engine, update } = setupWorld(
      worldElement,
      size,
      output
    );
    onReady({
      getImage: () => {
        const src = render.canvas;
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.width = src.width;
        image.height = src.height;
        image.src = src.toDataURL();
        return image;
      },
      getBackgroundColor: () => {
        return render.canvas.style.backgroundColor;
      },
    });

    const startTime = Date.now();
    let running = true;
    let lastTime = Date.now();
    function step() {
      if (!running) return;
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;
      update(Date.now() - startTime, delta);
      Runner.tick(runner, engine, delta);
      Render.world(render);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    return () => {
      running = false;
      worldElement.innerHTML = "";
    };
  }, [size, output]);
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: "#222",
      }}
      ref={worldRef}
    ></div>
  );
});
export default World;

function setupWorld(element: HTMLElement, size: number, output: Output) {
  const spinnerRadius = size * spinnerRadiusRatio;
  const clipRadius = size * clipRadiusRatio; // TODO: 切り抜き範囲を表示

  const engine = Engine.create();
  const createCanvas = (width: number, height: number) => {
    const canvas = document.createElement("canvas");
    canvas.style.display = "block"; // これがないとスクロールバーが出現する
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
  const { backgroundColor, spinner, objects } = output;
  const spinnerMatter = createSpinner(
    output.spinner,
    size * spinnerRadiusRatio
  );
  const objectsMatter = objects.map((object) => createBody(object, size));

  Composite.add(engine.world, [spinnerMatter]);
  Composite.add(engine.world, objectsMatter);

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
  Render.lookAt(render, {
    min: { x: -spinnerRadius, y: -spinnerRadius },
    max: { x: spinnerRadius, y: spinnerRadius },
  });
  const runner = Runner.create();
  return {
    render,
    runner,
    engine,
    update: (time: number, delta: number) => {
      for (let i = 0; i < objectsMatter.length; i++) {
        const objectMatter = objectsMatter[i];
        const object = objects[i];
        updateBody(object, objectMatter, size, time, engine.gravity);
      }
      // render.options.background や render.canvas.style.background だと
      // url(...) が許可されてしまう。安心安全のため backgroundColor に一度代入することで
      // url(...) を禁止する。
      render.canvas.style.backgroundColor = getCurrentColor(
        backgroundColor,
        time
      );
      Body.rotate(spinnerMatter, Math.PI * 2 * spinner.speed * (delta / 1000));
    },
  };
}
function createSpinner(spinner: OutSpinner, radius: number) {
  return Bodies.fromVertices(
    0,
    0,
    [
      spinner.vertices.map(({ x, y }) => {
        return Vector.create(x * radius, y * radius);
      }),
    ],
    {
      isStatic: true,
      render: { fillStyle: "#888" },
    }
  );
}
function createBody(object: OutObject, size: number): Body {
  const options: Matter.IBodyDefinition = {
    render: {
      fillStyle: getCurrentColor(object.fill, 0),
      strokeStyle: getCurrentColor(object.stroke, 0),
      lineWidth: getCurrentFloat(object.strokeWidth, 0) * size,
    },
  };
  const shape = object.shape;
  switch (shape.type) {
    case "circle":
      return Bodies.circle(
        0,
        0,
        getCurrentFloat(shape.radius, 0) * size,
        options
      );
    case "rectangle":
      return Bodies.rectangle(
        0,
        0,
        getCurrentFloat(shape.width, 0) * size,
        getCurrentFloat(shape.height, 0) * size,
        options
      );
    case "polygon":
      return Bodies.polygon(
        0,
        0,
        shape.sides,
        getCurrentFloat(shape.radius, 0) * size,
        options
      );
  }
}
function updateBody(
  object: OutObject,
  body: Body,
  size: number,
  time: number,
  gravity: Gravity
) {
  body.render.fillStyle = getCurrentColor(object.fill, time);
  body.render.strokeStyle = getCurrentColor(object.stroke, time);
  body.render.lineWidth = getCurrentFloat(object.strokeWidth, time) * size;
  const shape = object.shape;
  switch (shape.type) {
    case "circle": {
      const c = body.position;
      const currentRadius = Vector.magnitude(Vector.sub(body.vertices[0], c));
      const nextRadius = getCurrentFloat(shape.radius, time) * size;
      const scale = nextRadius / currentRadius;
      const vertices = body.vertices.map((v) => {
        return Vector.add(Vector.mult(Vector.sub(v, c), scale), c);
      });
      Body.setVertices(body, Vertices.create(vertices, body));
      Body.set(body, "circleRadius", nextRadius);
      break;
    }
    case "rectangle": {
      const [v0, v1, , v3] = body.vertices;
      const v01 = Vector.sub(v1, v0);
      const v03 = Vector.sub(v3, v0);
      const currentWidth = Vector.magnitude(v01);
      const currentHeight = Vector.magnitude(v03);
      const nextWidth = getCurrentFloat(shape.width, time) * size;
      const nextHeight = getCurrentFloat(shape.height, time) * size;
      const scaleW = nextWidth / currentWidth;
      const scaleH = nextHeight / currentHeight;
      const v4 = Vector.add(v0, Vector.mult(v01, scaleW));
      const v5 = Vector.add(v4, Vector.mult(v03, scaleH));
      const v6 = Vector.add(v0, Vector.mult(v03, scaleH));
      Body.setVertices(body, Vertices.create([v0, v4, v5, v6], body));
      break;
    }
    case "polygon": {
      const c = body.position;
      const currentRadius = Vector.magnitude(Vector.sub(body.vertices[0], c));
      const nextRadius = getCurrentFloat(shape.radius, time) * size;
      const scale = nextRadius / currentRadius;
      const vertices = body.vertices.map((v) => {
        return Vector.add(Vector.mult(Vector.sub(v, c), scale), c);
      });
      Body.setVertices(body, Vertices.create(vertices, body));
      break;
    }
  }
  const weight = getCurrentFloat(object.weight, time);
  Body.applyForce(body, body.position, {
    x: 0,
    y: (weight - 1) * body.mass * gravity.y * gravity.scale,
  });
}
function getCurrentFloat(float: OutFloat, time: number): number {
  if (typeof float === "number") {
    return float;
  }
  const angle = float.angle + Math.PI * 2 * float.frequency * (time / 1000);
  return (
    getCurrentFloat(float.offset, time) +
    getCurrentFloat(float.amplitude, time) * Math.sin(angle)
  );
}
function getCurrentColor(color: OutColor, time: number): string {
  if (typeof color === "string") {
    return color;
  }
  if (color.type === "rgb") {
    return `rgb(${getCurrentFloat(color.r, time)}, ${getCurrentFloat(
      color.g,
      time
    )}, ${getCurrentFloat(color.b, time)})`;
  }
  if (color.type === "hsl") {
    return `hsl(${getCurrentFloat(color.h, time)}, ${getCurrentFloat(
      color.s,
      time
    )}%, ${getCurrentFloat(color.l, time)}%)`;
  }
  return "transparent";
}
