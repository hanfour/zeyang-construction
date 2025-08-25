-- 澤暘建設網站 - 初始管理員帳號設定
-- 預設帳號: admin
-- 預設密碼: admin123456

USE zeyang;

-- 建立預設管理員帳號
-- 密碼已使用 bcrypt 加密（原始密碼: admin123456）
INSERT INTO users (username, email, password, role, is_active) 
VALUES (
    'admin',
    'admin@zeyanggroup.com.tw',
    '$2b$10$K7L1OJ0TfmCjU9N9H7RGLu8A4bKsK6J5qYJ0M1S8P9qKHfQZ6Zj5K',
    'admin',
    1
) ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    role = VALUES(role),
    is_active = VALUES(is_active);

-- 建立預設標籤
INSERT INTO tags (name, nameEn, slug, description) VALUES 
('住宅', 'Residential', 'residential', '住宅建案專案'),
('商業', 'Commercial', 'commercial', '商業大樓專案'),
('都更', 'Urban Renewal', 'urban-renewal', '都市更新專案'),
('豪宅', 'Luxury', 'luxury', '豪華住宅專案'),
('廠辦', 'Industrial', 'industrial', '廠房辦公室專案')
ON DUPLICATE KEY UPDATE 
    nameEn = VALUES(nameEn),
    description = VALUES(description);

-- 建立範例專案（可選）
INSERT INTO projects (
    identifier, 
    name, 
    nameEn, 
    type, 
    status, 
    description,
    location,
    developer,
    yearCompleted,
    is_featured,
    display_order
) VALUES (
    'demo-project-001',
    '澤暘松江',
    'ZeYang Songjiang',
    'residential',
    'completed',
    '位於台北市中心的精品住宅，結合現代建築美學與實用機能，打造都會生活新標準。',
    '台北市中山區松江路',
    '澤暘建設',
    2024,
    1,
    1
) ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    status = VALUES(status);

-- 顯示設定完成訊息
SELECT '✅ 資料庫初始化完成！' as '狀態',
       '預設管理員帳號: admin' as '帳號',
       '預設密碼: admin123456' as '密碼',
       '請立即登入後台更改密碼' as '提醒';