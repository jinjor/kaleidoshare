export function getGlobalStyle(name: string) {
  const style = getComputedStyle(document.body);
  return style.getPropertyValue(name);
}
export function getPx(s: string): number {
  return parseFloat(s.replace("px", ""));
}
