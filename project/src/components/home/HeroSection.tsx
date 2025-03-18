import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { regions } from '../../data/regions';

export function HeroSection() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const navigate = useNavigate();

  const districts = regions[selectedRegion as keyof typeof regions] || [];

  useEffect(() => {
    // When district is selected (and not empty), trigger search
    if (selectedDistrict && selectedRegion) {
      handleSearch();
    }
  }, [selectedDistrict]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedDistrict('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (selectedRegion) {
      params.append('region', selectedRegion);
    }
    
    if (selectedDistrict) {
      params.append('district', selectedDistrict);
    }
    
    navigate(`/restaurants?${params.toString()}`);
  };

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">내가 원하는 술과 함께하는</span>
                <span className="block text-primary-600">특별한 식사</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                내가 고른 주류을 가지고 방문할 수 있는 콜키지 서비스를 제공하는 식당을 찾아보세요. 전국의 다양한 콜키지 식당 정보를 한눈에!
              </p>
              
              <div className="mt-8 sm:mt-12">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <div className="relative">
                      <select
                        value={selectedRegion}
                        onChange={handleRegionChange}
                        className="appearance-none block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="" disabled hidden>시/도</option>
                        {Object.keys(regions).map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="relative">
                      <select
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        className="appearance-none block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={!selectedRegion}
                      >
                        <option value="" disabled hidden>시/군/구</option>
                        {districts.map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    검색하기
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="와인과 음식"
        />
      </div>
    </div>
  );
}