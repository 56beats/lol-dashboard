# lol-dashboard

自分専用の LoL / TFT 戦績ダッシュボードです。

Riot Games API から試合・ランク情報を取得し、Neon PostgreSQL に保存して表示します。

---

# 機能

## League of Legends

- ランク表示
- LP推移グラフ
- 最近20試合表示
- 試合詳細
  - 敵味方10人表示
  - KDA
  - アイテム
  - サモナースペル
  - CS
  - Vision Score
  - ダメージバー
- CommunityDragon画像対応（予定）

---

## Teamfight Tactics

- ランク表示
- ランク推移グラフ
- 最近20試合表示
- Trait表示
- Traitアイコン
- Champion画像
- アイテム表示
- オーグメント表示
- CommunityDragon画像対応

---

# 使用技術

| 項目      | 内容                         |
| --------- | ---------------------------- |
| Framework | Next.js                      |
| Language  | TypeScript                   |
| UI        | Tailwind CSS                 |
| Database  | Neon PostgreSQL              |
| ORM       | Prisma                       |
| Hosting   | Vercel                       |
| Game API  | Riot Games API               |
| Image     | CommunityDragon / DataDragon |

---

# セットアップ

## 1. Clone

```bash
git clone <repository-url>

cd lol-dashboard
```

---

## 2. パッケージインストール

```bash
npm install
```

---

## 3. Vercel CLI

```bash
npm install -g vercel
```

確認

```bash
vercel --version
```

---

## 4. Vercelログイン

```bash
vercel login
```

---

## 5. プロジェクトをリンク

```bash
vercel link
```

既存のプロジェクトを選択してください。

---

## 6. 環境変数取得

```bash
vercel env pull .env.local
```

Prisma CLIは `.env` を使用するためコピーします。

Windows

```powershell
copy .env.local .env
```

Mac/Linux

```bash
cp .env.local .env
```

---

# 環境変数

`.env.example`

```env
DATABASE_URL=

POSTGRES_URL_NON_POOLING=

RIOT_API_KEY=

RIOT_GAME_NAME=

RIOT_TAG_LINE=

CRON_SECRET=
```

## 補足

現在は

```
RIOT_PUUID
```

は使用していません。

起動時に

```
RIOT_GAME_NAME
RIOT_TAG_LINE
```

から取得しています。

---

# Prisma

Client生成

```bash
npx prisma generate
```

Migration

```bash
npx prisma migrate dev
```

Studio

```bash
npx prisma studio
```

---

# 開発サーバー

```bash
npm run dev
```

```
http://localhost:3000
```

---

# Build

```bash
npm run build
```

---

# API

## LoL

### 試合同期

```
GET /api/sync-lol-matches
```

### LP同期

```
GET /api/sync-rank
```

### Champion同期

```
POST /api/sync-lol-champions
```

---

## TFT

### 試合同期

```
GET /api/tft-sync
```

### LP同期

```
GET /api/tft-sync-rank
```

### Champion同期

```
POST /api/sync-tft-champions
```

---

## Cron

```
GET /api/cron/sync
```

現在は

- LoL試合同期
- LoLランク同期
- TFT試合同期
- TFTランク同期

を実行します。

---

# DB構成

## LoL

```
LolMatch
    │
    ├──── LolParticipant
    │
    └──── LolTeam

LolChampion
```

---

## TFT

```
TftMatch
      │
      └──── TftMatchParticipant

TftChampion
```

---

# 新しいPCで開発する手順

```bash
git clone <repository>

cd lol-dashboard

npm install

npm install -g vercel

vercel login

vercel link

vercel env pull .env.local

copy .env.local .env

npx prisma generate

npm run dev
```

---

# よく使うコマンド

依存更新

```bash
npm install
```

Client生成

```bash
npx prisma generate
```

Migration

```bash
npx prisma migrate dev
```

DB確認

```bash
npx prisma studio
```

Build

```bash
npm run build
```

---

# トラブルシューティング

## prisma が見つからない

```
prisma is not recognized...
```

↓

```bash
npx prisma generate
```

---

## Neonへ接続できない

```
P1001
```

確認すること

- Neonが起動しているか
- DATABASE_URL
- POSTGRES_URL_NON_POOLING
- ネットワーク

---

## Riot API 401

Developer Key切れです。

Portalから新しいKeyを取得してください。

---

## Riot API 404

GameName / TagLine を確認してください。

```
RIOT_GAME_NAME
RIOT_TAG_LINE
```

---

# 開発ルール

- 日本語コメントを積極的に入れる
- CommunityDragonを優先利用
- Champion情報はDBに保持する
- Riot APIは必要最低限だけ叩く
- 表示はDBから行う

---

# 今後の予定

## 優先度 高

- [ ] 旧 Match テーブル廃止
- [ ] 旧 sync API廃止
- [ ] Cron整理
- [ ] README更新

---

## 優先度 中

- [ ] Windows(Tauri)アプリ
- [ ] 自動同期
- [ ] 試合ごとのLP増減
- [ ] パッチフィルター
- [ ] シーズンフィルター

---

## 優先度 低

- [ ] チャンピオン統計
- [ ] パッチ別勝率
- [ ] TFT Trait統計
- [ ] TFT Champion統計
- [ ] 使用アイテム統計

---

# 将来構想

## Web

- iPhoneから確認

## Windows App

- LoLプレイ中だけ起動
- 自動同期
- タスクトレイ常駐
- 通知

## 長期目標

OP.GGライクな自分専用ダッシュボードを完成させる。
