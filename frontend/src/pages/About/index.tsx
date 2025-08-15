import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  const values = [
    {
      title: '專業誠信',
      description: '以專業知識和誠信態度，為客戶提供最優質的房地產服務。',
    },
    {
      title: '創新思維',
      description: '不斷創新，引領市場趨勢，提供前瞻性的房地產解決方案。',
    },
    {
      title: '客戶至上',
      description: '以客戶需求為中心，量身打造最適合的房地產投資方案。',
    },
    {
      title: '永續發展',
      description: '致力於綠色建築和永續發展，創造更美好的居住環境。',
    },
  ];

  const milestones = [
    { year: '2015', event: 'ZeYang 品牌成立' },
    { year: '2017', event: '完成第一個百億級專案' },
    { year: '2019', event: '榮獲最佳房地產開發商獎' },
    { year: '2021', event: '推出智慧建築系列專案' },
    { year: '2023', event: '達成 50 個專案里程碑' },
  ];

  return (
    <>
      <Helmet>
        <title>關於品牌 - ZeYang</title>
        <meta name="description" content="了解 ZeYang 的品牌故事、企業理念和發展歷程。" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-primary-50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              關於 ZeYang
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              自 2015 年成立以來，ZeYang 致力於打造最優質的房地產專案，
              結合創新設計與永續理念，為客戶創造理想的生活空間。
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">我們的使命</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                透過專業的房地產開發與管理，創造具有長期價值的優質專案，
                為客戶提供最佳的投資機會，同時為社會創造更美好的生活環境。
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">我們的願景</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                成為最受信賴的房地產品牌，引領產業創新，打造永續、智慧、
                人性化的建築專案，讓每個人都能擁有理想的生活空間。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">核心價值</h2>
            <p className="mt-4 text-lg text-gray-600">
              我們堅持的四大核心價值，是成功的基石
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <CheckCircleIcon className="h-10 w-10 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">發展歷程</h2>
            <p className="mt-4 text-lg text-gray-600">
              見證 ZeYang 的成長與蛻變
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center mb-8 last:mb-0">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-bold text-primary-600">{milestone.year}</span>
                </div>
                <div className="ml-8 flex-grow">
                  <div className="h-px bg-gray-300" />
                </div>
                <div className="ml-8 flex-grow">
                  <p className="text-lg text-gray-700">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            與我們一起打造未來
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            無論您是尋找理想住所還是投資機會，ZeYang 都是您最佳的選擇
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/projects"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              瀏覽專案
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700 transition-colors"
            >
              聯絡我們
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;