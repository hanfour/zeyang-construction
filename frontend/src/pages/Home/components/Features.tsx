import React from 'react';
import {
  BuildingOfficeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: '精選優質專案',
    description: '我們嚴選每一個房地產專案，確保品質與投資價值，為您提供最佳選擇。',
    icon: SparklesIcon,
  },
  {
    name: '專業團隊服務',
    description: '經驗豐富的專業團隊，提供全方位的諮詢服務，協助您做出明智的決定。',
    icon: UserGroupIcon,
  },
  {
    name: '透明可靠資訊',
    description: '提供詳細完整的專案資訊，包含位置、規格、價格等，讓您充分了解每個細節。',
    icon: ShieldCheckIcon,
  },
  {
    name: '多元專案類型',
    description: '從住宅、商業到辦公大樓，涵蓋各種房地產類型，滿足不同的投資需求。',
    icon: BuildingOfficeIcon,
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            為什麼選擇 ZeYang
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            我們致力於提供最優質的房地產服務體驗
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <feature.icon className="h-8 w-8 text-primary-600" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">{feature.name}</h3>
              <p className="mt-2 text-base text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;