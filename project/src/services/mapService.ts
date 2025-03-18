import { supabase } from '../lib/supabase';

type NaverMapCoordinates = {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
};

/**
 * 네이버 지도 좌표 서비스
 * - Place ID로부터 좌표 정보를 가져옵니다
 * - 네이버 API 키는 .env에 보관
 */
class MapService {
  private readonly NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
  private readonly NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET;
  
  // 좌표 캐시 (동일한 API 호출 방지)
  private coordinatesCache: Record<string, NaverMapCoordinates> = {};

  /**
   * Place ID로부터 좌표 조회 (네이버 지도 API 사용)
   * @param placeId 네이버 지도 Place ID
   */
  async getCoordinatesByPlaceId(placeId: string): Promise<NaverMapCoordinates> {
    // 캐시 확인
    const cacheKey = `place_${placeId}`;
    if (this.coordinatesCache[cacheKey]) {
      return this.coordinatesCache[cacheKey];
    }

    try {
      // 구성된 API 키가 없는 경우 기본 좌표 반환
      if (!this.NAVER_CLIENT_ID || !this.NAVER_CLIENT_SECRET) {
        console.warn('네이버 지도 API 키가 구성되지 않았습니다.');
        return { lat: 37.5665, lng: 126.9780 };
      }

      // Supabase 함수를 통해 호출 (보안 강화)
      // 이 부분은 Supabase Functions이 설정되어 있다면 사용할 수 있습니다
      if (false) { // Functions이 설정되어 있다면 이 조건을 true로 변경
        try {
          const { data, error } = await supabase.functions.invoke('naver-map-coordinates', {
            body: { placeId }
          });

          if (error) throw error;
          if (data && data.lat && data.lng) {
            // 캐시에 저장
            this.coordinatesCache[cacheKey] = data;
            return data;
          }
        } catch (err) {
          console.error('Supabase Function 호출 실패:', err);
          // 프록시 서버로 폴백
        }
      }

      // 프록시 서버를 통한 API 호출 (API 키 보호)
      // 참고: 실제 배포 시에는 이 방법보다 서버리스 함수 사용을 권장
      const proxyUrl = `/api/proxy/naver-map?placeId=${placeId}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.lat && data.lng) {
        // 캐시에 저장
        this.coordinatesCache[cacheKey] = data;
        return data;
      }
      
      throw new Error('유효한 좌표 데이터를 받지 못했습니다');
    } catch (error) {
      console.error('네이버 지도 API 오류:', error);
      
      // 오류 발생 시 서울 좌표 반환
      return { lat: 37.5665, lng: 126.9780 };
    }
  }

  /**
   * 네이버 지도 URL에서 Place ID 추출
   * @param url 네이버 지도 URL
   */
  extractPlaceId(url: string): string | null {
    // 다양한 URL 형식에서 Place ID 추출 시도
    const patterns = [
      /place\/(\d+)/,           // 일반 형식: place/1234567
      /entry\/place\/(\d+)/,    // 엔트리 형식: entry/place/1234567
      /eqpVu\/place\/(\d+)/,    // 모바일 형식: eqpVu/place/1234567
      /(?:place|entry)\/(\d+)/, // 그 외 가능한 형식
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * 네이버 지도 URL에서 직접 좌표 추출 시도
   * @param url 네이버 지도 URL
   */
  extractCoordinatesFromUrl(url: string): NaverMapCoordinates | null {
    try {
      // 유효한 URL 확인
      if (!url.includes('map.naver.com')) {
        return null;
      }

      // 캐시 확인
      if (this.coordinatesCache[url]) {
        return this.coordinatesCache[url];
      }

      // URL 파싱을 위한 URL 객체 생성
      const urlObj = new URL(url);
      const searchParams = new URLSearchParams(urlObj.search);
      
      // 다양한 파라미터 이름 확인
      let lat = parseFloat(searchParams.get('lat') || searchParams.get('latitude') || searchParams.get('y') || '0');
      let lng = parseFloat(searchParams.get('lng') || searchParams.get('longitude') || searchParams.get('x') || '0');

      // 해시 프래그먼트에서 좌표 추출 (예: #param@37.123,127.123)
      if ((!lat || !lng) && urlObj.hash) {
        const hashMatch = urlObj.hash.match(/(\d+\.?\d*),(\d+\.?\d*)/);
        if (hashMatch) {
          lat = parseFloat(hashMatch[1]);
          lng = parseFloat(hashMatch[2]);
        }
      }

      // URL 경로에서 좌표 추출 (예: /map/37.123,127.123)
      const pathMatch = url.match(/map[\/=](\d+\.?\d*),(\d+\.?\d*)/);
      if (pathMatch) {
        lat = parseFloat(pathMatch[1]);
        lng = parseFloat(pathMatch[2]);
      }

      // @로 구분된 좌표 (예: @37.123,127.123)
      const atMatch = url.match(/@(\d+\.?\d*),(\d+\.?\d*)/);
      if (atMatch) {
        lat = parseFloat(atMatch[1]);
        lng = parseFloat(atMatch[2]);
      }

      // 좌표 유효성 검사 (한국 영역 내 좌표인지)
      if (lat && lng && 
          lat >= 33 && lat <= 39 && 
          lng >= 124 && lng <= 132) {
        
        const result = { lat, lng };
        // 캐시에 저장
        this.coordinatesCache[url] = result;
        return result;
      }

      return null;
    } catch (error) {
      console.error('URL 파싱 오류:', error);
      return null;
    }
  }
  async extractMapCoordinates(url: string): Promise<NaverMapCoordinates> {
    try {
      // 1. 먼저 직접 URL에서 좌표 추출 시도
      const directCoords = this.extractCoordinatesFromUrl(url);
      if (directCoords) {
        console.log('URL에서 직접 좌표 추출 성공:', directCoords);
        return directCoords;
      }

      // 2. Place ID 추출 시도
      const placeId = this.extractPlaceId(url);
      if (placeId) {
        console.log('Place ID 추출 성공:', placeId);
        // Place ID로 좌표 조회
        return await this.getCoordinatesByPlaceId(placeId);
      }

      // 3. 모든 방법 실패 시 기본 좌표 반환
      console.warn('좌표 추출 실패, 기본 좌표 사용');
      return { lat: 37.5665, lng: 126.9780 };
    } catch (error) {
      console.error('좌표 추출 오류:', error);
      return { lat: 37.5665, lng: 126.9780 };
    }
  }
}

export const mapService = new MapService();