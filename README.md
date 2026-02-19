# 🛒 아마존 리뷰 감정 분석 챗봇

아마존 상품 리뷰를 자동으로 수집하고 GPT API를 활용하여 감정을 분석하는 웹 애플리케이션입니다.

## 🎬 라이브 데모

**[https://web-production-6427d.up.railway.app/](https://web-production-6427d.up.railway.app/)** ← 바로 체험해보기

## ✨ 주요 기능

- 🔍 **리뷰 크롤링**: BeautifulSoup을 사용하여 아마존 상품 리뷰 최신순 30개 자동 수집
- 🤖 **AI 감정 분석**: GPT API를 통해 각 리뷰를 positive/negative/neutral로 자동 분류
- 📊 **시각화**: Chart.js를 활용한 감정 분석 결과 차트
- 📝 **AI 요약 리포트**: GPT가 생성하는 전반적인 상품 인상 요약
- 💫 **모던 UI**: 반응형 디자인과 부드러운 애니메이션

## 🎯 사용 예시

**상품**: Samsung Galaxy Z Fold7 Cell Phone  
**URL**: https://www.amazon.com/Samsung-Smartphone-Unlocked-Manufacturer-Warranty/dp/B0F7J243YH

## 🚀 설치 및 실행

### 1. 저장소 클론 및 이동
```bash
cd vibe-1120-acorn-commerce-review-analysis-ai
```

### 2. 가상환경 생성 및 활성화
```bash
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. 필요한 패키지 설치
```bash
pip install -r requirements.txt
```

### 4. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 OpenAI API 키를 설정합니다:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

> 💡 OpenAI API 키는 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.

### 5. 애플리케이션 실행
```bash
python app.py
```

### 6. 브라우저에서 접속
```
http://localhost:5153
```

## 🚂 Railway 배포

이 프로젝트는 [Railway](https://railway.app)에 배포할 수 있습니다.

### 1. Railway에 배포하기

1. [Railway](https://railway.app)에 로그인
2. **New Project** → **Deploy from GitHub repo** 선택
3. GitHub 연동 후 `junsang-dong/vibe-1120-acorn-commerce-review-analysis-ai` 저장소 선택
4. 배포가 자동으로 시작됩니다 (Procfile, requirements.txt 자동 감지)

### 2. 환경 변수 설정

Railway 대시보드에서 **Variables** 탭에 다음 환경 변수를 추가합니다:

| 변수명 | 설명 |
|--------|------|
| `OPENAI_API_KEY` | OpenAI API 키 (필수) |

### 3. 도메인 설정

- **Settings** → **Networking** → **Generate Domain** 클릭
- 생성된 URL로 앱에 접속 가능합니다 (예: `https://xxx.up.railway.app`)

### 4. 배포 관련 파일

| 파일 | 용도 |
|------|------|
| `Procfile` | Gunicorn으로 웹 서버 실행 |
| `runtime.txt` | Python 3.9 버전 지정 |
| `requirements.txt` | gunicorn 포함 의존성 |

### 5. Railway 크래시 트러블슈팅

배포 직후 **"Worker failed to boot"** 또는 **"Crashed"** 오류가 발생하는 경우, 아래 원인과 해법을 참고하세요.

#### 원인

| 원인 | 설명 |
|------|------|
| **OpenAI 클라이언트 초기화** | 모듈 로드 시점에 `OpenAI()`를 호출하면, API 키 미설정·환경 이슈 시 Worker 부팅 단계에서 크래시 발생 |
| **PORT 바인딩 누락** | Railway가 제공하는 `PORT` 환경 변수에 바인딩하지 않으면 연결 실패 |
| **httpx 호환성** | `openai` 패키지와 `httpx` 버전 불일치 시 `proxies` 관련 TypeError 발생 |

#### 해법 (이미 적용됨)

- **Procfile**: `--bind 0.0.0.0:${PORT:-8080}`로 Railway PORT에 명시적 바인딩, `--workers 1` `--timeout 120` 설정
- **지연 초기화**: OpenAI 클라이언트를 첫 API 요청 시점에 생성 (`get_openai_client()`)
- **httpx 버전 고정**: `httpx==0.27.2`로 고정하여 OpenAI 클라이언트와 호환성 확보

#### 확인 사항

- Railway **Variables**에 `OPENAI_API_KEY`가 설정되어 있는지 확인
- 배포 로그에서 구체적인 에러 메시지 확인

## 📁 프로젝트 구조

```
vibe-1120-acorn-commerce-review-analysis-ai/
├── app.py                 # Flask 백엔드 메인 파일
├── requirements.txt       # Python 패키지 의존성
├── Procfile               # Railway/Gunicorn 실행 설정
├── runtime.txt            # Python 버전 지정 (Railway)
├── .env                   # 환경 변수 (API 키)
├── README.md             # 프로젝트 문서
├── templates/
│   └── index.html        # 메인 HTML 템플릿
└── static/
    ├── style.css         # 스타일시트
    └── script.js         # 클라이언트 JavaScript
```

## 🔧 기술 스택

### Backend
- **Flask**: 웹 서버 프레임워크
- **BeautifulSoup4**: 웹 크롤링
- **OpenAI API**: GPT를 활용한 감정 분석 및 요약
- **Requests**: HTTP 요청

### Frontend
- **HTML5 / CSS3**: 마크업 및 스타일링
- **JavaScript (ES6+)**: 클라이언트 로직
- **Chart.js**: 데이터 시각화

## 📊 작동 원리

1. **사용자 입력**: 아마존 상품 URL 입력
2. **리뷰 크롤링**: BeautifulSoup으로 최신 리뷰 30개 수집
3. **감정 분석**: 각 리뷰를 GPT API로 분석하여 감정 분류
4. **시각화**: Chart.js로 감정 분석 결과를 원형 차트로 표시
5. **요약 생성**: GPT API로 전반적인 상품 인상 요약 리포트 생성
6. **결과 표시**: 분석 결과, 차트, 요약, 리뷰 목록을 화면에 표시

## ⚠️ 주의사항

- **API 비용**: OpenAI API 사용에 따른 비용이 발생할 수 있습니다.
- **크롤링 제한**: 아마존 서버에 과부하를 주지 않도록 요청 간 딜레이를 설정했습니다.
- **Rate Limit**: 과도한 요청 시 일시적으로 차단될 수 있습니다.
- **리뷰 구조 변경**: 아마존 웹사이트 구조가 변경되면 크롤링이 작동하지 않을 수 있습니다.

## 🔑 환경 변수

`.env` 파일에 다음 변수를 설정해야 합니다:

```bash
OPENAI_API_KEY=sk-...your-api-key...
```

## 📝 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

## 💡 향후 개선 사항

- [ ] 더 많은 리뷰 수집 옵션
- [ ] 키워드 추출 기능
- [ ] 리뷰 필터링 옵션
- [ ] 다른 쇼핑몰 지원
- [ ] 데이터베이스 연동
- [ ] 분석 결과 PDF 다운로드

---

**Made with ❤️ using Flask, GPT API, and BeautifulSoup for Amazon Reviews**

