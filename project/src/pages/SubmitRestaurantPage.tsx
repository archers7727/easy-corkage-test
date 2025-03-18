import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Wine, MapPin, Phone, Globe, Clock, Camera, X, Plus, Link } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useRestaurantsStore } from '../store/restaurants';
import { useHashtagStore } from '../store/hashtags';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SuccessModal } from '../components/ui/SuccessModal';
import { regions } from '../data/regions';
import { mapService } from '../services/mapService';

interface SubmitRestaurantForm {
  name: string;
  location1: string;
  location2: string;
  address: string;
  map_url: string;
  lat: number;
  lng: number;
  corkage_type: 'free' | 'paid';
  corkage_fee: number;
  corkage_info: string;
  description?: string;
  phone?: string;
  website?: string;
  business_hours?: string;
  hashtags: string[];
  images: string[];
  thumbnail: string;
}

export function SubmitRestaurantPage() {
  const navigate = useNavigate();
  //const { user } = useAuthStore();
  const { signInWithAdmin } = useAuthStore();
  const { addSubmission, uploadImage } = useRestaurantsStore();
  const { hashtags, restaurantHashtags, loading: hashtagsLoading } = useHashtagStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [searchTag, setSearchTag] = useState('');
  const [mapUrlError, setMapUrlError] = useState<string | null>(null);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SubmitRestaurantForm>({
    defaultValues: {
      location1: '서울',
      location2: '강남구',
      corkage_type: 'paid',
      corkage_fee: 30000,
      hashtags: [],
      images: [],
      lat: 37.5665,
      lng: 126.9780
    }
  });

  const selectedRegion = watch('location1');
  const districts = regions[selectedRegion as keyof typeof regions] || [];
  const corkageType = watch('corkage_type');
  const selectedHashtags = watch('hashtags');
  const mapUrl = watch('map_url');

  // 지도 URL 처리 기능
useEffect(() => {
  if (!mapUrl) return;
  
  const processMapUrl = async () => {
    try {
      setMapUrlError(null);
      
      // 통합 함수 사용
      const coords = await mapService.extractMapCoordinates(mapUrl);
      
      setValue('lat', coords.lat);
      setValue('lng', coords.lng);
      
      // 로그에 좌표 출력
      console.log('추출된 좌표:', coords);
    } catch (err) {
      console.error('지도 URL 처리 오류:', err);
      setValue('lat', 37.5665);
      setValue('lng', 126.9780);
      setMapUrlError('지도 URL 처리 중 오류가 발생했습니다. 기본 좌표를 사용합니다.');
    }
  };
  
  processMapUrl();
}, [mapUrl, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isThumb: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      setError(null);

      const file = files[0];
      const imageUrl = await uploadImage(file);

      if (isThumb) {
        setThumbnailUrl(imageUrl);
        setValue('thumbnail', imageUrl);
      } else {
        const newImages = [...additionalImages, imageUrl];
        setAdditionalImages(newImages);
        setValue('images', newImages);
      }
    } catch (err) {
      setError('이미지 업로드에 실패했습니다.');
      console.error('Image upload error:', err);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);
    setValue('images', newImages);
  };

  const handleHashtagToggle = (tag: string) => {
    const currentTags = watch('hashtags');
    if (currentTags.includes(tag)) {
      setValue('hashtags', currentTags.filter(t => t !== tag));
    } else if (currentTags.length < 5) {
      setValue('hashtags', [...currentTags, tag]);
    }
  };

 const onSubmit = async (data: SubmitRestaurantForm) => {
  try {
    setLoading(true);
    setError(null);

    if (!thumbnailUrl) {
      setError('대표 이미지를 업로드해주세요.');
      setLoading(false);
      return;
    }

    // corkage_type에 따라 corkage_fee 자동 조정
    let corkageFee = data.corkage_fee;
    if (data.corkage_type === 'free') {
      corkageFee = 0; // 무료면 요금은 0원으로 설정
    }

    await addSubmission({
      name: data.name,
      location1: data.location1,
      location2: data.location2,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      corkage_type: data.corkage_type,
      corkage_fee: corkageFee, // 수정된 요금 사용
      corkage_info: data.corkage_info,
      description: data.description || '',
      phone: data.phone || '',
      website: data.website || '',
      business_hours: data.business_hours || '',
      hashtags: data.hashtags,
      images: data.images,
      thumbnail: data.thumbnail,
      status: 'pending'
    });

    setShowSuccessModal(true);
  } catch (err) {
    setError(err instanceof Error ? err.message : '레스토랑 등록 중 오류가 발생했습니다.');
    console.error('Submit error:', err);
  } finally {
    setLoading(false);
  }
};

   // 관리자 로그인 처리 함수
  const handleLogoClick = () => {
    const now = Date.now();
    
    // 클릭 시간 간격이 2초 이상이면 카운트 리셋
    if (now - lastClickTime > 2000) {
      setLogoClickCount(1);
    } else {
      setLogoClickCount(prevCount => prevCount + 1);
    }
    
    setLastClickTime(now);
    
    // 10번 클릭 시 관리자 로그인 비밀번호 입력 프롬프트 표시
    if (logoClickCount + 1 === 10) {
      const password = prompt('관리자 비밀번호를 입력하세요:');
      if (password === 'admin11') {
        signInWithAdmin().then(() => {
          alert('관리자로 로그인되었습니다!');
          navigate('/admin/restaurants');
        });
      }
      setLogoClickCount(0);
    }
  };



  
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Wine className="h-6 w-6 text-primary-600 mr-2 cursor-pointer" onClick={handleLogoClick}/>
            <h1 className="text-2xl font-bold text-gray-900">레스토랑 등록 신청</h1>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    레스토랑 이름 *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: '레스토랑 이름을 입력해주세요' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      지역 *
                    </label>
                    <select
                      {...register('location1', { required: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      {Object.keys(regions).map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      상세 지역 *
                    </label>
                    <select
                      {...register('location2', { required: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      {districts.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    주소 *
                  </label>
                  <input
                    type="text"
                    {...register('address', { required: '주소를 입력해주세요' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="상세 주소를 입력해주세요"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    네이버 지도 URL *
                  </label>
                  <input
                    type="text"
                    {...register('map_url', { required: '네이버 지도 URL을 입력해주세요' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="네이버 지도에서 해당 장소의 URL을 복사해서 붙여넣어주세요"
                  />
                  {mapUrlError && (
                    <p className="mt-1 text-sm text-amber-600">{mapUrlError}</p>
                  )}
                  {errors.map_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.map_url.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 콜키지 정보 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">콜키지 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    콜키지 타입 *
                  </label>
                  <div className="mt-2 space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        {...register('corkage_type')}
                        value="free"
                        className="form-radio text-primary-600"
                      />
                      <span className="ml-2">무료</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        {...register('corkage_type')}
                        value="paid"
                        className="form-radio text-primary-600"
                      />
                      <span className="ml-2">유료</span>
                    </label>
                  </div>
                </div>

                {corkageType === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      콜키지 비용 (원) *
                    </label>
                    <input
                      type="number"
                      {...register('corkage_fee', {
                        required: '콜키지 비용을 입력해주세요',
                        min: { value: 1000, message: '1,000원 이상 입력해주세요' }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    {errors.corkage_fee && (
                      <p className="mt-1 text-sm text-red-600">{errors.corkage_fee.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    콜키지 정책 설명 *
                  </label>
                  <textarea
                    {...register('corkage_info', { required: '콜키지 정책을 입력해주세요' })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="콜키지 정책에 대해 자세히 설명해주세요"
                  />
                  {errors.corkage_info && (
                    <p className="mt-1 text-sm text-red-600">{errors.corkage_info.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">이미지</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표 이미지 *
                  </label>
                  {thumbnailUrl ? (
                    <div className="relative w-40 h-40">
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailUrl('');
                          setValue('thumbnail', '');
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="flex items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 cursor-pointer"
                      >
                        {uploadingImages ? (
                          <LoadingSpinner className="h-8 w-8" />
                        ) : (
                          <Camera className="h-8 w-8 text-gray-400" />
                        )}
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추가 이미지 (최대 5장)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {additionalImages.map((image, index) => (
                      <div key={index} className="relative w-40 h-40">
                        <img
                          src={image}
                          alt={`Additional image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {additionalImages.length < 5 && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="additional-image-upload"
                        />
                        <label
                          htmlFor="additional-image-upload"
                          className="flex items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 cursor-pointer"
                        >
                          {uploadingImages ? (
                            <LoadingSpinner className="h-8 w-8" />
                          ) : (
                            <Plus className="h-8 w-8 text-gray-400" />
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 해시태그 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">해시태그 (최대 5개)</h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {restaurantHashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleHashtagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedHashtags.includes(tag)
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">추가 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    레스토랑 소개
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="레스토랑에 대해 자세히 설명해주세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="02-123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    네이버지도 링크
                  </label>
                  <input
                    type="url"
                    {...register('website')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    영업시간
                  </label>
                  <input
                    type="text"
                    {...register('business_hours')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="평일 11:30-22:00, 주말 12:00-21:00"
                  />
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? (
                  <LoadingSpinner className="h-5 w-5" />
                ) : (
                  '레스토랑 등록 신청하기'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/');
        }}
      />
    </div>
  );
}