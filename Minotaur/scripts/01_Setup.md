# Video 1: The Setup (Connecting the Brains) 🧠

**Duration:** ~5 mins
**Goal:** User connects Exchange -> WonderTrading -> TradingView.

| VISUAL (Screen Recording) | AUDIO (Script) |
| :--- | :--- |
| **[Intro]** Face cam or Logo sting. | "Welcome back to OrangePulse. Today, we’re building the engine. We’re connecting your Exchange, WonderTrading, and TradingView so they talk to each other perfectly." |
| **[Screen]** Exchange API Page (Bybit/Kraken). Mouse hovering over 'Create Key'. | "Step 1: The Exchange. Go to API Settings. Create a 'System Generated Key'. This is crucial." |
| **[Screen]** Selecting Permissions (Read/Write, Orders). HIGHLIGHT 'Withdrawals' unchecked. | "Select 'Read-Write'. Check 'Orders' and 'Positions'. But NEVER check 'Withdrawals'. We want the bot to trade, not steal your funds." |
| **[Screen]** WonderTrading 'My Exchanges' page. Copying IP Address. | "Step 2: Security. Go to WonderTrading, copy this IP whitelist address. Paste it into your exchange. This locks the key to WonderTrading only." |
| **[Screen]** Pasting Key/Secret into WonderTrading. | "Copy the API Key and Secret. Paste them here. Click connect. If you see 'Active', you’re good." |
| **[Screen]** TradingView Chart (BTC/USDT Perp). Adding 'Accumulator V3'. | "Step 3: The Brain. Load up TradingView. Find the 'Bitcoin USDT Perpetual' chart. Add the 'Accumulator V3' indicator." |
| **[Screen]** Creating Alert. Pasting Webhook URL. | "Finally, the trigger. Create an Alert. Paste the Webhook URL from WonderTrading. This is the signal wire. When TradingView says buy, WonderTrading executes." |
| **[Outro]** Face cam. | "That’s it. The pipes are connected. In the next video, we’ll talk strategy. Why are we doing this? See you there." |
