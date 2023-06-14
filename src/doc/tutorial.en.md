# How to Write Settings

Settings are written in JSON format. As a test, copy and paste the following configuration into the editor. To apply the settings, press the "Generate" button or Ctrl+S.

```javascript
{
  "objects": [
    {
      "count": 3,
      "shape": {
        "type": "circle",
        "radius": 0.1
      },
      "fill": "red"
    },
    {
      "count": 2,
      "shape": {
        "type": "rectangle",
        "width": 0.1,
        "height": 0.2
      },
      "fill": "yellow"
    }
  ]
}
```

The spinning triangle in the left pane is called the spinner, and the shapes placed inside it are called objects. In this example, three circles and two rectangles were placed inside the spinner.

What is drawn in the center view is a periodic pasting of an area of the spinner. Note that objects are not drawn when they are on the edges of the spinner.

## Numeric

Let's look at the first shape in the above settings.

```javascript
"shape": {
  "type": "circle",
  "radius": 0.1
}
```

The radius value (0.1) is the length when the width of the left area is set to 1.

Now, let's make sure that the radius value is randomly generated.

```javascript
"radius": { "min": 0.01, "max": 0.1 }
```

Reflecting this setting, circles of random sizes will be generated each time.

Now let's make the radius value change periodically.

```javascript
"radius": {
  "frequency": 0.2,
  "offset": 0.08,
  "amplitude": 0.05
}
```

Reflecting this setting, the radius of the circle will vary periodically around 0.08 with an amplitude of 0.05 and a frequency of 0.2 (Hz). The waveform is sine, and the initial phase "angle" (in degree) can be set if desired.

In addition, each value can be randomized as in the previous example. For example, if you want to have a variation in frequency, you can do the following.

```javascript
"radius": {
  "frequency": {
    "min": 0.1,
    "max": 0.8
  },
  "offset": 0.08,
  "amplitude": 0.05
}
```

## Color

Now let's look at the color. The circle is filled with red by specifying "fill".

```javascript
"fill": "red"
```

The following will randomly select one color from the list.

```javascript
"fill": ["red", "green", "blue", "purple"]
```

The same expressions as in CSS can be used to specify colors.

```javascript
"fill": ["#fa0", "rgb(100,100,200)", "hsl(180,50%,50%)"]
```

When using RGB or HSL, you can write as above, but you can also set individual properties.

```javascript
"fill": {
  "type": "hsl",
  "h": 180,
  "s": 50,
  "l": 50
}
```

Of course, each number can be randomized.

```javascript
"fill": {
  "type": "hsl",
  "h": 180,
  "s": 50,
  "l": {
    "min": 10,
    "max": 90
  }
}
```

If you want to specify the color of the outer edge, add "stroke" and "strokeWidth" next to "fill".

```javascript
"stroke": "white",
"strokeWidth": 0.03
```

## Shapes

The following shapes can be specified.

Circle

```javascript
"shape": { "type": "circle", "radius": 0.1 }
```

Polygon

```javascript
"shape": { "type": "polygon", "sides": 5, "radius": 0.1 }
```

Rectangle

```javascript
"shape": { "type": "rectangle", "width": 0.1, "height": 0.2 }
```

## Weight

You can also specify the weight of an object.

```javascript
"objects": [
  {
    "weight": 0.01
    ...
  }
]
```

The default value for weight is 1; smaller values slow the object's fall, and negative values cause the object to rise.

## Spinner

You can also set the behavior of the spinner.

```javascript
"spinner": {
  "sides": 4,
  "speed": 0.1
},
"objects": ...
```

"sides" is the number of sides and "speed" is the number of rotations per second.

## Background Color

You can also set a background color.

```javascript
"background": "#fff",
"objects": ...
```

# Publish your work

"Publish" button allows you to publish your work.

**Random values are fixed at the time of publication.** When you publish, not only the settings, but also the "last generated result based on the settings" will be saved at the same time. Since this generated result does not contain any random elements, the visitor will see the same screen each time.

If you, as the author, are not satisfied with the random generated result, try re-generating it until you get a better result.
