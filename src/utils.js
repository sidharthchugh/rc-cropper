/**
   * Get image contaniner size
   * @param {Number} originalWidth
   * @param {Number} originalHeight
   * @param {Object} sizeLimit - { maxW: 358, maxH: 320, minW: 34, minH: 34 }
   */
export function getImgContainerSize (originalWidth, originalHeight, sizeLimit) {
  const oriW = parseInt(originalWidth, 10)
  const oriH = parseInt(originalHeight, 10)

  if (!oriW || !oriH) {
    return {
      w: 'auto',
      h: 'auto'
    }
  }

  const naturalSize = {
    w: oriW,
    h: oriH
  }

  let containerSize = {}
  const nw = naturalSize.w
  const nh = naturalSize.h
  const maxW = sizeLimit.maxWidth
  const maxH = sizeLimit.maxHeight
  const minW = sizeLimit.minWidth
  const minH = sizeLimit.minHeight

  if (nw < maxW && nh < maxH) {
    containerSize = naturalSize
  } else if (nw > maxW && nh < maxH) {
    containerSize.w = maxW
    containerSize.h = Math.round(maxW / nw * nh)
  } else if (nw < maxW && nh > maxH) {
    containerSize.w = Math.round(maxH / nh * nw)
    containerSize.h = maxH
  } else { // nw > maxW && nh > maxH
    if (nw / maxW >= nh / maxH) {
      containerSize.w = maxW
      containerSize.h = Math.round(maxW / nw * nh)
    } else {
      containerSize.w = Math.round(maxH / nh * nw)
      containerSize.h = maxH
    }
  }
  return {
    w: Math.max(minW, containerSize.w),
    h: Math.max(minH, containerSize.h)
  }
}

const REGEXP_ORIGINS = /^(https?:)\/\/([^:/?#]+):?(\d*)/i
export function isCrossOriginURL (url) {
  const parts = url.match(REGEXP_ORIGINS)

  return parts && (
    parts[1] !== location.protocol ||
    parts[2] !== location.hostname ||
    parts[3] !== location.port
  )
}

export function isBlobURL (url) {
  // IE10: blob:73E64064-4C5C-49BE-A795-1ACA65C819F4
  // chrome: blob:http://localhost:3001/691af608-087e-466d-8f64-2ff423f29f4d
  return /^blob:(https?:\/\/)?/i.test(url)
}

export function loadImageByXHR (url, callback) {
  const xhr = new XMLHttpRequest()
  window.URL = window.URL || window.webkitURL
  xhr.onload = function onLoad () {
    callback(URL.createObjectURL(this.response))
  }
  xhr.open('GET', url, true)
  xhr.responseType = 'blob'
  xhr.send()
}

export function log (...args) {
  /* eslint-disable */
  console.log.apply(console, args)
  /* eslint-enable */
}
