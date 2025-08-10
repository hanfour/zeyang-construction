# 元件庫

## 後台元件結構

### Layout 元件
```jsx
<AdminLayout>
  <Sidebar />
  <Header />
  <Content>{children}</Content>
</AdminLayout>
Form 元件
jsx// 文字輸入
<TextField
  label="專案名稱"
  name="title"
  value={title}
  onChange={handleChange}
  required
/>

// 下拉選單
<SelectField
  label="類別"
  name="category"
  options={categories}
  value={category}
/>

// 圖片上傳
<ImageUpload
  label="專案圖片"
  multiple
  maxSize={10 * 1024 * 1024}
  onUpload={handleUpload}
/>
```
### Table 元件
```jsx
<DataTable
  columns={columns}
  data={projects}
  onSort={handleSort}
  onFilter={handleFilter}
  pagination
/>
```
### 常用 Hooks
```javascript
// 表單處理
const { values, errors, handleChange } = useForm(initialValues);

// API 請求
const { data, loading, error } = useApi('/api/projects');

// 認證狀態
const { user, isAuthenticated } = useAuth();
```