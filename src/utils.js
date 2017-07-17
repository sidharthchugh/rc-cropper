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
