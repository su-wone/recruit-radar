# JobScout 개발 가이드

이 문서는 JobScout 프로젝트의 모든 기술적 결정 이면에 있는 "왜(Why)"를 설명합니다.
코드를 처음 보는 사람도 전체 구조를 이해하고, 기여하고, 확장할 수 있도록 작성했습니다.

---

## 1. 프로젝트 구조

```
jobscout/
├── backend/                     # NestJS API 서버
│   └── src/
│       ├── crawler/             # 크롤러 모듈
│       │   ├── base-crawler.ts  # 공통 인터페이스 및 유틸리티
│       │   ├── wanted-crawler.ts   # 원티드 API 크롤러
│       │   ├── saramin-crawler.ts  # 사라민 HTML 파싱 크롤러
│       │   ├── crawler.service.ts  # 크롤러 실행 조율
│       │   └── crawler.module.ts   # NestJS 모듈 등록
│       ├── jobs/                # 채용공고 CRUD
│       │   ├── job.entity.ts    # DB 테이블 정의 (TypeORM Entity)
│       │   ├── jobs.service.ts  # 비즈니스 로직
│       │   ├── jobs.controller.ts # REST 엔드포인트
│       │   └── jobs.module.ts
│       ├── statistics/          # 통계 집계 API
│       │   ├── statistics.service.ts  # 원시 SQL 집계 쿼리
│       │   └── statistics.controller.ts
│       └── app.module.ts        # 루트 모듈, DB 연결 설정
├── frontend/                    # React + Vite
│   └── src/
│       ├── components/          # 재사용 가능한 UI 컴포넌트
│       ├── pages/               # 라우트별 페이지 컴포넌트
│       ├── hooks/               # 커스텀 React Hook (데이터 페칭)
│       ├── api/                 # Axios 기반 API 클라이언트
│       └── types/               # TypeScript 타입 정의
├── docs/                        # 프로젝트 문서
└── docker-compose.yml           # 전체 스택 실행 설정
```

각 디렉토리는 단일 책임을 가집니다. `crawler/`는 외부 데이터 수집만, `jobs/`는 DB 읽기/쓰기만 담당합니다.
이렇게 분리하면 크롤러를 교체해도 API가 영향받지 않고, 반대도 마찬가지입니다.

---

## 2. 왜 이 기술을 선택했나

### NestJS (백엔드 프레임워크)

**선택 이유:** Express는 자유도가 높지만, 프로젝트가 커지면 구조가 없어서 팀마다 다른 패턴을 사용하게 됩니다.
NestJS는 Angular에서 영감을 받은 모듈/컨트롤러/서비스 구조를 강제하여, 새 기여자가 구조를 예측할 수 있습니다.

**구체적 이점:**
- `@Module()`, `@Controller()`, `@Injectable()` 데코레이터로 의존성 주입(DI)이 자동화됨
- TypeScript-first 설계로 컴파일 타임에 오류 발견
- `@nestjs/schedule`로 크론 작업을 코드로 관리 (별도 cron 설정 불필요)

**대안 대비:** Fastify는 빠르지만 생태계가 좁고, Express는 구조화에 추가 작업이 필요합니다.

### TypeORM (ORM)

**선택 이유:** SQL을 직접 쓰면 DB 변경 시 쿼리를 모두 찾아 수정해야 합니다.
TypeORM의 Entity-기반 접근은 TypeScript 클래스가 DB 스키마의 단일 진실 공급원(Single Source of Truth)이 됩니다.

```typescript
// job.entity.ts 한 곳만 수정하면 DB 스키마와 TypeScript 타입이 동시에 변경됨
@Column({ nullable: true })
salary_min?: number;
```

**마이그레이션:** `synchronize: true`는 개발 환경에서만 사용합니다.
프로덕션에서는 `typeorm migration:generate`로 명시적 마이그레이션 파일을 만들어야 SQL 변경을 추적할 수 있습니다.

**대안 대비:** Prisma는 더 현대적이지만 NestJS와의 통합이 TypeORM보다 추가 설정이 필요합니다.

### React + Vite (프론트엔드)

**React 선택 이유:** 컴포넌트 기반 UI는 재사용성과 테스트 가능성을 높입니다.
채용공고 카드, 필터, 페이지네이션 같은 반복 요소에 적합합니다.

**Vite 선택 이유:** Create React App(CRA)은 webpack 기반으로 느린 HMR(Hot Module Replacement)을 가집니다.
Vite는 ESM 네이티브 번들링으로 개발 서버 시작이 수십 배 빠릅니다.
프로젝트 초기에 DX(Developer Experience)가 좋아야 빠르게 반복할 수 있습니다.

### Docker Compose (인프라)

**선택 이유:** "내 컴퓨터에서는 됐는데" 문제를 방지합니다.
PostgreSQL, 백엔드, 프론트엔드를 각각 컨테이너로 격리하면 환경 차이 없이 어디서나 동일하게 실행됩니다.

```yaml
# docker-compose.yml - 서비스 간 네트워크는 서비스 이름으로 통신
DATABASE_HOST: postgres   # 'localhost'가 아닌 서비스 이름
```

---

## 3. DB 설계 원칙

### 정규화: 중복 데이터를 제거하라

잘못된 설계 예시:

```
jobs 테이블: id, title, company_name, company_industry, company_logo_url, ...
```

문제: 같은 회사의 공고가 100개이면 `company_industry`가 100번 저장됩니다.
회사 정보가 바뀌면 100개 행을 모두 업데이트해야 합니다.

JobScout의 `job.entity.ts`는 회사 정보를 `company_*` 컬럼으로 비정규화하여 저장하는데,
이는 의도된 트레이드오프입니다. 채용공고는 공고 시점의 회사 정보를 스냅샷해야 하기 때문입니다.
(회사가 나중에 이름을 바꿔도 과거 공고는 당시 이름을 유지해야 함)

### 중복 방지: Unique 제약

```typescript
@Index(['source_site', 'source_id'], { unique: true })
```

같은 사이트의 같은 공고 ID는 DB에 한 번만 저장됩니다.
크롤러가 하루에 여러 번 실행되어도 중복이 쌓이지 않습니다.
`ON CONFLICT DO NOTHING` 또는 upsert 패턴으로 처리합니다.

### 인덱스 전략

자주 필터링되는 컬럼에만 인덱스를 추가합니다:
- `source_site + source_id`: 크롤러 중복 확인
- `is_active`: 활성 공고만 조회하는 쿼리에 필수
- `created_at`: 최신순 정렬에 사용

인덱스는 읽기를 빠르게 하지만 쓰기를 느리게 합니다. 크롤러가 대량 insert 시 인덱스 수가 많으면 부하가 생깁니다.

---

## 4. 크롤러 설계 패턴

### Strategy Pattern (전략 패턴)

```typescript
// base-crawler.ts
export abstract class BaseCrawler {
  abstract readonly sourceSite: string;
  abstract crawl(): Promise<CrawledJob[]>;
  protected randomDelay(): Promise<void> { ... }
}

// wanted-crawler.ts
export class WantedCrawler extends BaseCrawler {
  readonly sourceSite = 'wanted';
  async crawl(): Promise<CrawledJob[]> { ... }
}
```

`BaseCrawler`는 계약(Contract)을 정의합니다. `CrawlerService`는 어떤 크롤러를 사용하는지 알 필요 없이
`crawler.crawl()`을 호출합니다. 새 사이트(잡코리아, 링크드인 등)를 추가할 때 기존 코드를 수정하지 않고
새 클래스만 추가하면 됩니다. 이것이 Open/Closed Principle입니다.

### API 크롤링 vs HTML 파싱

**원티드 (API 방식):**

```typescript
const url = `https://www.wanted.co.kr/api/v4/jobs/${id}`;
const res = await fetch(url, { headers: this.headers });
const data: WantedJobDetail = await res.json();
```

원티드는 공개 REST API를 제공합니다. JSON 응답은 구조가 명확하고 파싱이 쉽습니다.
UI 변경에 영향받지 않아 크롤러가 안정적입니다.

**사라민 (HTML 파싱 방식):**

```typescript
const $ = cheerio.load(html);
$('.item_recruit').each((_, el) => {
  const title = $(el).find('.job_tit a').text().trim();
});
```

사라민은 공개 API가 없습니다. cheerio는 서버 환경에서 jQuery와 같은 CSS 선택자로 HTML을 파싱합니다.
단점: 사이트 UI가 바뀌면 선택자(.item_recruit, .job_tit)가 깨질 수 있습니다.
`try/catch`로 개별 항목 파싱 실패를 격리하여 한 항목 오류가 전체를 중단시키지 않습니다.

### 요청 속도 제한 (Rate Limiting)

```typescript
protected randomDelay(): Promise<void> {
  return this.delay(1000 + Math.random() * 2000);
}
```

고정 딜레이(1초)가 아닌 랜덤 딜레이(1~3초)를 사용합니다.
고정 패턴은 봇으로 탐지될 수 있습니다. 랜덤성이 사람처럼 보이게 합니다.

---

## 5. API 설계 원칙

### REST 자원 중심 설계

```
GET  /jobs          # 목록 조회
GET  /jobs/:id      # 단건 조회
POST /jobs/crawl    # 크롤링 실행 (액션)
GET  /statistics    # 통계 조회
```

URL은 명사(자원), HTTP 메서드가 동사(행위)입니다.
`/getJobs`, `/fetchStatistics` 같은 동사 URL은 REST 원칙에 어긋납니다.

### 페이지네이션

```typescript
// Query Builder 방식
query.skip((page - 1) * limit).take(limit);

// 응답 형식
{
  data: Job[],
  total: number,
  page: number,
  limit: number
}
```

`total`을 함께 반환하는 이유: 프론트엔드가 전체 페이지 수를 계산하기 위해 별도 API를 호출하지 않아도 됩니다.
`page * limit > total`이면 마지막 페이지임을 알 수 있습니다.

### Query Builder로 동적 필터링

```typescript
const query = this.jobRepository.createQueryBuilder('job');

if (search) {
  query.andWhere('job.title ILIKE :search', { search: `%${search}%` });
}
if (location) {
  query.andWhere('job.location ILIKE :location', { location: `%${location}%` });
}
```

`ILIKE`는 PostgreSQL의 대소문자 무시 LIKE입니다. 파라미터 바인딩(`:search`)을 사용하여
SQL Injection을 방지합니다. 문자열 직접 삽입(`WHERE title LIKE '%${search}%'`)은 절대 금지입니다.

---

## 6. 통계 쿼리에서 원시 SQL을 쓴 이유

```typescript
// statistics.service.ts
const result = await this.jobRepository.query(`
  SELECT
    COALESCE(tech_stack, '기타') as tech_stack,
    COUNT(*) as count
  FROM jobs, unnest(tech_stacks) as tech_stack
  GROUP BY tech_stack
  ORDER BY count DESC
  LIMIT 20
`);
```

**왜 TypeORM Query Builder를 쓰지 않았나?**

`unnest()`는 PostgreSQL 배열을 행으로 펼치는 함수입니다. TypeORM Query Builder는 이런
PostgreSQL 특화 배열 함수를 지원하지 않습니다. 이런 경우 원시 SQL이 유일한 선택입니다.

**원시 SQL의 위험:**
- SQL Injection 주의 (이 경우 사용자 입력이 없으므로 안전)
- DB 변경 시 수동 수정 필요
- 타입 안전성이 없음 (결과가 `any[]`)

**트레이드오프:** 집계 쿼리는 자주 바뀌지 않고, PostgreSQL 특화 기능이 필요하므로
원시 SQL의 직관성이 Query Builder의 복잡한 우회보다 낫습니다.

---

## 7. 프론트엔드 컴포넌트 설계

### 단방향 데이터 흐름

```
useJobs (Hook) → Page → Component → UI
     ↑                        |
     └── 사용자 이벤트 (필터 변경) ┘
```

데이터는 항상 위에서 아래로 흐릅니다. 컴포넌트는 props를 받고, 이벤트를 위로 올립니다.
`JobCard`는 자신이 표시할 데이터를 직접 fetch하지 않습니다. 부모(Page)가 데이터를 내려줍니다.

**왜 이렇게 설계하나?**
- 예측 가능성: 데이터 출처가 명확합니다
- 테스트 용이성: 컴포넌트에 props만 주입하면 테스트 가능합니다
- 재사용성: `JobCard`를 다른 페이지에서도 재사용할 수 있습니다

### 커스텀 Hook으로 데이터 페칭 분리

```typescript
// hooks/useJobs.ts
export function useJobs(filters: JobFilters) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    jobsApi.getJobs(filters)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [filters]);

  return { jobs, loading };
}
```

페이지 컴포넌트에서 fetch 로직을 분리하면 컴포넌트는 UI에만 집중합니다.
같은 Hook을 여러 컴포넌트에서 재사용할 수 있습니다.

### 컴포넌트 분류

| 컴포넌트 | 역할 | 상태 |
|----------|------|------|
| `JobCard` | 카드 한 장 렌더링 | 없음 (순수) |
| `JobFilter` | 필터 UI | 로컬 입력값 |
| `Pagination` | 페이지 이동 버튼 | 없음 (순수) |
| `JobListPage` | 조합, 데이터 조율 | 전체 필터 상태 |

"순수 컴포넌트"는 같은 props에 항상 같은 UI를 반환합니다. 부작용이 없어 테스트가 쉽습니다.

---

## 8. 디자인 원칙

### 다크 테마 우선

```css
:root {
  --bg-primary: #0f172a;    /* slate-900 */
  --bg-secondary: #1e293b;  /* slate-800 */
  --text-primary: #f8fafc;  /* slate-50 */
  --accent: #6366f1;        /* indigo-500 */
}
```

**왜 다크 테마인가?**
개발자가 주요 사용자입니다. 개발자는 어두운 환경에서 오래 화면을 봅니다.
다크 테마는 눈 피로를 줄이고, 개발 도구(VSCode, Terminal)와 시각적 일관성을 줍니다.

CSS 변수(Custom Properties)를 사용하여 테마 전환 시 한 곳만 수정합니다.
컴포넌트별로 색상을 하드코딩하면 테마 변경이 불가능합니다.

### WCAG AA 접근성

- 텍스트 대비비 최소 4.5:1 (일반 텍스트), 3:1 (대형 텍스트)
- 포커스 링(`:focus-visible`) 항상 표시
- 스크린 리더를 위한 `aria-label`, `role` 속성

`--text-primary: #f8fafc`와 `--bg-primary: #0f172a`의 대비비는 약 17:1로 AAA 기준도 충족합니다.

### Tailwind CSS 활용

유틸리티-퍼스트 접근법은 컴포넌트별 CSS 파일 없이 클래스로 스타일을 표현합니다.

```jsx
<div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-indigo-500 transition-colors">
```

장점: HTML과 스타일이 같은 곳에 있어 변경 시 파일 전환이 없습니다.
단점: 클래스가 길어질 수 있습니다. `cn()` 유틸리티로 조건부 클래스를 관리합니다.

---

## 9. 실행 방법

### Docker Compose로 전체 스택 실행 (권장)

```bash
# 처음 실행 시
docker compose up -d

# 로그 확인
docker compose logs -f backend

# 종료
docker compose down
```

PostgreSQL, 백엔드(3000), 프론트엔드(5173)가 자동으로 시작됩니다.
`docker compose up -d --build`는 코드 변경 후 이미지를 재빌드합니다.

### 수동으로 크롤링 실행

```bash
# API를 통한 크롤링 트리거
curl -X POST http://localhost:3000/jobs/crawl

# 특정 사이트만
curl -X POST http://localhost:3000/jobs/crawl/wanted
curl -X POST http://localhost:3000/jobs/crawl/saramin
```

크롤링은 비동기로 실행됩니다. 응답을 받은 즉시 백그라운드에서 크롤링이 시작됩니다.
`GET /jobs`로 결과를 확인하세요.

### 개발 환경 개별 실행

```bash
# 백엔드
cd backend
npm install
npm run start:dev   # 파일 변경 시 자동 재시작

# 프론트엔드
cd frontend
npm install
npm run dev         # Vite 개발 서버

# DB만 Docker로
docker compose up postgres -d
```

### 환경 변수

```bash
# backend/.env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=jobscout
DATABASE_PASSWORD=jobscout123
DATABASE_NAME=jobscout
```

`.env` 파일은 절대 git에 커밋하지 마세요. `.env.example`을 참고하여 로컬에서 생성합니다.

---

## 10. 학습 포인트 요약

이 프로젝트를 통해 배울 수 있는 핵심 개념들입니다.

### 백엔드

| 개념 | 어디서 볼 수 있나 | 핵심 교훈 |
|------|------------------|-----------|
| Strategy Pattern | `base-crawler.ts` | 인터페이스를 통한 교체 가능한 구현 |
| Dependency Injection | `crawler.module.ts` | 객체 생성을 프레임워크에 위임 |
| Query Builder | `jobs.service.ts` | 동적 조건을 안전하게 조합 |
| 원시 SQL | `statistics.service.ts` | ORM의 한계를 알고 우회하는 법 |
| Rate Limiting | `base-crawler.ts` | 외부 서비스 요청 시 예의 지키기 |

### 프론트엔드

| 개념 | 어디서 볼 수 있나 | 핵심 교훈 |
|------|------------------|-----------|
| 단방향 데이터 흐름 | `JobListPage → JobCard` | 예측 가능한 상태 변화 |
| 커스텀 Hook | `hooks/useJobs.ts` | 로직과 UI 분리 |
| CSS 변수 | `index.css` | 테마 관리의 단일 진실 공급원 |

### 인프라

| 개념 | 어디서 볼 수 있나 | 핵심 교훈 |
|------|------------------|-----------|
| 컨테이너 격리 | `docker-compose.yml` | 환경 재현 가능성 |
| 서비스 네트워킹 | `DATABASE_HOST: postgres` | 컨테이너 간 DNS 기반 통신 |

### 앞으로 개선할 수 있는 것들

1. **Redis 캐싱**: 통계 쿼리는 매번 DB를 때릴 필요가 없습니다. 5분 TTL 캐시를 추가하면 성능이 크게 개선됩니다.
2. **Bull Queue**: 크롤링을 API 요청-응답 사이클에서 분리하여 큐 기반으로 처리하면 타임아웃 없이 장시간 크롤링이 가능합니다.
3. **Playwright**: cheerio HTML 파싱은 JavaScript 렌더링 페이지에서 실패합니다. Playwright로 실제 브라우저를 제어하면 SPA도 크롤링 가능합니다.
4. **Jest 테스트**: 각 크롤러의 파싱 로직을 HTML 픽스처로 단위 테스트하면 사이트 변경을 빠르게 감지할 수 있습니다.
5. **마이그레이션**: `synchronize: true`를 끄고 TypeORM 마이그레이션으로 스키마 변경을 버전 관리하세요.

---

*이 가이드는 코드를 처음 보는 사람이 "왜 이렇게 만들었나"를 이해할 수 있도록 작성되었습니다.
코드를 읽다가 이해가 안 되는 부분이 있으면 이 문서에 추가해주세요.*
