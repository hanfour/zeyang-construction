import React from 'react';
import { Link } from 'react-router-dom';

const CTA: React.FC = () => {
  return (
    <section className="bg-primary-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            準備好找到您的理想房產了嗎？
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            立即聯絡我們，讓專業團隊協助您實現房產投資目標
          </p>
          <div className="mt-8 flex justify-center gap-x-4">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              聯絡我們
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700 transition-colors"
            >
              瀏覽專案
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;