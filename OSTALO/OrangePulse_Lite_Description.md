# OrangePulse v3.0 Lite - TradingView Description & Feature Comparison

## TradingView Description

```
🍊 OrangePulse v3.0 Lite - Free Mean Reversion DCA Strategy

A simplified, open-source version of the OrangePulse trading bot featuring:

📈 Strategy:
• Mean Reversion using Bollinger Bands + RSI
• Automatic entry when price touches lower BB with RSI oversold (LONG)
• Works in both LONG and SHORT directions

💰 DCA (Dollar Cost Averaging):
• Up to 3 Safety Orders to average down your position
• Customizable Volume Scale and Step Scale
• Price Deviation settings for SO trigger levels

🎯 Risk Management:
• Take Profit % exit
• Stop Loss % exit  
• Simple Trailing TP option

📊 Visualization:
• Yellow AVG price line
• Green TP level line
• Orange SO trigger lines
• Status table with real-time position info

⚙️ Settings:
• Time window for trading
• Order sizes in USD
• All DCA parameters customizable
• Cooldown settings between orders

---

🔒 Looking for more? The full OrangePulse v3.0 includes:
• 4 entry strategies (MeanReversion, TrendPullback, Breakout, MicroBreakout)
• Unlimited Safety Orders + Emergency SO
• Advanced 3-stage Trailing TP (ARM → BUFFER → TRAIL)
• WunderTrading & 3Commas integration with JSON signals
• TP/SL at specific price levels
• Fee tracking (Maker/Taker/Funding)
• Manual mode, Start at Price, Stop on Exit
• And much more!

Visit our website for the full version.

---

⚠️ Disclaimer: This script is for educational purposes only. Past performance does not guarantee future results. Always do your own research and trade responsibly.
```

---

## Feature Comparison Table

| Feature | OrangePulse v3.0 Lite | OrangePulse v3.0 (Full) |
|---------|----------------------|-------------------------|
| **Entry Strategies** | 1 (MeanReversion) | 4 (MeanReversion, TrendPullback, Breakout, MicroBreakout) |
| **Safety Orders** | Up to 3 | Unlimited |
| **Emergency SO (MSO)** | ❌ | ✅ (3 time-based) |
| **Volume Scale** | ✅ | ✅ |
| **Step Scale** | ✅ | ✅ |
| **Price Deviation** | ✅ | ✅ |
| **Take Profit %** | ✅ | ✅ |
| **Stop Loss %** | ✅ | ✅ |
| **Trailing TP** | ✅ Simple | ✅ 3-stage (ARM→BUFFER→TRAIL) |
| **TP at Price** | ❌ | ✅ |
| **SL at Price** | ❌ | ✅ |
| **SL in Profit** | ❌ | ✅ |
| **Manual Mode** | ❌ | ✅ |
| **Start at Price** | ❌ | ✅ |
| **Stop on Exit** | ❌ | ✅ |
| **Pause Bot** | ❌ | ✅ |
| **WunderTrading** | ❌ | ✅ (JSON signals) |
| **3Commas** | ❌ | ✅ (JSON signals) |
| **Fee Tracking** | ❌ | ✅ (Maker/Taker/Funding) |
| **Status Table** | ✅ 8 rows | ✅ 15 rows |
| **SO Line Visualization** | ✅ | ✅ |
| **AVG/TP Lines** | ✅ | ✅ + stepline history |
| **Cooldowns** | ✅ Basic | ✅ Advanced |
| **Time Window** | ✅ | ✅ |
| **LONG/SHORT** | ✅ | ✅ |

---

## Code Size Comparison

| Metric | v3.0 Lite | v3.0 Full |
|--------|-----------|-----------|
| Lines of code | ~420 | ~1,900 |
| Input parameters | ~20 | ~60+ |
