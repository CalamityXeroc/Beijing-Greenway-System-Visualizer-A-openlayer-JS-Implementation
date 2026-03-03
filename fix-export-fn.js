const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, 'greenway-vue/src/components/MapToolbar.vue')
let content = fs.readFileSync(file, 'utf8')

// Find the old function by start/end markers
const startMarker = 'const exportMapImage = () => {'
const endMarkerAfter = '\n\n// 激活测量工具'

const startIdx = content.indexOf(startMarker)
if (startIdx === -1) {
  console.error('Could not find exportMapImage function start')
  process.exit(1)
}

// Find the end: look for `\n}\n` after startIdx, then check context
// The function ends at the lone `}` on its own line
// We'll find it by scanning bracket depth
let depth = 0
let endIdx = -1
let inStr = false
let strChar = ''
for (let i = startIdx; i < content.length; i++) {
  const c = content[i]
  if (inStr) {
    if (c === strChar && content[i-1] !== '\\') inStr = false
    continue
  }
  if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue }
  if (c === '{') depth++
  if (c === '}') {
    depth--
    if (depth === 0) {
      endIdx = i
      break
    }
  }
}

if (endIdx === -1) {
  console.error('Could not find closing brace of exportMapImage')
  process.exit(1)
}

console.log(`Found function: chars ${startIdx}..${endIdx}`)
console.log('Old function snippet end:', JSON.stringify(content.slice(endIdx - 30, endIdx + 5)))

const newFn = `const exportMapImage = () => {
  const map = props.mapManager.getMap()
  if (!map) return

  setTimeout(() => {
    map.once('rendercomplete', () => {
      const mapCanvas = document.createElement('canvas')
      const size = map.getSize()
      mapCanvas.width = size[0]
      mapCanvas.height = size[1]
      const ctx = mapCanvas.getContext('2d')

      // 白色背景，防止透明底
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height)

      // 收集 map viewport 内所有 canvas 并按层叠顺序合成
      const viewport = map.getViewport()
      const layerDivs = Array.from(viewport.querySelectorAll('.ol-layer'))
      const canvases = layerDivs.length > 0
        ? layerDivs.map(div => ({ canvas: div.querySelector('canvas'), parent: div }))
        : Array.from(viewport.querySelectorAll('canvas')).map(c => ({ canvas: c, parent: c.parentElement }))

      canvases.forEach(({ canvas, parent }) => {
        if (!canvas || canvas.width === 0 || canvas.height === 0) return

        const opacity = parseFloat((parent && parent.style.opacity) || canvas.style.opacity || '1')
        ctx.globalAlpha = isNaN(opacity) ? 1 : opacity

        const transform = canvas.style.transform || (parent && parent.style.transform)
        if (transform && transform.includes('matrix')) {
          const m = transform.match(/matrix\\(([^)]+)\\)/)?.[1]?.split(',').map(Number)
          if (m && m.length === 6) ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5])
          else ctx.setTransform(1, 0, 0, 1, 0, 0)
        } else {
          ctx.setTransform(1, 0, 0, 1, 0, 0)
        }

        ctx.filter = (parent && parent.style.filter) || canvas.style.filter || 'none'

        try {
          ctx.drawImage(canvas, 0, 0)
        } catch (e) {
          console.warn('[导出] 跳过受污染 canvas:', e.message)
        }
      })

      ctx.globalAlpha = 1
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.filter = 'none'

      try {
        const link = document.createElement('a')
        link.download = \`greenway-map-\${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png\`
        link.href = mapCanvas.toDataURL('image/png')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (e) {
        console.error('[导出] toDataURL 失败（canvas 被污染）:', e)
        alert('导出失败：地图画布被跨域内容污染，请确认后端服务正在运行（端口 3001）。')
      }
    })

    map.renderSync()
  }, 300)
}`

const newContent = content.slice(0, startIdx) + newFn + content.slice(endIdx + 1)
fs.writeFileSync(file, newContent, 'utf8')
console.log('exportMapImage function replaced successfully')
console.log('New function length:', newFn.length, 'chars')
