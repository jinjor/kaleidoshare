type TrignaleNode = {
  x: number;
  y: number;
  rotateMatrix: [number, number, number, number];
};

export function createTriangleNodes(generation) {
  const nodes = new Map();
  const firstNode: TrignaleNode = {
    x: 0,
    y: 0,
    rotateMatrix: [1, 0, 0, 1],
  }; // r = 1 で正規化
  function nodeId(node) {
    return (
      Math.round(node.x * 100) / 100 + "," + Math.round(node.y * 100) / 100
    );
  }
  nodes.set(nodeId(firstNode), firstNode);
  let prev: TrignaleNode[] = [firstNode];
  for (let i = 0; i < generation; i++) {
    const next: TrignaleNode[] = [];
    const directions =
      i % 2 === 0
        ? [(Math.PI / 6) * 3, (Math.PI / 6) * 7, (Math.PI / 6) * 11]
        : [(Math.PI / 6) * 1, (Math.PI / 6) * 5, (Math.PI / 6) * 9];
    for (const node of prev) {
      for (const direction of directions) {
        const [a, b, c, d] = node.rotateMatrix;
        const newNode = {
          x: node.x + Math.cos(direction),
          y: node.y + Math.sin(direction),
          rotateMatrix: stepMatrix(direction, a, b, c, d),
        };
        const id = nodeId(newNode);
        if (!nodes.has(id)) {
          nodes.set(id, newNode);
          next.push(newNode);
        }
      }
    }
    prev = next;
  }
  return [...nodes.values()];
}

function stepMatrix(
  angle: number,
  a: number,
  b: number,
  c: number,
  d: number
): [number, number, number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const a2 = -Math.pow(cos, 2) + Math.pow(sin, 2);
  const b2 = -2 * cos * sin;
  const c2 = -2 * cos * sin;
  const d2 = Math.pow(cos, 2) - Math.pow(sin, 2);
  const a3 = a2 * a + c2 * b;
  const b3 = b2 * a + d2 * b;
  const c3 = a2 * c + c2 * d;
  const d3 = b2 * c + d2 * d;
  return [a3, b3, c3, d3];
}

export function addElementsIntoView(
  num: number,
  viewElement: HTMLElement,
  triangleNodes: TrignaleNode[],
  options: { radius: number; width: number; height: number }
) {
  const { radius, width, height } = options;
  for (const node of triangleNodes) {
    const x = width / 2 - radius + node.x * radius;
    const y = width / 2 - radius + node.y * radius;

    const el = document.createElement("div");
    el.style.position = "absolute";
    el.className = "node" + num;
    el.style.width = `${radius * 2}px`;
    el.style.height = `${radius * 2}px`;
    el.style.backgroundPosition = "center";
    el.style.backgroundRepeat = "no-repeat";
    el.style.clipPath = `polygon(${radius}px ${0}px, ${
      radius + radius * Math.cos(Math.PI / 6)
    }px ${radius + radius * Math.sin(Math.PI / 6)}px, ${
      radius + radius * Math.cos((Math.PI / 6) * 5)
    }px ${radius + radius * Math.sin((Math.PI / 6) * 5)}px)`;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = `matrix(${node.rotateMatrix
      .map((n) => n.toFixed(2))
      .join(",")},0,0)`;
    viewElement.appendChild(el);
  }
}
