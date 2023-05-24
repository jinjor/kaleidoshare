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

  const viewRef = useRef<HTMLDivElement>(null);
  const viewRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
    .node0 {
      background-image: none;
    }
    .node1 {
      background-image: none;
    }
    `;
    document.body.appendChild(styleElement);

    const { rotate, getImageURL } = world;

    const triangleNodes = createTriangleNodes(generation);

    const viewElement = viewRef.current!;
    addElementsIntoView(0, viewElement, triangleNodes, {
      radius: viewRadiusRatio,
    });
    const view2Element = viewRef2.current!;
    addElementsIntoView(1, view2Element, triangleNodes, {
      radius: viewRadiusRatio,
    });

    let count = 0;
    const interval = setInterval(() => {
      rotate();
      const url = getImageURL();

      // Firefox, Safari でチラつくので、２枚の画像を交互に表示する
      if (count % 2 === 0) {
        viewElement.style.zIndex = "0";
        view2Element.style.zIndex = "1";
      } else {
        viewElement.style.zIndex = "1";
        view2Element.style.zIndex = "0";
      }
      // それぞれのノードに url をセットすると CPU 使用率が上がる
      //（特に FirefoxCP Isolated Web Content）ため、
      // CSS ルールを変更して一括で画像を変更する。
      (
        (styleElement.sheet!.cssRules[count % 2] as any)
          .style as CSSStyleDeclaration
      ).backgroundImage = `url(${url})`;
      count++;
    }, 1000 / 30);

    return () => {
      viewElement.innerHTML = "";
      view2Element.innerHTML = "";
      clearInterval(interval);
      document.body.removeChild(styleElement);
    };
  }, [world, settings]);
  const backgroundColor =
    settings.background != null ? generateColor(settings.background) : "#000";
  return (
    <div
      style={{
        backgroundColor: "#000",
        width: size,
        height: size,
        position: "relative",
      }}
    >
      {[viewRef, viewRef2].map((ref, i) => (
        <div
          ref={ref}
          key={i}
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
        ></div>
      ))}
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

export function addElementsIntoView(
  num: number,
  viewElement: HTMLElement,
  triangleNodes: TrignaleNode[],
  options: { radius: number }
) {
  const { radius } = options;
  for (const node of triangleNodes) {
    const x = 0.5 - radius + node.x * radius;
    const y = 0.5 - radius + node.y * radius;

    const el = document.createElement("div");
    el.style.position = "absolute";
    el.className = "node" + num;
    el.style.width = `${radius * 2 * 100}%`;
    el.style.height = `${radius * 2 * 100}%`;
    el.style.backgroundSize = "cover";
    el.style.backgroundRepeat = "no-repeat";
    el.style.clipPath = `polygon(50% 0%, ${
      (0.5 + 0.5 * Math.cos(Math.PI / 6)) * 100
    }% ${(0.5 + 0.5 * Math.sin(Math.PI / 6)) * 100}%, ${
      (0.5 + 0.5 * Math.cos((Math.PI / 6) * 5)) * 100
    }% ${(0.5 + 0.5 * Math.sin((Math.PI / 6) * 5)) * 100}%)`;

    el.style.left = `${x * 100}%`;
    el.style.top = `${y * 100}%`;
    el.style.transform = `matrix(${node.rotateMatrix
      .map((n) => n.toFixed(2))
      .join(",")},0,0)`;
    viewElement.appendChild(el);
  }
}
