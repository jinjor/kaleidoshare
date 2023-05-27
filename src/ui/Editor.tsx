import React, { useCallback, useState } from "react";
import View from "./View";
import World, { WorldOptions } from "./World";
import SettingEditor from "./SettingEditor";
import { Settings } from "../domain/settings";
import Operation from "./Operation";
import { User } from "../domain/user";

// |--- worldSize --|-|--- viewSize ---|-|-- opetaionSize --|
//                  gap                gap
const worldSize = 300;
const viewSize = 300;
const operationSize = 340;
const upperHeight = 300;
const gap = (960 - (worldSize + viewSize + operationSize)) / 2;
const defaultSettings: Settings = {
  background: "#103",
  generators: [
    {
      count: 15,
      shape: {
        type: "rectangle",
        width: 0.06,
        height: 0.06,
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
      count: 100,
      shape: {
        type: "circle",
        radius: {
          frequency: 0.2,
          offset: 0.02,
          amplitude: 0.01,
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
  ],
};
export default function Editor(props: {
  user: User | null;
  preview: boolean;
  settings?: Settings;
  onQuitPreview: () => void;
}) {
  const { user, preview, settings, onQuitPreview } = props;

  const [worldOptions, setWorldOptions] = useState<WorldOptions>({
    size: worldSize,
    spinnerRadiusRatio: 0.5,
    clipRadiusRatio: 0.25,
    settings: settings ?? defaultSettings,
  });
  const [world, setWorld] = useState<World | null>(null);

  const handleReady = useCallback((world: World) => {
    setWorld(world);
  }, []);
  const handleApply = useCallback((json: any) => {
    setWorldOptions({ ...worldOptions, settings: json });
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
          <View
            size={viewSize * 2}
            world={world}
            settings={worldOptions.settings}
          />
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
        {world && (
          <View
            size={viewSize}
            world={world}
            settings={worldOptions.settings}
          />
        )}
        <Operation
          width={operationSize}
          height={upperHeight}
          settings={worldOptions.settings}
          user={user}
        />
      </div>
      <SettingEditor settings={worldOptions.settings} onApply={handleApply} />
    </>
  );
}
