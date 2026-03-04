COMPANY ANALYZER 🏢📊

就活生が自分独自の評価軸で企業を分析・比較するための、レーダーチャート可視化ツールです。

🚀 ライブデモ

https://company-research-radar-chart.vercel.app/

✨ 概要

- ターゲット層：企業研究中の就活生
- 企業研究をする中でまとめた企業への評価を、レーダーチャートの形で整理できるアプリ。
- 企業名と凡例を自分に合わせたものに変更可能。

✨ 主な機能

- 独自の評価軸設定: 企業ごとに評価項目（3〜8項目）や項目名を自由に変更可能。
- レーダーチャート可視化: 入力スコアをリアルタイムでSVGグラフに反映。
- データ永続化: ブラウザの LocalStorage を利用し、リロードしてもデータが保持されます。
- データポータビリティ: JSON形式でのインポート/エクスポート機能。
- レスポンシブデザイン: PC・スマホ両方で快適に操作可能。

🛠 使用技術

Frontend: React (Hooks: useState, useEffect, useMemo, useCallback, memo)

Styling: Tailwind CSS

Icons: Lucide React

Visualization: SVG (独自ロジックによる描画)

Build Tool: Vite

💡 技術的なこだわり

ライブラリに頼らないグラフ描画:
Chart.js などの外部ライブラリを使用せず、数学的計算（三角関数）を用いて SVG でレーダーチャートを自作しました。これにより、軽量化と企業ごとの柔軟な項目変更を両立させています。

レンダリングの最適化:
React.memo や useCallback を活用し、フォーム入力時の不要な再レンダリングを抑制。大規模なリスト表示でもスムーズな動作を実現しました。

堅牢なデータ処理:
外部ファイル読み込み（JSON）の際、データの整合性をチェックするバリデーション層を設けています。

📦 開発環境での実行方法

クローン

git clone [https://github.com/oy-hotwater/company-research-radar-chart.git](https://github.com/oy-hotwater/company-research-radar-chart.git)

依存関係のインストール

npm install

起動

npm run dev
