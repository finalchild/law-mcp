# Korean Law MCP Server

한국 법령 및 자치법규(조례)를 조회할 수 있는 Model Context Protocol (MCP) 서버입니다. 법제처의 국가법령정보센터(open.law.go.kr) API를 통해 데이터를 제공합니다.

## 주요 기능

- 법령 및 자치법규(조례) 검색 지원
- 법령명 또는 본문 내용으로 검색
- 페이지네이션 및 다양한 정렬 옵션
- 법령/자치법규 상세 정보 조회 및 자동 파일 저장 (JSON/Markdown)
- 조문, 부칙, 개정문, 제개정이유 포함

## 설치 및 실행

### Claude Code에서 사용하기

1. 먼저 바이너리 빌드:
   ```bash
   # 현재 플랫폼용 빌드
   deno task build:current
   ```

2. Claude Code 설정 파일 열기:
   
   macOS:
   ```bash
   code ~/Library/Application\ Support/Code/User/globalStorage/claude.claude-code/settings.json
   ```
   
   Linux:
   ```bash
   code ~/.config/Code/User/globalStorage/claude.claude-code/settings.json
   ```

3. MCP 서버 설정 추가:
   ```json
   {
     "mcpServers": {
       "law-mcp": {
         "command": "/path/to/law-mcp/build/law-mcp",
         "env": {
           "LAW_API_OC": "your-email-id"
         }
       }
     }
   }
   ```
   
   macOS ARM64 (Apple Silicon)의 경우:
   ```json
   {
     "mcpServers": {
       "law-mcp": {
         "command": "/path/to/law-mcp/build/law-mcp-darwin-arm64",
         "env": {
           "LAW_API_OC": "your-email-id"
         }
       }
     }
   }
   ```

4. VS Code 재시작 후 Claude Code에서 사용 가능

### 환경 변수 설정

```bash
# open.law.go.kr API 인증을 위한 OC 값 (이메일 ID 부분)
export LAW_API_OC="your-email-id"
```

### 개발자용 실행 방법

```bash
# 개발 모드 (자동 재시작)
deno task dev

# 프로덕션 모드
deno task start

# 테스트 실행
deno task test

# DXT 빌드
deno task build
```

## 사용 가능한 도구

### search_laws
한국 법령 및 자치법규를 검색합니다.

파라미터:
- `query` (필수): 검색할 법령명 또는 내용
- `type`: 검색 유형 - "law"=법령(기본값), "ordinance"=자치법규(조례)
- `page`: 페이지 번호 (기본값: 1)
- `display`: 페이지당 결과 수, 최대 100 (기본값: 20)
- `search`: 검색 범위 - 1=법령명(기본값), 2=본문검색
- `sort`: 정렬 옵션
  - `lasc`: 법령명 오름차순 (기본값)
  - `ldes`: 법령명 내림차순
  - `dasc`: 공포일자 오름차순
  - `ddes`: 공포일자 내림차순
  - `nasc`: 공포번호 오름차순
  - `ndes`: 공포번호 내림차순
  - `efasc`: 시행일자 오름차순
  - `efdes`: 시행일자 내림차순

### get_law_details
특정 법령 또는 자치법규의 상세 정보를 조회하고 파일로 저장합니다.

파라미터:
- `lawId` 또는 `mst` (둘 중 하나 필수):
  - `lawId`: 법령/자치법규 ID (예: '001638' - 도로교통법, '2026666' - 자치법규)
  - `mst`: 법령/자치법규 일련번호 (예: '266639' - 법령, '1316146' - 자치법규)
- `type`: 조회 유형 - "law"=법령(기본값), "ordinance"=자치법규(조례)

반환 결과:
- JSON 파일: 전체 상세 정보 (조문, 부칙, 개정이력 등)
- Markdown 파일: 읽기 쉬운 형식으로 변환된 법령 정보

## Desktop Extension (DXT) 지원

이 프로젝트는 MCP Desktop Extension으로 패키징할 수 있습니다:

- 플랫폼별 바이너리 빌드 지원 (Windows, macOS, Linux)
- 사용자 설정 가능한 API OC 파라미터
- 자세한 내용은 `DXT_BUILD_GUIDE.md` 및 `DXT_README.md` 참조

## 라이선스

ISC License