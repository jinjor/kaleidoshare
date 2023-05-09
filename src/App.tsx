import React from "react";
import "./App.css";
import { useEffect, useRef } from "react";
import { addElementsIntoView, createTriangleNodes } from "./view";
import { setup } from "./world";

const spinnerRadius = 120;
const radius = 60;
const ballRadius = 12;
const ballRadiusVar = 10;
const numBalls = 15;
const generation = 7;

export default function App() {
  const viewWidth = 480;
  const viewHeight = 480;

  const worldRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <div style={{ display: "flex", gap: 10 }}>
        <div id="world"></div>
        <View width={viewWidth} height={viewHeight} />
      </div>
    </>
  );
}

function View(props: { width: number; height: number }) {
  const { width, height } = props;
  useEffect(() => {
    const worldElement = document.getElementById("world") as HTMLElement;

    const { rotate, canvas } = setup(worldElement, {
      spinnerRadius,
      numBalls,
      ballRadius,
      ballRadiusVar,
    });

    const interval = setInterval(() => {
      rotate();
      const ctx = canvas.getContext("2d")!;
      const imgData = ctx.getImageData(
        spinnerRadius - radius,
        spinnerRadius - radius,
        radius * 2,
        radius * 2
      );
      const url = getImageURL(imgData, radius * 2, radius * 2);

      const nodeElements = document.querySelectorAll(".node");
      for (let i = 0; i < triangleNodes.length; i++) {
        const el = nodeElements[i] as HTMLElement;
        el.style.backgroundImage = `url(${url})`;
      }
    }, 1000 / 60);

    const triangleNodes = createTriangleNodes(generation);

    const viewElement = document.getElementById("view") as HTMLElement;
    addElementsIntoView(viewElement, triangleNodes, {
      radius,
      width,
      height,
    });

    return () => {
      worldElement.innerHTML = "";
      viewElement.innerHTML = "";
      clearInterval(interval);
    };
  });
  return (
    <div
      id="view"
      style={{
        width,
        height,
        border: "1px solid #000",
        overflow: "hidden",
        position: "relative",
      }}
    ></div>
  );
}

function getImageURL(imgData, width, height) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = width;
  canvas.height = height;
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL(); //image URL
}
