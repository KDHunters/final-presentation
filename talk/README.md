# talk: 발표 덱(현석 구간 + 팀 슬라이드)

현석의 발표 덱(자막·발표 창 포함) 뒤에 저장소 루트의 팀 슬라이드(`order.json` 순서 그대로)를 이어 붙여 한 번에 넘기는 화면입니다.

- 보기: `https://kdhunters.github.io/final-presentation/` (저장소 루트의 `index.html`이 이 폴더의 덱을 엽니다)
- 팀 슬라이드만 보는 원래 뷰어: `https://kdhunters.github.io/final-presentation/team.html`
- 팀 슬라이드(`slides/`, `order.json`, `common.css`)는 건드리지 않습니다. 슬라이드를 고치거나 `order.json`을 바꾸면 여기에도 그대로 반영됩니다.

## 조작

- `Space` / `→`: 다음, `←`: 이전, `Home`: 처음
- `C`: 자막 켜기·끄기 (발표자 창)
- `F`: 전체 화면
- `P`: 발표 창 열기. 발표 창을 발표 화면으로 옮기고 한 번 클릭하면 전체 화면이 됩니다. 넘김은 두 창이 같이 따라갑니다.

## 구성

- 루트 `index.html`, `deck.js`, `deck.css`: 바깥 덱. `deck.js`는 `build/`를 묶은 결과물입니다.
- `slides-data.json`: 현석 구간의 장 순서와 자막
- `team-embed.html`: 팀 슬라이드 조각을 띄우는 안쪽 창. 팀 덱의 `deck.js`는 쓰지 않습니다.
- `merge.json`: `teamRoot`(팀 덱 위치), `teamFrom`(팀 슬라이드를 어느 장부터 붙일지. `null`이면 전부)
- `assets/`: 현석 구간 그림·소리

## 다시 묶기

`build/deck.tsx`, `build/src/`, `slides-data.json`을 고쳤을 때만 필요합니다.

```bash
cd talk/build
npm install
sh build.sh
```
