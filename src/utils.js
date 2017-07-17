/**
   * 获取图片消息容器尺寸
   * @param {Number} oriW - 图片的实际宽度
   * @param {Number} oriH - 图片的实际高度
   * @param {Object} sizeLimit - 图片尺寸限制 { maxW: 358, maxH: 320, minW: 34, minH: 34 }
   */
export function getImgContainerSize (oriW, oriH, sizeLimit) {
  oriW = parseInt(oriW, 10)
  oriH = parseInt(oriH, 10)

  // 异常处理：没有oriW oriH
  if (!oriW || !oriH) {
    return {
      w: 'auto',
      h: 'auto'
    }
  }

  const naturalSize = { // 图片的实际大小
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
