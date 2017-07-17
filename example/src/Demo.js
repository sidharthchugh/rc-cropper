import React, { Component } from 'react';
import 'cropperjs/dist/cropper.css';
import Cropper from '../../src/rc-cropper';

const src = 'http://fengyuanchen.github.io/cropper/images/picture.jpg';

// Inspired by [react-cropper](https://github.com/roadmanfong/react-cropper)

export default class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src,
      cropResult: null,
    };
    this._cropImage = this._cropImage.bind(this);
    this._onChange = this._onChange.bind(this);
    this._useDefaultImage = this._useDefaultImage.bind(this);
  }

  _cropImage() {
    if (typeof this.refs.cropper.getCroppedCanvas() === 'undefined') {
      return;
    }
    this.setState({
      cropResult: this.refs.cropper.getCroppedCanvas().toDataURL(),
    });
  }

  _onChange(e) {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({ src: reader.result });
    };
    reader.readAsDataURL(files[0]);
  }

  _useDefaultImage() {
    this.setState({ src });
  }

  render() {
    return (
      <div>
        <div style={{ width: '100%' }}>
          <input type="file" onChange={this._onChange} />
          <button onClick={this._useDefaultImage}>Use default img</button>
          <br />
          <br />
          <Cropper ref="cropper" src={this.state.src} showActions />
        </div>
        <div>
          <button onClick={this._cropImage}>Crop</button>
          <div>
            {
              this.state.cropResult
              ? <img src={this.state.cropResult} />
              : null
            }
          </div>
        </div>
      </div>
    );
  }
}
