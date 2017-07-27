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
      imgLoaded: false,
      src: undefined
    })

    this._isMounted = false
    this.state = this._getInitialState()
    this.cropped = false
    this.cropper = null
    this.image = null
    this.container = null
    this.imgSize = {}
    this.isCropperReady = false

    this.zoomIn = this._zoom.bind(this, props.zoomStep)
    this.zoomOut = this._zoom.bind(this, -1 * props.zoomStep)
    this.moveLeft = this._move.bind(this, -1 * props.moveStep, 0)
    this.moveRight = this._move.bind(this, props.moveStep, 0)
    this.moveUp = this._move.bind(this, 0, -1 * props.moveStep)
    this.moveDown = this._move.bind(this, 0, props.moveStep)
    this.rotate = this._rotate.bind(this, props.rotateStep)
    this.rotateAnti = this._rotate.bind(this, -1 * props.rotateStep)
    this.getCroppedCanvas = this._getCroppedCanvas.bind(this)
    this.handleInputWidth = this._handleInputWidth.bind(this)
    this.handleInputHeight = this._handleInputHeight.bind(this)
    this.handleImgLoaded = this._handleImgLoaded.bind(this)
  }

  componentDidMount () {
    if (this.props.src) {
      this._initiate(this.props)
    }
    this._isMounted = true
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.src !== nextProps.src) {
      $h.log('rc-cropper src changed')
      this.destroy()
      this.setState({
        ...this._getInitialState()
      })
      this.cropped = false

      this._initiate(nextProps)
    } else if (!this.props.shouldRender &&
        nextProps.shouldRender &&
        this.state.imgLoaded &&
        !this.cropper) {
      $h.log('rc-cropper init by receive props')
      this._initCropper(nextProps)
    }
  }

  componentWillUnmount () {
    this.destroy()
    this._isMounted = false
  }

  destroy () {
    if (this.cropper) {
      $h.log('rc-cropper destroy')
      this.cropper.destroy()
      this.cropper = null
    }

    const { src } = this.state
    if (src && $h.isBlobURL(src)) {
      $h.log('rc-cropper revoke url')
      URL.revokeObjectURL(src)
    }
  }

  _initiate (props) {
    const { src } = props

    const onLoad = image => {
      if (this._isMounted) {
        this.setState({
          imgInfo: {
            width: image.width,
            height: image.height
          },
          src: image.src
        })
        this._setContainerSize(image)
      }
    }

    if ($h.isCrossOriginURL(src)) {
      $h.loadImageByXHR(src, url => {
        this._loadImage(url, onLoad)
      })
    } else {
      this._loadImage(src, onLoad)
    }
  }

  _loadImage (src, callback) {
    const img = new Image()
    img.onload = () => {
      callback(img)
    }
    img.src = src
  }

  _initCropper (props) {
    const { outputImgSize, onReady } = props
    const options = {
      // aspectRatio: 16 / 9,
      autoCrop: true,
      autoCropArea: 0.8,
      viewMode: 0,
      minContainerWidth: 50,
      minContainerHeight: 50,
      ...props.options
    }

    if (!options.aspectRatio && outputImgSize.width && outputImgSize.height) {
      options.aspectRatio = outputImgSize.width / outputImgSize.height
    }

    this.cropper = new Cropper(this.image, {
      ...options,
      ready: () => {
        if (options.autoCrop) {
          this.cropper.crop()
          this.cropped = true
        }
        if (onReady) {
          onReady()
        }
        this.isCropperReady = true
      },
      crop: e => {
        $h.log(111, e.detail)
        this.setState({
          cropDetail: e.detail || {}
        })
      }
    })

    this.image.addEventListener('cropstart', () => {
      this.cropped = true
    })
  }

  _setContainerSize (img) {
    const limit = {
      ...SIZE_LIMIT,
      ...this.props.containerSizeLimit
    }
    const containerSize = $h.getImgContainerSize(img.width, img.height, limit)
    this.imgSize = {
      width: `${containerSize.w}px`,
      height: `${containerSize.h}px`
    }
    // set the container size immediately,
    // because the cropper need the size to intiate it's cropper box
    this.container.style.width = this.imgSize.width
    this.container.style.height = this.imgSize.height
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

  _getCroppedCanvas (options) {
    const { outputImgSize } = this.props
    return this.cropper && this.cropped && this.isCropperReady
      ? this.cropper.getCroppedCanvas({ ...outputImgSize, ...options })
      : null
  }

  _processSrc (src) {
    return src ? src.replace(/size=\d+&?/, '') : src
  }

  _getOutputSize (cropDetail, outputSize) {
    if (!outputSize.width && !outputSize.height) {
      // not specified output size
      return cropDetail
    } else if (outputSize.width && outputSize.height) {
      return outputSize
    } else if (outputSize.width && !outputSize.height) {
      const height = outputSize.width / (cropDetail.width / cropDetail.height)
      return {
        ...outputSize,
        height
      }
    }
    const width = outputSize.height * (cropDetail.width / cropDetail.height)
    return {
      ...outputSize,
      width
    }
  }

  _parseInput (e) {
    let val = parseInt(e.target.value, 10)
    if (isNaN(val) || val < 1) {
      val = 1
    }
    return val
  }

  _handleInputWidth (e) {
    const val = this._parseInput(e)
    const imgData = this.cropper.getImageData()
    const ratio = imgData.width / imgData.naturalWidth
    const lastCropData = this.cropper.getCropBoxData()
    this.cropper.setCropBoxData({
      ...lastCropData,
      width: val * ratio
    })
  }

  _handleInputHeight (e) {
    const val = this._parseInput(e)
    const imgData = this.cropper.getImageData()
    const ratio = imgData.width / imgData.naturalWidth
    const lastCropData = this.cropper.getCropBoxData()
    this.cropper.setCropBoxData({
      ...lastCropData,
      height: val * ratio
    })
  }

  _handleImgLoaded () {
    this.setState({
      imgLoaded: true
    })
    if (this.props.shouldRender) {
      this._initCropper(this.props)
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

  _renderImage () {
    const { src } = this.state
    const { locale } = this.props
    if (src) {
      return (
        <img
          src={src}
          onLoad={this.handleImgLoaded}
          crossOrigin="anonymous"
          ref={img => { this.image = img }}
        />
      )
    }
    return (
      <div className="img-loading-mask">
        <span>{locale.loading}</span>
      </div>
    )
  }

  render () {
    const { locale, showActions, className, outputImgSize } = this.props
    const { imgInfo, cropDetail } = this.state
    const { imgSize } = this
    const cropBoxEditable = outputImgSize && (outputImgSize.width || outputImgSize.height)
      ? false
      : this.props.cropBoxEditable

    const cls = `crop-container ${className}`

    const outputSize = this._getOutputSize(cropDetail, outputImgSize)

    return (
      <div className={cls}>
        <div ref={c => { this.container = c }} className="img-container" style={imgSize}>
          { this._renderImage() }
        </div>
        <div className="actions">
          <div className="info">
            <span className="fl">
              <span>{locale.originalSize}</span>
              <span>{`${imgInfo.width} * ${imgInfo.height}`}</span>
            </span>
            <span className="fr">
              <span>{locale.cropSize}</span>
              {
                cropBoxEditable
                ? <input
                  value={Math.round(outputSize.width || 0)}
                  onChange={this.handleInputWidth}
                  pattern="[0-9]+"
                />
                : <span>{Math.round(outputSize.width || 0)}</span>
              }
              <span style={{ margin: '0 3px' }}> * </span>
              {
                cropBoxEditable
                ? <input
                  value={Math.round(outputSize.height || 0)}
                  onChange={this.handleInputHeight}
                  pattern="[0-9]+"
                />
                : <span>{Math.round(outputSize.height || 0)}</span>
              }
            </span>
          </div>
          <div className="btns">
            { showActions ? this._renderActions() : null }
          </div>
        </div>
      </div>
    )
  }
}

CropperCore.propTypes = {
  src: PropTypes.string.isRequired,
  locale: PropTypes.object,
  zoomStep: PropTypes.number,
  moveStep: PropTypes.number,
  rotateStep: PropTypes.number,
  outputImgSize: PropTypes.object,
  showActions: PropTypes.bool,
  className: PropTypes.string,
  options: PropTypes.object, // see https://github.com/fengyuanchen/cropperjs/blob/master/README.md#options
  containerSizeLimit: PropTypes.object,
  onReady: PropTypes.func,
  cropBoxEditable: PropTypes.bool,
  shouldRender: PropTypes.bool  // whether initiate the cropper immediateley
}

CropperCore.defaultProps = {
  locale: {
    originalSize: 'Original Size: ',
    cropSize: 'Output Size: ',
    loading: 'Loading...'
  },
  zoomStep: 0.2,
  moveStep: 2,
  rotateStep: 45,
  outputImgSize: {},
  showActions: false,
  className: '',
  options: {},
  containerSizeLimit: SIZE_LIMIT,
  cropBoxEditable: true,
  shouldRender: true
}
