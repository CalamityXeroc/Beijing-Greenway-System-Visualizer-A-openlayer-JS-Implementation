# 环境配置说明

## 后端环境变量设置

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，填入你的数据库凭据：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenway
DB_USER=postgres
DB_PASSWORD=your_secure_password
PORT=3000
```

## 前端 API 密钥

前端代码中使用的百度地图 API 密钥需要替换为你自己的密钥。

在以下文件中替换 `als8C7E7ORhccEaRUiToTKbuxDIYlIiw`：
- `greenway-vue/src/views/WenyuDetail.vue`
- `greenway-vue/src/views/BeiyunheDetail.vue`
- `greenway-vue/src/views/HuanerhuanDetail.vue`
- 以及所有其他 Detail.vue 文件

### 获取百度地图 API 密钥步骤：

1. 访问 [百度地图开放平台](https://lbsyun.baidu.com/)
2. 注册开发者账号
3. 创建应用
4. 复制生成的 API 密钥
5. 替换代码中的密钥值

## 安全建议

- ❌ 不要提交包含真实密码的 .env 文件
- ❌ 不要在代码中硬编码 API 密钥
- ✅ 使用环境变量存储所有敏感信息
- ✅ 在生产环境使用强密码
- ✅ 定期轮换 API 密钥
