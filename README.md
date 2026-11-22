# Final Presentation

여러 사람이 슬라이드를 나누어 작성하는 웹 발표 자료입니다.

- 저장소: [KDHunters/final-presentation](https://github.com/KDHunters/final-presentation)
- 발표 보기: [GitHub Pages](https://kdhunters.github.io/final-presentation/)
- 배포 설정: 저장소의 **Settings → Pages → Deploy from a branch**에서 `main` 브랜치와 `/(root)`를 선택하고 저장합니다.

## 구성

- `index.html`, `deck.js`: 슬라이드 뷰어
- `common.css`: 공통 스타일. `.slide`, `.two-column`, `.card` 등을 제공합니다.
- `slides/cover.html`, `slides/example.html`: 슬라이드 조각
- `slides/template.html`: 새 슬라이드 작성용 템플릿
- `order.json`: 표시할 슬라이드 경로와 순서

각 슬라이드 파일은 독립적인 HTML 문서가 아니라 **`<section>` 하나로 된 조각**입니다.

## 슬라이드 추가하기

1. `slides/template.html`을 참고해 `slides/`에 새 HTML 파일을 만듭니다. 기존 슬라이드를 참고해 내용을 작성합니다.
2. 공통 스타일을 우선 사용합니다. 슬라이드 전용 CSS는 해당 슬라이드의 고유 클래스 아래로 범위를 제한해 다른 슬라이드에 영향을 주지 않도록 합니다.
3. 이미지 등 파일은 `assets/`에 두고, 경로는 뷰어인 `index.html`을 기준으로 `assets/파일명`처럼 작성합니다. `/assets/파일명`처럼 맨 앞에 `/`를 붙이지 않습니다.
4. `order.json` 배열에 새 파일 경로를 원하는 순서로 추가합니다. 예시:

   ```json
   ["slides/cover.html", "slides/solution.html", "slides/example.html"]
   ```

## GitHub 웹에서 협업하기

1. 저장소에서 새 브랜치를 만듭니다.
2. GitHub 파일 화면의 연필 버튼으로 수정하거나 **Add file**로 새 파일을 추가합니다. 새 슬라이드라면 `order.json`도 수정합니다.
3. 변경 사항을 해당 브랜치에 커밋합니다.
4. **Pull requests → New pull request**에서 `main`을 대상으로 PR을 열고 변경 내용을 설명합니다.
5. 리뷰 후 PR을 병합합니다. `main`의 루트가 Pages 배포 대상입니다.

## 로컬 확인

저장소 루트에서 다음 명령을 실행합니다.

```bash
python3 -m http.server
```

브라우저에서 `http://localhost:8000/`을 엽니다. 슬라이드는 화면을 가득 채우며 이전·다음 버튼 없이 조작합니다.

- `←` / `→`: 이전 / 다음 슬라이드
- `Space`: 다음 슬라이드
- `F`: 전체화면 전환
- 터치 화면: 좌우로 스와이프해 이동

종료하려면 터미널에서 `Ctrl+C`를 누릅니다.
