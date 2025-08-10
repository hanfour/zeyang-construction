import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { 
  MapPinIcon, 
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ErrorMessage from '@/components/Common/ErrorMessage';
import projectService from '@/services/project.service';
import { formatPrice } from '@/utils/format';

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectService.getProjectBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage 
          title="找不到專案" 
          message="您查找的專案不存在或已被移除。"
          actionLabel="返回專案列表"
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  const images = project.images || [];
  const activeImage = images[activeImageIndex];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      planning: { label: '規劃中', class: 'bg-gray-100 text-gray-800' },
      pre_sale: { label: '預售中', class: 'bg-blue-100 text-blue-800' },
      on_sale: { label: '銷售中', class: 'bg-green-100 text-green-800' },
      sold_out: { label: '已售罄', class: 'bg-red-100 text-red-800' },
      completed: { label: '已完工', class: 'bg-purple-100 text-purple-800' },
    };
    return statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
  };

  const statusDisplay = getStatusDisplay(project.status);

  return (
    <>
      <Helmet>
        <title>{project.title} - EstateHub</title>
        <meta name="description" content={project.description} />
      </Helmet>

      {/* Hero Section with Image Gallery */}
      <section className="relative bg-gray-900">
        <div className="relative h-[60vh] md:h-[70vh]">
          {images.length > 0 ? (
            <>
              <img
                src={activeImage.imageUrl}
                alt={activeImage.alt || project.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <p className="text-gray-400">暫無圖片</p>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-4 ${statusDisplay.class}`}>
                {statusDisplay.label}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{project.title}</h1>
              {project.subtitle && (
                <p className="text-xl text-gray-200">{project.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">類型</p>
              <p className="font-semibold">{project.category}</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <MapPinIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">地點</p>
              <p className="font-semibold">{project.location}</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">價格範圍</p>
              <p className="font-semibold">
                {project.minPrice && project.maxPrice
                  ? `${formatPrice(project.minPrice)} - ${formatPrice(project.maxPrice)}`
                  : '請洽詢'}
              </p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">完工日期</p>
              <p className="font-semibold">{project.completionDate || '規劃中'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Details */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">專案介紹</h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p>{project.description}</p>
              </div>

              {project.features && project.features.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">專案特色</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                          <div className="w-2 h-2 bg-primary-600 rounded-full" />
                        </div>
                        <p className="text-gray-700">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {project.specifications && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">規格資訊</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <dl className="grid md:grid-cols-2 gap-4">
                      {Object.entries(project.specifications).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm font-medium text-gray-500">{key}</dt>
                          <dd className="mt-1 text-gray-900">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">聯絡我們</h3>
                  <p className="text-gray-600 mb-6">
                    對這個專案有興趣？請留下您的聯絡資訊，我們的專員會盡快與您聯繫。
                  </p>
                  <button
                    onClick={() => navigate('/contact')}
                    className="btn-primary w-full"
                  >
                    預約賞屋
                  </button>
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-500 mb-2">專案經理</p>
                    <p className="font-semibold text-gray-900">{project.projectManager || '專業團隊'}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      電話：02-8789-9999
                    </p>
                  </div>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">標籤</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Grid */}
      {images.length > 1 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">更多圖片</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className="aspect-[4/3] overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                >
                  <img
                    src={image.thumbnailUrl || image.imageUrl}
                    alt={image.alt || `${project.title} - 圖片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            準備好開始您的房地產投資了嗎？
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            立即聯繫我們的專業團隊，獲得最適合您的投資建議
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              立即諮詢
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700 transition-colors"
            >
              查看更多專案
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectDetailPage;