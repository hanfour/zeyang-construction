import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-100">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-3xl font-bold text-primary">ZY</span>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-700">澤暘建設股份有限公司</p>
                <p className="text-xs text-neutral-600">Ze Yang Construction Co., Ltd.</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-neutral-600">
              <p className="flex items-center">
                <span className="mr-2">📞</span>
                02-2736-8955
              </p>
              <p className="flex items-center">
                <span className="mr-2">📍</span>
                台北市大安區安和路二段213號3樓之2
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-neutral-800 mb-4">快速連結</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-neutral-600 hover:text-primary transition-colors">
                  關於澤暘
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-neutral-600 hover:text-primary transition-colors">
                  澤暘作品
                </Link>
              </li>
              <li>
                <Link to="/development" className="text-neutral-600 hover:text-primary transition-colors">
                  開發專區
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-neutral-600 hover:text-primary transition-colors">
                  澤暘團隊
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-600 hover:text-primary transition-colors">
                  聯絡我們
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-medium text-neutral-800 mb-4">聯絡資訊</h3>
            <div className="space-y-2 text-sm text-neutral-600">
              <p>營業時間</p>
              <p>週一至週五 09:00-18:00</p>
              <p>週六、日及國定假日休息</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500">
            <p>© {currentYear} ZE YANG. ALL RIGHTS RESERVED</p>
            <p className="mt-2 sm:mt-0">© COPYRIGHT ZE YANG. ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;