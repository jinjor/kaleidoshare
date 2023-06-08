import React, { useCallback, useState } from "react";
import View, { ViewApi } from "./View";
import World, { WorldOptions } from "./World";
import SettingEditor, { SettingsEditorController } from "./SettingEditor";
import { Settings, Output, User, Content } from "../../schema/schema.js";
import Operation from "./Operation";
import { createContent, updateContent } from "../domain/io";
import { generate } from "../domain/generate";
import { MessageContext } from "./MessageBar";
import { RoutingContext } from "../Routing";
import examples from "../domain/example";

// |--- worldSize --|-|--- viewSize ---|-|-- opetaionSize --|
//                  gap                gap
const worldSize = 300;
const viewSize = 300;
const operationSize = 340;
const upperHeight = 300;
const gap = (960 - (worldSize + viewSize + operationSize)) / 2;

const worldOptions: WorldOptions = {
  size: worldSize,
};
export default function Editor(props: {
  user: User | null;
  initiallyPreview: boolean;
  content: Content | null;
}) {
  const { user, initiallyPreview, content } = props;

  const routingContext = React.useContext(RoutingContext)!;
  const messageContext = React.useContext(MessageContext)!;

  const [preview, setPreview] = React.useState(initiallyPreview);
  const [settings, setSettings] = useState<Settings | null>(
    content?.settings ?? null
  );
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(0);
  const usedSettings = settings ?? examples[selectedExampleIndex].settings;
  const [output, setOutput] = useState<Output>(
    content?.output ?? generate(usedSettings)
  );
  const [world, setWorld] = useState<World | null>(null);
  const [settingsController, setSettingsController] =
    useState<SettingsEditorController | null>(null);
  const [saved, setSaved] = useState<boolean>(true);
  const [warningShown, setWarningShown] = useState<boolean>(false);
  const [viewApi, setViewApi] = useState<ViewApi | null>(null);

  const handleWorldReady = useCallback((world: World) => {
    setWorld(world);
  }, []);
  const handleViewReady = useCallback((viewApi: ViewApi) => {
    setViewApi(viewApi);
  }, []);
  const handleSettingsEditorReady = useCallback(
    (controller: SettingsEditorController) => {
      setSettingsController(controller);
    },
    []
  );
  const handlePreview =
    output != null
      ? () => {
          if (content != null) {
            routingContext.changeUrl(
              `/contents/${content.author}/${content.id}`
            );
          }
          setPreview(true);
        }
      : null;
  const quitPreview = () => {
    if (content != null) {
      routingContext.changeUrl(
        `/contents/${content.author}/${content.id}/edit`
      );
    }
    setPreview(false);
  };
  const handleGenerate =
    settings == null
      ? () => {
          const example = examples[selectedExampleIndex];
          setOutput(generate(example.settings));
        }
      : settingsController != null && !warningShown
      ? () => {
          settingsController.save();
        }
      : null;
  const handlePublish =
    settings && saved && viewApi != null
      ? async (userName: string) => {
          const image = await viewApi.getImage();
          if (content == null) {
            const contentId = await createContent(
              userName,
              settings,
              output,
              image
            );
            messageContext.setMessage("Published!");
            routingContext.goTo(
              `/contents/${userName}/${contentId}/edit`,
              true
            );
          } else {
            await updateContent(
              content.author,
              content.id,
              settings,
              output,
              image
            );
            messageContext.setMessage("Saved!");
          }
        }
      : null;
  const handleChange = useCallback(() => {
    setSaved(false);
  }, []);
  const handleApply = useCallback((json: any) => {
    const settings = json as Settings;
    const output = generate(settings);
    setSettings(settings);
    setOutput(output);
    // 保存操作の直後にフォーマットされ handleChange が呼ばれてしまうため、
    // その後に saved を true にする
    setTimeout(() => {
      setSaved(true);
    }, 100);
  }, []);
  const handleWarningShownChange = useCallback((warningShown) => {
    setWarningShown(warningShown);
  }, []);

  if (world && preview) {
    return (
      <>
        {/** World の状態をリセットされないように HTML 構造を下と合わせておく */}
        <div>
          <World
            options={worldOptions}
            output={output}
            onReady={handleWorldReady}
          />
        </div>
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
            <View
              size={viewSize * 2}
              world={world}
              settings={usedSettings}
              onReady={handleViewReady}
            />
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
        <World
          options={worldOptions}
          output={output}
          onReady={handleWorldReady}
        />
        <div
          style={{
            backgroundColor: "#111",
            width: viewSize,
            height: viewSize,
            position: "relative",
            minWidth: viewSize,
          }}
        >
          {world && (
            <View
              size={viewSize}
              world={world}
              settings={usedSettings}
              onReady={handleViewReady}
            />
          )}
        </div>
        <Operation
          width={operationSize}
          height={upperHeight}
          user={user}
          onPreview={handlePreview}
          onGenerate={handleGenerate}
          onPublish={handlePublish}
          coding={settings != null}
          content={content}
        />
      </div>
      {settings != null ? (
        <SettingEditor
          settings={settings}
          onChange={handleChange}
          onApply={handleApply}
          onReady={handleSettingsEditorReady}
          onWarningShownChange={handleWarningShownChange}
        />
      ) : (
        <div className="horizontal-center">
          <div className="form" style={{ width: 450 }}>
            <div className="form-title">Getting started</div>
            <div className="select">
              <select
                defaultValue={selectedExampleIndex}
                onChange={(e) => {
                  const index = Number(e.target.value);
                  setSelectedExampleIndex(index);
                  setOutput(generate(examples[index].settings));
                }}
              >
                {examples.map((example, index) => (
                  <option key={index} value={index}>
                    {example.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="button primary wide"
              onClick={(e) => {
                e.preventDefault();
                setSettings(examples[selectedExampleIndex].settings);
              }}
            >
              Start editing
            </button>
          </div>
        </div>
      )}
    </>
  );
}
