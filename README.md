# JobScout (recruit-radar)

> 예비 취준생을 위한 채용 시장 분석 도구

취업 준비를 시작할 때 가장 먼저 막히는 질문이 있습니다.  
"지금 시장에서 어떤 기술을 요구하고 있나?" "내가 배운 것들이 실제로 쓸모가 있나?"

JobScout는 원티드와 사람인의 채용 공고를 자동으로 수집하고, 기술 스택 수요 트렌드·회사별 채용 현황·경력별 공고 분포를 한눈에 보여줍니다. 구직 활동을 시작하기 전, 시장을 먼저 이해하는 데 씁니다.

---

## 목차

- [왜 만들었나](#왜-만들었나)
- [누가 쓰는가](#누가-쓰는가)
- [핵심 기능](#핵심-기능)
- [스크린샷](#스크린샷)
- [기술 스택](#기술-스택)
- [설치 및 실행](#설치-및-실행)
- [로드맵](#로드맵)
- [기여 방법](#기여-방법)
- [라이선스](#라이선스)

---

## 왜 만들었나

취업 준비생은 정보 비대칭 상태에 놓여 있습니다.

- "React가 많이 쓰이나, Vue가 많이 쓰이나?" → 커뮤니티 의견에 의존
- "신입 공고가 이 회사에 있었나?" → 매일 직접 사이트를 확인
- "Spring이냐 NestJS냐" → 학원 강사나 유튜버의 주관적 의견

JobScout는 이 질문들을 데이터로 답합니다. 원티드·사람인 공고를 6시간마다 자동 수집하여, 지금 이 순간 채용 시장의 실제 수요를 수치로 보여줍니다.

---

## 누가 쓰는가

| 사용자 | 사용 목적 |
|--------|----------|
| 부트캠프 수료 예정자 | 다음에 배울 기술 우선순위 결정 |
| 학부 졸업 예정자 | 포트폴리오 기술 스택 방향 설정 |
| 커리어 전환 준비자 | 목표 직군의 시장 규모 파악 |
| 취업 준비 중인 개발자 | 특정 회사의 채용 현황 모니터링 |

---

## 핵심 기능

### 시장 분석 대시보드

현재 채용 시장의 상태를 숫자로 요약합니다.

- 전체 활성 채용 공고 건수
- 기술 스택 수요 랭킹 (상위 20개)
- 자주 함께 요구되는 스택 조합 (예: React + TypeScript + AWS)
- 경력별 공고 분포 (신입 / 1-3년 / 3-5년 / 5년 이상)

### 회사 탐색

회사 단위로 채용 현황을 봅니다.

- 회사별 현재 채용 건수
- 주요 요구 기술 스택
- 연봉 범위 (공고에 명시된 경우)

### 공고 목록

수집된 공고를 검색하고 필터링합니다.

- 키워드 검색
- 출처별 필터 (원티드 / 사람인)
- 기술 스택 필터
- 경력 요건 필터
- 페이지네이션

### 자동 크롤링

사람이 직접 수집할 필요가 없습니다.

- **원티드**: 공개 REST API 사용 (안정적)
- **사람인**: HTML 파싱 (Cheerio)
- **주기**: 6시간마다 자동 실행
- **중복 방지**: 동일 공고는 한 번만 저장

---

## 스크린샷

> 스크린샷 준비 중입니다.

| 화면 | 설명 |
|------|------|
| ![시장 분석](docs/screenshots/dashboard.png) | 기술 스택 랭킹 및 경력 분포 |
| ![회사 탐색](docs/screenshots/companies.png) | 회사별 채용 현황 |
| ![공고 목록](docs/screenshots/jobs.png) | 검색 및 필터 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | NestJS, TypeScript, TypeORM |
| 데이터베이스 | PostgreSQL 16 |
| 크롤링 | Puppeteer, Cheerio |
| 프론트엔드 | React 18, TypeScript, Vite |
| 인프라 | Docker, Docker Compose |

---

## 설치 및 실행

### 사전 요구 사항

- [Docker](https://docs.docker.com/get-docker/) 및 Docker Compose

### Docker Compose로 실행 (권장)

```bash
# 저장소 클론
git clone https://github.com/su-wone/recruit-radar.git
cd recruit-radar

# 전체 스택 실행 (DB + 백엔드 + 프론트엔드)
docker compose up -d
```

실행 후 접속:

| 서비스 | 주소 |
|--------|------|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:3000/api |
| PostgreSQL | localhost:5432 |

```bash
# 로그 확인
docker compose logs -f backend

# 종료
docker compose down
```

### 첫 데이터 수집

컨테이너 실행 후 6시간 주기 스케줄러가 자동으로 크롤링을 시작합니다. 즉시 수집하려면:

```bash
# 전체 크롤링 실행 (원티드 + 사람인)
curl -X POST http://localhost:3000/api/crawl/trigger
```

### 로컬 개발 환경 (Docker 없이)

```bash
# DB만 Docker로 실행
docker compose up db -d

# 백엔드
cd backend
npm install
cp .env.example .env   # 환경 변수 설정
npm run start:dev

# 프론트엔드 (새 터미널)
cd frontend
npm install
npm run dev
```

#### 환경 변수 (`backend/.env`)

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=jobscout
DATABASE_USER=jobscout
DATABASE_PASSWORD=jobscout
```

---

## 로드맵

### Phase 1 — 현재

- [x] 원티드 + 사람인 크롤러
- [x] 시장 분석 대시보드
- [x] 회사 탐색
- [x] 공고 목록 (검색/필터/페이지네이션)
- [x] 6시간 주기 자동 수집

### Phase 2 — 개인화

- [ ] 내 기술 스택 등록
- [ ] 시장 요구와 내 스택 사이의 갭 분석
- [ ] 학습 우선순위 로드맵 생성
- [ ] 지원 관리 칸반 보드
- [ ] 점핏, LinkedIn 크롤러 추가

### Phase 3 — 서비스화

- [ ] AI 기반 JD 파싱 (비정형 공고 정형화)
- [ ] 클라우드 배포 (공개 서비스)
- [ ] 알림 기능 (신규 공고 감지)

---

## 기여 방법

1. 저장소를 Fork합니다.
2. 기능 브랜치를 생성합니다. (`git checkout -b feat/새기능`)
3. 변경 사항을 커밋합니다. (`git commit -m 'feat: 새기능 추가'`)
4. 브랜치를 Push합니다. (`git push origin feat/새기능`)
5. Pull Request를 생성합니다.

기술적 배경과 설계 결정은 [개발 가이드](docs/DEVELOPMENT_GUIDE.md)를 참고하세요.

---

## 라이선스

[MIT](LICENSE)
