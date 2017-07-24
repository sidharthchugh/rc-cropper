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
      loaded: false
    })

    this._isMounted = false
    this.state = this._getInitialState()
    this.cropped = false
    this.cropper = null
    this.image = null
    this.container = null
    this.imgSize = {}
    this.isCropperReady = true

    this.zoomIn = this._zoom.bind(this, props.zoomStep)
    this.zoomOut = this._zoom.bind(this, -1 * props.zoomStep)
    this.moveLeft = this._move.bind(this, -1 * props.moveStep, 0)
    this.moveRight = this._move.bind(this, props.moveStep, 0)
    this.moveUp = this._move.bind(this, 0, -1 * props.moveStep)
    this.moveDown = this._move.bind(this, 0, props.moveStep)
    this.rotate = this._rotate.bind(this, props.rotateStep)
    this.rotateAnti = this._rotate.bind(this, -1 * props.rotateStep)
    this.getCroppedCanvas = this._getCroppedCanvas.bind(this)
  }

  componentDidMount () {
    if (this.props.src) {
      this._initiate(this.props)
    }
    this._isMounted = true
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.src !== nextProps.src) {
      if (this.cropper) {
        this.cropper.destroy()
      }
      this.setState({
        ...this._getInitialState()
      })
      this.cropped = false
    }
  }

  componentDidUpdate (prevProps) {
    // the cropper should initiate after image was mounted
    if (prevProps.src !== this.props.src) {
      this._initiate(this.props)
    }
  }

  componentWillUnmount () {
    if (this.cropper) {
      this.cropper.destroy()
    }
    this._isMounted = false
  }

  _initiate (props) {
    let { src } = props
    src = this._processSrc(src)
    const img = new Image()
    img.src = src
    img.onload = () => {
      if (this._isMounted) {
        this.setState({
          imgInfo: {
            width: img.width,
            height: img.height
          },
          loaded: true
        })
        this._setContainerSize(img)
        this._initCropper(props)
      }
    }
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

  render () {
    const { src, locale, showActions, className, outputImgSize } = this.props
    const { imgInfo, loaded, cropDetail } = this.state
    const { imgSize } = this

    const cls = `crop-container ${className}`
    const originalSrc = this._processSrc(src)

    const outputSize = this._getOutputSize(cropDetail, outputImgSize)
    const containerCls = `img-container${loaded ? '' : ' not-loaded'}`

    return (
      <div className={cls}>
        <div ref={c => { this.container = c }} className={containerCls} style={imgSize}>
          <img
            src={originalSrc}
            ref={img => { this.image = img }}
          />
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
              <span>
                {`${Math.floor(outputSize.width || 0)} * ${Math.floor(outputSize.height || 0)}`}
              </span>
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
  onReady: PropTypes.func
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
  containerSizeLimit: SIZE_LIMIT
}
