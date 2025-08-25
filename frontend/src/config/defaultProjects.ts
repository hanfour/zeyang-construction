import { Project } from '@/types';

// 預設專案資料 - 當 API 無法連線或沒有資料時使用
// 統一管理所有預設專案，依據 display_page 欄位來區分顯示位置
export const defaultProjects: Project[] = [
  // 澤暘作品 - 顯示在首頁和專案頁
  {
    id: 'default-zeyang-songjiang',
    uuid: 'default-zeyang-songjiang',
    title: '澤暘松江',
    location: '台北市中山區',
    base_address: '台北市中山區松江路23-5號',
    year: '2025',
    area: '172.02坪',
    floor_plan_info: '地上15層，地下4層',
    is_featured: 1,
    main_image: {
      id: 'img-songjiang-main',
      file_path: '/images/project/澤暘松江.webp',
      file_name: '澤暘松江.webp',
      mime_type: 'image/webp',
      size: 0,
      type: 'main' as const,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    },
    images: [
      {
        id: 'img-songjiang-2',
        file_path: '/images/project/img-work-1.png',
        file_name: 'img-work-1.png',
        mime_type: 'image/png',
        size: 0,
        type: 'image' as const,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'img-songjiang-3',
        file_path: '/images/project/img-work-2.png',
        file_name: 'img-work-2.png',
        mime_type: 'image/png',
        size: 0,
        type: 'image' as const,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }
    ],
    tags: [],
    display_page: '澤暘作品',
    slug: 'zeyang-songjiang',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  // 開發專區 - 顯示在開發專區頁面
  {
    id: 'default-zhongshan',
    uuid: 'default-zhongshan',
    title: '中山區',
    location: '台北市中山區',
    main_image: {
      id: 'img-zhongshan-1',
      file_path: '/images/project/img-work-1.png',
      file_name: 'img-work-1.png',
      mime_type: 'image/png',
      size: 0,
      type: 'main' as const,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    },
    images: [],
    tags: [],
    display_page: '開發專區',
    slug: 'zhongshan-district',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
];

// Helper functions to get filtered projects
export const getDefaultProjectsByDisplayPage = (displayPage: '澤暘作品' | '開發專區'): Project[] => {
  return defaultProjects.filter(project => project.display_page === displayPage);
};

export const getDefaultFeaturedProjects = (): Project[] => {
  // 只返回標記為精選且是澤暘作品的專案
  return defaultProjects.filter(project => 
    project.display_page === '澤暘作品' && 
    project.is_featured === 1
  );
};

// 向後相容的函數
export const getDefaultProjects = (type: 'development' | 'projects' | 'featured'): any => {
  switch(type) {
    case 'development':
      return getDefaultProjectsByDisplayPage('開發專區')[0]; // 返回第一個開發專區專案
    case 'projects':
      return getDefaultProjectsByDisplayPage('澤暘作品')[0]; // 返回第一個澤暘作品
    case 'featured':
      return getDefaultFeaturedProjects(); // 返回精選專案陣列
    default:
      return [];
  }
};