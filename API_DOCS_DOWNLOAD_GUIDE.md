# API 문서 다운로드 가이드

이 가이드는 open.law.go.kr에서 API 문서를 다운로드하는 방법을 설명합니다.

## 1단계: API 가이드 목록 확인

1. 브라우저에서 https://open.law.go.kr/LSO/openApi/guideList.do 접속
2. 페이지에 있는 각 API 가이드 링크를 확인
3. 각 링크의 `<a>` 요소에서 `onclick` 속성 확인:
   ```html
   <a href="#" onclick="javascript:openApiGuide('lsNwListGuide')">현행법령목록조회</a>
   ```
4. `openApiGuide()` 함수의 파라미터 값을 기록 (예: `lsNwListGuide`)

## 2단계: API 문서 다운로드

각 API 문서를 다운로드하려면 POST 요청을 보냅니다:

### curl을 사용한 방법:
```bash
curl -X POST https://open.law.go.kr/LSO/openApi/guideResult.do \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "htmlName=lsNwListGuide" \
  -o "현행법령목록조회.html"
```

### 주요 API 문서 목록 및 다운로드 명령:

```bash
# 현행법령목록조회
curl -X POST https://open.law.go.kr/LSO/openApi/guideResult.do \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "htmlName=lsNwListGuide" \
  -o "현행법령목록조회.html"

# 현행법령본문조회
curl -X POST https://open.law.go.kr/LSO/openApi/guideResult.do \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "htmlName=lsNwInfoGuide" \
  -o "현행법령본문조회.html"

# 자치법규목록조회
curl -X POST https://open.law.go.kr/LSO/openApi/guideResult.do \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "htmlName=ordinListGuide" \
  -o "자치법규목록조회.html"

# 자치법규본문조회
curl -X POST https://open.law.go.kr/LSO/openApi/guideResult.do \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "htmlName=ordinInfoGuide" \
  -o "자치법규본문조회.html"
```
