import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'greenway_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function importGeoJSON() {
  try {
    await client.connect();
    console.log('[导入] 🔌 连接到数据库成功\n');

    // GeoJSON 数据路径
    const geojsonDir = path.join(__dirname, '..', 'greenway-vue', 'public', '数据', '绿道');
    
    if (!fs.existsSync(geojsonDir)) {
      console.error(`[导入] ❌ 找不到目录: ${geojsonDir}`);
      process.exit(1);
    }

    const geojsonFiles = fs.readdirSync(geojsonDir).filter(f => f.endsWith('.geojson'));
    console.log(`[导入] 📁 找到 ${geojsonFiles.length} 个 GeoJSON 文件\n`);

    let totalInserted = 0;

    for (const file of geojsonFiles) {
      const filePath = path.join(geojsonDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (data.features && Array.isArray(data.features)) {
        console.log(`[导入] 📄 处理: ${file}`);

        for (const feature of data.features) {
          const { properties, geometry } = feature;

          // 提取坐标
          let coordinates = null;
          if (geometry.type === 'LineString') {
            coordinates = JSON.stringify({ type: 'LineString', coordinates: geometry.coordinates });
          } else if (geometry.type === 'Point') {
            coordinates = JSON.stringify({ type: 'Point', coordinates: geometry.coordinates });
          } else if (geometry.type === 'MultiLineString') {
            // 处理多线
            coordinates = JSON.stringify({ 
              type: 'MultiLineString', 
              coordinates: geometry.coordinates 
            });
          }

          // 判断是否为绿道或 POI
          if (geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
            // 插入绿道
            const insertQuery = `
              INSERT INTO greenways (name, description, length, introduction, location, coordinates)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (name) DO UPDATE SET coordinates = $6
              RETURNING id;
            `;

            const result = await client.query(insertQuery, [
              properties.name || file.replace('.geojson', ''),
              properties.description || '',
              properties.length || null,
              properties.introduction || '',
              properties.location || '',
              coordinates,
            ]);

            totalInserted++;
            console.log(`  ✓ 插入绿道: ${properties.name || file}`);
          } else if (geometry.type === 'Point') {
            // 插入 POI（如果有 greenway_id）
            if (properties.greenway_id) {
              const poiQuery = `
                INSERT INTO points_of_interest (name, description, poi_type, greenway_id, coordinates)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (name) DO UPDATE SET coordinates = $5;
              `;

              await client.query(poiQuery, [
                properties.name || '',
                properties.description || '',
                properties.poi_type || 'landmark',
                properties.greenway_id,
                coordinates,
              ]);

              console.log(`  ✓ 插入 POI: ${properties.name}`);
            }
          }
        }
      }

      console.log('');
    }

    // 验证导入结果
    const countResult = await client.query('SELECT COUNT(*) FROM greenways;');
    const poiCountResult = await client.query('SELECT COUNT(*) FROM points_of_interest;');

    console.log('\n[导入] ✅ 导入完成!');
    console.log(`[导入] 📊 绿道总数: ${countResult.rows[0].count}`);
    console.log(`[导入] 📍 POI 总数: ${poiCountResult.rows[0].count}`);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('[导入] ❌ 错误:', error.message);
    process.exit(1);
  }
}

importGeoJSON();
