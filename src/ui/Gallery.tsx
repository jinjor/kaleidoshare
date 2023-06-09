import React from "react";
import { getContents } from "../domain/io";
import { Content } from "../../schema/schema.js";

export default function Gallery(props: { authorName: string }) {
  const { authorName } = props;
  const [contents, setContents] = React.useState<Content[] | undefined>();

  React.useEffect(() => {
    getContents(authorName).then((contents) => {
      setContents(contents);
    });
  }, [authorName]);

  if (contents === undefined) {
    return null;
  }
  const size = 120;
  return (
    <div className="form" style={{ width: "100%" }}>
      <h1 className="form-title">{authorName}'s gallery</h1>
      <div
        style={{
          display: "grid",
          gap: "20px 40px",
          gridTemplateColumns: `repeat(auto-fill, ${size}px)`,
        }}
      >
        {contents.length === 0 ? (
          <div>None yet.</div>
        ) : (
          contents.map((content) => (
            <a
              href={`/contents/${authorName}/${content.id}`}
              key={content.id}
              style={{ textAlign: "center" }}
            >
              <img
                src={content.image}
                width={size}
                height={size}
                style={{ borderRadius: "50%" }}
              />
              <div>{formatDateTime(content.updatedAt)}</div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
function formatDateTime(dateTime: string) {
  const date = new Date(dateTime);
  const yyyy = date.getFullYear();
  const MM = fillZero(date.getMonth() + 1, 2);
  const dd = fillZero(date.getDate(), 2);
  const HH = fillZero(date.getHours(), 2);
  const mm = fillZero(date.getMinutes(), 2);
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}`;
}
function fillZero(n: number, digit: number) {
  return n.toString().padStart(digit, "0");
}
