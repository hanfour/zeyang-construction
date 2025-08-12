# 首頁三大區塊組件文檔

## 組件概覽

### 1. HomeDreamSection（築夢區塊）
- **類名**: `.p-homeDream`
- **高度**: 100vh
- **主要特色**: 視差背景、淡入動畫

### 2. HomeCraftSustainSection（精工及永續區塊）
- **類名**: `.p-homeCraftSustain`
- **高度**: 100vh (pin固定)
- **主要特色**: 段落切換動畫、ScrollTrigger pin效果

### 3. HomeClassicSection（經典區塊）
- **類名**: `.p-homeClassic`
- **高度**: auto
- **主要特色**: 案例卡片淡入、hover放大效果

## 使用方式

```tsx
import HomeDreamSection from './components/HomeDreamSection';
import HomeCraftSustainSection from './components/HomeCraftSustainSection';
import HomeClassicSection from './components/HomeClassicSection';

// 在首頁組件中使用
<HomeDreamSection />
<HomeCraftSustainSection />
<HomeClassicSection />
```

## 動畫細節

### HomeDreamSection
- 背景圖片：scale 1.05→1 + opacity淡入 (0.8s)
- 主標題：延遲0.2s，translateY 40px→0 + opacity (0.6s)
- 副標題/CTA：延遲0.4s，translateY 30px→0 + opacity (0.6s, stagger 0.15s)
- 視差效果：背景圖片隨滾動移動 (20%比率)
- 滾出淡出：標題opacity降至0 (0.5s)

### HomeCraftSustainSection
- Pin固定：整個區塊固定100vh高度
- 段落切換：當前段落opacity 1→0 + translateY 0→-40px
- 新段落進入：opacity 0→1 + translateY 40px→0 (0.8s)
- 背景視差：低速視差效果 (10%比率)

### HomeClassicSection
- 標題進場：opacity + translateY 40px→0 (0.6s)
- 卡片進場：依序淡入，stagger 0.15s
- Hover效果：scale 1→1.03 + 陰影增強 (0.3s)
- 遮罩層：hover時opacity 0.6→0.4

## 無障礙支援
- 所有組件都支援 `prefers-reduced-motion`
- 當啟用減少動態效果時，僅保留opacity動畫，移除位移和縮放

## 圖片資源
需要準備以下圖片：
- `/images/home-dream-bg.jpg` - 築夢區塊背景
- `/images/home-craft-bg.jpg` - 精工背景
- `/images/home-sustain-bg.jpg` - 永續背景
- `/images/classic-case1-4.jpg` - 經典案例圖片

## 技術要求
- GSAP 3.x
- ScrollTrigger 插件
- React 18.x
- Tailwind CSS

## 效能優化
- 圖片使用 lazy loading
- 建議使用 WebP 格式
- 動畫使用 transform 和 opacity 避免重排
- ScrollTrigger 使用 anticipatePin 優化