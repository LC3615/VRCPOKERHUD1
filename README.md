# VRC Poker HUD (8-MAX カチカチ君 Edition)

![Screenshot](./public/rm.png)

VRChatでのポーカープレイ中に、相手の動向を「カチカチ君」のように素早くメモ・集計するための簡易的なHUD（Webアプリ）です。
フロントエンドのみで動作し、ブラウザ内のSQLite (WASM) でデータを管理します。

## ⚠️ 免責事項 (Disclaimer)

- **本ツールの使用によって生じたいかなる損失、損害、トラブルについても、開発者は一切の責任を負いません。**
- ギャンブルを助長するものではなく、あくまで個人の学習・メモ用ツールです。
- 各プラットフォーム（VRChat等）の規約を遵守して使用してください。

## 特徴

- **8-MAX対応**: 4人+4人の対面レイアウト。
- **クイック・カウント**: Limp, PFR, 3B+ などのアクションを1タップで記録。
- **Showdownメモ**: 相手の手札の強さ（NUTS, VAL, MAR, BAD）を記録可能。
- **インテリジェント・タグ**: Shark, GTO, Maniacなどのタグを付けると、カードの背景色が連動して変化。一目で相手のタイプを判別。
- **SQLite 永続化**: ブラウザを閉じてもデータは自動保存されます。
- **データ出力**: 記録したデータを `.sqlite` 形式でエクスポート可能。

## 使い方 (Setup)

本格的なツールが欲しい方は、これをベースに自分で開発してください。

```bash
# リポジトリをクローン
git clone https://github.com/LC3615/VRCPOKERHUD1.git
cd VRCPOKERHUD1

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

表示されたローカルURL（localhost:5173など）をブラウザで開いて使用してください。

## 技術スタック

- React / TypeScript / Vite
- Tailwind CSS (v3)
- SQLite WASM (sql.js)
- localforage (IndexedDB persistence)
- Lucide React (Icons)
