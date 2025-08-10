import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import contactService from '@/services/contact.service';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  project_interest?: string;
}

const ContactPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>();

  const contactMutation = useMutation({
    mutationFn: contactService.createContact,
    onSuccess: () => {
      toast.success('您的訊息已成功送出，我們會盡快與您聯繫！');
      reset();
    },
    onError: () => {
      toast.error('送出失敗，請稍後再試');
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    await contactMutation.mutateAsync(data);
  };

  const contactInfo = [
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: '公司地址',
      details: ['台北市信義區信義路五段7號', '15樓 A室']
    },
    {
      icon: <PhoneIcon className="h-6 w-6" />,
      title: '聯絡電話',
      details: ['02-8789-9999', '免費專線：0800-123-456']
    },
    {
      icon: <EnvelopeIcon className="h-6 w-6" />,
      title: '電子郵件',
      details: ['info@estatehub.com', 'sales@estatehub.com']
    },
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: '營業時間',
      details: ['週一至週五：09:00 - 18:00', '週六：10:00 - 17:00', '週日及國定假日：預約制']
    }
  ];

  return (
    <>
      <Helmet>
        <title>聯絡我們 - EstateHub</title>
        <meta name="description" content="與 EstateHub 聯繫，了解更多房地產專案資訊或預約賞屋。" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gray-900 py-16 md:py-24">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
            alt="Contact us"
          />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              聯絡我們
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto">
              無論您是想了解專案資訊、預約賞屋，或是有任何合作提案，
              我們的專業團隊都樂意為您服務。
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">聯絡資訊</h2>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                      {item.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">位置地圖</h3>
                <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.7035509686747!2d121.56089021500655!3d25.044299983966966!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442abb6da80a7ad%3A0xacc4d11dc963103!2sTaipei%20101!5e0!3m2!1sen!2stw!4v1647856166200!5m2!1sen!2stw"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">立即聯繫</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: '請輸入姓名' })}
                      className="input-field"
                      placeholder="請輸入您的姓名"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      電子郵件 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email', {
                        required: '請輸入電子郵件',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: '請輸入有效的電子郵件'
                        }
                      })}
                      className="input-field"
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      聯絡電話 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone', { required: '請輸入聯絡電話' })}
                      className="input-field"
                      placeholder="0912-345-678"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      主旨 <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      {...register('subject', { required: '請選擇主旨' })}
                      className="input-field"
                    >
                      <option value="">請選擇主旨</option>
                      <option value="專案諮詢">專案諮詢</option>
                      <option value="預約賞屋">預約賞屋</option>
                      <option value="投資合作">投資合作</option>
                      <option value="媒體採訪">媒體採訪</option>
                      <option value="其他">其他</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="project_interest" className="block text-sm font-medium text-gray-700 mb-1">
                    感興趣的專案 (選填)
                  </label>
                  <input
                    type="text"
                    id="project_interest"
                    {...register('project_interest')}
                    className="input-field"
                    placeholder="例如：天際豪苑"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    訊息內容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    {...register('message', { required: '請輸入訊息內容' })}
                    className="input-field"
                    placeholder="請告訴我們您的需求..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || contactMutation.isPending}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || contactMutation.isPending ? '送出中...' : '送出訊息'}
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  送出表單即表示您同意我們的服務條款與隱私政策
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">常見問題</h2>
            <p className="mt-4 text-lg text-gray-600">以下是客戶最常詢問的問題</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">如何預約賞屋？</h3>
                <p className="text-gray-600">
                  您可以透過上方的聯絡表單選擇「預約賞屋」，或直接撥打我們的服務專線。
                  我們的專員會在 24 小時內與您聯繫，安排最適合的賞屋時間。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">是否提供線上看屋服務？</h3>
                <p className="text-gray-600">
                  是的，我們提供 VR 實景看屋和線上視訊導覽服務。您可以在家中舒適地
                  瀏覽專案，並由專人即時解說。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">投資合作的條件為何？</h3>
                <p className="text-gray-600">
                  我們歡迎各種形式的投資合作。具體條件會根據專案性質和投資規模而定。
                  請透過聯絡表單選擇「投資合作」，我們的商務團隊會與您詳談。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">是否提供貸款諮詢服務？</h3>
                <p className="text-gray-600">
                  是的，我們與多家銀行合作，可以為您提供最優惠的貸款方案諮詢。
                  我們的財務顧問會根據您的需求，量身訂做最適合的財務規劃。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;