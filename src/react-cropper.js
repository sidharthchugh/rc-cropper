import React, { Component, PropTypes } from 'react'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import './style.css'
import * as $h from './utils'

const SIZE_LIMIT = {
  maxWidth: 500,
  maxHeight: 500,
  minWidth: 50,
  minHeight: 50
}

export default class CropperCore extends Component {
  constructor (props) {
    super()
    this._getInitialState = () => ({
      imgInfo: {
        width: '',
        height: ''
      },
      cropDetail: {},
      previewSrc: '',
      imgSize: {},
      loaded: false
    })
    this.state = this._getInitialState()
    this.cropped = false
    this.cropper = null
    this.image = null
    this.imgSize = {}

    this.initiate = this._initiate.bind(this)
    this.initCropper = this._initCropper.bind(this)
    this.zoomIn = this._zoom.bind(this, props.zoomStep)
    this.zoomOut = this._zoom.bind(this, -1 * props.zoomStep)
    this.moveLeft = this._move.bind(this, -1 * props.moveStep, 0)
    this.moveRight = this._move.bind(this, props.moveStep, 0)
    this.moveUp = this._move.bind(this, 0, -1 * props.moveStep)
    this.moveDown = this._move.bind(this, 0, props.moveStep)
    this.rotate = this._rotate.bind(this, props.rotateStep)
    this.rotateAnti = this._rotate.bind(this, -1 * props.rotateStep)
    this.preview = this._preview.bind(this)
    this.getCroppedImageData = this._getCroppedImageData.bind(this)
    this.getCroppedCanvas = this._getCroppedCanvas.bind(this)
    this.setContainerSize = this._setContainerSize.bind(this)
    this.reset = () => this.cropper && this.cropper.reset()
  }

  static propTypes = {
    src: PropTypes.string.isRequired,
    locale: PropTypes.object, // {originalSize: '原图尺寸'， cropSize: '裁剪尺寸'}
    zoomStep: PropTypes.number,
    moveStep: PropTypes.number,
    rotateStep: PropTypes.number,
    outputImgType: PropTypes.string,
    outputImgSize: PropTypes.object,
    preview: PropTypes.bool,
    showActions: PropTypes.bool,
    className: PropTypes.string,
    options: PropTypes.object, // 参见 https://github.com/fengyuanchen/cropperjs/blob/master/README.md#options
    containerSizeLimit: PropTypes.object
  };

  static defaultProps = {
    locale: {
      originalSize: 'Original Size: ',
      cropSize: 'Output Size: ',
      loading: 'Loading...'
    },
    zoomStep: 0.2,
    moveStep: 2,
    rotateStep: 45,
    outputImgType: 'png',
    outputImgSize: {},
    preview: false,
    showActions: false,
    className: '',
    options: {},
    containerSizeLimit: SIZE_LIMIT
  };

  _initiate (props) {
    let { src } = props
    src = this._processSrc(src)
    const img = new Image()
    img.src = src
    img.onload = () => {
      this.setState({
        imgInfo: {
          width: img.width,
          height: img.height
        },
        loaded: true
      })
      this.setContainerSize(img)
      this.initCropper(props)
    }
  }

  _initCropper (props) {
    const { outputImgSize } = props
    const options = {
      // aspectRatio: 16 / 9,
      autoCrop: true,
      autoCropArea: 0.8,
      viewMode: 0,
      minContainerWidth: 50,
      minContainerHeight: 50,
      ...props.options
    }

    if (options.autoCrop) {
      this.cropped = true
    }

    if (!options.aspectRatio && outputImgSize.width && outputImgSize.height) {
      options.aspectRatio = outputImgSize.width / outputImgSize.height
    }

    this.cropper = new Cropper(this.image, {
      ...options,
      ready: () => {
        if (options.autoCrop) {
          this.cropper.crop()
        }
      },
      crop: e => {
        this.setState({
          cropDetail: e.detail || {}
        })
      }
    })

    this.image.addEventListener('cropstart', e => {
      this.cropped = true
    })
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.src !== nextProps.src) {
      this.cropper && this.cropper.destroy()
      this.setState({
        ...this._getInitialState()
      })
      this.cropped = false
    }
  }

  componentDidMount () {
    if (this.props.src) {
      this.initiate(this.props)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    // image需要挂载之后才能去初始化cropper，故放到didUpdate中执行
    if (prevProps.src !== this.props.src) {
      this.initiate(this.props)
    }
  }

  componentWillUnmount () {
    if (this.image) {
      this.cropper.destroy()
    }
  }

  _setContainerSize (img) {
    const limit = {
      ...SIZE_LIMIT,
      ...this.props.containerSizeLimit
    }
    const containerSize = $h.getImgContainerSize(img.width, img.height, limit)
    this.imgSize = {
      width: containerSize.w,
      height: containerSize.h
    }
    // 立即设置容器的大小，而不是通过setState来设置
    // 因为初始化cropper时候会根据容器尺寸设置cropper的尺寸
    this.container.style.width = containerSize.w + 'px'
    this.container.style.height = containerSize.h + 'px'
  }

  _zoom (ratio) {
    this.cropped = true
    this.cropper.zoom(ratio)
  }

  _move (x = 0, y = 0) {
    this.cropped = true
    this.cropper.move(x, y)
  }

  _rotate (deg) {
    this.cropped = true
    this.cropper.rotate(deg)
  }

  _getCroppedImageData () {
    return new Promise(resolve => {
      const canvas = this._getCroppedCanvas()
      if (!canvas) {
        resolve(null) // not cropped
      }

      const { outputImgType } = this.props
      const dataURL = canvas.toDataURL(`image/${outputImgType}`)
      canvas.toBlob(blob => {
        resolve({ dataURL, blob })
      })
    })
  }

  _getCroppedCanvas (options) {
    const { outputImgSize } = this.props
    return this.cropped
      ? this.cropper.getCroppedCanvas({ ...outputImgSize, ...options })
      : null
  }

  _preview () {
    this.setState({
      previewSrc: this.getCroppedImageData()
    })
  }

  _processSrc (src) {
    return src ? src.replace(/size=\d+&?/, '') : src
  }

  render () {
    const { src, locale, showActions, className, outputImgSize } = this.props
    const { imgInfo, loaded, cropDetail, previewSrc } = this.state
    const { imgSize } = this

    const cls = 'crop-container ' + className
    const originalSrc = this._processSrc(src)

    const outputSize = this._getOutputSize(cropDetail, outputImgSize)
    const containerCls = 'img-container' + (loaded ? '' : ' not-loaded')

    return (
      <div className={cls}>
        <div ref={c => { this.container = c }} className={containerCls} style={imgSize}>
          <img
            src={originalSrc}
            ref={img => { this.image = img }} />
          <div className="img-loading-mask">
            <span>{locale.loading}</span>
          </div>
        </div>
        <div className="actions">
          <div className="info">
            <span className="fl">
              <span>{locale.originalSize}</span>
              <span>{`${imgInfo.width} * ${imgInfo.height}`}</span>
            </span>
            <span className="fr">
              <span>{locale.cropSize}</span>
              <span>{`${Math.floor(outputSize.width || 0)} * ${Math.floor(outputSize.height || 0)}`}</span>
            </span>
          </div>
          <div className="btns">
            { showActions ? this._renderActions() : null }
          </div>
          {previewSrc ? <img src={previewSrc} /> : null}
        </div>
      </div>
    )
  }

  _getOutputSize (cropDetail, outputSize) {
    if (!outputSize.width && !outputSize.height) {
      // 未指定输出尺寸
      return cropDetail
    } else if (outputSize.width && outputSize.height) {
       // 指定输出尺寸
      return outputSize
    } else if (outputSize.width && !outputSize.height) {
       // 只指定了宽度
      const height = outputSize.width / (cropDetail.width / cropDetail.height)
      return {
        ...outputSize,
        height
      }
    } else {
      // 只指定高度
      const width = outputSize.height * (cropDetail.width / cropDetail.height)
      return {
        ...outputSize,
        width
      }
    }
  }

  _renderActions () {
    return (
      <span>
        <span className="btn-group">
          <button onClick={this.zoomIn}>Zoom In</button>
          <button onClick={this.zoomOut}>Zoom Out</button>
        </span>
        <span className="btn-group">
          <button onClick={this.moveLeft}>Left</button>
          <button onClick={this.moveRight}>Right</button>
          <button onClick={this.moveUp}>Up</button>
          <button onClick={this.moveDown}>Down</button>
        </span>
        <span className="btn-group">
          <button onClick={this.rotateAnti}>Contrarotate</button>
          <button onClick={this.rotate}>Rotate</button>
        </span>
      </span>
    )
  }
}
