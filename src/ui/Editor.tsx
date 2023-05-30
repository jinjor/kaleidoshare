import React, { useCallback, useState } from "react";
import View from "./View";
import World, { WorldOptions } from "./World";
import SettingEditor from "./SettingEditor";
import { Settings } from "../domain/settings";
import Operation from "./Operation";
import { Content, User } from "../domain/io";
import { Output } from "../domain/output";
import { generate } from "../domain/generate";

// |--- worldSize --|-|--- viewSize ---|-|-- opetaionSize --|
//                  gap                gap
const worldSize = 300;
const viewSize = 300;
const operationSize = 340;
const upperHeight = 300;
const gap = (960 - (worldSize + viewSize + operationSize)) / 2;
const defaultSettings: Settings = {
  background: "#103",
  objects: [
    {
      count: 10,
      shape: {
        type: "rectangle",
        width: 0.05,
        height: {
          frequency: 0.2,
          offset: 0.1,
          amplitude: 0.05,
        },
        stroke: {
          type: "hsl",
          h: {
            min: 300,
            max: 360,
          },
          s: 40,
          l: 90,
        },
        strokeWidth: 0.005,
      },
    },
    {
      count: 2,
      shape: {
        type: "polygon",
        sides: 3,
        radius: {
          frequency: 0.2,
          offset: 0.12,
          amplitude: 0.05,
        },
        fill: {
          type: "hsl",
          h: {
            min: 200,
            max: 400,
          },
          s: 60,
          l: {
            min: 50,
            max: 80,
          },
        },
      },
    },
    {
      count: 3,
      shape: {
        type: "circle",
        radius: {
          frequency: 0.2,
          offset: 0.08,
          amplitude: 0.02,
        },
        fill: {
          type: "hsl",
          h: {
            min: 200,
            max: 400,
          },
          s: 60,
          l: {
            frequency: 0.2,
            offset: 50,
            amplitude: 20,
          },
        },
      },
    },
  ],
};
export default function Editor(props: {
  user: User | null;
  preview: boolean;
  content?: Content;
  onQuitPreview: () => void;
}) {
  const { user, preview, content, onQuitPreview } = props;

  const spinnerRadiusRatio = 0.5;
  const [settings, setSettings] = useState<Settings>(
    content?.settings ?? defaultSettings
  );
  const [worldOptions, setWorldOptions] = useState<WorldOptions>({
    size: worldSize,
    spinnerRadiusRatio,
    clipRadiusRatio: 0.25,
    output: content?.output ?? generate(spinnerRadiusRatio, settings),
  });
  const [world, setWorld] = useState<World | null>(null);

  const handleReady = useCallback((world: World) => {
    setWorld(world);
  }, []);
  const handleApply = useCallback((json: any) => {
    const settings = json as Settings;
    const output: Output = generate(spinnerRadiusRatio, settings);
    setSettings(settings);
    setWorldOptions({ ...worldOptions, output });
  }, []);
  const quitPreview = useCallback(() => {
    onQuitPreview();
  }, [onQuitPreview]);
  if (world && preview) {
    return (
      <>
        <World options={worldOptions} onReady={handleReady} />
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111",
          }}
          onClick={quitPreview}
        >
          <View size={viewSize * 2} world={world} settings={settings} />
        </div>
      </>
    );
  }
  return (
    <>
      <div
        style={{
          display: "flex",
          gap,
          marginBottom: 10,
          maxWidth: "100vw",
          overflow: "scroll",
        }}
      >
        <World options={worldOptions} onReady={handleReady} />
        {world && <View size={viewSize} world={world} settings={settings} />}
        <Operation
          width={operationSize}
          height={upperHeight}
          settings={settings}
          user={user}
        />
      </div>
      <SettingEditor settings={settings} onApply={handleApply} />
    </>
  );
}
