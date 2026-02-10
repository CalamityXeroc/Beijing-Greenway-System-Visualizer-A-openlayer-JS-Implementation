import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const app = express();
const PORT = 3000;

// PostgreSQL 连接池
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'greenway_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => {
  console.error('[数据库] 意外错误:', err);
});

// 启用 CORS
app.use(cors());
app.use(express.json());

// 高德 API Key - 从环境变量读取
const AMAP_API_KEY = process.env.VITE_AMAP_KEY || process.env.AMAP_API_KEY;

// 绿道数据接口 - 从数据库读取
app.get('/api/greenways', async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ status: '0', info: '缺少 name 参数' });
  }

  console.log(`[Server] 查询绿道数据: ${name}`);

  try {
    // 动态构建查询
    // 注意：ST_AsGeoJSON 返回几何的 GeoJSON 字符串 representation
    // 我们将其解析为 JSON 以便 json_build_object 正确处理
    const query = `
      SELECT 
        json_build_object(
          'type', 'FeatureCollection',
          'features', COALESCE(json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', coordinates,
              'properties', to_jsonb(t) - 'coordinates' 
            )
          ), '[]'::json)
        ) as geojson
      FROM (SELECT * FROM greenways WHERE name = $1) t
    `;

    const result = await pool.query(query, [name]);

    if (result.rows.length > 0) {
      const geojson = result.rows[0].geojson;
      // 如果没有找到数据（features 为空），尝试模糊搜索
      if (geojson.features.length === 0) {
        console.log(`[Server] 精确匹配未找到，尝试模糊搜索: %${name}%`);
        const fuzzyQuery = `
          SELECT 
            json_build_object(
              'type', 'FeatureCollection',
              'features', COALESCE(json_agg(
                json_build_object(
                  'type', 'Feature',
                  'geometry', coordinates,
                  'properties', to_jsonb(t) - 'coordinates' 
                )
              ), '[]'::json)
            ) as geojson
          FROM (SELECT * FROM greenways WHERE name LIKE $1) t
        `;
        const fuzzyResult = await pool.query(fuzzyQuery, [`%${name}%`]);
        
        if (fuzzyResult.rows.length > 0 && fuzzyResult.rows[0].geojson.features.length > 0) {
           console.log(`[Server] ✓ 模糊搜索成功`);
           res.json(fuzzyResult.rows[0].geojson);
        } else {
           console.log(`[Server] ⚠ 未找到数据`);
           res.status(404).json({ status: '0', info: '未找到该绿道数据' });
        }
      } else {
        console.log(`[Server] ✓ 成功获取数据`);
        res.json(geojson);
      }
    } else {
      res.status(404).json({ status: '0', info: '未找到该绿道数据' });
    }
  } catch (err) {
    console.error('[Server] 数据库查询失败:', err);
    res.status(500).json({ status: '0', info: '数据库查询错误: ' + err.message });
  }
});

// 通用 HTTP 请求函数
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 逆地理编码接口 - 获取位置信息
 * GET /api/weather/location?lon=116.397&lat=40.018
 */
app.get('/api/weather/location', async (req, res) => {
  try {
    const { lon, lat } = req.query;

    if (!lon || !lat) {
      return res.status(400).json({
        status: '0',
        info: '缺少必要参数: lon, lat'
      });
    }

    console.log(`[Server] 获取位置信息: ${lon}, ${lat}`);

    const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_API_KEY}&location=${lon},${lat}`;
    const data = await makeRequest(url);

    console.log(`[Server] 逆地理编码响应:`, data);
    res.json(data);
  } catch (error) {
    console.error('[Server] 逆地理编码错误:', error);
    res.status(500).json({
      status: '0',
      info: '服务器错误: ' + error.message
    });
  }
});

/**
 * 获取天气接口
 * GET /api/weather?adcode=110101
 */
app.get('/api/weather', async (req, res) => {
  try {
    const { adcode } = req.query;

    if (!adcode) {
      return res.status(400).json({
        status: '0',
        info: '缺少必要参数: adcode'
      });
    }

    console.log(`[Server] 获取天气: 行政代码 ${adcode}`);

    const url = `https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_API_KEY}&city=${adcode}&extensions=base`;
    const data = await makeRequest(url);

    console.log(`[Server] 天气查询响应:`, data);
    res.json(data);
  } catch (error) {
    console.error('[Server] 天气查询错误:', error);
    res.status(500).json({
      status: '0',
      info: '服务器错误: ' + error.message
    });
  }
});

/**
 * 完整的天气获取接口（一次性请求）
 * GET /api/weather/complete?lon=116.397&lat=40.018
 */
app.get('/api/weather/complete', async (req, res) => {
  try {
    const { lon, lat } = req.query;

    if (!lon || !lat) {
      return res.status(400).json({
        status: '0',
        info: '缺少必要参数: lon, lat'
      });
    }

    console.log(`[Server] 获取完整天气信息: ${lon}, ${lat}`);

    try {
      // 1. 逆地理编码
      const geoUrl = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_API_KEY}&location=${lon},${lat}`;
      console.log(`[Server] 逆地理编码请求: ${geoUrl}`);
      const geoData = await makeRequest(geoUrl);
      console.log('[Server] 逆地理编码响应:', geoData);

      if (geoData.status !== '1' || !geoData.regeocode) {
        return res.json({
          status: '0',
          info: `逆地理编码失败: ${geoData.info || '未知错误'}`
        });
      }

      const adcode = geoData.regeocode.addressComponent.adcode;
      let cityName = geoData.regeocode.addressComponent.city || 
                     geoData.regeocode.addressComponent.province;

      if (Array.isArray(cityName)) {
        cityName = cityName[0] || '未知城市';
      }
      if (!cityName || cityName.length === 0) {
        cityName = geoData.regeocode.addressComponent.province || '北京市';
      }

      console.log(`[Server] 城市代码: ${adcode}, 城市: ${cityName}`);

      // 2. 获取天气
      const weatherUrl = `https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_API_KEY}&city=${adcode}&extensions=base`;
      console.log(`[Server] 天气查询请求: ${weatherUrl}`);
      const weatherData = await makeRequest(weatherUrl);
      console.log('[Server] 天气查询响应:', weatherData);

      if (weatherData.status !== '1' || !weatherData.lives || weatherData.lives.length === 0) {
        return res.json({
          status: '0',
          info: `天气查询失败: ${weatherData.info || '未知错误'}`
        });
      }

      // 返回完整的天气数据
      res.json({
        status: '1',
        weather: {
          ...weatherData.lives[0],
          city: cityName
        }
      });
    } catch (apiError) {
      console.error('[Server] API 调用出错:', apiError);
      return res.json({
        status: '0',
        info: `API 调用失败: ${apiError.message}`
      });
    }
  } catch (error) {
    console.error('[Server] 完整天气查询错误:', error);
    res.status(500).json({
      status: '0',
      info: '服务器错误: ' + error.message
    });
  }
});


// 其他接口可选
/**
 * 逆地理编码接口 - 获取位置信息
 * GET /api/weather/location?lon=116.397&lat=40.018
 */
app.get('/api/weather/location', async (req, res) => {
  try {
    const { lon, lat } = req.query;
    if (!lon || !lat) {
      return res.status(400).json({ status: '0', info: '缺少必要参数: lon, lat' });
    }
    const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_API_KEY}&location=${lon},${lat}`;
    const data = await makeRequest(url);
    res.json(data);
  } catch (error) {
    console.error('[Server] 位置查询错误:', error);
    res.status(500).json({ status: '0', info: '服务器错误: ' + error.message });
  }
});

/**
 * 获取天气接口
 * GET /api/weather?adcode=110101
 */
app.get('/api/weather', async (req, res) => {
  try {
    const { adcode } = req.query;
    if (!adcode) {
      return res.status(400).json({ status: '0', info: '缺少必要参数: adcode' });
    }
    const url = `https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_API_KEY}&city=${adcode}&extensions=base`;
    const data = await makeRequest(url);
    res.json(data);
  } catch (error) {
    console.error('[Server] 天气查询错误:', error);
    res.status(500).json({ status: '0', info: '服务器错误: ' + error.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[Server] 后端服务运行在 http://localhost:${PORT}`);
  console.log(`[Server] 使用数据库: ${process.env.DB_NAME || 'greenway_db'}@${process.env.DB_HOST || 'localhost'}`);
  
  // 测试数据库连接
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('[Server] ✓ 数据库连接成功:', res.rows[0].now);
  } catch (err) {
    console.error('[Server] ✗ 数据库连接失败:', err.message);
  }
});

// 全局错误处理
process.on('uncaughtException', (err) => {
  console.error('[Server] 未捕获的异常:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('[Server] 未处理的 Promise 拒绝:', err);
});
