import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // 네이버 지도 API 프록시 설정
        '/api/proxy/naver-map': {
          target: 'https://openapi.naver.com',
          changeOrigin: true,
          rewrite: (path) => {
            // 요청 경로에서 placeId 파라미터 추출
            const placeId = path.split('?placeId=')[1];
            // 네이버 검색 API로 리다이렉트
            return `/v1/search/local.json?query=id:${placeId}&display=1`;
          },
          configure: (proxy, options) => {
            // API 요청에 네이버 API 키 추가
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.setHeader('X-Naver-Client-Id', env.VITE_NAVER_CLIENT_ID);
              proxyReq.setHeader('X-Naver-Client-Secret', env.VITE_NAVER_CLIENT_SECRET);
            });
          },
        },
      },
    },
  };
});