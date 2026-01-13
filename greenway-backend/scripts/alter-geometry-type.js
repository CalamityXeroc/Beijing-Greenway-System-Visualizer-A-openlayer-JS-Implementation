/**
 * 更改数据库 geometry 列从 LineString 到 MultiLineString
 */

import { query } from '../src/db.js'

async function alterGeometryColumn() {
  try {
    console.log('\n📊 更改 geometry 列类型...\n')
    
    // 将 geometry 列从 LineString 改为 MultiLineString
    const result = await query(`
      ALTER TABLE greenways 
      ALTER COLUMN geometry TYPE geometry(MultiLineString, 4326) 
      USING ST_Multi(geometry)
    `)
    
    console.log('✅ geometry 列类型已更改为 MultiLineString')
    console.log('\n接下来需要重新导入几何数据。\n')
    
    process.exit(0)
  } catch (err) {
    console.error('❌ 修改列类型失败:', err.message)
    process.exit(1)
  }
}

alterGeometryColumn()
