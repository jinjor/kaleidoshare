import React from "react";
import "./App.css";
import { useEffect, useRef } from "react";
import { addElementsIntoView, createTriangleNodes } from "./view";
import { setupWorld } from "./world";

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
  const viewRef = useRef<HTMLDivElement>(null);
  const viewRef2 = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const worldElement = worldRef.current!;

    const { rotate, canvas } = setupWorld(worldElement, {
      spinnerRadius,
      numBalls,
      ballRadius,
      ballRadiusVar,
    });

    const triangleNodes = createTriangleNodes(generation);

    const viewElement = viewRef.current!;
    addElementsIntoView(viewElement, triangleNodes, {
      radius,
      width: viewWidth,
      height: viewHeight,
    });
    const view2Element = viewRef2.current!;
    addElementsIntoView(view2Element, triangleNodes, {
      radius,
      width: viewWidth,
      height: viewHeight,
    });

    let count = 0;
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

      // Firefox, Safari でチラつくので、２枚の画像を交互に表示する
      const image = count % 2 === 0 ? viewElement : view2Element;
      if (count % 2 === 0) {
        viewElement.style.zIndex = "0";
        view2Element.style.zIndex = "1";
      } else {
        viewElement.style.zIndex = "1";
        view2Element.style.zIndex = "0";
      }

      const nodeElements = image.querySelectorAll(".node");
      for (let i = 0; i < triangleNodes.length; i++) {
        const el = nodeElements[i] as HTMLElement;
        el.style.backgroundImage = `url(${url})`;
      }
      count++;
    }, 1000 / 60);

    return () => {
      worldElement.innerHTML = "";
      viewElement.innerHTML = "";
      view2Element.innerHTML = "";
      clearInterval(interval);
    };
  });
  return (
    <>
      <div style={{ display: "flex", gap: 10 }}>
        <div ref={worldRef}></div>
        <div
          style={{
            backgroundColor: "#eee",
            width: viewWidth,
            height: viewHeight,
            border: "1px solid #000",
            position: "relative",
          }}
        >
          <div
            ref={viewRef}
            style={{
              backgroundColor: "#eee",
              width: viewWidth,
              height: viewHeight,
              overflow: "hidden",
              position: "absolute",
              left: 0,
              top: 0,
            }}
          ></div>
          <div
            ref={viewRef2}
            style={{
              backgroundColor: "#eee",
              width: viewWidth,
              height: viewHeight,
              overflow: "hidden",
              position: "absolute",
              left: 0,
              top: 0,
            }}
          ></div>
        </div>
      </div>
    </>
  );
}

function getImageURL(imgData, width, height) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = width;
  canvas.height = height;
  ctx.rotate((Math.PI / 180) * 25);
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL(); //image URL
}
