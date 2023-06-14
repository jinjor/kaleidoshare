# 設定の書き方

設定は JSON 形式で記述します。
試しに、以下の設定をコピーしてエディタに貼り付けてみましょう。
設定を反映するには、"Generate" ボタンを押すか Ctrl+S を押してください。

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

左ペインの回転する三角形をスピナー、その中に配置される図形をオブジェクトと呼びます。
この例では、スピナーの中に円が３つ、長方形が２つ配置されました。

中央のビューに描画されているのは、スピナーの一部の領域を周期的に貼り合わせたものです。
オブジェクトがスピナーの端にある時は描画されないことに注意してください。

## 数値

上の設定の中の１つ目の `shape` に注目してみましょう。

```javascript
"shape": {
  "type": "circle",
  "radius": 0.1
}
```

円の半径 radius の値（0.1）は左の領域全体の幅を 1 とした時の長さです。

ここで、 radius の値がランダムに生成されるようにしてみましょう。

```javascript
"radius": { "min": 0.01, "max": 0.1 }
```

この設定を反映すると、毎回ランダムな大きさの円が生成されるようになります。

今度は、 radius の値が周期的に変化するようにしてみましょう。

```javascript
"radius": {
  "frequency": 0.2,
  "offset": 0.08,
  "amplitude": 0.05
}
```

この設定を反映すると、円の半径は 0.08 を中心に振幅 0.05 、周波数 0.2(Hz) で周期的に変化します。
波形はサインで、必要に応じて初期位相 angle(degree) を設定することもできます。

さらに、それぞれの数値は先ほどと同様にランダムにすることもできます。
たとえば周波数にバラツキを持たせたい場合は以下のようにします。

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

## 色

今度は色に注目してみましょう。
円の色は fill の指定で赤に塗りつぶされています。

```javascript
"fill": "red"
```

次のようにすると、リストの中から一つの色がランダムに選ばれます。

```javascript
"fill": ["red", "green", "blue", "purple"]
```

色の指定には CSS と同様の表現が使えます。

```javascript
"fill": ["#fa0", "rgb(100,100,200)", "hsl(180,50%,50%)"]
```

RGB や HSL を使う場合、上のように書いても良いのですが、個別のプロパティを設定することもできます。

```javascript
"fill": {
  "type": "hsl",
  "h": 180,
  "s": 50,
  "l": 50
}
```

もちろん、各数値はランダムにすることもできます。

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

外縁の色を指定したい場合は、fill の隣に stroke と strokeWidth を加えます。

```javascript
"stroke": "white",
"strokeWidth": 0.03
```

## 形

指定可能な形は次の通りです。

円

```javascript
"shape": { "type": "circle", "radius": 0.1 }
```

多角形

```javascript
"shape": { "type": "polygon", "sides": 5, "radius": 0.1 }
```

長方形

```javascript
"shape": { "type": "rectangle", "width": 0.1, "height": 0.2 }
```

## 重さ

オブジェクトの重さを指定することもできます。

```javascript
"objects": [
  {
    "weight": 0.01
    ...
  }
]
```

weight のデフォルト値は 1 で、それよりも小さな値にするとオブジェクトの落下が遅くなり、負の値にするとオブジェクトは上昇します。

## スピナー

スピナーの挙動を設定することもできます。

```javascript
"spinner": {
  "sides": 4,
  "speed": 0.1
},
"objects": ...
```

sides は辺の数、 speed は１秒あたりの回転数です。

## 背景色

背景色を設定することもできます。

```javascript
"background": "#fff",
"objects": ...
```

# 作品の公開

"Publish" ボタンを押すと、作品を公開できます。

**ランダムな値は公開時に固定されます。**
公開時には設定だけでなく「設定を元に最後に生成した結果」も同時に保存されます。
この生成結果にはランダムな要素は含まれないため、閲覧者は毎回同じ画面を見ることになります。

作者としてランダムな生成結果に納得がいかない場合は、良い結果が出るまで再生成してみましょう。
