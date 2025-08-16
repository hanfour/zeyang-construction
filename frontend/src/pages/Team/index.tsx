import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import PageBanner from '@/components/Layout/PageBanner';
import MenuButton from '@/components/Layout/MenuButton';
import NavigationMenu from '@/components/Layout/NavigationMenu';
import TeamMember from '@/components/Team/TeamMember';


const TeamPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleMembers, setVisibleMembers] = useState<Set<number>>(new Set());
  const [animationTriggered, setAnimationTriggered] = useState(false);
  const memberRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // 備用滾動觸發器 - 當滾動到團隊區域時
      if (sectionRef.current) {
        const sectionTop = sectionRef.current.offsetTop;
        const windowHeight = window.innerHeight;
        const scrollPosition = window.scrollY + windowHeight;
        
        if (scrollPosition > sectionTop + 200 && !animationTriggered) {
          setAnimationTriggered(true);
          // 觸發所有團隊成員動畫 (4個團隊成員)
          for (let index = 0; index < 4; index++) {
            setTimeout(() => {
              setVisibleMembers(prev => new Set([...prev, index]));
            }, index * 200);
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setTimeout(() => {
              setVisibleMembers(prev => new Set([...prev, index]));
            }, index * 200);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // 延遲觀察器的設置，確保組件完全渲染
    const timeoutId = setTimeout(() => {
      const currentRefs = memberRefs.current;
      currentRefs.forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const currentRefs = memberRefs.current;
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
      observer.disconnect();
    };
  }, []);

  // 初始檢查 - 頁面載入時如果團隊區域已經可見
  useEffect(() => {
    const checkInitialVisibility = () => {
      if (sectionRef.current && !animationTriggered) {
        const sectionTop = sectionRef.current.offsetTop;
        const windowHeight = window.innerHeight;
        const scrollPosition = window.scrollY + windowHeight;
        
        if (scrollPosition > sectionTop + 200) {
          setAnimationTriggered(true);
          for (let index = 0; index < 4; index++) {
            setTimeout(() => {
              setVisibleMembers(prev => new Set([...prev, index]));
            }, index * 200);
          }
        }
      }
    };

    const timeoutId = setTimeout(checkInitialVisibility, 300);
    return () => clearTimeout(timeoutId);
  }, [animationTriggered]);

  const BANNER_HEIGHT = 288;

  const bannerConfig = {
    logoSection: {
      iconSrc: "/images/logo-icon-brand.svg",
      iconAlt: "澤暘建設",
      subtitle: "PARTNER WITH US",
      title: "澤暘團隊"
    },
    centralContent: {
      text: "找對的人，做對的事，澤暘攜手各界創藝大師，共築城市新貌\n演繹建築與生活的高端品味"
    },
    backgroundImage: "/images/team/top-bn-partner.png"
  };

  const teamMembers = [
    {
      logoSrc: "/images/team/logo-pga.png",
      logoAlt: "PGA 周簡建築師事務所",
      title: "PGA 周簡建築師事務所",
      description: "由周夢龍、簡志聰、柯智明三位建築師聯合創辦，始終致力於以前瞻眼光與多元觀點，重新詮釋建築的無限可能。",
      category: "建築規劃"
    },
    {
      logoSrc: "/images/team/logo-obyashi.png",
      logoAlt: "台灣大林組營造",
      title: "台灣大林組營造",
      description: "擁有逾130年歷史的日本建設龍頭，以職人工藝精神，精鑄無數世界地標，實績涵蓋：頂級酒店、超高層地標與高端住宅。",
      category: "營造顧問"
    },
    {
      logoSrc: "/images/team/logo-h.png",
      logoAlt: "豐立工程營造",
      title: "豐立工程營造",
      description: "秉持安全、經濟及施工性均衡兼顧的設計理念，靈活因應現場施工狀況，並運用最先進的技術提出最佳解方。",
      category: "結構設計"
    },
    {
      logoSrc: "/images/team/logo-sinyi.png",
      logoAlt: "信義代銷",
      title: "信義代銷",
      description: "跨界整合信義房屋集團之實體通路、網路行銷等資源，專精企劃、行銷及產品規劃等領域，搭配龐大的集團客戶數，提供C2B精準產品定位。",
      category: "廣告行銷"
    }
  ];

  return (
    <>
      <Helmet>
        <title>澤暘團隊 - 澤暘建設</title>
        <meta name="description" content="找對的人，做對的事，澤暘攜手各界創藝大師，共築城市新貌，演繹建築與生活的高端品味" />
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

      {/* Team Partners Section */}
      <section ref={sectionRef} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              ref={(el) => (memberRefs.current[index] = el)}
              data-index={index}
              className={`transform transition-all duration-1000 ease-out ${
                visibleMembers.has(index)
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-full opacity-0'
              }`}
              style={{
                transitionDelay: '0ms'
              }}
            >
              <TeamMember
                logoSrc={member.logoSrc}
                logoAlt={member.logoAlt}
                title={member.title}
                description={member.description}
                category={member.category}
                isLast={index === teamMembers.length - 1}
              />
            </div>
          ))}
        </div>
      </section>

    </>
  );
};

export default TeamPage;