import React from 'react';
import { Helmet } from 'react-helmet-async';
import { LinkedinIcon, MailIcon } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: string;
  image: string;
  bio: string;
  linkedin?: string;
  email?: string;
}

const TeamPage: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: '王大明',
      position: '執行長',
      department: '管理團隊',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      bio: '擁有超過 20 年的房地產開發經驗，致力於打造創新且永續的建築專案。',
      linkedin: '#',
      email: 'ceo@ZeYang.com'
    },
    {
      id: 2,
      name: '李美玲',
      position: '營運總監',
      department: '管理團隊',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      bio: '專精於專案管理與營運優化，確保每個專案都能準時且高品質地完成。',
      linkedin: '#',
      email: 'coo@ZeYang.com'
    },
    {
      id: 3,
      name: '張建國',
      position: '首席建築師',
      department: '設計團隊',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      bio: '國際知名建築師，曾獲得多項建築設計大獎，擅長結合美學與功能性。',
      linkedin: '#'
    },
    {
      id: 4,
      name: '陳雅婷',
      position: '行銷總監',
      department: '行銷團隊',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      bio: '深耕房地產行銷領域 15 年，精通數位行銷與品牌策略規劃。',
      email: 'marketing@ZeYang.com'
    },
    {
      id: 5,
      name: '林志偉',
      position: '工程總監',
      department: '工程團隊',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      bio: '土木工程博士，專注於綠建築技術與智慧建築系統的應用。',
      linkedin: '#'
    },
    {
      id: 6,
      name: '黃淑芬',
      position: '財務總監',
      department: '財務團隊',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80',
      bio: '資深財務專家，確保公司財務健康並為投資者創造最大價值。',
      email: 'cfo@ZeYang.com'
    }
  ];

  const departments = ['全部', '管理團隊', '設計團隊', '行銷團隊', '工程團隊', '財務團隊'];
  const [selectedDepartment, setSelectedDepartment] = React.useState('全部');

  const filteredMembers = selectedDepartment === '全部' 
    ? teamMembers 
    : teamMembers.filter(member => member.department === selectedDepartment);

  return (
    <>
      <Helmet>
        <title>品牌團隊 - ZeYang</title>
        <meta name="description" content="認識 ZeYang 的專業團隊，了解我們的核心成員和專業背景。" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gray-900 py-16 md:py-24">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Team collaboration"
          />
        </div>
        <div className="relative container mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              品牌團隊
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto">
              ZeYang 擁有業界最優秀的專業團隊，結合豐富經驗與創新思維，
              為客戶打造最理想的房地產專案。
            </p>
          </div>
        </div>
      </section>

      {/* Team Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">專業、熱情、創新</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              我們的團隊由來自不同領域的專業人士組成，包括建築師、工程師、行銷專家、
              財務顧問等。每位成員都擁有豐富的產業經驗和專業知識，共同為打造卓越的
              房地產專案而努力。
            </p>
          </div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-primary-600 font-medium">{member.position}</p>
                  <p className="text-sm text-gray-500 mb-4">{member.department}</p>
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  <div className="flex gap-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        aria-label={`${member.name} LinkedIn`}
                      >
                        <LinkedinIcon className="h-5 w-5" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        aria-label={`Email ${member.name}`}
                      >
                        <MailIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            加入我們的團隊
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            如果您對房地產充滿熱情，歡迎加入 ZeYang，與我們一起創造更美好的未來
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
          >
            查看職缺
          </a>
        </div>
      </section>
    </>
  );
};

export default TeamPage;