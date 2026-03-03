const fs = require("fs");
const p = "c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-vue/src/components/MapToolbar.vue";
let c = fs.readFileSync(p, "utf8");
c = c.replace(/const layerDivs = viewport\.querySelectorAll\("\.ol-layer"\)/g, "const layerDivs = Array.from(viewport.querySelectorAll(\".ol-layer, .ol-layer-tile, .ol-layer-vector\"))");
fs.writeFileSync(p, c);
