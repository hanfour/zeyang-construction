# 資料庫結構

## 資料表關係圖
```bash
users (1) ─────────── (n) projects
│                         │
│                         ├── project_details (1:1)
│                         ├── project_images (1:n)
│                         └── project_tags (n:n) ── tags
│
└── contacts (1:n)
```

## 主要資料表

### users
- id (PK)
- username (UNIQUE)
- password (bcrypt)
- email (UNIQUE)
- role (admin|editor|viewer)

### projects  
- id (PK)
- uuid (UNIQUE)
- slug (UNIQUE, INDEX)
- title
- category (INDEX)
- status (INDEX)
- created_at
- updated_at

### project_images
- id (PK)
- project_uuid (FK, INDEX)
- image_type
- file_path
- display_order (INDEX)

## 索引策略
- 常用查詢欄位建立索引
- 複合索引用於多條件查詢
- 避免過多索引影響寫入