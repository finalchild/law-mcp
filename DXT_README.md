# Korean Law MCP Desktop Extension

한국 법령 정보를 조회할 수 있는 Desktop Extension (DXT)입니다.

## 특징

- 🔍 법령명 및 본문 내용 검색
- 📄 법령 상세 정보 조회 (조문, 부칙, 개정문 포함)
- 🌐 크로스 플랫폼 지원 (Windows, macOS, Linux)
- ⚙️ 사용자 설정 가능한 API 인증

## 설치

1. 플랫폼에 맞는 `.dxt` 파일을 다운로드:
   - Linux: `korean-law-mcp-linux-x64.dxt`
   - macOS (Intel): `korean-law-mcp-macos-x64.dxt`
   - macOS (Apple Silicon): `korean-law-mcp-macos-arm64.dxt`
   - Windows: `korean-law-mcp-windows-x64.dxt`

2. DXT를 지원하는 애플리케이션에서 설치

## 사용 방법

### 1. search_laws - 법령 검색

```json
{
  "query": "도로교통법",
  "page": 1,
  "display": 20,
  "search": 1,
  "sort": "lasc"
}
```

**파라미터:**
- `query` (필수): 검색할 법령명 또는 내용
- `page`: 페이지 번호 (기본값: 1)
- `display`: 페이지당 결과 수 (기본값: 20, 최대: 100)
- `search`: 검색 범위
  - 1: 법령명 검색 (기본값)
  - 2: 본문 검색
- `sort`: 정렬 옵션
  - `lasc`: 법령명 오름차순 (기본값)
  - `ldes`: 법령명 내림차순
  - `dasc`: 공포일자 오름차순
  - `ddes`: 공포일자 내림차순
  - `nasc`: 공포번호 오름차순
  - `ndes`: 공포번호 내림차순
  - `efasc`: 시행일자 오름차순
  - `efdes`: 시행일자 내림차순

### 2. get_law_details - 법령 상세 조회

```json
{
  "mst": "266639"
}
```

또는

```json
{
  "lawId": "001638"
}
```

**파라미터 (둘 중 하나 필수):**
- `lawId`: 법령 ID
- `mst`: 법령 일련번호

## 설정

### API OC 파라미터

DXT 호스트 애플리케이션에서 설정:

```json
{
  "api_oc": "your-email-id"
}
```

- open.law.go.kr API 사용을 위한 인증값
- 이메일 주소의 ID 부분 입력 (예: `g4c@korea.kr`의 경우 `g4c`)

## 개발자 정보

### 빌드 방법

```bash
# 현재 플랫폼용 빌드
deno task build:current

# 모든 플랫폼용 빌드
deno task build

# 테스트
deno task test:dxt
```

### 기술 스택

- Runtime: Deno (compiled to binary)
- Protocol: Model Context Protocol (MCP)
- API: open.law.go.kr
- Language: TypeScript

## 라이선스

ISC License

## 작성자

finalchild <me@finalchild.dev>

## 문제 해결

### 네트워크 오류
- 인터넷 연결 확인
- `open.law.go.kr` 접속 가능 여부 확인

### 인증 오류
- API OC 파라미터 설정 확인
- 올바른 이메일 ID 입력 여부 확인

### 검색 결과 없음
- 검색어 철자 확인
- 다른 검색 범위 (search 파라미터) 시도
