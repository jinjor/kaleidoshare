import { Settings } from "../../schema/schema";

export type Example = {
  name: string;
  settings: Settings;
};
export const example1: Example = {
  name: "example 1",
  settings: {
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
  },
};
export const example2: Example = {
  name: "Snow",
  settings: {
    background: "#124",
    objects: [
      {
        count: 100,
        shape: {
          type: "circle",
          radius: {
            min: 0.01,
            max: 0.04,
          },
          stroke: "#28e",
          strokeWidth: 0.01,
          fill: ["transparent", "#ddd", "#8be"],
        },
      },
    ],
  },
};

export const empty: Example = {
  name: "empty",
  settings: {
    objects: [],
  },
};

export default [example1, example2, empty];
