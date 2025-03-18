import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine } from 'lucide-react';

export function AuthPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Wine className="w-12 h-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          서비스 준비 중
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          로그인 서비스는 곧 제공될 예정입니다
        </p>
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}