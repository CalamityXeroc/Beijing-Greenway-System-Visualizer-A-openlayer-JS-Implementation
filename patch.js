const fs=require("fs");
const p="c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-vue/src/components/MapToolbar.vue";
let c=fs.readFileSync(p,"utf8"); 
const a=c.indexOf("    const viewport = map.getViewport()"); 
const b = c.indexOf("    ctx.globalAlpha = 1"); 
const o = c.substring(a, b); 
const repl = `    const viewport = map.getViewport()
    const layerDivs = viewport.querySelectorAll(".ol-layer")
    const canvases = layerDivs.length > 0 
      ? Array.from(layerDivs).map(div => ({ canvas: div.querySelector("canvas"), parent: div }))
      : Array.from(viewport.querySelectorAll("canvas")).map(c => ({ canvas: c, parent: c.parentElement }))

    canvases.forEach(({ canvas, parent }) => {
      if (!canvas || canvas.width === 0 || canvas.height === 0) return

      const opacity = parseFloat((parent && parent.style.opacity) || canvas.style.opacity || "1")
      ctx.globalAlpha = isNaN(opacity) ? 1 : opacity

      const transform = canvas.style.transform || (parent && parent.style.transform)
      if (transform && transform.includes("matrix")) {
        const m = transform.match(/matrix\\(([^)]+)\\)/)?.[1]?.split(",").map(Number)
        if (m && m.length === 6) ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5])
        else ctx.setTransform(1, 0, 0, 1, 0, 0)
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      }

      ctx.filter = (parent && parent.style.filter) || canvas.style.filter || "none"

      try {
        ctx.drawImage(canvas, 0, 0)
      } catch (e) {
        console.warn("[导出] 跳过受限 canvas:", e.message)
      }
    })

`;
c = c.replace(o, repl); 
fs.writeFileSync(p, c);
