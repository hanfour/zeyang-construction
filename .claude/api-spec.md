markdown# API 規格快速參考

## 認證端點
```bash
POST   /api/auth/login          # 登入
PUT    /api/auth/password       # 改密碼
專案端點
bashGET    /api/projects            # 列表
GET    /api/projects/:slug      # 詳情
POST   /api/projects            # 新增 [Auth]
PUT    /api/projects/:uuid      # 更新 [Auth]
DELETE /api/projects/:uuid      # 刪除 [Auth]
請求範例
javascript// 新增專案
POST /api/projects
Headers: { Authorization: 'Bearer token' }
Body: {
  title: "專案名稱",
  category: "住宅",
  location: "台北市",
  status: "on_sale"
}

// 回應格式
{
  success: true,
  data: { uuid, slug },
  message: "專案新增成功"
}
```
錯誤代碼

400: 參數錯誤
401: 未認證
403: 無權限
404: 找不到
500: 伺服器錯誤