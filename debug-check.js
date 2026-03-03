const fs=require("fs");
const toolbar=fs.readFileSync("c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-vue/src/components/MapToolbar.vue","utf8");
const navbar=fs.readFileSync("c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-vue/src/components/TopNavbar.vue","utf8");

console.log("=== ISSUES ===" );

// Check if drawStyles is properly reactive
if (!toolbar.includes("const drawStyles = ref({")) console.log("MISS: drawStyles ref not found in MapToolbar");
else console.log("OK: drawStyles ref in MapToolbar");

// check if drawStyles is exposed
if (!toolbar.includes("drawStyles,")) console.log("MISS: drawStyles not exposed in MapToolbar");
else console.log("OK: drawStyles exposed in MapToolbar");

// Check TopNavbar drawStyles computed
if (!navbar.includes("return props.toolbarRef.drawStyles;")) console.log("MISS: drawStyles computed incorrect in TopNavbar"); 
else console.log("OK: drawStyles computed in TopNavbar");

// Check if localDrawType toggle logic is correct
if (!navbar.includes("localDrawType.value = localDrawType.value === type ? null : type")) console.log("MISS: localDrawType toggle logic incomplete"); 
else console.log("OK: localDrawType toggle logic");

// Check color template uses localDrawType
if (!navbar.includes("v-if=\"localDrawType === " )) console.log("MISS: localDrawType v-if not found");
else console.log("OK: localDrawType v-if found");

// Check export
if (!toolbar.includes("map.once")) console.log("MISS: map.once not found"); 
else console.log("OK: map.once present");

if (!toolbar.includes("map.renderSync()")) console.log("MISS: map.renderSync missing"); 
else console.log("OK: renderSync present");

// Check if proxy is used in LayerManager
const layerMgr=fs.readFileSync("c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-vue/src/core/LayerManager.js","utf8");
if (!layerMgr.includes("/api/tiles/gaode")) console.log("MISS: proxy URL not in LayerManager");
else console.log("OK: Proxy URL in LayerManager");

// Check backend proxy route
const backend=fs.readFileSync("c:/Users/cheng/Desktop/BST_lab/tryyyyyy/greenway-backend/src/index.js","utf8");
if (!backend.includes("/api/tiles/gaode")) console.log("MISS: proxy route missing in backend");
else console.log("OK: Proxy route in backend");

if (!backend.includes("Access-Control-Allow-Origin")) console.log("MISS: CORS header missing from backend"); 
else console.log("OK: CORS header in backend");

