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
      database: process.env.DB_NAME || 'greenway_db'
    });

    await client.connect();
    console.log(`[导入] 正在导入 ${greenwayName}...`);

    // 读取 GeoJSON 文件
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const features = data.type === 'FeatureCollection' ? data.features : [data];

    for (const feature of features) {
      if (feature.geometry.type !== 'LineString') {
        console.warn(`[导入] ⚠ 跳过非 LineString 几何: ${greenwayName}`);
        continue;
      }

      const coordinates = feature.geometry.coordinates;
      const props = feature.properties || {};

      // 构建 GeoJSON 线字符串
      const geojsonStr = JSON.stringify({
        type: 'LineString',
        coordinates: coordinates
      });

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
        props.name || greenwayName,
        props.description || '',
        props.length || null,
        props.introduction || props.description || '',
        props.location || '',
        geojsonStr
      ];

      await client.query(sql, values);
    }

    console.log(`[导入] ✓ ${greenwayName} 导入成功`);
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
