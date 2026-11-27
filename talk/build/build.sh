#!/bin/sh
# slides-data.json이나 build/ 아래 소스를 고친 뒤 다시 묶는다. 결과는 ../deck.js 하나.
cd "$(dirname "$0")" && ./node_modules/.bin/esbuild deck.tsx --bundle --minify --format=iife --target=es2020 --alias:remotion=./shim.tsx --define:process.env.NODE_ENV=\"production\" --loader:.json=json --outfile=../deck.js
# 브라우저가 예전 deck.js·deck.css를 붙들지 않게 주소 뒤 번호를 바꾼다(저장소 루트의 index.html).
V=$(date +%s) && sed -i '' -E "s#deck\.css(\?v=[0-9]+)?#deck.css?v=$V#; s#deck\.js(\?v=[0-9]+)?#deck.js?v=$V#" ../../index.html
