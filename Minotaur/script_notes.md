# Notes for YouTube Video Scripts (OrangePulse)

Based on Minotaur transcripts (`video.rtf`).

## Video 1: Setup (API & Tools)
**Goal:** Guide user through connecting TradingView, WonderTrading, and Exchange.
**Source Material:** Videos 8, 9, 11 (API), 16, 17 (Setup).

**Key Steps:**
1.  **Prerequisites:** TradingView Account, WonderTrading Account, Exchange Account (Bybit/Kraken/BitGet).
2.  **API Creation (Exchange side):**
    *   Create "System Generated API Key".
    *   Permissions: Read/Write, Orders, Positions (NO Withdrawal/Transfer).
    *   IP Whitelist: Copy IP from WonderTrading.
3.  **WonderTrading Connection:**
    *   "My Exchanges" -> "Add New".
    *   Paste Key & Secret.
4.  **TradingView Setup:**
    *   Load correct chart (e.g., BTC/USDT Perpetual).
    *   Load Indicator (Accumulator V3).
    *   Create Alert (Webhook URL from WonderTrading).

## Video 2: Strategy Selection (The "Why")
**Goal:** Explain why we use Accumulator/DCA vs. High Frequency.
**Source Material:** Videos 13 (Power Law), 14 (Accumulator Demo), 18 (Patience).

**Key Concepts:**
1.  **The Problem:** Market volatility and "chop". Manual trading is emotional.
2.  **The Solution:** Mechanical DCA (Dollar Cost Averaging).
    *   *Base Order:* Initial entry.
    *   *Safety Orders:* Buying more as price drops to lower average entry.
    *   *Take Profit:* Small rallies (1.5% - 3%) clear the whole position.
3.  **Power Law:** Bitcoin has a "hard bottom" (mining cost). We trade knowing this floor exists.
4.  **Performance:** Shows example of April 2024 crash -> 19% gain despite market drop.

## Video 3: Position Sizing & Risk Management
**Goal:** How much money to put in? Using the Calculator.
**Source Material:** Video 15 (Position Sizing), Video 17 (Calculator).

**Key Concepts:**
1.  **The Calculator:** Essential tool before starting.
2.  **Inputs:**
    *   Wallet Size (e.g., $10k).
    *   Leverage (10x recommended max, usually isolated).
    *   Base/Safety Order Size.
3.  **The "Red Zone":** Ensure you have enough capital for all 10 Safety Orders.
4.  **Risk Levels:**
    *   *Conservative:* Cover 40%+ drop.
    *   *Aggressive:* Cover 25% drop.
5.  **Golden Rule:** Don't over-leverage. 1-2% position size is "sleep well" mode.
