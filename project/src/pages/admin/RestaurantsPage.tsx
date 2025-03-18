import React, { useState } from 'react';
import { RestaurantSubmission } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Eye, X, Check, Edit } from 'lucide-react';
import { useRestaurantsStore } from '../../store/restaurants';
import { EditRestaurantModal } from '../../components/admin/EditRestaurantModal';

export function AdminRestaurantsPage() {
  const { submissions, updateSubmission, editSubmission } = useRestaurantsStore();
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<RestaurantSubmission | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<RestaurantSubmission | null>(null);

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      updateSubmission(id, 'approved');
    } catch (error) {
      console.error('Error approving submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      updateSubmission(id, 'rejected');
    } catch (error) {
      console.error('Error rejecting submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (submission: RestaurantSubmission) => {
    setEditingSubmission(submission);
  };

  const handleSaveEdit = (editedSubmission: RestaurantSubmission) => {
    editSubmission(editedSubmission);
    setEditingSubmission(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">레스토랑 관리</h1>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">신규 제출</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.filter(sub => sub.status === 'pending').map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{submission.name}</h3>
                      <p className="text-sm text-gray-500">
                        {submission.location1} {submission.location2}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        콜키지: {submission.corkage_type === 'free' ? '무료' : `${submission.corkage_fee.toLocaleString()}원`}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {submission.hashtags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(submission)}
                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(submission.id)}
                        className="p-2 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(submission.id)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedSubmission.name}</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">위치</h4>
                  <p>{selectedSubmission.location1} {selectedSubmission.location2}</p>
                  <p className="text-sm text-gray-500">{selectedSubmission.address}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">콜키지 정보</h4>
                  <p>{selectedSubmission.corkage_type === 'free' ? '무료' : `${selectedSubmission.corkage_fee.toLocaleString()}원`}</p>
                  <p className="text-sm text-gray-500">{selectedSubmission.corkage_info}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">해시태그</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedSubmission.hashtags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">이미지</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <img
                      src={selectedSubmission.thumbnail}
                      alt="대표 이미지"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    {selectedSubmission.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`추가 이미지 ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    handleReject(selectedSubmission.id);
                    setSelectedSubmission(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  거절
                </button>
                <button
                  onClick={() => {
                    handleEdit(selectedSubmission);
                    setSelectedSubmission(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  수정
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedSubmission.id);
                    setSelectedSubmission(null);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  승인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editingSubmission && (
        <EditRestaurantModal
          submission={editingSubmission}
          onSave={handleSaveEdit}
          onClose={() => setEditingSubmission(null)}
        />
      )}
    </div>
  );
}