import { pool } from '../src/lib/db.js';
import { restaurants } from '../src/data/restaurants.js';
import { hashtags } from '../src/data/hashtags.js';

// 초기 데이터 삽입
async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 해시태그 삽입
    console.log('해시태그 데이터 삽입 중...');
    for (const tag of hashtags) {
      await client.query(
        'INSERT INTO hashtags (name, count) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [tag, 0]
      );
    }
    
    // 레스토랑 삽입
    console.log('레스토랑 데이터 삽입 중...');
    for (const restaurant of restaurants) {
      const result = await client.query(
        `INSERT INTO restaurants (
          name, thumbnail, location1, location2, address, 
          map_lat, map_lng, corkage_type, corkage_fee, corkage_info,
          description, phone, website, business_hours, hashtags,
          images, view_count, weekly_view_count, featured, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (id) DO NOTHING
        RETURNING id`,
        [
          restaurant.name,
          restaurant.thumbnail,
          restaurant.location1,
          restaurant.location2,
          restaurant.address || '',
          restaurant.map_info.lat,
          restaurant.map_info.lng,
          restaurant.corkage_type,
          restaurant.corkage_fee,
          restaurant.corkage_info,
          restaurant.description || '',
          restaurant.phone || '',
          restaurant.website || '',
          restaurant.business_hours || '',
          restaurant.hashtags,
          restaurant.images,
          restaurant.view_count,
          restaurant.weekly_view_count,
          restaurant.featured || false,
          new Date(restaurant.created_at),
          new Date(restaurant.updated_at)
        ]
      );
      
      // 해시태그 카운트 업데이트
      if (result.rows.length > 0) {
        for (const tag of restaurant.hashtags) {
          await client.query(
            'UPDATE hashtags SET count = count + 1 WHERE name = $1',
            [tag]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    console.log('데이터베이스 시드 작업이 완료되었습니다.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('데이터베이스 시드 오류:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();