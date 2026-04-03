import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import os from 'os';
import authRouter from './auth.js';
import aiRouter from './routes/ai.js';
import adminAiStatsRouter from './routes/adminAiStats.js';
import commentsRouter from './routes/comments.js';
import adminCommentsRouter from './routes/adminComments.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;  // 后端端口：3001（非 3000）

// 中间件 - 配置CORS允许移动端访问
app.use(cors({
  origin: '*', // 开发环境允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// 数据库连接
const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'greenway'  // 数据库名称：greenway（非 greenway_db）
});

// 将 pool 注入 req 对象，供各路由使用
app.use((req, _res, next) => { req.pool = pool; next(); });

// 挂载认证与用户管理路由
app.use('/api', authRouter);

// 挂载 AI 助手路由
app.use('/api/ai', aiRouter);

// 挂载管理员 AI 统计路由
app.use('/api/admin', adminAiStatsRouter);

// 挂载评论路由
app.use('/api/comments', commentsRouter);
app.use('/api/admin/comments', adminCommentsRouter);
// 文档兼容别名路由
app.use('/api/comment', commentsRouter);
app.use('/api/admin/comment', adminCommentsRouter);

// 健康检查
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 绿道颜色配置
const greenwayColors = {
  '环二环城市绿道': '#2E7D32',
  '昌平42绿道': '#388E3C',
  '温榆河': '#1976D2',
  '亮马河绿道': '#0097A7',
  '北运河绿道': '#00897B',
  '南沙绿道': '#558B2F',
  '奥林匹克森林公园绿道': '#689F38',
  '常营半马绿道': '#7CB342',
  '丽都商圈绿道': '#AFB42B',
  '营城建都绿道': '#FBC02D'
};

// 获取所有绿道列表
app.get('/api/greenways', async (req, res) => {
  try {
    const { name } = req.query;
    
    let query = `
      SELECT 
        id,
        name,
        description,
        length,
        introduction,
        location,
        coverage_area,
        construction_area,
        features,
        ST_AsGeoJSON(geometry)::json as geometry,
        created_at,
        updated_at
      FROM greenways
    `;
    
    const params = [];
    if (name) {
      query += ` WHERE name = $1`;
      params.push(name);
    }
    
    query += ` ORDER BY name`;
    
    const result = await pool.query(query, params);

    // 转换为标准 GeoJSON FeatureCollection 格式
    const features = result.rows.map(row => ({
      type: 'Feature',
      id: row.id,
      geometry: row.geometry,
      properties: {
        id: row.id,
        name: row.name,
        description: row.description,
        length: row.length,
        introduction: row.introduction,
        location: row.location,
        coverage_area: row.coverage_area,
        construction_area: row.construction_area,
        features: row.features,
        color: greenwayColors[row.name] || '#4CAF50',  // 添加颜色属性
        created_at: row.created_at,
        updated_at: row.updated_at
      }
    }));

    res.json({
      type: 'FeatureCollection',
      features: features
    });
  } catch (err) {
    res.status(500).json({ type: 'FeatureCollection', features: [] });
  }
});

// 获取单个绿道详情
app.get('/api/greenways/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const greenwayResult = await pool.query(`
      SELECT 
        id,
        name,
        description,
        length,
        introduction,
        location,
        ST_AsGeoJSON(geometry)::json as geometry,
        created_at,
        updated_at
      FROM greenways
      WHERE id = $1
    `, [id]);

    if (greenwayResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: '绿道不存在' });
    }

    const greenway = greenwayResult.rows[0];

    // 获取相关的兴趣点
    const poisResult = await pool.query(`
      SELECT 
        id,
        name,
        description,
        poi_type,
        ST_AsGeoJSON(geometry)::json as geometry
      FROM points_of_interest
      WHERE greenway_id = $1
    `, [id]);

    greenway.points_of_interest = poisResult.rows;

    res.json({
      status: 'success',
      data: greenway
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 创建或更新绿道
app.post('/api/greenways', async (req, res) => {
  try {
    const { name, description, length, introduction, location, coordinates } = req.body;

    if (!name || !coordinates) {
      return res.status(400).json({ status: 'error', message: '缺少必要字段' });
    }

    const coordinatesStr = typeof coordinates === 'string' ? coordinates : JSON.stringify(coordinates);

    // 构造 GeoJSON 结构用于转换
    const geoJsonInput = JSON.stringify({
      type: "LineString",
      coordinates: typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates
    });

    const result = await pool.query(`
      INSERT INTO greenways (name, description, length, introduction, location, geometry)
      VALUES ($1, $2, $3, $4, $5, ST_GeomFromGeoJSON($6))
      ON CONFLICT (name) DO UPDATE SET
        description = $2,
        length = $3,
        introduction = $4,
        location = $5,
        geometry = ST_GeomFromGeoJSON($6),
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, name, description, length, introduction, location, ST_AsGeoJSON(geometry)::json as geometry, created_at, updated_at
    `, [name, description, length, introduction, location, geoJsonInput]);

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 创建兴趣点
app.post('/api/greenways/:id/poi', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, poi_type, coordinates } = req.body;

    if (!name || !coordinates) {
      return res.status(400).json({ status: 'error', message: '缺少必要字段' });
    }

    // 构造 GeoJSON Point 结构
    const geoJsonInput = JSON.stringify({
      type: "Point",
      coordinates: typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates
    });

    const result = await pool.query(`
      INSERT INTO points_of_interest (name, description, poi_type, greenway_id, geometry)
      VALUES ($1, $2, $3, $4, ST_GeomFromGeoJSON($5))
      RETURNING id, name, description, poi_type, ST_AsGeoJSON(geometry)::json as geometry
    `, [name, description, poi_type, id, geoJsonInput]);

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 获取绿道 GeoJSON FeatureCollection（用于前端地图）
app.get('/api/greenways/geojson/collection', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(json_build_object(
          'type', 'Feature',
          'id', id,
          'properties', json_build_object(
            'id', id,
            'name', name,
            'description', description,
            'length', length,
            'introduction', introduction,
            'location', location
          ),
          'geometry', ST_AsGeoJSON(geometry)::json
        ))
      ) as collection
      FROM greenways
    `);

    const collection = result.rows[0]?.collection || {
      type: 'FeatureCollection',
      features: []
    };
    
    // 处理空结果可能是 null 的情况
    if (!collection.features) {
       collection.features = [];
    }

    res.json(collection);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 'error', message: '服务器错误' });
});

// ===== 高德地图瓦片代理（解决 CORS 问题，使地图截图可包含底图） =====
app.get('/api/tiles/gaode', async (req, res) => {
  const { x, y, z, style = 8 } = req.query;
  if (!x || !y || !z) return res.status(400).json({ error: 'Missing x/y/z' });
  const server = (parseInt(x) + parseInt(y)) % 4 + 1;
  const tileUrl = `https://webrd0${server}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=${style}&x=${x}&y=${y}&z=${z}`;
  try {
    const response = await fetch(tileUrl, {
      headers: { 'Referer': 'https://www.amap.com/', 'User-Agent': 'Mozilla/5.0' }
    });
    if (!response.ok) return res.status(response.status).send();
    const buffer = await response.arrayBuffer();
    const ct = response.headers.get('content-type') || 'image/jpeg';
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', ct);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (e) {
    console.error('[瓦片代理] 错误:', e.message);
    res.status(502).send();
  }
});

// 获取本机IP用于显示 - 优先选择非169.254开头的地址（真实网络接口）
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        candidates.push({ name, address: iface.address });
      }
    }
  }
  
  // 优先选择非169.254开头的地址（真实网络，非自动配置）
  const realNetwork = candidates.find(c => !c.address.startsWith('169.254.') && !c.address.startsWith('192.168.70.') && !c.address.startsWith('192.168.238.'));
  if (realNetwork) {
    console.log(`[网络] 选择网络接口: ${realNetwork.name} (${realNetwork.address})`);
    return realNetwork.address;
  }
  
  // 降级选择任何可用地址
  if (candidates.length > 0) {
    console.log(`[网络] 使用备用接口: ${candidates[0].name} (${candidates[0].address})`);
    return candidates[0].address;
  }
  
  return '0.0.0.0';
}

const localIP = getLocalIP();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[服务器] ✓ 后端已启动`);
  console.log(`[服务器] 本地地址: http://localhost:${PORT}`);
  console.log(`[服务器] 网络地址: http://${localIP}:${PORT}`);
  console.log(`[服务器] 绑定: 0.0.0.0:${PORT} (所有网卡)`);
  console.log(`[服务器] 健康检查: http://${localIP}:${PORT}/health`);
  console.log(`[服务器] 绿道列表: http://${localIP}:${PORT}/api/greenways`);
  console.log(`${'='.repeat(60)}\n`);
});

pool.on('error', (err) => {
  console.error('[数据库] 连接错误:', err);
});
