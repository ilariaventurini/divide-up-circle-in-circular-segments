<div align="center" style="text-align: center;">

[demo page](https://divide-up-circle-in-circular-segments.netlify.app/)
<h1>Divide up circle in circular segments</h1>

</div>

---

This library allows you to divide a circle into circular segments whose area is proportional to the data received in input.
Here is an example:

![step1](https://user-images.githubusercontent.com/44204353/90658274-ab216480-e243-11ea-867a-5e5837d32bd5.png)

This means that the red circular segment (`S1`) has area equal to 30% of the area of ​​the circle, the blue circular segment (`S2`) also, while the blue circular segment (`S3`) has area equal to 40% of the total area of ​​the circle.

The computation is therefore made on areas, not as a proportion of the diameter. In this case the result would have been different:

![propDiam](https://user-images.githubusercontent.com/44204353/90658272-aa88ce00-e243-11ea-9fc4-d4c481ffc77b.png)

As you can see, in the firs case (library output) the first two circular segments have both value 30% but their heights are different, in the second case not.

## ⚙️ Install

```bash
yarn add divide-up-circle-in-proportional-areas-by-chords
```

or

```bash
npm install divide-up-circle-in-proportional-areas-by-chords --save
```

## 📷 Screenshots

![demo](https://user-images.githubusercontent.com/44204353/90682534-627aa300-e265-11ea-9082-193a2c64b20b.gif)

## 🐝 API

As seen before, you can create circular segments proportional by circle area.

### `computeCircularSegments(r, center, percentages)`

The `computeCircularSegments` function accepts 4 parameters and an array of objects in which each object contains the useful information about each circular segment.

#### Parameters

| Argument             | Type      | Description                                                                            |
| -------------------- | --------- | -------------------------------------------------------------------------------------- |
| `dataset`            | `number`  | array of objects, each object must contains a `percentage` property (number in [0, 1]) |
| `radius`             | `number`  | circle radius                                                                          |
| `center`             | `Point`   | circle center                                                                          |
| `options` (optional) | `Options` | option objects                                                                         |

**Note**: the sum of `percentage` values must be 1.

Where:

```ts
interface Point {
  x: number
  y: number
}
```

```ts
interface Options {
  orientation?: 'horizontal' | 'vertical'
}
```

`options` object is optional and the default is:

```js
const defaultOptions: Options = {
  orientation: 'horizontal',
}
```

#### Returns

The returned array contains one object for each circular segment. Each object is composed of these properties:

| Property name          | Type       | Description                                                                               |
| ---------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| `...datum`             | /          | the original `dataset` object info                                                        |
| `percentage`           | `number`   | number in [0, 1]                                                                          |
| `cumulativePercentage` | `number`   | cumulative percentage value                                                               |
| `height`               | `number`   | circular segment height                                                                   |
| `cumulativeHeight`     | `number`   | cumulative circular segment height                                                        |
| `theta`                | `number`   | angle subtended by the chord at the center of the circle related to the circlular segment |
| `path`                 | `string`   | path string useful to draw the circular segment                                           |
| `center`               | `Point`    | center point of the circular segment                                                      |
| `vertices`             | `Vertices` | coordinates of vertices of circular segment                                               |

```ts
interface Vertices {
  topLeft: Point
  topRight: Point
  bottomLeft: Point
  bottomRight: Point
}
```

## Example

I hope the following example can better explain the information written above.

```ts
const dataset = [
  {percentage: 0.3, color: "#ff787a"},
  {percentage: 0.3, color: "#7f7ad9"},
  {percentage: 0.4, color: "#74dfc9"}
]
const radius = 125
const center = { x: radius, y: radius }
const circularSegments = computeCircularSegments(dataset, r, center)

// [
//   {
//     center: { x: 125, y: 42.5192806380935 },
//     color: '#ff787a',
//     cumulativeHeight: 85.038561276187,
//     cumulativePercentage: 0.3,
//     height: 85.038561276187,
//     path:
//       'M 125 0 L 125 0 A 125 125 2.4907848665483074 0 0 6.559789703315133 85.038561276187 L 243.44021029668488 85.038561276187 A 125 125 2.4907848665483074 0 0 125 0',
//     percentage: 0.3,
//     theta: 2.4907848665483074,
//     vertices: {
//       bottomLeft: { x: 6.559789703315133, y: 85.038561276187 },
//       bottomRight: { x: 243.44021029668488, y: 85.038561276187 },
//       topLeft: { x: 125, y: 0 },
//       topRight: { x: 125, y: 0 },
//     },
//   },
//   { ... },
//   { ... }
```

You can draw the circular segments using the information above and here is the result:

![step1](https://user-images.githubusercontent.com/44204353/90658274-ab216480-e243-11ea-867a-5e5837d32bd5.png)

In particular:

![stepS1](https://user-images.githubusercontent.com/44204353/90683814-70312800-e267-11ea-8213-cd042684ec37.png)

![stepS2](https://user-images.githubusercontent.com/44204353/90673110-8636ec80-e257-11ea-8c06-e508b629593e.png)

and so on...

In this case the `options` object is undefined and since the default orientation value is `horizontal`, the circular segments are drawn horizontally.

Setting orientation to `vertical` (`computeCircularSegments(dataset, r, center, { orientation: 'vertical' })`), you get:

![vert](https://user-images.githubusercontent.com/44204353/90673568-3c023b00-e258-11ea-9763-11d9933de66b.png)

## 🙈 Demo page

A [demo page](https://divide-up-circle-in-proportional-areas-by-chords.netlify.app/) is available.

## License

[MIT](https://github.com/ilariaventurini/divide-up-circle-in-proportional-areas-by-chords/blob/master/LICENSE) © [Ilaria
Venturini](https://github.com/ilariaventurini)

<!--
TODO:
- [ ]
-->
