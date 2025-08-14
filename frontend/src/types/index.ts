// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: string;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at?: string;
  last_login_at?: string;
}

// Custom field type for dynamic fields
export interface CustomField {
  label: string;
  value: string;
  id?: string;
}

// Project types
export interface Project {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: '住宅' | '商業' | '辦公室' | '公共建築' | '其他';
  status: 'planning' | 'pre_sale' | 'on_sale' | 'sold_out' | 'completed';
  location: string;
  base_address?: string;
  year?: number;
  area?: string;
  floor_plan_info?: string;
  unit_count?: number;
  display_order: number;
  view_count: number;
  is_active: boolean;
  is_featured: boolean;
  facebook_page?: string;
  booking_phone?: string;
  info_website?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  // Relations
  description?: string;
  detail_content?: string;
  features?: Record<string, any>;
  specifications?: Record<string, any>;
  floor_plans?: string[];
  nearby_facilities?: Record<string, any>;
  custom_fields?: CustomField[];
  images?: ProjectImage[];
  tags?: Tag[] | string[];
  image_count?: number;
  main_image?: {
    file_path: string;
    thumbnails: {
      THUMBNAIL?: ImageInfo;
      SMALL?: ImageInfo;
      MEDIUM?: ImageInfo;
      LARGE?: ImageInfo;
      ORIGINAL?: ImageInfo;
      optimized?: ImageInfo;
    };
  };
}

export interface ProjectImage {
  id: number;
  project_uuid: string;
  image_type: 'main' | 'gallery' | 'floor_plan' | 'location' | 'vr';
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  thumbnails?: {
    thumbnail?: ImageInfo;
    small?: ImageInfo;
    medium?: ImageInfo;
    large?: ImageInfo;
    optimized?: ImageInfo;
  };
  alt_text?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ImageInfo {
  path: string;
  filename: string;
  width: number;
  height: number;
}

// Tag types
export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  usage_count: number;
  project_count?: number;
  created_at: string;
}

// Contact types
export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  source?: string;
  is_read: boolean;
  is_replied: boolean;
  read_by?: number;
  read_at?: string;
  replied_by?: number;
  replied_at?: string;
  notes?: string;
  created_at: string;
  // Relations
  read_by_name?: string;
  replied_by_name?: string;
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  source?: string;
}

export interface ProjectFormData {
  title: string;
  subtitle?: string;
  category: Project['category'];
  status?: Project['status'];
  location: string;
  base_address?: string;
  year?: number;
  area?: string;
  floor_plan_info?: string;
  unit_count?: number;
  display_order?: number;
  is_featured?: boolean;
  facebook_page?: string;
  booking_phone?: string;
  info_website?: string;
  meta_title?: string;
  meta_description?: string;
  description?: string;
  detail_content?: string;
  features?: Record<string, any>;
  specifications?: Record<string, any>;
  floor_plans?: string[];
  nearby_facilities?: Record<string, any>;
  custom_fields?: CustomField[];
  tags?: string[];
}

// Filter types
export interface ProjectFilters {
  category?: Project['category'];
  status?: Project['status'];
  is_featured?: boolean;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export interface ContactFilters {
  is_read?: boolean;
  is_replied?: boolean;
  source?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}