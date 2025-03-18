import { supabase, shouldUseMockData } from '../lib/supabase';

/**
 * 이미지를 Supabase Storage에 업로드하고 URL을 반환합니다.
 * @param file 업로드할 파일
 * @param folder 저장할 폴더 경로 (기본값: 'restaurants')
 * @returns 업로드된 이미지의 공개 URL
 */
export const uploadImage = async (file: File, folder: string = 'restaurants'): Promise<string> => {
  try {
    // Mock data 사용 시 가짜 URL 반환
    if (shouldUseMockData()) {
      console.log('Using mock data for image upload');
      return `https://example.com/mock-image-${Date.now()}.jpg`;
    }
    
    // 파일 확장자 검사
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!fileExt || !validExts.includes(fileExt)) {
      throw new Error('지원되지 않는 이미지 형식입니다. (jpg, jpeg, png, gif, webp만 허용)');
    }
    
    // 파일 크기 검사 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('이미지 크기는 10MB 이하여야 합니다.');
    }
    
    // 파일명 생성 (중복 방지를 위해 타임스탬프 추가)
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = `${folder}/${fileName}`;
    
    console.log('Uploading file:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      filePath
    });
    
    // Supabase Storage에 업로드
    const { data, error } = await supabase
      .storage
      .from('easycorkage-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    console.log('Upload response:', { data, error });
    
    if (error) {
      console.error('업로드 에러:', error);
      throw error;
    }
    
    // 공개 URL 생성
    const { data: urlData } = supabase
      .storage
      .from('easycorkage-images')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('이미지 업로드 에러:', error);
    throw error;
  }
};

/**
 * 다중 이미지를 Supabase Storage에 업로드합니다.
 * @param files 업로드할 파일 배열
 * @param folder 저장할 폴더 경로
 * @returns 업로드된 이미지 URL 배열
 */
export const uploadMultipleImages = async (files: File[], folder: string = 'restaurants'): Promise<string[]> => {
  try {
    const uploadPromises = Array.from(files).map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('다중 이미지 업로드 에러:', error);
    throw error;
  }
};

/**
 * Storage에서 이미지를 삭제합니다.
 * @param url 삭제할 이미지 URL
 * @returns 성공 여부
 */
export const deleteImage = async (url: string): Promise<boolean> => {
  try {
    // Mock data 사용 시 성공으로 처리
    if (shouldUseMockData()) {
      console.log('Using mock data for image deletion:', url);
      return true;
    }
    
    // URL에서 파일 경로 추출
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const filePath = pathSegments.slice(pathSegments.indexOf('object') + 2).join('/');
    
    console.log('Deleting file:', filePath);
    
    const { error } = await supabase
      .storage
      .from('easycorkage-images')
      .remove([filePath]);
    
    if (error) {
      console.error('이미지 삭제 에러:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('이미지 삭제 에러:', error);
    return false;
  }
};