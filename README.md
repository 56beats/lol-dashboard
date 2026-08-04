# LoL Dashboard

自分専用の **League of Legends / Teamfight Tactics 戦績ダッシュボード**です。

Riot Games APIから取得した試合・ランク情報をデータベースへ保存し、Webアプリ・PWA・Windowsアプリとして閲覧できます。

---

## ✨ Features

### League of Legends

- 最近20試合の表示
- KDA・勝敗表示
- アイテム表示
- 味方・敵プレイヤー一覧
- ランク情報表示
- LP推移グラフ
- 勝率・平均KDAなどの統計

### Teamfight Tactics

- 最近20試合表示
- 順位表示
- Trait表示
- Champion表示
- Augment表示
- ランク表示
- LP推移グラフ
- Top4率・平均順位

### Synchronization

- Riot APIとの手動同期
- Vercel Cronによる毎日自動同期
- LoL / TFTを個別同期
- Product Key対応
- エラーハンドリング

### Application

- PWA対応
- Windowsアプリとしてインストール可能
- レスポンシブ対応
- ダークテーマ

---

# Screenshots

> （スクリーンショットを追加予定）

---

# Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## Backend

- Next.js Route Handlers
- Prisma ORM

## Database

- Neon PostgreSQL

## Hosting

- Vercel

## External APIs

- Riot Games API
- CommunityDragon
- Data Dragon

---

# Architecture

```
Browser
        │
        ▼
 Next.js (Vercel)
        │
        ├── Riot Games API
        │
        ├── CommunityDragon
        │
        ├── Data Dragon
        │
        ▼
 Neon PostgreSQL
```

画面表示はデータベースのみを参照し、Riot APIへ直接アクセスしません。

同期時のみRiot APIを利用します。

---

# Project Structure

```
src
├── app
│   ├── api
│   └── page.tsx
│
├── components
│   └── dashboard
│
├── lib
│   ├── dashboard
│   ├── ddragon
│   ├── riot
│   └── sync
│
├── types
│
└── prisma
```

---

# Environment Variables

```
DATABASE_URL=

RIOT_GAME_NAME=
RIOT_TAG_LINE=

RIOT_API_KEY_LOL=
RIOT_API_KEY_TFT=

CRON_SECRET=
```

---

# Setup

Install packages

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Run development server

```bash
npm run dev
```

---

# Synchronization

## Manual

LoL

```
/api/sync-profile
/api/sync-lol-matches
/api/sync-rank
```

TFT

```
/api/tft-sync
/api/tft-sync-rank
```

---

## Automatic

Vercel Cron

```
0 19 * * *
```

毎日 JST 04:00 に自動同期します。

---

# Design Principles

- Riot APIへのアクセスは同期時のみ
- 画面はDBのみ参照
- LoLとTFTを責務ごとに分離
- ビジネスロジックは `src/lib` に集約
- Route HandlerはHTTPエントリーポイントのみ
- 型安全性を重視
- 共通処理は最小限に集約

---

# Roadmap

## v1.0

- [x] LoL戦績表示
- [x] TFT戦績表示
- [x] ランク履歴
- [x] LPグラフ
- [x] Riot API同期
- [x] 自動同期(Cron)
- [x] PWA対応
- [x] Windowsアプリ対応

## v1.1

- [ ] チャンピオン別統計
- [ ] TFT構成統計
- [ ] 検索機能
- [ ] フィルター

## v1.2

- [ ] シーズン切替
- [ ] パッチ切替
- [ ] Champion Analytics

---

# License

MIT

---

# Author

Sanshiro Nishikawa
