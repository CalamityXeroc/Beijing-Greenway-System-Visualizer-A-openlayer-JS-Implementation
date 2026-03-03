const fs = require('fs')

const file = 'greenway-vue/src/components/MapToolbar.vue'
const lines = fs.readFileSync(file, 'utf8').split('\n')

// Find exportMapImage start (1-based line 542 = 0-based index 541)
let startIdx = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].replace(/\r/, '') === 'const exportMapImage = () => {') {
    startIdx = i
    break
  }
}

if (startIdx === -1) {
  console.error('Cannot find exportMapImage start')
  process.exit(1)
}

// Find end: look for a lone `}` or `}\r` at column 0 after startIdx
// that follows map.renderSync()
let endIdx = -1
for (let i = startIdx + 1; i < lines.length; i++) {
  const stripped = lines[i].replace(/\r/, '')
  if (stripped === '}') {
    // check that lines[i-2] or lines[i-1] contains map.renderSync or a close paren
    const prev = lines[i-1] ? lines[i-1].replace(/\r/, '') : ''
    const prev2 = lines[i-2] ? lines[i-2].replace(/\r/, '') : ''
    if (prev.includes('map.renderSync') || prev.includes('renderSync') || prev2.includes('renderSync')) {
      endIdx = i
      break
    }
  }
}

if (endIdx === -1) {
  // fallback: next top-level `const` or `// 激活测量工具`
  for (let i = startIdx + 5; i < lines.length; i++) {
    const stripped = lines[i].replace(/\r/, '')
    if (stripped === '// 激活测量工具') {
      endIdx = i - 2 // skip blank line
      break
    }
  }
}

if (endIdx === -1) {
  console.error('Cannot find exportMapImage end')
  process.exit(1)
}

console.log(`Replacing lines ${startIdx + 1} to ${endIdx + 1} (0-indexed: ${startIdx}..${endIdx})`)
console.log('First line:', lines[startIdx].replace(/\r/, ''))
console.log('Last line:', lines[endIdx].replace(/\r/, ''))

// Build new function lines (using \r\n to match file CR LF style if needed)
const eol = lines[0].includes('\r') ? '\r\n' : '\n'
const newFnLines = [
  'const exportMapImage = () => {',
  '  const map = props.mapManager.getMap()',
  '  if (!map) return',
  '',
  '  setTimeout(() => {',
  "    map.once('rendercomplete', () => {",
  '      const mapCanvas = document.createElement(\'canvas\')',
  '      const size = map.getSize()',
  '      mapCanvas.width = size[0]',
  '      mapCanvas.height = size[1]',
  '      const ctx = mapCanvas.getContext(\'2d\')',
  '',
  '      // 白色背景，防止透明底',
  '      ctx.fillStyle = \'#ffffff\'',
  '      ctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height)',
  '',
  '      // 收集所有图层 canvas 并按顺序合成',
  '      const viewport = map.getViewport()',
  "      const layerDivs = Array.from(viewport.querySelectorAll('.ol-layer'))",
  '      const canvases = layerDivs.length > 0',
  '        ? layerDivs.map(div => ({ canvas: div.querySelector(\'canvas\'), parent: div }))',
  "        : Array.from(viewport.querySelectorAll('canvas')).map(c => ({ canvas: c, parent: c.parentElement }))",
  '',
  '      canvases.forEach(({ canvas, parent }) => {',
  '        if (!canvas || canvas.width === 0 || canvas.height === 0) return',
  '',
  "        const opacity = parseFloat((parent && parent.style.opacity) || canvas.style.opacity || '1')",
  '        ctx.globalAlpha = isNaN(opacity) ? 1 : opacity',
  '',
  '        const transform = canvas.style.transform || (parent && parent.style.transform)',
  "        if (transform && transform.includes('matrix')) {",
  "          const m = transform.match(/matrix\\(([^)]+)\\)/)?.[1]?.split(',').map(Number)",
  '          if (m && m.length === 6) ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5])',
  '          else ctx.setTransform(1, 0, 0, 1, 0, 0)',
  '        } else {',
  '          ctx.setTransform(1, 0, 0, 1, 0, 0)',
  '        }',
  '',
  "        ctx.filter = (parent && parent.style.filter) || canvas.style.filter || 'none'",
  '',
  '        try {',
  '          ctx.drawImage(canvas, 0, 0)',
  '        } catch (e) {',
  "          console.warn('[导出] 跳过受污染 canvas:', e.message)",
  '        }',
  '      })',
  '',
  '      ctx.globalAlpha = 1',
  '      ctx.setTransform(1, 0, 0, 1, 0, 0)',
  "      ctx.filter = 'none'",
  '',
  '      try {',
  "        const link = document.createElement('a')",
  '        link.download = `greenway-map-${new Date().toISOString().slice(0, 19).replace(/:/g, \'-\')}.png`',
  "        link.href = mapCanvas.toDataURL('image/png')",
  '        document.body.appendChild(link)',
  '        link.click()',
  '        document.body.removeChild(link)',
  '      } catch (e) {',
  "        console.error('[导出] toDataURL 失败（canvas 被污染）:', e)",
  "        alert('导出失败：地图画布被跨域内容污染，请确认后端服务正在运行（端口 3001）。')",
  '      }',
  '    })',
  '',
  '    map.renderSync()',
  '  }, 300)',
  '}'
]

const before = lines.slice(0, startIdx)
const after = lines.slice(endIdx + 1)

const newLines = [...before, ...newFnLines, ...after]
const newContent = newLines.join(eol)
fs.writeFileSync(file, newContent, 'utf8')
console.log(`Done. Replaced ${endIdx - startIdx + 1} lines with ${newFnLines.length} lines.`)
