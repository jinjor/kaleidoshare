import React, { useCallback, useState } from "react";
import View from "./View";
import World, { WorldOptions } from "./World";
import SettingEditor from "./SettingEditor";
import { Settings } from "../domain/settings";

// |--- worldSize --|-|--- viewSize ---|-|--- ????Size ---|
//                  gap                gap
const worldSize = 300;
const viewSize = 300;
const ____Size = 300;
const gap = (960 - (worldSize + viewSize + ____Size)) / 2;

export default function Editor(props: {
  preview: boolean;
  onQuitPreview: () => void;
}) {
  const { preview, onQuitPreview } = props;
  const settings: Settings = {
    background: "#502",
    generators: [
      {
        count: 5,
        shape: {
          type: "circle",
          radius: { min: 0.04, max: 0.11 },
          stroke: ["white", "yellow"],
          strokeWidth: 0.01,
        },
      },
      {
        count: 50,
        shape: {
          type: "rectangle",
          width: { min: 0.05, max: 0.12 },
          height: { min: 0.02, max: 0.03 },
          fill: ["cyan", "magenta", "yellow"],
        },
      },
    ],
  };
  const [worldOptions, setWorldOptions] = useState<WorldOptions>({
    size: worldSize,
    spinnerRadiusRatio: 0.5,
    clipRadiusRatio: 0.25,
    settings,
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
      <div style={{ display: "flex", gap }}>
        <World options={worldOptions} onReady={handleReady} />
        {world && (
          <View
            size={viewSize}
            world={world}
            settings={worldOptions.settings}
          />
        )}
      </div>
      <SettingEditor settings={worldOptions.settings} onApply={handleApply} />
    </>
  );
}
