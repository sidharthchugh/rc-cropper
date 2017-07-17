# rc-cropper

[Cropperjs](https://github.com/fengyuanchen/cropperjs) as React components

Inspired by [react-cropper](https://github.com/roadmanfong/react-cropper)

## Docs

* [Image Cropper](https://github.com/fengyuanchen/cropper)

## Installation
Install via [npm](https://www.npmjs.com/package/rc-cropper)

```shell
npm install --save rc-cropper
```


## Quick Example
```js
import React, {Component} from 'react';
import Cropper from 'react-cropper';
class Demo extends Component {
  
  // public
  crop(){
    const canvas = this.refs.cropper.getCroppedCanvas()
    const url = canvas.toDataURL() // image url
    const blob = canvas.toBlob(blob => {
      // upload or other actions
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
    );
  }
}
```

## Options
* See [Image Cropper](https://github.com/fengyuanchen/cropper)