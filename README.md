# Cosmic Card Oracle

“请帮我创建一个基于 Next.js 的塔罗牌单页应用。 风格：极简、深色星空、带有金色动态粒子效果。 功能：

首页显示 78 张牌的背面，点击可进入‘每日一牌’百科页面。

核心抽牌区：用户输入问题后，利用 LLM 语义识别意图。如果是决策类，自动展示‘二选一’牌阵；如果是运势类，展示‘时间流三牌阵’。

集成抽牌仪式感：用户点击洗牌，手动挑选卡牌。

解析区：预留一个 API 接口，准备接入 Gemini 1.5 Flash。

限制：利用 LocalStorage 实现每人每天免费一次的限制。”

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mimitarot.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6279cdf5-30cc-4670-bc02-3c501be10b71).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
