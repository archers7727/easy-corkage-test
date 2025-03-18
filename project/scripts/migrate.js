import { pool } from '../src/lib/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 마이그레이션 파일 경로
const migrationsDir = path.join(__dirname, '../migrations');

// 마이그레이션 테이블 생성
async function createMigrationsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('마이그레이션 테이블이 생성되었습니다.');
  } catch (error) {
    console.error('마이그레이션 테이블 생성 오류:', error);
    throw error;
  }
}

// 적용된 마이그레이션 가져오기
async function getAppliedMigrations() {
  try {
    const result = await pool.query('SELECT name FROM migrations ORDER BY id');
    return result.rows.map(row => row.name);
  } catch (error) {
    console.error('적용된 마이그레이션 조회 오류:', error);
    throw error;
  }
}

// 마이그레이션 실행
async function runMigrations() {
  try {
    await createMigrationsTable();
    const appliedMigrations = await getAppliedMigrations();
    
    // 마이그레이션 디렉토리가 없으면 생성
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('마이그레이션 디렉토리가 생성되었습니다.');
    }
    
    // 마이그레이션 파일 목록 가져오기
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // 파일명 기준 정렬
    
    // 적용되지 않은 마이그레이션 실행
    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        console.log(`마이그레이션 실행 중: ${file}`);
        
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // 트랜잭션 내에서 마이그레이션 실행
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`마이그레이션 완료: ${file}`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`마이그레이션 오류 (${file}):`, error);
          throw error;
        } finally {
          client.release();
        }
      }
    }
    
    console.log('모든 마이그레이션이 완료되었습니다.');
  } catch (error) {
    console.error('마이그레이션 실행 오류:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();