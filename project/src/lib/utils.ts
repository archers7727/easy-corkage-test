import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomNickname(): string {
  const adjectives = ['Happy', 'Lucky', 'Sunny', 'Clever', 'Bright', 'Swift'];
  const nouns = ['Wine', 'Cork', 'Glass', 'Bottle', 'Grape', 'Cellar'];
  const number = Math.floor(Math.random() * 1000);
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective}${randomNoun}${number}`;
}

// 좌표 캐시 (동일한 URL에 대한 반복 파싱 방지)
const coordinatesCache: Record<string, { lat: number; lng: number }> = {};

/**
 * 네이버 지도 URL에서 좌표를 추출하는 함수
 * @param url 네이버 지도 URL 또는 단축 URL
 */
export async function extractNaverMapCoordinates(url: string): Promise<{ lat: number; lng: number }> {
  try {
    console.log('URL 파싱 시작:', url);
    
    // URL이 없는 경우 기본 좌표 반환
    if (!url) {
      console.warn('URL이 없음');
      return { lat: 37.5665, lng: 126.9780 };
    }

    // 1. 네이버 단축 URL(naver.me) 확인
    if (url.includes('naver.me')) {
      console.log('네이버 단축 URL 감지됨');
      // 단축 URL은 리다이렉트를 따라가야 하지만, 
      // 프론트엔드에서는 CORS 제한으로 인해 어렵습니다.
      // 따라서 이 경우 기본 좌표를 반환하고, DB에 저장된 좌표를 사용하도록 합니다.
      console.warn('단축 URL 리다이렉트 처리 불가, DB 좌표 사용 권장');
      return { lat: 37.5665, lng: 126.9780 };
    }
    
    // 2. 일반 네이버 지도 URL 처리
    if (url.includes('map.naver.com') || url.includes('place.naver.com')) {
      // URL에서 직접 좌표 추출 시도
      const extractedCoordinates = extractCoordinatesFromUrl(url);
      
      if (extractedCoordinates) {
        console.log('URL에서 좌표 추출 성공:', extractedCoordinates);
        return extractedCoordinates;
      }

      // Place ID 추출 시도 
      const placeId = extractPlaceId(url);
      
      if (placeId) {
        console.log('Place ID 발견:', placeId);
        // 실제 구현에서는 API 호출 필요
        // 현재는 좌표 데이터가 이미 DB에 있으므로 기본값 반환
      }
    }

    // 모든 시도가 실패하면 기본 좌표 반환
    console.log('좌표 추출 실패, 기본 좌표 반환');
    return { lat: 37.5665, lng: 126.9780 };
  } catch (error) {
    console.error('지도 좌표 추출 오류:', error);
    return { lat: 37.5665, lng: 126.9780 };
  }
}

/**
 * URL에서 직접 좌표 추출
 */
function extractCoordinatesFromUrl(url: string): { lat: number; lng: number } | null {
  try {
    // URL 객체 생성 시도
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      console.log('URL 파싱 실패, 정규식으로 시도');
      // URL이 잘못된 형식인 경우 정규식으로 시도
    }

    let lat = 0, lng = 0;
    
    // 1. URL 객체가 생성된 경우 파라미터 확인
    if (urlObj) {
      const searchParams = new URLSearchParams(urlObj.search);
      
      // 다양한 파라미터 이름 확인
      lat = parseFloat(searchParams.get('lat') || searchParams.get('latitude') || searchParams.get('y') || '0');
      lng = parseFloat(searchParams.get('lng') || searchParams.get('longitude') || searchParams.get('x') || '0');

      // URL 해시에서 좌표 추출 (예: #param@37.123,127.123)
      if ((!lat || !lng) && urlObj.hash) {
        console.log('해시에서 좌표 추출 시도:', urlObj.hash);
        const hashMatch = urlObj.hash.match(/(\d+\.?\d*),(\d+\.?\d*)/);
        if (hashMatch) {
          lat = parseFloat(hashMatch[1]);
          lng = parseFloat(hashMatch[2]);
          console.log('해시에서 좌표 발견:', lat, lng);
        }
      }
    }

    // 2. URL 경로에서 좌표 추출 (예: /map/37.123,127.123)
    if (!lat || !lng) {
      console.log('URL 경로에서 좌표 추출 시도');
      const pathMatch = url.match(/map[\/=](\d+\.?\d*),(\d+\.?\d*)/);
      if (pathMatch) {
        lat = parseFloat(pathMatch[1]);
        lng = parseFloat(pathMatch[2]);
        console.log('URL 경로에서 좌표 발견:', lat, lng);
      }
    }

    // 3. @로 구분된 좌표 (예: @37.123,127.123)
    if (!lat || !lng) {
      console.log('@로 구분된 좌표 추출 시도');
      const atMatch = url.match(/@(\d+\.?\d*),(\d+\.?\d*)/);
      if (atMatch) {
        lat = parseFloat(atMatch[1]);
        lng = parseFloat(atMatch[2]);
        console.log('@로 구분된 좌표 발견:', lat, lng);
      }
    }
    
    // 4. 마지막 시도: 숫자 두 쌍 찾기
    if (!lat || !lng) {
      console.log('숫자 쌍 찾기 시도');
      const numberPairMatch = url.match(/(\d+\.\d+)[^0-9]+(\d+\.\d+)/);
      if (numberPairMatch) {
        // 한국 영역 내에 있는지 확인
        const num1 = parseFloat(numberPairMatch[1]);
        const num2 = parseFloat(numberPairMatch[2]);
        
        // 어느 쪽이 위도/경도인지 추정
        if (num1 >= 33 && num1 <= 39) {
          lat = num1;
          lng = num2;
        } else if (num2 >= 33 && num2 <= 39) {
          lat = num2;
          lng = num1;
        }
        
        console.log('숫자 쌍에서 좌표 추정:', lat, lng);
      }
    }

    // 좌표 유효성 검사 (한국 영역 내 좌표인지)
    if (lat && lng && 
        lat >= 33 && lat <= 39 && 
        lng >= 124 && lng <= 132) {
      return { lat, lng };
    }

    return null;
  } catch (error) {
    console.error('URL 파싱 오류:', error);
    return null;
  }
}

/**
 * 네이버 지도 URL에서 Place ID 추출
 */
function extractPlaceId(url: string): string | null {
  try {
    // 다양한 URL 형식에서 Place ID 추출 시도
    const patterns = [
      /place\/(\d+)/,           // 일반 형식: place/1234567
      /entry\/place\/(\d+)/,    // 엔트리 형식: entry/place/1234567
      /eqpVu\/place\/(\d+)/,    // 모바일 형식: eqpVu/place/1234567
      /(?:place|entry)\/(\d+)/, // 그 외 가능한 형식
      /id=(\d+)/,               // 쿼리 파라미터 형식: id=1234567
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Place ID 추출 오류:', error);
    return null;
  }
}