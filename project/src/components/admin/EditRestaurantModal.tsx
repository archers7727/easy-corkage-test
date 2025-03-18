import React, { useState } from 'react';
import { X } from 'lucide-react';
import { RestaurantSubmission } from '../../types';
import { regions } from '../../data/regions';
import { useHashtagStore } from '../../store/hashtags';

interface EditRestaurantModalProps {
  submission: RestaurantSubmission;
  onSave: (submission: RestaurantSubmission) => void;
  onClose: () => void;
}

export function EditRestaurantModal({ submission, onSave, onClose }: EditRestaurantModalProps) {
  const [editedSubmission, setEditedSubmission] = useState(submission);
  const { hashtags: availableHashtags } = useHashtagStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedSubmission(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHashtagToggle = (tag: string) => {
    setEditedSubmission(prev => ({
      ...prev,
      hashtags: prev.hashtags.includes(tag)
        ? prev.hashtags.filter(t => t !== tag)
        : [...prev.hashtags, tag]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedSubmission);
  };

  const districts = regions[editedSubmission.location1 as keyof typeof regions] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">레스토랑 정보 수정</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    레스토랑 이름
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editedSubmission.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      지역
                    </label>
                    <select
                      name="location1"
                      value={editedSubmission.location1}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      {Object.keys(regions).map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      상세 지역
                    </label>
                    <select
                      name="location2"
                      value={editedSubmission.location2}
                      onChange={handleChange}
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
                    주소
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={editedSubmission.address}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* 콜키지 정보 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">콜키지 정보</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    콜키지 타입
                  </label>
                  <div className="mt-2 space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="corkage_type"
                        value="free"
                        checked={editedSubmission.corkage_type === 'free'}
                        onChange={handleChange}
                        className="form-radio text-primary-600"
                      />
                      <span className="ml-2">무료</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="corkage_type"
                        value="paid"
                        checked={editedSubmission.corkage_type === 'paid'}
                        onChange={handleChange}
                        className="form-radio text-primary-600"
                      />
                      <span className="ml-2">유료</span>
                    </label>
                  </div>
                </div>

                {editedSubmission.corkage_type === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      콜키지 비용 (원)
                    </label>
                    <input
                      type="number"
                      name="corkage_fee"
                      value={editedSubmission.corkage_fee}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    콜키지 정책 설명
                  </label>
                  <textarea
                    name="corkage_info"
                    value={editedSubmission.corkage_info}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* 해시태그 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">해시태그</h3>
              <div className="flex flex-wrap gap-2">
                {availableHashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleHashtagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      editedSubmission.hashtags.includes(tag)
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 추가 정보 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">추가 정보</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    레스토랑 소개
                  </label>
                  <textarea
                    name="description"
                    value={editedSubmission.description || ''}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedSubmission.phone || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    웹사이트
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={editedSubmission.website || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    영업시간
                  </label>
                  <input
                    type="text"
                    name="business_hours"
                    value={editedSubmission.business_hours || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}