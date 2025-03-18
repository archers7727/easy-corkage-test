import React, { useEffect } from 'react';

interface AdSenseProps {
  style?: React.CSSProperties;
  className?: string;
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
}

export function AdSense({ 
  style, 
  className = '', 
  adSlot, 
  adFormat = 'auto',
  responsive = true 
}: AdSenseProps) {
  useEffect(() => {
    try {
      // AdSense 코드가 로드된 후 광고를 표시
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{
        display: 'block',
        textAlign: 'center',
        ...style,
      }}
      data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={responsive}
      data-adtest="on" // 개발 중에는 테스트 모드 활성화
    />
  );
}

// 사용 예시:
// <AdSense
//   adSlot="1234567890"
//   className="my-4"
//   style={{ minHeight: '250px' }}
//   adFormat="rectangle"
// />