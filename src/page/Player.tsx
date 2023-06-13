import React, { useCallback, useState } from "react";
import { getContent } from "../domain/io";
import { Content } from "../../schema/schema.js";
import World, { WorldApi } from "../ui/World";
import View from "../ui/View";

const worldSize = 300;
const viewSize = 300;
const messageStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  backgroundColor: "#000",
  fontWeight: "bold",
  fontSize: 16,
} as const;
export default function Player(props: {
  authorName: string;
  contentId: string;
}) {
  const { authorName, contentId } = props;
  const [content, setContent] = useState<Content | null | undefined>();
  const [world, setWorld] = useState<WorldApi | undefined>();
  const handleWorldReady = useCallback((world: WorldApi) => {
    setWorld(world);
  }, []);
  React.useEffect(() => {
    getContent(authorName, contentId).then((content) => {
      setContent(content);
    });
  }, [authorName, contentId]);
  if (content === undefined) {
    return <div style={messageStyle}>Loading...</div>;
  }
  if (content === null) {
    // TODO: サイトに誘導
    return <div style={messageStyle}>Content not found</div>;
  }
  return (
    <>
      <div>
        {content && (
          <World
            size={worldSize}
            output={content.output}
            onReady={handleWorldReady}
          />
        )}
      </div>
      <View
        fullscreen={true}
        onQuitFullscreen={() => {}}
        size={viewSize * 2}
        world={world}
        onReady={() => {}}
      />
    </>
  );
}
