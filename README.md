# rc-cropper

An react component wrapping the [Cropperjs](https://github.com/fengyuanchen/cropperjs).

## Cropperjs Docs

* [Image Cropper](https://github.com/fengyuanchen/cropperjs)

## Installation
Install via [npm](https://www.npmjs.com/package/rc-cropper)

```shell
npm install --save rc-cropper
```

## Example

Inspired by [react-cropper](https://github.com/roadmanfong/react-cropper)

```js
import React, {Component} from 'react'
import Cropper from 'rc-cropper'
class Demo extends Component {
  crop(){
    const canvas = this.refs.cropper.getCroppedCanvas()
    const url = canvas.toDataURL() // image url
    const blob = canvas.toBlob(blob => {
      // upload the blob or do anything else
    })
  }

  render() {
    const options = {
      aspectRatio: 16 / 9
    }
    return (
      <Cropper
        ref='cropper'
        src='http://fengyuanchen.github.io/cropper/images/picture.jpg'
        options={options} />
    )
  }
}
```

## Props
name | type | default | description
---|---|---|---
src | string | | image src
className | string |  | custom class name
locale | object | | for i18n
zoomStep | number | 0.2 | zoom step
moveStep | number | 2px | move step
rotateStep | number | 45deg | rotate step
onReady | function |  | callback when the cropper is ready
showActions | bool | false | whether show action buttons, support zoom/move/rotate
outputImgSize | object | | specify the output canvas size, format: {width: *, height: *}
containerSizeLimit | object | {  maxWidth: 500, maxHeight: 500, minWidth: 50, minHeight: 50} | the size limitation of image container
cropBoxEditable | bool | true | Whether the cropbox width and height can edit by input. If `outputImgSize` is set, this property would be invaild
shouldRender | bool | true | should initiate the cropper instance, the cropper instance will be intiated when `shouldRender` become `true` and the image is loaded.
options | object |  | options for [cropperjs](https://github.com/fengyuanchen/cropper)

Note:
* If `outputImgSize` is specified and no `aspectRatio` specified in `options`, rc-cropper will caculate the `aspectRatio` based on `outputImgSize` automatically. `aspectRation = outputImgSize.width / outputImgSize.height`
