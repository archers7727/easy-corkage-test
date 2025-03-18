import React, { useEffect, useRef, useState } from 'react';

interface NaverMapProps {
  lat: number;
  lng: number;
  name: string;
  onMapClick?: (e: any) => void;
}

declare global {
  interface Window {
    naver: any;
  }
}

export function NaverMap({ lat, lng, name, onMapClick }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const infoWindowInstance = useRef<any>(null);
  const eventListeners = useRef<any[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = () => {
      if (!mapRef.current || !window.naver || !isMounted) return;

      try {
        // 좌표 유효성 검사를 더 정확하게 수행
        const validLat = isValidLatitude(lat) ? lat : 37.5665;
        const validLng = isValidLongitude(lng) ? lng : 126.9780;

        // 기본 좌표를 사용하는 경우 경고 표시
        if (validLat !== lat || validLng !== lng) {
          console.warn(`Using default coordinates: Original (${lat}, ${lng}) -> Valid (${validLat}, ${validLng})`);
          setMapError('유효하지 않은 좌표가 감지되어 기본 위치(서울)를 표시합니다.');
        }

        const location = new window.naver.maps.LatLng(validLat, validLng);
        const mapOptions = {
          center: location,
          zoom: 17,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT
          }
        };

        // 지도 생성
        const map = new window.naver.maps.Map(mapRef.current, mapOptions);
        mapInstance.current = map;

        // 마커 생성
        const marker = new window.naver.maps.Marker({
          position: location,
          map: map,
          title: name,
          animation: window.naver.maps.Animation.DROP // 드롭 애니메이션 추가
        });
        markerInstance.current = marker;

        // 인포윈도우 생성 및 개선
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px; text-align: center;">
              <strong style="display: block; margin-bottom: 5px; font-size: 14px;">${name}</strong>
              <a href="https://map.naver.com/v5/search/${encodeURIComponent(name)}" 
                 target="_blank" 
                 style="color: #00a000; font-size: 12px; text-decoration: none;"
              >
                네이버 지도에서 보기 ↗
              </a>
            </div>
          `,
          borderWidth: 0,
          borderColor: "#00a000",
          anchorSize: new window.naver.maps.Size(10, 10),
          pixelOffset: new window.naver.maps.Point(0, -5)
        });
        infoWindowInstance.current = infoWindow;

        // 이벤트 리스너 등록
        if (window.naver && window.naver.maps && window.naver.maps.Event) {
          // 마커 클릭 이벤트
          const clickListener = window.naver.maps.Event.addListener(marker, 'click', () => {
            if (infoWindow.getMap()) {
              infoWindow.close();
            } else {
              infoWindow.open(map, marker);
            }
          });
          eventListeners.current.push(clickListener);

          // 지도 로드 완료 이벤트
          const idleListener = window.naver.maps.Event.addListener(map, 'idle', () => {
            // 지도가 로드되면 인포윈도우 잠시 표시 후 자동 닫기
            infoWindow.open(map, marker);
            setTimeout(() => {
              if (infoWindow.getMap() && isMounted) {
                infoWindow.close();
              }
            }, 3000);
          });
          eventListeners.current.push(idleListener);

          // 지도 클릭 이벤트
          if (onMapClick) {
            const mapClickListener = window.naver.maps.Event.addListener(map, 'click', onMapClick);
            eventListeners.current.push(mapClickListener);
          }
        }
      } catch (error) {
        console.error('Error initializing Naver Map:', error);
        setMapError('지도를 로드하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    };

    // 네이버 지도가 로드되었는지 확인
    if (window.naver && window.naver.maps) {
      initializeMap();
    } else {
      // 네이버 지도가 로드될 때까지 대기
      const checkNaverMaps = setInterval(() => {
        if (window.naver && window.naver.maps) {
          clearInterval(checkNaverMaps);
          initializeMap();
        }
      }, 100);

      // 일정 시간(10초) 후에도 로드되지 않으면 에러 표시
      const timeoutId = setTimeout(() => {
        clearInterval(checkNaverMaps);
        if (isMounted && !window.naver?.maps) {
          setMapError('네이버 지도를 불러올 수 없습니다. 인터넷 연결을 확인해주세요.');
        }
      }, 10000);

      return () => {
        clearInterval(checkNaverMaps);
        clearTimeout(timeoutId);
      };
    }

    // 정리 함수
    return () => {
      isMounted = false;

      // 이벤트 리스너 제거
      if (window.naver && window.naver.maps && window.naver.maps.Event) {
        eventListeners.current.forEach(listener => {
          try {
            window.naver.maps.Event.removeListener(listener);
          } catch (e) {
            console.log('Error removing event listener:', e);
          }
        });
      }

      // 인포윈도우 안전하게 닫기
      if (infoWindowInstance.current) {
        try {
          if (infoWindowInstance.current.getMap()) {
            infoWindowInstance.current.close();
          }
        } catch (e) {
          console.log('Error closing info window:', e);
        }
        infoWindowInstance.current = null;
      }

      // 마커 안전하게 제거
      if (markerInstance.current) {
        try {
          markerInstance.current.setMap(null);
        } catch (e) {
          console.log('Error removing marker:', e);
        }
        markerInstance.current = null;
      }

      // 지도 안전하게 제거
      if (mapInstance.current) {
        try {
          mapInstance.current.destroy();
        } catch (e) {
          console.log('Error destroying map:', e);
        }
        mapInstance.current = null;
      }

      // 참조 초기화
      eventListeners.current = [];
    };
  }, [lat, lng, name, onMapClick]);

  // 위도 유효성 검사 함수
  const isValidLatitude = (lat: number): boolean => {
    return typeof lat === 'number' && !isNaN(lat) && lat >= 33 && lat <= 39;
  };

  // 경도 유효성 검사 함수
  const isValidLongitude = (lng: number): boolean => {
    return typeof lng === 'number' && !isNaN(lng) && lng >= 124 && lng <= 132;
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* 에러 메시지 표시 */}
      {mapError && (
        <div className="absolute top-2 left-0 right-0 mx-auto w-max bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm shadow-md">
          {mapError}
        </div>
      )}
    </div>
  );
}