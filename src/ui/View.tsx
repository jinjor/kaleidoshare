import React, { useEffect, useRef } from "react";
import World from "./World";
import { Settings } from "../domain/settings";
import { generateColor } from "../domain/generate";

const generation = 5;
const f = [
  1,
  1 / 2,
  1 / 2,
  1 / 4,
  1 / (2 * Math.sqrt(7)),
  1 / (2 * Math.sqrt(13)),
  1 / 8,
];
const viewRadiusRatio = f[generation];

type TrignaleNode = {
  x: number;
  y: number;
  rotateMatrix: [number, number, number, number];
};

const View = React.memo(function View(props: {
  size: number;
  world: World;
  settings: Settings;
}) {
  const { size, world, settings } = props;

  const viewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const { getImage } = world;

    const triangleNodes = createTriangleNodes(generation);

    const viewElement = viewRef.current!;
    const interval = setInterval(() => {
      const image = getImage();
      image.onload = () => {
        const canvas = viewElement;
        drawTriangles(canvas, image, triangleNodes, {
          clipRadiusRatio: 0.25,
          viewRadiusRatio,
        });
      };
    }, 1000 / 30);

    return () => {
      viewElement.innerHTML = "";
      clearInterval(interval);
    };
  }, [world, settings]);
  const backgroundColor = settings.background ?? "#000";
  return (
    <div
      style={{
        backgroundColor: "#111",
        width: size,
        height: size,
        position: "relative",
        maxWidth: "90vw",
        maxHeight: "90vw", // keep square
      }}
    >
      <canvas
        ref={viewRef}
        width={size}
        height={size}
        style={{
          backgroundColor,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "absolute",
          left: 0,
          top: 0,
          borderRadius: "50%",
        }}
      ></canvas>
    </div>
  );
});
export default View;

function createTriangleNodes(generation: number) {
  const nodes = new Map();
  const firstNode: TrignaleNode = {
    x: 0,
    y: 0,
    rotateMatrix: [1, 0, 0, 1],
  }; // r = 1 で正規化
  function nodeId(node) {
    return (
      Math.round(node.x * 100) / 100 + "," + Math.round(node.y * 100) / 100
    );
  }
  nodes.set(nodeId(firstNode), firstNode);
  let prev: TrignaleNode[] = [firstNode];
  for (let i = 0; i < generation; i++) {
    const next: TrignaleNode[] = [];
    const directions =
      i % 2 === 0
        ? [(Math.PI / 6) * 3, (Math.PI / 6) * 7, (Math.PI / 6) * 11]
        : [(Math.PI / 6) * 1, (Math.PI / 6) * 5, (Math.PI / 6) * 9];
    for (const node of prev) {
      for (const direction of directions) {
        const [a, b, c, d] = node.rotateMatrix;
        const newNode = {
          x: node.x + Math.cos(direction),
          y: node.y + Math.sin(direction),
          rotateMatrix: stepMatrix(direction, a, b, c, d),
        };
        const id = nodeId(newNode);
        if (!nodes.has(id)) {
          nodes.set(id, newNode);
          next.push(newNode);
        }
      }
    }
    prev = next;
  }
  return [...nodes.values()];
}

function stepMatrix(
  angle: number,
  a: number,
  b: number,
  c: number,
  d: number
): [number, number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const a2 = -Math.pow(cos, 2) + Math.pow(sin, 2);
  const b2 = -2 * cos * sin;
  const c2 = -2 * cos * sin;
  const d2 = Math.pow(cos, 2) - Math.pow(sin, 2);
  const a3 = a2 * a + c2 * b;
  const b3 = b2 * a + d2 * b;
  const c3 = a2 * c + c2 * d;
  const d3 = b2 * c + d2 * d;
  return [a3, b3, c3, d3];
}
function drawTriangles(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  triangleNodes: TrignaleNode[],
  options: {
    clipRadiusRatio: number;
    viewRadiusRatio: number;
  }
) {
  const { clipRadiusRatio, viewRadiusRatio } = options;

  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scaleX =
    (canvas.width * viewRadiusRatio) / (image.width * clipRadiusRatio);
  const scaleY =
    (canvas.height * viewRadiusRatio) / (image.height * clipRadiusRatio);

  for (const node of triangleNodes) {
    const x = canvas.width * (0.5 + viewRadiusRatio * node.x);
    const y = canvas.height * (0.5 + viewRadiusRatio * node.y);
    ctx.save();
    ctx.setTransform(
      node.rotateMatrix[0] * scaleX,
      node.rotateMatrix[1] * scaleY,
      node.rotateMatrix[2] * scaleX,
      node.rotateMatrix[3] * scaleY,
      x,
      y
    );
    ctx.beginPath();
    ctx.moveTo(0, -image.width * clipRadiusRatio);
    ctx.lineTo(
      image.width * (clipRadiusRatio * (Math.sqrt(3) / 2)),
      image.height * (clipRadiusRatio / 2)
    );
    ctx.lineTo(
      image.width * (clipRadiusRatio * (-Math.sqrt(3) / 2)),
      image.height * (clipRadiusRatio / 2)
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
  }
}
