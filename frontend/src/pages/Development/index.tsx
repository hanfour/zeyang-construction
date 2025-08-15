import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  BuildingOfficeIcon, 
  HomeModernIcon, 
  BuildingStorefrontIcon,
  MapPinIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DevelopmentZone {
  id: number;
  name: string;
  location: string;
  type: string;
  area: string;
  status: string;
  startDate: string;
  expectedCompletion: string;
  description: string;
  features: string[];
  image: string;
  mapImage?: string;
}

const DevelopmentPage: React.FC = () => {
  const developmentZones: DevelopmentZone[] = [
    {
      id: 1,
      name: '北區科技園區開發案',
      location: '台北市內湖區',
      type: '商業辦公',
      area: '15,000 坪',
      status: '規劃中',
      startDate: '2024 Q3',
      expectedCompletion: '2027 Q2',
      description: '結合科技產業與綠色建築概念，打造新世代科技園區。預計引進AI、生技、綠能等產業，創造超過5000個工作機會。',
      features: [
        '智慧建築系統',
        '綠能發電設施',
        '共享工作空間',
        '員工休憩設施'
      ],
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 2,
      name: '中區住宅新都心',
      location: '台中市西屯區',
      type: '住宅社區',
      area: '25,000 坪',
      status: '建設中',
      startDate: '2023 Q2',
      expectedCompletion: '2026 Q4',
      description: '大型住宅社區開發案，規劃1,200戶住宅單位，包含公園、學校、商業設施等完整生活機能。',
      features: [
        '中央公園綠地',
        '雙語學區規劃',
        '捷運共構',
        '商業購物中心'
      ],
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 3,
      name: '南區複合式商城',
      location: '高雄市前鎮區',
      type: '商業複合',
      area: '8,000 坪',
      status: '規劃中',
      startDate: '2025 Q1',
      expectedCompletion: '2028 Q3',
      description: '結合購物、餐飲、娛樂、辦公的大型複合式開發案，將成為南台灣新地標。',
      features: [
        '國際品牌進駐',
        'IMAX影城',
        '空中花園',
        '智慧停車系統'
      ],
      image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '規劃中':
        return 'bg-blue-100 text-blue-800';
      case '建設中':
        return 'bg-green-100 text-green-800';
      case '即將完工':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '商業辦公':
        return <BuildingOfficeIcon className="h-6 w-6" />;
      case '住宅社區':
        return <HomeModernIcon className="h-6 w-6" />;
      case '商業複合':
        return <BuildingStorefrontIcon className="h-6 w-6" />;
      default:
        return <BuildingOfficeIcon className="h-6 w-6" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>開發專區 - ZeYang</title>
        <meta name="description" content="了解 ZeYang 正在開發的大型專案，包含商業、住宅、複合式開發案。" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gray-900 py-16 md:py-24">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
            alt="Development zone"
          />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              開發專區
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto">
              ZeYang 正在進行的大型開發案，涵蓋住宅、商業、辦公等多元類型，
              為城市發展注入新活力。
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary-600">48,000+</p>
              <p className="mt-2 text-sm text-gray-600">總開發坪數</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-600">3</p>
              <p className="mt-2 text-sm text-gray-600">進行中專案</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-600">NT$ 180億</p>
              <p className="mt-2 text-sm text-gray-600">總投資金額</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-600">8,000+</p>
              <p className="mt-2 text-sm text-gray-600">預計創造就業</p>
            </div>
          </div>
        </div>
      </section>

      {/* Development Zones */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {developmentZones.map((zone, index) => (
              <div key={zone.id} className={`${index % 2 === 0 ? '' : 'lg:flex-row-reverse'} lg:flex lg:gap-12 items-center`}>
                {/* Image */}
                <div className="lg:w-1/2 mb-8 lg:mb-0">
                  <div className="relative overflow-hidden rounded-lg shadow-xl">
                    <img
                      src={zone.image}
                      alt={zone.name}
                      className="w-full h-[400px] object-cover"
                    />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(zone.status)}`}>
                      {zone.status}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:w-1/2">
                  <div className="flex items-center gap-2 text-primary-600 mb-4">
                    {getTypeIcon(zone.type)}
                    <span className="font-medium">{zone.type}</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{zone.name}</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPinIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{zone.location}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <ChartBarIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>開發面積：{zone.area}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <ClockIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>預計時程：{zone.startDate} - {zone.expectedCompletion}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">{zone.description}</p>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">專案特色</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {zone.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-600">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="btn-primary">
                    了解更多
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            投資未來，共創價值
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            ZeYang 的開發專案不僅創造優質的生活與工作空間，更為投資者帶來長期穩定的回報
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              投資洽詢
            </a>
            <a
              href="/projects"
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700 transition-colors"
            >
              查看所有專案
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default DevelopmentPage;