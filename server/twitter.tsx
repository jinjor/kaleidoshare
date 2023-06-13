import React from "react";
import ReactDOMServer from "react-dom/server";

export function makeContentPageForTwitterBot(
  authorName: string,
  contentId: string
): string {
  const encAuthorName = encodeURIComponent(authorName);
  const encContentId = encodeURIComponent(contentId);
  const playerUrl = `https://kaleidoshare.deno.dev/contents/${encAuthorName}/${encContentId}/player`;
  const title = `${contentId} - kaleidoshare`;
  const description = `A kaleidoscope created by ${authorName}`; // TODO: title
  const imageUrl = `https://kaleidoshare.deno.dev/api/contents/${encAuthorName}/${encContentId}/image.png`;
  return ReactDOMServer.renderToString(
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta http-equiv="Cache-Control" content="no-store" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="twitter:card" content="player" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:site" content="kaleidoshare" />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:player" content={playerUrl} />
        <meta property="twitter:player:width" content="300" />
        <meta property="twitter:player:height" content="300" />
        <meta property="twitter:image" content={imageUrl} />
        <title>{contentId}</title>
      </head>
      <body></body>
    </html>
  );
}
