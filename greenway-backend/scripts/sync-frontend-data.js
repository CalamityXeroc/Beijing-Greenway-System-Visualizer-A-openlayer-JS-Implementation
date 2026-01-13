/**
 * 与前端数据同步 - 从GreenwayOverview.vue中的定义更新数据库
 * 这是真实数据，直接从前端抄过来的
 */

import { query } from '../src/db.js'

const frontendData = [
  {
    name: '温榆河',
    length: 108,
    area: '昌平、顺义、朝阳、通州'
  },
  {
    name: '环二环城市绿道',
    length: 87,
    area: '东城、西城、朝阳、海淀'
  },
  {
    name: '亮马河绿道',
    length: 5.5,
    area: '朝阳区'
  },
  {
    name: '常营半马绿道',
    length: 21,
    area: '朝阳区常营地区'
  },
  {
    name: '昌平42绿道',
    length: 42,
    area: '昌平区'
  },
  {
    name: '丽都商圈绿道',
    length: 6.8,
    area: '朝阳区丽都商圈'
  },
  {
    name: '北运河绿道',
    length: 36,
    area: '通州区北运河沿岸'
  },
  {
    name: '南沙绿道',
    length: 15,
    area: '昌平区南沙河沿岸'
  },
  {
    name: '奥林匹克森林公园绿道',
    length: 23,
    area: '朝阳区奥森公园'
  },
  {
    name: '营城建都绿道',
    length: 42,
    area: '西城区、东城区'
  }
]

async function syncFrontendData() {
  try {
    console.log('\n🔄 开始与前端数据同步...\n')
    
    let successCount = 0
    let errorCount = 0
    
    for (const data of frontendData) {
      try {
        // 转换面积值为文本格式
        const result = await query(
          `UPDATE greenways 
           SET length = $1, coverage_area = $2, location = $3
           WHERE name = $4
           RETURNING id, name, length, coverage_area, location`,
          [data.length, data.area, data.area, data.name]
        )
        
        if (result.rows.length > 0) {
          const row = result.rows[0]
          console.log(`✅ ${row.name}`)
          console.log(`   长度: ${row.length} km`)
          console.log(`   覆盖区域: ${row.coverage_area}`)
          successCount++
        } else {
          console.log(`⚠️  ${data.name} - 未找到该记录`)
          errorCount++
        }
      } catch (err) {
        console.error(`❌ 更新 ${data.name} 失败:`, err.message)
        errorCount++
      }
    }
    
    console.log(`\n📊 同步完成!`)
    console.log(`✅ 成功: ${successCount}`)
    console.log(`❌ 失败: ${errorCount}`)
    console.log(`📈 总计: ${successCount + errorCount}\n`)
    
    process.exit(0)
  } catch (err) {
    console.error('❌ 同步过程出错:', err)
    process.exit(1)
  }
}

syncFrontendData()
