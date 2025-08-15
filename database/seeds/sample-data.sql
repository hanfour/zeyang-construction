-- Sample data for ZeYang
-- This file contains sample projects and data for testing

USE ZeYang_db;

-- Insert sample projects
INSERT INTO projects (slug, title, subtitle, category, status, location, year, area, price_range, display_order, is_featured, meta_title, meta_description, created_by, updated_by) VALUES
('taipei-luxury-residence', '台北豪華住宅', '都會精品生活', '住宅', 'on_sale', '台北市信義區', 2024, '45-120坪', '5,000萬-2億', 1, true, '台北豪華住宅 - 信義區頂級住宅', '位於台北市信義區的頂級住宅，享受都會精品生活', 1, 1),
('riverside-commercial-complex', '河岸商業大樓', '新世代商業地標', '商業', 'pre_sale', '新北市板橋區', 2025, '30-500坪', '3,000萬-5億', 2, true, '河岸商業大樓 - 板橋新地標', '板橋河岸第一排商業大樓，打造新世代商業地標', 1, 1),
('tech-park-office', '科技園區辦公大樓', '智慧辦公新典範', '辦公室', 'planning', '新竹科學園區', 2025, '50-300坪', '2,000萬-2億', 3, false, '科技園區辦公大樓 - 新竹科學園區', '位於新竹科學園區的智慧辦公大樓', 1, 1),
('city-center-apartments', '市中心公寓', '便利生活首選', '住宅', 'on_sale', '台中市西區', 2023, '25-45坪', '1,500萬-3,000萬', 4, false, '市中心公寓 - 台中西區便利宅', '台中市西區便利生活圈，交通便捷', 1, 1),
('green-eco-residence', '綠能生態宅', '永續環保住宅', '住宅', 'completed', '高雄市鼓山區', 2023, '35-80坪', '2,000萬-5,000萬', 5, true, '綠能生態宅 - 高雄永續住宅', '高雄首座獲得綠建築標章的生態住宅', 1, 1);

-- Get project UUIDs (MySQL 8.0 will auto-generate these)
SET @project1_uuid = (SELECT uuid FROM projects WHERE slug = 'taipei-luxury-residence');
SET @project2_uuid = (SELECT uuid FROM projects WHERE slug = 'riverside-commercial-complex');
SET @project3_uuid = (SELECT uuid FROM projects WHERE slug = 'tech-park-office');
SET @project4_uuid = (SELECT uuid FROM projects WHERE slug = 'city-center-apartments');
SET @project5_uuid = (SELECT uuid FROM projects WHERE slug = 'green-eco-residence');

-- Insert project details
INSERT INTO project_details (project_uuid, description, detail_content, features, specifications, floor_plans, nearby_facilities) VALUES
(@project1_uuid, 
 '座落於台北市最精華的信義計畫區，享有101大樓景觀，結合現代建築美學與智慧生活科技。',
 '<h3>專案特色</h3><p>本案位於信義計畫區核心地段，鄰近捷運站、百貨公司、國際企業總部。建築設計由國際知名建築師操刀，融合現代簡約風格與東方美學。</p><h3>生活機能</h3><ul><li>步行5分鐘至捷運站</li><li>鄰近多家百貨公司</li><li>周邊國際學校林立</li></ul>',
 '["24小時禮賓服務", "空中花園", "健身房與泳池", "智慧家居系統", "雙車位"]',
 '{"結構": "SRC鋼骨結構", "樓高": "地上35層，地下5層", "戶數": "138戶", "公設比": "32%", "樓地板面積": "45-120坪"}',
 '["2房(45坪)", "3房(68坪)", "4房(95坪)", "頂樓(120坪)"]',
 '{"交通": ["捷運信義線", "公車站"], "購物": ["微風信義", "新光三越"], "學校": ["台北美國學校", "信義國小"], "醫療": ["台大醫院"], "公園": ["大安森林公園"]}'),

(@project2_uuid,
 '板橋河岸第一排，擁有絕佳河景視野，規劃商場、辦公、餐飲等複合式商業空間。',
 '<h3>投資亮點</h3><p>位於板橋新都心，緊鄰河岸公園，交通便捷。規劃1-3樓為商場，4-15樓為辦公空間，頂樓設有景觀餐廳。</p>',
 '["河岸第一排", "複合式商業空間", "捷運共構", "智慧建築標章", "綠建築認證"]',
 '{"總樓地板面積": "15,000坪", "商場面積": "3,000坪", "辦公面積": "10,000坪", "停車位": "350個"}',
 '["商場樓層配置", "標準辦公樓層(300坪)", "彈性辦公空間(150坪)"]',
 '{"交通": ["捷運板南線", "高鐵站"], "商圈": ["板橋車站商圈", "府中商圈"], "公園": ["河濱公園"]}'),

(@project3_uuid,
 '座落於新竹科學園區內，專為科技產業打造的智慧辦公大樓，提供最先進的辦公環境。',
 '<h3>智慧辦公</h3><p>整合IoT物聯網、AI人工智慧等最新科技，打造高效能辦公環境。</p>',
 '["5G網路覆蓋", "AI門禁系統", "智慧停車", "綠能設計", "彈性隔間"]',
 '{"基地面積": "2,000坪", "樓層": "地上12層，地下3層", "標準層面積": "300坪", "天花板高度": "3.6米"}',
 '["大廳與接待區", "標準辦公樓層", "會議中心", "員工休憩區"]',
 '{"園區設施": ["員工餐廳", "便利商店"], "交通": ["園區接駁車", "停車場"], "周邊": ["清大", "交大"]}'),

(@project4_uuid,
 '位於台中市精華地段，生活機能完善，適合首購族與小家庭。',
 '<h3>便利生活</h3><p>鄰近SOGO百貨、勤美綠園道，生活機能極佳。</p>',
 '["近勤美綠園道", "生活機能完善", "優質學區", "公設完善"]',
 '{"基地面積": "800坪", "戶數": "120戶", "樓層": "地上15層", "公設比": "30%"}',
 '["2房(25坪)", "3房(35坪)", "3+1房(45坪)"]',
 '{"購物": ["SOGO百貨", "勤美誠品"], "公園": ["勤美綠園道", "市民廣場"], "學校": ["台中一中", "居仁國中"]}'),

(@project5_uuid,
 '高雄第一座通過綠建築黃金級認證的住宅，實現永續生活理念。',
 '<h3>永續生活</h3><p>採用太陽能發電、雨水回收系統，打造環保永續的居住環境。</p>',
 '["綠建築黃金級", "太陽能發電", "雨水回收", "生態池", "屋頂農園"]',
 '{"基地面積": "1,500坪", "綠覆率": "65%", "節能效率": "40%", "戶數": "88戶"}',
 '["3房(35坪)", "4房(55坪)", "5房(80坪)"]',
 '{"交通": ["輕軌站", "公車站"], "教育": ["中山大學", "鼓山國小"], "休閒": ["西子灣", "壽山動物園"]}');

-- Insert sample project images (placeholder data)
INSERT INTO project_images (project_uuid, image_type, file_name, file_path, file_size, mime_type, alt_text, display_order) VALUES
(@project1_uuid, 'main', 'taipei-luxury-main.jpg', 'projects/sample/taipei-luxury-main.jpg', 2048000, 'image/jpeg', '台北豪華住宅外觀', 0),
(@project1_uuid, 'gallery', 'taipei-luxury-lobby.jpg', 'projects/sample/taipei-luxury-lobby.jpg', 1536000, 'image/jpeg', '豪華大廳', 1),
(@project1_uuid, 'gallery', 'taipei-luxury-pool.jpg', 'projects/sample/taipei-luxury-pool.jpg', 1843200, 'image/jpeg', '空中泳池', 2),
(@project1_uuid, 'floor_plan', 'taipei-luxury-3room.jpg', 'projects/sample/taipei-luxury-3room.jpg', 1024000, 'image/jpeg', '三房格局圖', 3),

(@project2_uuid, 'main', 'riverside-main.jpg', 'projects/sample/riverside-main.jpg', 2457600, 'image/jpeg', '河岸商業大樓外觀', 0),
(@project2_uuid, 'gallery', 'riverside-lobby.jpg', 'projects/sample/riverside-lobby.jpg', 1638400, 'image/jpeg', '商業大廳', 1),

(@project3_uuid, 'main', 'tech-park-main.jpg', 'projects/sample/tech-park-main.jpg', 2048000, 'image/jpeg', '科技園區辦公大樓', 0),

(@project4_uuid, 'main', 'city-center-main.jpg', 'projects/sample/city-center-main.jpg', 1843200, 'image/jpeg', '市中心公寓外觀', 0),

(@project5_uuid, 'main', 'green-eco-main.jpg', 'projects/sample/green-eco-main.jpg', 2252800, 'image/jpeg', '綠能生態宅', 0),
(@project5_uuid, 'gallery', 'green-eco-garden.jpg', 'projects/sample/green-eco-garden.jpg', 1945600, 'image/jpeg', '生態花園', 1);

-- Link projects with tags
INSERT INTO project_tags (project_uuid, tag_id) VALUES
(@project1_uuid, 1), -- 豪華
(@project1_uuid, 3), -- 交通便利
(@project2_uuid, 3), -- 交通便利
(@project2_uuid, 5), -- 投資首選
(@project3_uuid, 5), -- 投資首選
(@project4_uuid, 3), -- 交通便利
(@project4_uuid, 4), -- 學區房
(@project5_uuid, 2), -- 環保
(@project5_uuid, 1); -- 豪華

-- Update tag usage counts
UPDATE tags SET usage_count = (
  SELECT COUNT(*) FROM project_tags WHERE tag_id = tags.id
);

-- Insert sample contacts
INSERT INTO contacts (name, email, phone, subject, message, source, is_read) VALUES
('張先生', 'zhang@example.com', '0912345678', '詢問台北豪華住宅', '請問還有3房的戶型嗎？想約看房。', 'taipei-luxury-residence', false),
('李小姐', 'li@example.com', '0923456789', '河岸商業大樓投資', '想了解商業大樓的投資報酬率。', 'riverside-commercial-complex', false),
('王先生', 'wang@example.com', '0934567890', '綠能生態宅資訊', '對環保建材很有興趣，可以提供更多資訊嗎？', 'green-eco-residence', true);

-- Insert sample project statistics (last 7 days)
INSERT INTO project_statistics (project_uuid, date, view_count, unique_visitors, contact_count) VALUES
(@project1_uuid, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 150, 120, 3),
(@project1_uuid, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 180, 145, 5),
(@project1_uuid, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 200, 160, 4),
(@project1_uuid, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 220, 175, 6),
(@project1_uuid, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 195, 155, 3),
(@project1_uuid, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 210, 168, 7),
(@project1_uuid, CURDATE(), 185, 148, 4),

(@project2_uuid, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 80, 65, 2),
(@project2_uuid, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 95, 75, 1),
(@project2_uuid, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 110, 88, 3),
(@project2_uuid, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 105, 84, 2),
(@project2_uuid, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 98, 78, 1),
(@project2_uuid, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 115, 92, 3),
(@project2_uuid, CURDATE(), 102, 82, 2);

-- Update project view counts
UPDATE projects p
SET view_count = (
  SELECT SUM(view_count) 
  FROM project_statistics 
  WHERE project_uuid = p.uuid
);