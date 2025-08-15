import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import PageBanner from '@/components/Layout/PageBanner';
import MenuButton from '@/components/Layout/MenuButton';
import NavigationMenu from '@/components/Layout/NavigationMenu';
import contactService from '@/services/contact.service';

interface ContactFormData {
  name: string;
  gender: string;
  phone: string;
  email: string;
  requirement: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const contactMutation = useMutation({
    mutationFn: contactService.createContact,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('您的訊息已成功送出，我們會盡快與您聯繫！');
        reset();
      } else {
        toast.error(response.message || '送出失敗，請稍後再試');
      }
    },
    onError: (error: any) => {
      console.error('Contact form submission error:', error);
      const errorMessage = error?.response?.data?.message || '送出失敗，請稍後再試';
      toast.error(errorMessage);
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    await contactMutation.mutateAsync(data);
  };

  const genderOptions = [
    { value: '', label: '請選擇' },
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
    { value: 'other', label: '其他' }
  ];

  const requirementOptions = [
    { value: '', label: '請選擇' },
    { value: '建案諮詢', label: '建案諮詢' },
    { value: '土地開發', label: '土地開發' },
    { value: '都更合建', label: '都更合建' },
    { value: '其他問題', label: '其他問題' }
  ];

  const BANNER_HEIGHT = 288;

  const bannerConfig = {
    logoSection: {
      iconSrc: "/images/logo-icon-brand.svg",
      iconAlt: "澤暘建設",
      subtitle: "CONTACT US",
      title: "聯絡我們"
    },
    centralContent: {
      text: "您好，若您有任何需要服務的地方，\n歡迎撥打服務專線或填寫下列表格並送出，我們將盡快與您聯絡！謝謝！"
    },
    backgroundImage: "/images/contact/top-bn-contact.jpg"
  };

  return (
    <>
      <Helmet>
        <title>聯絡我們 - 澤暘建設</title>
        <meta name="description" content="與澤暘建設聯繫，了解更多房地產專案資訊或預約賞屋。" />
      </Helmet>

      {/* Hero Section */}
      <PageBanner config={bannerConfig}>
        {/* Menu Button */}
        <MenuButton 
          isOpen={isMenuOpen} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          color={scrollY > BANNER_HEIGHT ? 'dark' : 'light'}
        />
        
        {/* Navigation Menu */}
        <NavigationMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />
      </PageBanner>

      {/* Contact Form Section */}
      <section className="py-16 md:py-24 bg-[url('/images/contact/form-bg.png')] bg-cover bg-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid md:grid-cols-2 md:gap-8 h-full">
                {/* 左側欄位 */}
                <div className="flex flex-col space-y-2">
                  {/* 姓名 */}
                  <div>
                    <label htmlFor="name" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      姓名
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="text"
                        id="name"
                        {...register('name', { required: '請輸入姓名' })}
                        className="w-full h-12 px-4 pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                        placeholder=""
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* 性別 */}
                  <div>
                    <label htmlFor="gender" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      性別
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <select
                        id="gender"
                        {...register('gender', { required: '請選擇性別' })}
                        className="w-full h-12 px-4 pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none appearance-none"
                      >
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-5 h-5 text-primary-more" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {errors.gender && (
                      <p className="mt-2 text-sm text-red-600">{errors.gender.message}</p>
                    )}
                  </div>

                  {/* 聯絡電話 */}
                  <div>
                    <label htmlFor="phone" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      聯絡電話
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="tel"
                        id="phone"
                        {...register('phone', { required: '請輸入聯絡電話' })}
                        className="w-full h-12 px-4 pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                        placeholder=""
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* 電子信箱 */}
                  <div>
                    <label htmlFor="email" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      電子信箱
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="email"
                        id="email"
                        {...register('email', {
                          required: '請輸入電子信箱',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: '請輸入有效的電子信箱'
                          }
                        })}
                        className="w-full h-12 px-4 pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                        placeholder=""
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* 右側欄位 */}
                <div className="flex flex-col space-y-2">
                  {/* 需求項目 */}
                  <div>
                    <label htmlFor="requirement" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      需求項目
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <select
                        id="requirement"
                        {...register('requirement', { required: '請選擇需求項目' })}
                        className="w-full h-12 px-4 pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none appearance-none"
                      >
                        {requirementOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-5 h-5 text-primary-more" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {errors.requirement && (
                      <p className="mt-2 text-sm text-red-600">{errors.requirement.message}</p>
                    )}
                  </div>

                  {/* 諮詢內容 */}
                  <div className="flex-1 flex flex-col">
                    <label htmlFor="message" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      諮詢內容
                    </label>
                    <div className="relative flex-1">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <textarea
                        id="message"
                        {...register('message', { required: '請輸入諮詢內容' })}
                        className="w-full h-full px-4 py-3 pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none resize-none"
                        placeholder=""
                      />
                    </div>
                    {errors.message && (
                      <p className="mt-2 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 送出按鈕 */}
              <div className="flex justify-center pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting || contactMutation.isPending}
                  className="bg-primary-more text-white min-w-[320px] px-16 py-4 text-content-mobile lg:text-content-desktop font-medium tracking-wider hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || contactMutation.isPending ? '送出中...' : '送出'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

    </>
  );
};

export default ContactPage;