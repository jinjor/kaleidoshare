export async function publish(
  userName: string,
  settings: any
): Promise<string> {
  // TODO: encode
  const res = await fetch(`/api/contents/${userName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  if (res.status >= 400) {
    const { message } = await res.json();
    alert(message); // TODO
    throw new Error("Failed"); // TODO: handle error
  }
  const { id } = await res.json();
  return id;
}
