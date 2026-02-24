import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function importGeoJSON(filePath, greenwayName) {
  try {
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'greenway'
    });

    await client.connect();
    console.log(`[导入] 正在导入 ${greenwayName}...`);

    // 读取 GeoJSON 文件
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const features = data.type === 'FeatureCollection' ? data.features : [data];

    // 合并所有 feature 的坐标到一个数组
    const allCoordinates = [];
    
    for (const feature of features) {
      const geom = feature.geometry;
      if (!geom) {
        console.warn(`[导入] ⚠ 跳过无几何的要素: ${greenwayName}`);
        continue;
      }

      // 提取坐标
      let featureCoords = [];
      
      if (geom.type === 'LineString') {
        featureCoords = geom.coordinates;
      } else if (geom.type === 'MultiLineString') {
        // 把所有线段合并
        for (const lineCoords of geom.coordinates) {
          featureCoords.push(...lineCoords);
        }
      } else if (geom.type === 'Polygon') {
        // 使用外环
        if (geom.coordinates && geom.coordinates.length > 0) {
          featureCoords = geom.coordinates[0];
        }
      } else if (geom.type === 'MultiPolygon') {
        // 使用第一个多边形的外环
        if (geom.coordinates && geom.coordinates.length > 0 && geom.coordinates[0].length > 0) {
          featureCoords = geom.coordinates[0][0];
        }
      } else {
        console.warn(`[导入] ⚠ 不支持的几何类型 (${geom.type}): ${greenwayName}`);
        continue;
      }

      // 将这个 feature 的坐标加入总数组
      if (featureCoords.length > 0) {
        allCoordinates.push(...featureCoords);
      }
    }

    if (allCoordinates.length === 0) {
      console.warn(`[导入] ⚠ 没有找到有效的坐标: ${greenwayName}`);
      await client.end();
      return;
    }

    // 创建合并后的 LineString GeoJSON
    const mergedGeojson = JSON.stringify({
      type: 'LineString',
      coordinates: allCoordinates
    });

    // 获取第一个 feature 的属性（如果有的话）
    const firstFeature = features.find(f => f.properties);
    const props = firstFeature?.properties || {};

    const sql = `
      INSERT INTO greenways (name, description, length, introduction, location, geometry)
      VALUES ($1, $2, $3, $4, $5, ST_GeomFromGeoJSON($6))
      ON CONFLICT (name) DO UPDATE SET
        description = $2,
        length = $3,
        introduction = $4,
        location = $5,
        geometry = ST_GeomFromGeoJSON($6),
        updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
      greenwayName,
      props.description || '',
      props.length || null,
      props.introduction || props.description || '',
      props.location || '',
      mergedGeojson
    ];

    await client.query(sql, values);

    console.log(`[导入] ✓ ${greenwayName} 导入成功 (合并 ${features.length} 个 feature，共 ${allCoordinates.length} 个坐标点)`);
    await client.end();
  } catch (err) {
    console.error(`[导入] ❌ 导入失败: ${err.message}`);
  }
}

async function main() {
  const geoDataPath = path.resolve('../greenway-vue/public/数据/绿道');
  
  if (!fs.existsSync(geoDataPath)) {
    console.error('[导入] ❌ GeoJSON 文件夹不存在:', geoDataPath);
    return;
  }

  const files = fs.readdirSync(geoDataPath).filter(f => f.endsWith('.geojson'));
  
  if (files.length === 0) {
    console.warn('[导入] ⚠ 未找到 GeoJSON 文件');
    return;
  }

  console.log(`[导入] 找到 ${files.length} 个 GeoJSON 文件`);

  for (const file of files) {
    const filePath = path.join(geoDataPath, file);
    const greenwayName = path.basename(file, '.geojson');
    await importGeoJSON(filePath, greenwayName);
  }

  console.log('[导入] ✓ 所有数据导入完成');
}

main();
