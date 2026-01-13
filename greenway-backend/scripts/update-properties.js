import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'greenway_db'
});

const greenwayData = [
  {
    name: '环二环城市绿道',
    length: 108,
    location: '昌平、顺义、朝阳、通州四区',
    introduction: '环绕北京二环路的城市绿道，是北京市内最重要的绿色廊道之一。绿道沿二环路分布，串联了众多城市景观、文化遗产和生态空间，为市民提供了便利的休闲运动场所。',
    description: '二环路两侧环形绿道，连接全城主要公园'
  },
  {
    name: '昌平42绿道',
    length: 42,
    location: '昌平区',
    introduction: '昌平绿道，展示首都北部绿色生态风貌。绿道穿过昌平区多个生态公园，展示了城市与自然的和谐共处。',
    description: '昌平区运动休闲绿道'
  },
  {
    name: '温榆河',
    length: 45.3,
    location: '朝阳、顺义、昌平交界',
    introduction: '温榆河绿道是北京东北部重要的生态廊道，沿温榆河而建。绿道展示了河流与湿地生态，是市民休闲散步的好去处。',
    description: '温榆河沿线生态公园绿道'
  },
  {
    name: '亮马河绿道',
    length: 25.8,
    location: '朝阳区',
    introduction: '亮马河绿道位于朝阳区，沿亮马河依河而建。绿道两侧建设了骑行道、步行道等设施，是北京重要的运动休闲绿道。',
    description: '城区运动健身绿道'
  },
  {
    name: '北运河绿道',
    length: 35.6,
    location: '朝阳、通州、河北交界',
    introduction: '北运河绿道贯穿北京北部和东部，是连接市区和城市副中心的重要廊道。绿道展示了运河文化和生态修复成果。',
    description: '北运河水系生态绿道'
  },
  {
    name: '南沙绿道',
    length: 28.3,
    location: '大兴区',
    introduction: '南沙绿道位于大兴区，是南部新城重要的生态绿道。绿道连接多个城市公园，为市民提供了便利的运动休闲场所。',
    description: '南部生态示范绿道'
  },
  {
    name: '奥林匹克森林公园绿道',
    length: 31.2,
    location: '朝阳区',
    introduction: '奥林匹克森林公园绿道是北京最大的城市公园绿道。绿道经过山水、湿地、草坪等多种生态景观，是市民运动健身的热门去处。',
    description: '奥森公园环形运动绿道'
  },
  {
    name: '常营半马绿道',
    length: 38.5,
    location: '朝阳区',
    introduction: '常营半马绿道是北京东部重要的运动健身线路。绿道途经多个社区和景观节点，每年举办多项体育赛事。',
    description: '社区运动竞赛绿道'
  },
  {
    name: '丽都商圈绿道',
    length: 22.7,
    location: '朝阳区',
    introduction: '丽都商圈绿道位于朝阳区，展示了城市商业与生态休闲的结合。绿道连接工体、丽都公园等重要商业休闲地点。',
    description: '城市商业休闲绿道'
  },
  {
    name: '营城建都绿道',
    length: 52.6,
    location: '东城、西城、朝阳、丰台四区',
    introduction: '营城建都绿道是北京中轴线两侧的重要绿道。绿道展示了北京古都文化和现代城市风貌，串联了众多文化遗产和现代建筑。',
    description: '中轴线文化景观绿道'
  }
];

async function updateProperties() {
  try {
    for (const data of greenwayData) {
      await pool.query(
        `UPDATE greenways 
         SET length = $1, location = $2, introduction = $3, description = $4
         WHERE name = $5`,
        [data.length, data.location, data.introduction, data.description, data.name]
      );
      console.log(`✓ 已更新: ${data.name}`);
    }
    console.log('\n✓ 所有绿道属性已更新完成');
    await pool.end();
  } catch (err) {
    console.error('❌ 更新失败:', err.message);
    await pool.end();
  }
}

updateProperties();
