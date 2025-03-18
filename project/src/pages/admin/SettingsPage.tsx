import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Save, AlertCircle } from 'lucide-react';
import debounce from 'lodash/debounce';
import { useHashtagStore } from '../../store/hashtags';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function SettingsPage() {
  const { hashtags, addHashtag, removeHashtag, loading, error } = useHashtagStore();
  const [hashtagInput, setHashtagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count'>('name');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tagToRemove, setTagToRemove] = useState('');

  const filteredAndSortedHashtags = useMemo(() => {
    return hashtags
      .filter(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.localeCompare(b);
        }
        return 0; // 현재는 count 기준 정렬 미구현
      });
  }, [hashtags, searchQuery, sortBy]);

  const handleAddHashtag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hashtagInput.trim()) {
      try {
        const newTag = hashtagInput.trim().toLowerCase();
        await addHashtag(newTag);
        setHashtagInput('');
      } catch (err) {
        console.error('Error adding hashtag:', err);
      }
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setTagToRemove(tag);
    setShowConfirmModal(true);
  };

  const confirmRemoveHashtag = async () => {
    try {
      await removeHashtag(tagToRemove);
      setShowConfirmModal(false);
      setTagToRemove('');
    } catch (err) {
      console.error('Error removing hashtag:', err);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">설정</h1>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">해시태그 관리</h3>
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'count')}
                  className="pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="name">이름순</option>
                  <option value="count">사용 빈도순</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-4">
                <form onSubmit={handleAddHashtag} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    className="flex-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="새 해시태그 입력"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <LoadingSpinner className="h-5 w-5" />
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        추가
                      </>
                    )}
                  </button>
                </form>

                <div className="w-64 relative">
                  <input
                    type="text"
                    placeholder="해시태그 검색"
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                {loading && filteredAndSortedHashtags.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner className="h-8 w-8" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredAndSortedHashtags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center justify-between px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <span className="text-sm font-medium text-gray-900">#{tag}</span>
                        <button
                          onClick={() => handleRemoveHashtag(tag)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {!loading && filteredAndSortedHashtags.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? '검색 결과가 없습니다' : '등록된 해시태그가 없습니다'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">해시태그 삭제</h3>
            <p className="text-gray-600 mb-6">
              <span className="font-medium">#{tagToRemove}</span> 해시태그를 삭제하시겠습니까?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                취소
              </button>
              <button
                onClick={confirmRemoveHashtag}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? <LoadingSpinner className="h-5 w-5" /> : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}