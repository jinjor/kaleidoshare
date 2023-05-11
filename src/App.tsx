import React from "react";
import "./App.css";
import { useEffect, useRef } from "react";
import { addElementsIntoView, createTriangleNodes } from "./view";
import { setupWorld } from "./world";

const spinnerRadius = 120;
const radius = 68;
const ballRadius = 12;
const ballRadiusVar = 10;
const numBalls = 15;
const generation = 5; // TODO: これを使って radius を計算する

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
    addElementsIntoView(0, viewElement, triangleNodes, {
      radius,
      width: viewWidth,
      height: viewHeight,
    });
    const view2Element = viewRef2.current!;
    addElementsIntoView(1, view2Element, triangleNodes, {
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
        (document.styleSheets[0].cssRules[count % 2] as any)
          .style as CSSStyleDeclaration
      ).backgroundImage = `url(${url})`;
      count++;
    }, 1000 / 30);

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
            backgroundColor: "#000",
            width: viewWidth,
            height: viewHeight,
            border: "1px solid #000",
            position: "relative",
          }}
        >
          {[viewRef, viewRef2].map((ref, i) => (
            <div
              ref={ref}
              key={i}
              style={{
                backgroundColor: "#eee",
                width: viewWidth,
                height: viewHeight,
                overflow: "hidden",
                position: "absolute",
                left: 0,
                top: 0,
                borderRadius: "50%",
              }}
            ></div>
          ))}
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
