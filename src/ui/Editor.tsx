import React, { useCallback, useState } from "react";
import View from "./View";
import World, { WorldOptions } from "./World";
import SettingEditor, { SettingsEditorController } from "./SettingEditor";
import { Settings } from "../../schema/settings.mjs";
import Operation from "./Operation";
import { publish } from "../domain/io";
import { Output } from "../../schema/output.mjs";
import { generate } from "../domain/generate";
import { MessageContext } from "./MessageBar";
import { User } from "../../schema/user.mjs";
import { Content } from "../../schema/content.mjs";
import { env } from "../domain/env";

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
  initiallyPreview: boolean;
  authorName: string | null;
  content?: Content;
}) {
  const { user, initiallyPreview, content, authorName } = props;

  const spinnerRadiusRatio = 0.5;
  const messageContext = React.useContext(MessageContext)!;

  const [preview, setPreview] = React.useState(initiallyPreview);
  const [settings, setSettings] = useState<Settings>(
    content?.settings ?? defaultSettings
  );
  const [worldOptions, setWorldOptions] = useState<WorldOptions>({
    size: worldSize,
    spinnerRadiusRatio,
    clipRadiusRatio: 0.25,
    output: content?.output ?? generate(spinnerRadiusRatio, settings), // TODO: ここじゃなくない？
  });
  const [world, setWorld] = useState<World | null>(null);
  const [settingsController, setSettingsController] =
    useState<SettingsEditorController | null>(null);
  const [saved, setSaved] = useState<boolean>(true);
  const [warningShown, setWarningShown] = useState<boolean>(false);

  const handleWorldReady = useCallback((world: World) => {
    setWorld(world);
  }, []);
  const handleSettingsEditorReady = useCallback(
    (controller: SettingsEditorController) => {
      setSettingsController(controller);
    },
    []
  );
  const handlePreview =
    worldOptions.output != null ? () => setPreview(true) : null;
  const handleRegenerate =
    settingsController != null && !warningShown
      ? () => {
          settingsController.save();
        }
      : null;
  const handlePublish = saved
    ? async (userName: string) => {
        try {
          const contentId = await publish(
            userName,
            settings,
            worldOptions.output
          );
          location.href = `/contents/${userName}/${contentId}`;
        } catch (e) {
          messageContext.setError(e);
        }
      }
    : null;
  const handleChange = useCallback(() => {
    setSaved(false);
  }, []);
  const handleApply = useCallback((json: any) => {
    const settings = json as Settings;
    const output: Output = generate(spinnerRadiusRatio, settings);
    setSettings(settings);
    setWorldOptions({ ...worldOptions, output });
    // 保存操作の直後にフォーマットされ handleChange が呼ばれてしまうため、
    // その後に saved を true にする
    setTimeout(() => {
      setSaved(true);
    }, 100);
  }, []);
  const quitPreview = useCallback(() => {
    setPreview(false);
  }, []);
  const handleWarningShownChange = useCallback((warningShown) => {
    setWarningShown(warningShown);
  }, []);

  if (world && preview) {
    return (
      <>
        <World options={worldOptions} onReady={handleWorldReady} />
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
          <div
            style={{
              backgroundColor: "#111",
              maxWidth: "90vh",
              maxHeight: "90vh",
              position: "relative",
              width: "90vw",
              height: "90vw",
            }}
          >
            <View size={viewSize * 2} world={world} settings={settings} />
          </div>
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
          maxWidth: "100vw",
          overflow: "scroll",
        }}
      >
        <World options={worldOptions} onReady={handleWorldReady} />
        <div
          style={{
            backgroundColor: "#111",
            width: viewSize,
            height: viewSize,
            position: "relative",
            minWidth: viewSize,
          }}
        >
          {world && <View size={viewSize} world={world} settings={settings} />}
        </div>
        <Operation
          width={operationSize}
          height={upperHeight}
          user={user}
          onPreview={handlePreview}
          onRegenerate={handleRegenerate}
          onPublish={handlePublish}
          allowedToPublish={
            !env.prod && (authorName == null || authorName === user?.name)
          }
        />
      </div>
      <SettingEditor
        settings={settings}
        onChange={handleChange}
        onApply={handleApply}
        onReady={handleSettingsEditorReady}
        onWarningShownChange={handleWarningShownChange}
      />
    </>
  );
}
