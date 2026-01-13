/**
 * 从 GeoJSON 文件导入几何数据到数据库
 * 这样可以保证前端和数据库使用的是完全相同的数据
 */

import fs from 'fs'
import path from 'path'
import { query } from '../src/db.js'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 绿道对应的 GeoJSON 文件名
const greenwayFiles = [
  { name: '温榆河', file: '温榆河.geojson' },
  { name: '环二环城市绿道', file: '环二环城市绿道.geojson' },
  { name: '亮马河绿道', file: '亮马河绿道.geojson' },
  { name: '常营半马绿道', file: '常营半马绿道.geojson' },
  { name: '昌平42绿道', file: '昌平42绿道.geojson' },
  { name: '丽都商圈绿道', file: '丽都商圈绿道.geojson' },
  { name: '北运河绿道', file: '北运河绿道.geojson' },
  { name: '南沙绿道', file: '南沙绿道.geojson' },
  { name: '奥林匹克森林公园绿道', file: '奥林匹克森林公园绿道.geojson' },
  { name: '营城建都绿道', file: '营城建都绿道.geojson' }
]

async function importGeometryData() {
  try {
    console.log('\n🗺️  开始导入几何数据...\n')
    
    let successCount = 0
    let errorCount = 0
    
    // 从前端公共目录读取 GeoJSON 文件
    const geojsonDir = path.join(__dirname, '../..', 'greenway-vue/public/数据/绿道')
    
    for (const { name, file } of greenwayFiles) {
      try {
        const filePath = path.join(geojsonDir, file)
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  找不到文件: ${file}`)
          errorCount++
          continue
        }
        
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const geojson = JSON.parse(fileContent)
        
        if (!geojson.features || geojson.features.length === 0) {
          console.log(`⚠️  ${name}: GeoJSON 中没有要素`)
          errorCount++
          continue
        }
        
        // 合并所有要素的几何数据
        const geometries = []
        let totalCoords = 0
        
        for (const feature of geojson.features) {
          if (feature.geometry && feature.geometry.coordinates) {
            geometries.push(feature.geometry)
            if (feature.geometry.type === 'LineString') {
              totalCoords += feature.geometry.coordinates.length
            } else if (feature.geometry.type === 'MultiLineString') {
              for (const line of feature.geometry.coordinates) {
                totalCoords += line.length
              }
            }
          }
        }
        
        if (geometries.length === 0) {
          console.log(`⚠️  ${name}: 没有有效的几何数据`)
          errorCount++
          continue
        }
        
        // 保留 MultiLineString 结构，不要合并成单一的 LineString
        // 这样可以避免不相连的线段之间被错误地连接
        let geometry
        if (geometries.length === 1 && geometries[0].type === 'LineString') {
          // 如果只有一条线，直接使用
          geometry = geometries[0]
        } else {
          // 如果有多条线或 MultiLineString，转换为 MultiLineString
          const allLines = []
          for (const geom of geometries) {
            if (geom.type === 'LineString') {
              allLines.push(geom.coordinates)
            } else if (geom.type === 'MultiLineString') {
              for (const line of geom.coordinates) {
                allLines.push(line)
              }
            }
          }
          geometry = { type: 'MultiLineString', coordinates: allLines }
        }
        
        totalCoords = 0
        for (const feature of geojson.features) {
          if (feature.geometry && feature.geometry.type === 'LineString') {
            totalCoords += feature.geometry.coordinates.length
          } else if (feature.geometry && feature.geometry.type === 'MultiLineString') {
            for (const line of feature.geometry.coordinates) {
              totalCoords += line.length
            }
          }
        }
        
        // 更新数据库
        const result = await query(
          `UPDATE greenways 
           SET geometry = ST_GeomFromGeoJSON($1)
           WHERE name = $2
           RETURNING id, name`,
          [JSON.stringify(geometry), name]
        )
        
        if (result.rows.length > 0) {
          console.log(`✅ ${name}`)
          console.log(`   📍 几何类型: ${geometry.type}`)
          console.log(`   📊 坐标点总数: ${totalCoords}`)
          successCount++
        } else {
          console.log(`⚠️  ${name} - 未找到该绿道记录`)
          errorCount++
        }
      } catch (err) {
        console.error(`❌ 导入 ${name} 失败:`, err.message)
        errorCount++
      }
    }
    
    console.log(`\n📊 导入完成!`)
    console.log(`✅ 成功: ${successCount}`)
    console.log(`❌ 失败: ${errorCount}`)
    console.log(`📈 总计: ${successCount + errorCount}\n`)
    
    process.exit(0)
  } catch (err) {
    console.error('❌ 导入过程出错:', err)
    process.exit(1)
  }
}

importGeometryData()
