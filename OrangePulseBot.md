//@version=6
strategy("OrangePulse v3.0 (USD, Modes: Trend/Pullback, Breakout, MeanReversion)", overlay=true, pyramiding=50, default_qty_type=strategy.fixed, initial_capital=1000000, calc_on_order_fills=true, calc_on_every_tick=false, process_orders_on_close=true, max_lines_count=500)

// ====== Time Window ======
int start_time = input.time(timestamp("01 Sep 2025 00:00"), "Start Trading Time", tooltip="Bot will only trade after this date/time")
int end_time = input.time(timestamp("01 Jan 2050 00:00"), "End Trading Time", tooltip="Bot will stop trading after this date/time")
bool in_time_window = time >= start_time and time <= end_time

// ====== Direction ======
string direction = input.string("LONG", "Direction", options=["LONG", "SHORT"], tooltip="Trading direction: LONG (buy low, sell high) or SHORT (sell high, buy low)")

// ====== Wundertrading (custom signals) ======
bool wt_enable = input.bool(false, "Enable WunderTrading signals (JSON)", group="WunderTrading", tooltip="Enable signals for WunderTrading; cannot be used with 3Commas")
string wt_enter_long_code = input.string("", "WT Enter Long Code", group="WunderTrading", tooltip="Enter the specific 'code' from WunderTrading bot settings for long entry")
string wt_enter_short_code = input.string("", "WT Enter Short Code", group="WunderTrading", tooltip="Enter the specific 'code' from WunderTrading bot settings for short entry")
string wt_exit_all_code = input.string("", "WT Exit All Code", group="WunderTrading", tooltip="Enter the specific 'code' from WunderTrading bot settings for exit")
//string wt_amount_type = input.string("quote", "WT Amount Type", options=["base", "quote", "percents", "contracts"], group="WunderTrading", tooltip="'quote' for USD, 'base' for coin qty, 'percents' for % balance")
const string wt_amount_type = "quote"
const string wt_order_type = "market"

// ====== 3Commas (custom signals) ======
bool cm_enable = input.bool(false, "Enable 3Commas signals (JSON)", group="3Commas", tooltip="Enable signals for 3Commas; cannot be used with WunderTrading")
int cm_bot_id = input.int(0, "3Commas Bot ID", group="3Commas", tooltip="Enter the Bot ID from your 3Commas DCA bot setup")
string cm_email_token = input.string("", "3Commas Email Token", group="3Commas", tooltip="Enter the Email Token (account ID) from your 3Commas bot setup")
//float cm_delay_seconds = input.float(0.0, "Delay Seconds", minval=0.0, group="3Commas", tooltip="Delay for signal execution, default 0")
const float cm_delay_seconds = 0.0
//string cm_pair = input.string("", "Custom Pair (leave blank for auto)", group="3Commas", tooltip="Optional: Custom pair format, e.g. 'USDT_BTCUSDT'; if blank, auto-generates from symbol")
const string cm_pair = ""
//bool cm_use_limit_for_so = input.bool(false, "Use Limit Orders for SO (with price)", group="3Commas", tooltip="If true, includes 'price' in SO signals for limit orders; otherwise market")
bool cm_use_limit_for_so = false

// Switch between normal strategy selection and always-on MicroBreakout
string market_entry_mode = input.string("Normal", "Market Entry Mode", options=["Normal", "Manual"], group="Entry Settings • Mode & General", tooltip="Normal: uses selected strategy. Manual: ultra-fast MicroBreakout (1-bar lookback), auto-disarms after first TP")

// ====== Start Settings ======
bool use_start_price = input.bool(false, "Manual Start at Price", group="Start Settings", tooltip="Activates Manual mode (ultra-fast 1-bar MicroBreakout) when price crosses specified level. Bot enters immediately on next breakout, then returns to Normal mode after TP. One-time trigger per enable/disable.")
string start_condition = input.string("Above", "Start Condition", options=["Above", "Below"], group="Start Settings", tooltip="Trigger Manual mode when price crosses Above or Below the specified level")
float start_price = input.float(100000.0, "Start Price", group="Start Settings", minval=0.0, tooltip="Price level that triggers Manual mode activation (e.g., 95000 for quick entry at $95k)")

// ====== Exits (TP / Trail / SL) ======
bool use_tp = input.bool(true, "Take Profit %", inline="tp", group="Take Profit Settings", tooltip="Enable Take Profit exit at specified % gain from average entry price")
float tp_pct = input.float(1, "", minval=0.05, inline="tp", group="Take Profit Settings", tooltip="Take Profit percentage (e.g., 1.5 = exit at 1.5% profit)")

bool use_trail_tp = input.bool(false, "Trail TP %", inline="trailtp", group="Take Profit Settings", tooltip="Enable staged trailing stop with buffer protection")
float trail_tp_activation_pct = input.float(1.0, "", minval=0.1, inline="trailtp", group="Take Profit Settings", tooltip="Stage 1: ARM activation % above AVG")
float trail_tp_trail_pct = input.float(0.5, "Tr", minval=0.01, inline="trailtp", group="Take Profit Settings", tooltip="Stage 3: Trail distance % from peak (activates at ARM + Trail)")
float trail_tp_buffer_pct = input.float(0.2, "Buf", minval=0.0, inline="trailtp", group="Take Profit Settings", tooltip="Stage 2: Buffer protection % (exit if falls below ARM - Buffer)")
const int trail_min_bars_after_arm = 1

// ====== Follow TP (%) ======
//bool use_follow_tp = input.bool(false, "Follow TP (%)", inline="followtp", group="Take Profit Settings", tooltip="Trailing take-profit that activates at threshold, follows price upward. Disables TP %, TP at Price, and Trail TP when enabled.")
//float follow_tp_activation_pct = input.float(1.0, "", minval=0.1, inline="followtp", group="Take Profit Settings", tooltip="Activation threshold % above AVG (e.g., 1.0 = arms when +1% profit)")
//float follow_tp_trail_pct = input.float(0.5, "Trail", minval=0.01, inline="followtp", group="Take Profit Settings", tooltip="Trail distance % from peak (e.g., 0.5 = exit if price drops 0.5% from highest point)")
const bool use_follow_tp = false  // Hidden - disabled by default
const float follow_tp_activation_pct = 1.0
const float follow_tp_trail_pct = 0.5

// ====== Take Profit at Price ======
bool use_tp_at_price = input.bool(false, "TP at Price", inline="tprice", group="Take Profit Settings", tooltip="Exit position at specified price to take profit. For LONG: price must be above average entry. For SHORT: price must be below average entry. Takes priority over % TP and Trail if reached first.")
float tp_price_level = input.float(115000.0, "", inline="tprice", group="Take Profit Settings", minval=0.0, tooltip="Exact price level for take profit exit (e.g., $98000 for LONG to exit at resistance)")
    
bool use_sl = input.bool(false, "Stop Loss (%)", inline="sl", group="Exit Settings", tooltip="Enable Stop Loss exit at specified % loss from average entry price")
bool tp_before_last_so = input.bool(false, "Stop Loss at Last SO", group="Exit Settings", tooltip="When enabled and SL is OFF, if conditions for the last SO would be met, the position is closed instead of adding that last SO. Triggers on bar close (same gates as SO). Displayed as “TP last SO” in the table.")

float sl_pct = input.float(3.0, "", minval=0.1, inline="sl", group="Exit Settings", tooltip="Stop Loss percentage (e.g., 3.0 = exit at 3% loss)")

bool use_sl_at_price = input.bool(false, "SL at Price", inline="slprice", group="Exit Settings", tooltip="Exit position at specified price to limit loss. For LONG: price must be below average entry. For SHORT: price must be above average entry. Takes priority over % SL if reached first.")
float sl_price_level = input.float(116900.0, "", inline="slprice", group="Exit Settings", minval=0.0, tooltip="Exact price level for stop loss exit (e.g., $92000 for LONG to cut losses at support)")


// ====== Stop Loss in Profit at Price ======
bool use_sl_profit_at_price = input.bool(false, "SL in Profit at Price/Percent", inline="slprofit", group="Exit Settings", tooltip="Manual protective stop in profit zone. For LONG: price/% must be between AVG and current price. For SHORT: price/% must be between current price and AVG. Set during trade to lock minimum profit.")
string sl_profit_type = input.string("Percent", "", options=["Percent", "Price"], inline="slprofit", group="Exit Settings", tooltip="Choose between percentage from AVG or absolute price level")
float sl_profit_value = input.float(0.5, "", inline="slprofit", group="Exit Settings", minval=0.0, tooltip="Value: % above AVG (e.g., 0.5 = lock profit at +0.5%) or exact price (e.g., $121000)")

// === Stop on Exit
bool stop_on_exit = input.bool(false, "Stop on Exit", group="Stop/Pasue Bot", tooltip="After any exit (TP/SL/Trail/Exit Price/TP@LastSO), stop the bot (Status=OFF) and block new entries until you manually resume or other logic re-enables entries.")  // Unconditional stop after exit

// === Pause BOT ===
bool pause_bot = input.bool(false, "Pause BOT", group="Stop/Pasue Bot", tooltip="Pause bot: blocks new entries when flat; use only when idle")

// --- Stateless pause derivation (survives reloads) ---
bool pause_now_paused = pause_bot and (strategy.position_size == 0)   // flat & paused => block BO
bool pause_now_armed  = pause_bot and (strategy.position_size != 0)   // in position => only "PAUSE ARMED" label
bool pause_blocks_new_bo = pause_now_paused                            // gate for can_enter()

//bool use_exit_price_stop = input.bool(false, "Stop on Price Condition", group="Exit Settings", tooltip="If enabled, close the position when price reaches the specified level in the chosen direction (Above/Below). Triggers on bar close.")  //  Conditional stop based on price
//string exit_price_condition = input.string("Below", "Price Condition", options=["Above", "Below"], group="Exit Settings", tooltip="Exit when price goes Above or Below the specified Exit Price")
//float exit_condition_price = input.float(100000.0, "Exit Price", group="Exit Settings", tooltip="Price level for conditional exit (e.g., exit when price drops below 95000)")

// ====== Checking simultaneous activation of WT and CM ======
if wt_enable and cm_enable
    runtime.error("Cannot enable both WunderTrading and 3Commas signals simultaneously")

// --- Fee accounting (per active position session) ---
var float fee_buy_cum_usd     = 0.0   // cumulative entry fees (BO + SO fills)
var float fee_funding_cum_usd = 0.0   // funding fees accumulated over time (can be negative)
var int   funding_last_ms     = na    // last timestamp for accumulation

// ====== Bot Stopped (now controls logic) ======
var bool bot_stopped = false  // : Manages bot state (ON/OFF)

// Stop on Exit - single-use tracking
var int stop_on_exit_armed_bar = na
var bool stop_on_exit_prev = false

// Runtime Manual state
var bool manual_disarmed         = false   // show “MANUAL DISARMED” during the first manual session until TP
var bool manual_disabled_global  = false   // after the first TP in Manual: treat it as Normal until the user changes the UI

// --- Manual auto-disarm state (internal, no user input) ---
var string prev_entry_mode = na

// Track cumulative realized profit across all sessions
var float total_realized_pnl_usd = 0.0  // cumulative profit/loss from all closed trades

// Track user flips of Market entry mode; re-arm Manual on explicit toggle
if na(prev_entry_mode)
    prev_entry_mode := market_entry_mode
if market_entry_mode != prev_entry_mode
    manual_disarmed := false
    prev_entry_mode := market_entry_mode

// Pause bot vars
var label pause_lbl = na

// Start Price → Manual state
var bool start_price_forced_manual = false  // Start Price aktiviral Manual mode
var bool start_price_completed = false      // Start Price job completed (one-time flag)

// TP/SL at Price → one-time completion flags
var bool tp_at_price_completed = false      // TP at Price job completed (one-time flag)
var bool sl_at_price_completed = false      // SL at Price job completed (one-time flag)

// Stop Loss in Profit at Price → target
var float sl_profit_price_target = na       // Validated SL in Profit target price

// ====== Start Price Logic (with Manual activation) ======
var bool trading_started = false

// Activate Manual mode when Start on Price is enabled (immediate UI feedback)
if use_start_price and not start_price_forced_manual and not start_price_completed
    start_price_forced_manual := true

// Deactivate when user disables Start on Price
if not use_start_price
    start_price_forced_manual := false
    start_price_completed := false  // Reset when user disables

// Check if start price condition is met
if use_start_price and in_time_window and not trading_started
    bool start_price_valid = not na(start_price) and start_price > 0
    if not start_price_valid
        label.new(bar_index, close, "Error: Invalid Start Price!", color=color.red, style=label.style_label_down, textcolor=color.white)
    bool start_met = start_price_valid and (start_condition == "Above" ? (close >= start_price) : (close <= start_price))
    if start_met
        trading_started := true
        bot_stopped := false

// ====== Order Sizes (USD) ======
float bo_usd = input.float(1000, "BO Size (USD)", minval=1, group="Order Sizes (USD)", tooltip="Base Order size in USD (initial position entry)")
float so_usd_l1 = input.float(1000, "SO Size (USD)", minval=1, group="Order Sizes (USD)", tooltip="First Safety Order size in USD (subsequent SOs scale by Volume Scale)")

// ====== DCA Settings ======
int so_number = input.int(10, "SO Number", minval=0, group="DCA Settings", tooltip="Total number of Safety Orders (additional buys/sells to average down/up)")
float pd_pct = input.float(0.5, "Price Deviation %", minval=0.05, group="DCA Settings", tooltip="Price deviation for first SO (e.g., 0.5 = SO1 triggers 0.5% away from BO)")
float vs = input.float(1.55, "Volume Scale", minval=0.1, group="DCA Settings", tooltip="Each SO size multiplier (e.g., 1.55: SO2 = SO1 × 1.55, SO3 = SO2 × 1.55, etc.)")
float sc = input.float(1.05, "Step Scale", minval=0.1, group="DCA Settings", tooltip="Price deviation multiplier for each SO (e.g., 1.05: SO2 at 0.5%×1.05, SO3 at 0.5%×1.05², etc.)")
int cooldown_after_exit = input.int(4, "Cooldown after EXIT", minval=0, group="DCA Settings", tooltip="Number of bars to wait after position exit before allowing new BO (Normal mode)")
int cooldown_after_exit_manual = 3
int cooldown_after_bo = input.int(4, "Cooldown after BO", minval=0, group="DCA Settings", tooltip="Number of bars to wait after BO before allowing first SO")
int so_cooldown_bars = input.int(4, "Cooldown after SO", minval=0, group="DCA Settings", tooltip="Number of bars to wait between consecutive SOs (0 = next SO allowed on following bar)")
float so_close_tolerance = input.float(1.0, "SO Close Tolerance %", minval=0.0, group="DCA Settings", tooltip="SO fills if close is within this % of trigger level (e.g., 1.0 = SO fills if close ≤ trigger×1.01 for LONG)")

// ====== Emergency SO (MSO) Settings ======
bool mso_enable = input.bool(false, "Enable Emergency SO", group="Emergency SO", tooltip="Enable 3 additional emergency Safety Orders after all normal SOs are filled")

float mso1_usd = input.float(10000, "MSO1 (USD)", minval=1, inline="mso1", group="Emergency SO", tooltip="MSO1 order size in USD")
int mso1_time = input.time(timestamp("01 Jan 2050 00:00"), "", inline="mso1", group="Emergency SO", tooltip="MSO1 triggers after this time (set to future time)")

float mso2_usd = input.float(20000, "MSO2 (USD)", minval=1, inline="mso2", group="Emergency SO", tooltip="MSO2 order size in USD")
int mso2_time = input.time(timestamp("01 Jan 2050 00:00"), "", inline="mso2", group="Emergency SO", tooltip="MSO2 triggers after this time")

float mso3_usd = input.float(30000, "MSO3 (USD)", minval=1, inline="mso3", group="Emergency SO", tooltip="MSO3 order size in USD")
int mso3_time = input.time(timestamp("01 Jan 2050 00:00"), "", inline="mso3", group="Emergency SO", tooltip="MSO3 triggers after this time")

// ====== Fees (Maker/Taker/Funding) ======
float maker_fee_pct  = input.float(0.02, "Maker Fee (Limit Orders)(%)",  minval=0.0, group="Fees",
     tooltip="Limit orders resting in the book. Percent, e.g. 0.02 = 0.02%.")
float taker_fee_pct  = input.float(0.05, "Taker Fee (Market Orders)(%)",  minval=0.0, group="Fees",
     tooltip="Market/IOC. Percent, e.g. 0.05 = 0.05%. Used for BO/SO and exit projection.")
float funding_8h_pct = input.float(0.01, "Funding per 8h (%)", step=0.0001, group="Fees",
     tooltip="Perpetuals funding rate per 8 hours. Positive = LONG pays, SHORT receives (and vice versa).")

// ====== Visualization Settings ======
//bool soLabelToggle = input.bool(false, "Show SO labels", group="Visualization Settings")
bool soLabelToggle = false  // hidden; the button disappears, the variable remains
bool show_so_lines = input.bool(true, "Show orange SO Lines", group="Visualization Settings")
//bool show_so_labels = input.bool(false, "Show orange SO Labels", group="Visualization Settings")
bool show_so_labels = false
// --- AVG/TP history (plot) & stepline detail ---
bool show_avg_tp_history = input.bool(false, "Show AVG/TP History (plot)", group="Visualization Settings", tooltip="Show always-on plot lines for AVG and TP across all bars; avoids 500 line-object limit.")
int  stems_cap = input.int(180, "Stepline detail (stems)", minval=50, maxval=400, group="Visualization Settings", tooltip="Max number of vertical connector lines kept for AVG/TP stepline (per series). Lower = fewer line objects, higher = more detail.")

// ===== Status Table (fixed corner) =====
bool show_status_table = input.bool(true, "Show Status Table", group="Visualization Settings")
string status_table_corner = input.string("Bottom Right", "Status Table Corner", 
     options=["Bottom Right", "Bottom Left", "Top Right", "Top Left"], group="Visualization Settings")

// ====== Entry Mode (choose one) ======
string entry_mode = input.string("MeanReversion", "Market Entry Strategy", options=["MeanReversion", "TrendPullback", "Breakout", "MicroBreakout"], group="Entry Settings • Mode & General", tooltip="Select entry strategy: MeanReversion (BB+RSI), TrendPullback (MA+MACD), Breakout (range+volume), MicroBreakout (Donchian)")

// --- Mean Reversion (BB + RSI) params ---
int mr_bb_len = input.int(20, "BB Period", minval=5, group="Entry • MeanReversion", tooltip="Bollinger Bands period for mean reversion detection")
float mr_bb_mult = input.float(2.0, "BB Mult", minval=0.5, group="Entry • MeanReversion", tooltip="Bollinger Bands standard deviation multiplier")
float mr_rsi_long = input.float(30, "RSI Oversold (LONG <)", minval=1, maxval=99, group="Entry • MeanReversion", tooltip="RSI threshold for LONG entry (price touches lower BB and RSI < this value)")
float mr_rsi_short = input.float(70, "RSI Overbought (SHORT >)", minval=1, maxval=99, group="Entry • MeanReversion", tooltip="RSI threshold for SHORT entry (price touches upper BB and RSI > this value)")
bool mr_use_trend = input.bool(false, "Use Trend Filter (EMA200)", group="Entry • MeanReversion", tooltip="If enabled, only enter LONG above EMA200 or SHORT below EMA200")
float mr_min_dist_ema = input.float(0.0, "Min distance from EMA50 (%)", minval=0.0, group="Entry • MeanReversion", tooltip="Minimum distance from EMA50 to avoid entries too close to moving average (0 = no filter)")

// --- Trend + Pullback params ---
int trend_ma_len = input.int(200, "Trend MA Length", minval=10, group="Entry • TrendPullback", tooltip="Primary trend moving average period (e.g., EMA200)")
int pull_ma_len = input.int(20, "Pullback MA Length", minval=5, group="Entry • TrendPullback", tooltip="Pullback detection moving average (e.g., EMA20)")
float rsi_pull_long = input.float(40, "RSI Pullback (LONG ≤)", minval=1, maxval=99, group="Entry • TrendPullback", tooltip="RSI must be ≤ this value during pullback for LONG entry")
float rsi_pull_short = input.float(60, "RSI Pullback (SHORT ≥)", minval=1, maxval=99, group="Entry • TrendPullback", tooltip="RSI must be ≥ this value during pullback for SHORT entry")
string tp_confirm = input.string("MACD", "Momentum Confirm", options=["MACD", "MA Reclaim"], group="Entry • TrendPullback", tooltip="Confirmation signal: MACD crossover or price reclaiming pullback MA")
int tp_pullback_lookback = input.int(10, "Pullback lookback (bars)", minval=1, group="Entry • TrendPullback", tooltip="How many bars to look back for pullback touch (price touching pullback MA)")
int tp_confirm_lookback = input.int(2, "Confirm lookback (bars)", minval=0, group="Entry • TrendPullback", tooltip="How many bars to look back for confirmation signal (MACD cross or MA reclaim)")
int tp_rsi_window = input.int(5, "RSI window (bars)", minval=1, group="Entry • TrendPullback", tooltip="RSI condition must be met within this many recent bars")

// --- Breakout + Squeeze params ---
int bo_range_len = input.int(20, "Range Length (bars)", minval=5, group="Entry • Breakout", tooltip="Lookback period for breakout high/low detection")
bool bo_use_vol = input.bool(true, "Volume Confirm", inline="bov", group="Entry • Breakout", tooltip="Require volume confirmation for breakout validity")
float bo_vol_factor = input.float(1.2, "", minval=1.0, inline="bov", group="Entry • Breakout", tooltip="Volume must be > this multiplier × average volume (e.g., 1.2 = 20% above average)")
int bo_vol_len = input.int(20, "Volume SMA Len", minval=1, group="Entry • Breakout", tooltip="Volume moving average period for comparison")
bool bo_use_squeeze = input.bool(true, "Squeeze Filter (BB width % < threshold)", inline="bosq", group="Entry • Breakout", tooltip="Only enter if Bollinger Bands width is compressed (low volatility)")
float bo_bw_pct_max = input.float(5.0, "", minval=0.1, inline="bosq", group="Entry • Breakout", tooltip="Maximum BB width as % of price for squeeze filter (e.g., 5.0 = BB width < 5% of price)")
int bo_bb_len = input.int(20, "BB Period (for squeeze)", minval=5, group="Entry • Breakout", tooltip="Bollinger Bands period for squeeze detection")
float bo_bb_mult = input.float(2.0, "BB Mult (for squeeze)", minval=0.5, group="Entry • Breakout", tooltip="Bollinger Bands multiplier for squeeze detection")
bool bo_use_trend = input.bool(false, "Use Trend Filter (EMA200)", group="Entry • Breakout", tooltip="If enabled, only enter LONG above EMA200 or SHORT below EMA200")

// --- Micro-Breakout (Donchian) params ---
int mb_len = input.int(3, "Donchian Lookback (bars)", minval=1, group="Entry • MicroBreakout", tooltip="Donchian channel lookback period (e.g., 3 = break of 3-bar high/low)")
int mb_eps_ticks = input.int(1, "Epsilon (ticks)", minval=0, group="Entry • MicroBreakout", tooltip="Price must exceed Donchian level by this many ticks (0 = exact level)")
bool mb_require_close = input.bool(false, "Require Close beyond level", group="Entry • MicroBreakout", tooltip="If ON, bar close must be beyond level; if OFF, intrabar high/low is enough")
    
// --- Manual mode • MicroBreakout overrides ---
int  mbm_len           = 1
int  mbm_eps_ticks     = 1
bool mbm_require_close = false

// ====== Indicators (shared) ======
[macdLine, signalLine, macdHist] = ta.macd(close, 12, 26, 9)
float rsi = ta.rsi(close, 14)
float ema_trend = ta.ema(close, trend_ma_len)
float ema_pull = ta.ema(close, pull_ma_len)
float ema50 = ta.ema(close, 50)

float bb_basis_br = ta.sma(close, bo_bb_len)
float bb_dev_br = ta.stdev(close, bo_bb_len) * bo_bb_mult
float bb_upper_br = bb_basis_br + bb_dev_br
float bb_lower_br = bb_basis_br - bb_dev_br
float bb_width_pct_br = bb_basis_br != 0 ? (100.0 * (bb_upper_br - bb_lower_br) / bb_basis_br) : na

float vol_sma = ta.sma(volume, bo_vol_len)

float mr_basis = ta.sma(close, mr_bb_len)
float mr_dev = ta.stdev(close, mr_bb_len) * mr_bb_mult
float mr_upper = mr_basis + mr_dev
float mr_lower = mr_basis - mr_dev

// ====== DCA ladder state ======
var bool ladder_active = false
var float bo_ref_price = na
var so_prices = array.new_float()
var so_usds = array.new_float()
var so_filled = array.new_bool()
var int lastSOBar = na
var float bo_price = na
var int so_next_idx = 0
var int so_armed_idx = -1
var float last_so_fill_price = na

// ====== MSO State ======
var int mso_next_idx = 0           // 0,1,2 = next MSO to fill; 3 = all MSOs filled
var int last_mso_bar = na          // bar index of last MSO fill
var float last_mso_fill_price = na // price of last MSO fill
var bool mso_can_toggle = true     // can user toggle mso_enable? (false after first MSO fill)

// ====== Helpers ======
f_qty_from_usd(usd, price) =>
    price > 0 ? usd / price : 0.0

f_to_tick(p) =>
    math.round(p / syminfo.mintick) * syminfo.mintick

// ---- Funds helpers (no UI) ----
f_invested_usd_sofar() =>
    float inv = 0.0
    // BO counts as bo_usd if position is open
    if strategy.position_size != 0
        inv += bo_usd
    /// add already filled SO USD
    if array.size(so_filled) > 0
        for i = 0 to array.size(so_filled) - 1
            if array.get(so_filled, i)
                inv += array.get(so_usds, i)
    inv

f_can_afford_next_so(float next_so_usd) =>
    float budget   = strategy.initial_capital
    float invested = f_invested_usd_sofar()
    (budget - invested) >= next_so_usd

// ====== SO Line Drawing (horizontal next-SO levels) ======
var line[] so_lines = array.new_line(0)
var label[] so_labels = array.new_label(0)

// ====== MSO Line Drawing ======
var line[] mso_lines = array.new_line(0)
var label[] mso_labels = array.new_label(0)

// ====== Var for Cooldown after EXIT
var int last_exit_bar = na

// Re-entry unlock (normal/manual)
var int reenter_unlock_bar_normal = na
var int reenter_unlock_bar_manual = na

f_draw_so_line(float _price, int _level) =>
    if not na(_price)
        var line _l = na
        var label _lbl = na
        if show_so_lines
            _l := line.new(bar_index, _price, bar_index + 1, _price, extend=extend.none, color=color.orange, width=2, style=line.style_dotted)
            array.push(so_lines, _l)
        if show_so_labels
            _lbl := label.new(bar_index, _price, "SO" + str.tostring(_level), xloc=xloc.bar_index, yloc=yloc.price, style=label.style_label_left, color=color.orange, textcolor=color.black, size=size.small)
            array.push(so_labels, _lbl)
        _l

f_end_last_line() =>
    if array.size(so_lines) > 0
        line _last = array.get(so_lines, array.size(so_lines) - 1)
        line.set_x2(_last, bar_index)
        line.set_extend(_last, extend.none)

// ====== MSO Helpers (Time-based) ======
f_mso_is_active(int idx) =>
    // MSO is active if: enable ON, time has passed, and not yet filled
    bool active = mso_enable and mso_next_idx <= idx
    if idx == 0
        active := active and time >= mso1_time
    else if idx == 1
        active := active and time >= mso2_time
    else if idx == 2
        active := active and time >= mso3_time
    active

f_mso_get_usd(int idx) =>
    idx == 0 ? mso1_usd : idx == 1 ? mso2_usd : mso3_usd

f_draw_mso_line(float _price, int _level) =>
    if not na(_price) and _price > 0
        var line _l = na
        var label _lbl = na
        if show_so_lines  // reuse existing toggle
            _l := line.new(bar_index, _price, bar_index + 1, _price, extend=extend.none, color=color.purple, width=2, style=line.style_dotted)
            array.push(mso_lines, _l)
        if show_so_labels  // reuse existing toggle
            _lbl := label.new(bar_index, _price, "MSO" + str.tostring(_level), xloc=xloc.bar_index, yloc=yloc.price, style=label.style_label_left, color=color.purple, textcolor=color.white, size=size.small)
            array.push(mso_labels, _lbl)
        _l

f_clear_mso_lines() =>
    if array.size(mso_lines) > 0
        for i = 0 to array.size(mso_lines) - 1
            line.delete(array.get(mso_lines, i))
        array.clear(mso_lines)
    if array.size(mso_labels) > 0
        for i = 0 to array.size(mso_labels) - 1
            label.delete(array.get(mso_labels, i))
        array.clear(mso_labels)

// Keep bo_price updated while in position
if strategy.position_size != 0
    bo_price := strategy.position_avg_price

f_build_ladder(float basePrice, string dir, float prevFillPrice = na) =>
    array.clear(so_prices)
    array.clear(so_usds)
    array.clear(so_filled)

    float prev = na(prevFillPrice) ? basePrice : prevFillPrice
    float usd  = so_usd_l1

    // i = 0..so_number-1 ; korak_i = BO * (pd_pct * sc^i / 100)
    for i = 0 to so_number - 1
        float step_pct = pd_pct * math.pow(sc, i)
        float delta    = basePrice * (step_pct / 100.0)
        float raw_price = dir == "LONG" ? (prev - delta) : (prev + delta)
        float price_q   = f_to_tick(raw_price)

        // ensure a strictly monotonic ladder
        if dir == "LONG"
            if price_q >= prev
                price_q := prev - syminfo.mintick
        else
            if price_q <= prev
                price_q := prev + syminfo.mintick

        array.push(so_prices, price_q)
        array.push(so_usds, usd)
        array.push(so_filled, false)

        prev := price_q
        usd  := usd * vs

// ====== Trailing state ======
var float hh_since_entry = na
var float ll_since_entry = na
var bool trail_is_armed = false
var int  trail_arm_bar  = na
var string trail_stage = "DISARMED"  // "DISARMED", "BUFFER", "TRAILING"
var float hh_since_trail_activation = na  // Peak tracking for trailing stage
var float ll_since_trail_activation = na

// ====== Follow TP state ======
var bool follow_tp_armed = false                 // Follow TP armed status
var float follow_tp_activation_pct_locked = na   // Locked activation % when armed
var float follow_tp_trail_pct_locked = na        // Locked trail % when armed
var float hh_since_follow_activation = na        // HH tracking for Follow TP (LONG)
var float ll_since_follow_activation = na        // LL tracking for Follow TP (SHORT)

// Track entry time (ms since epoch) for duration display
var int entry_time_ms = na

// ====== Cooldown ======
var int last_entry_bar = na

// Helper: did we exit on this bar (blocks re-entry on the same bar)
f_exited_this_bar() =>
    not na(last_exit_bar) and (bar_index == last_exit_bar)

// Helper: has the cooldown after EXIT expired (separately for Normal/Manual)
f_can_reenter() =>
    int unlock = market_entry_mode == "Manual" ? reenter_unlock_bar_manual : reenter_unlock_bar_normal
    na(unlock) or (bar_index > unlock)   // strict >: counts full bars after EXIT

// Unified truth function for BO gating (Normal & Manual)
can_enter() =>
    in_time_window and not bot_stopped and (not use_start_price or trading_started) and not pause_blocks_new_bo and f_can_reenter() and not f_exited_this_bar()

// ====== Position session id (for viz line breaks) ======
var int pos_session = 0

// Alert queue (BO/SO/EXIT)
var bool   bo_alert_due = false
var string bo_alert_msg = ""
var bool   so_alert_due = false
var string so_alert_msg = ""
var bool   exit_alert_due = false
var string exit_alert_msg_q = ""   // global EXIT message queue

// NEW: bar-based guards (deterministic)
var int last_alert_bar_any  = na
var int last_alert_bar_bo   = na
var int last_alert_bar_so   = na
var int last_alert_bar_exit = na

bool can_send_alert_this_bar = na(last_alert_bar_any) or bar_index > last_alert_bar_any

// Runtime reset, if the UI is already on "Normal" (before computing signals)
if market_entry_mode == "Normal"
    manual_disabled_global := false
    manual_disarmed := false

// Stop on Exit - arm only when we're in live trading zone
if barstate.isfirst
    stop_on_exit_prev := stop_on_exit

// Detect toggle ON → arm if we're close to realtime (last bar)
if stop_on_exit and not stop_on_exit_prev
    if barstate.islast
        stop_on_exit_armed_bar := bar_index

// Detect toggle OFF → disarm
if not stop_on_exit and stop_on_exit_prev
    stop_on_exit_armed_bar := na
    
stop_on_exit_prev := stop_on_exit

// Also arm on last bar if enabled (catch case where it's toggled during replay)
if barstate.islast and stop_on_exit and na(stop_on_exit_armed_bar)
    stop_on_exit_armed_bar := bar_index

// ====== MSO Toggle Lock ======
// After first MSO fill, user can no longer toggle mso_enable (only delete prices)
if mso_next_idx > 0
    mso_can_toggle := false

// ====== Entry Mode logic ======
bool sig_trendpullback = false
bool sig_breakout = false
bool sig_meanrev = false
bool sig_microbo = false

// Unconditional MicroBreakout signal (Manual mode uses dedicated params)
bool  sig_microbo_manual = false
float _mbm_high = ta.highest(high[1], mbm_len)
float _mbm_low  = ta.lowest(low[1],  mbm_len)
float _mbm_eps  = mbm_eps_ticks * syminfo.mintick
bool  _mbm_long  = mbm_require_close ? (close > _mbm_high + _mbm_eps) : (high > _mbm_high + _mbm_eps)
bool  _mbm_short = mbm_require_close ? (close < _mbm_low  - _mbm_eps) : (low  < _mbm_low  - _mbm_eps)
sig_microbo_manual := direction == "LONG" ? _mbm_long : _mbm_short

// --- Trend + Pullback (tolerant window) ---
if entry_mode == "TrendPullback"
    bool trend_ok = direction == "LONG" ? close > ema_trend : close < ema_trend
    int pull_bars_since = direction == "LONG" ? ta.barssince(low <= ema_pull) : ta.barssince(high >= ema_pull)
    bool pull_recent = not na(pull_bars_since) and pull_bars_since <= tp_pullback_lookback

    bool conf_cond = false
    if tp_confirm == "MACD"
        conf_cond := direction == "LONG" ? ta.crossover(macdLine, signalLine) : ta.crossunder(macdLine, signalLine)
    else
        conf_cond := direction == "LONG" ? ta.crossover(close, ema_pull) : ta.crossunder(close, ema_pull)
    int conf_bars_since = ta.barssince(conf_cond)
    bool confirm_recent = not na(conf_bars_since) and conf_bars_since <= tp_confirm_lookback

    bool rsi_ok = direction == "LONG" ? (ta.lowest(rsi, tp_rsi_window) <= rsi_pull_long) : (ta.highest(rsi, tp_rsi_window) >= rsi_pull_short)

    sig_trendpullback := trend_ok and pull_recent and confirm_recent and rsi_ok

// --- Breakout + Squeeze ---
if entry_mode == "Breakout"
    float prev_highest = ta.highest(high, bo_range_len)[1]
    float prev_lowest = ta.lowest(low, bo_range_len)[1]
    bool brk_ok = direction == "LONG" ? ta.crossover(high, prev_highest) : ta.crossunder(low, prev_lowest)
    bool vol_ok = not bo_use_vol or (vol_sma > 0 and volume > bo_vol_factor * vol_sma)
    bool sq_ok = not bo_use_squeeze or (not na(bb_width_pct_br) and bb_width_pct_br < bo_bw_pct_max)
    bool trend_ok2 = not bo_use_trend or (direction == "LONG" ? close > ta.ema(close, 200) : close < ta.ema(close, 200))
    sig_breakout := brk_ok and vol_ok and sq_ok and trend_ok2

// --- Mean Reversion (BB + RSI) ---
if entry_mode == "MeanReversion"
    bool band_touch = direction == "LONG" ? (close <= mr_lower or low <= mr_lower) : (close >= mr_upper or high >= mr_upper)
    bool rsi_extreme = direction == "LONG" ? rsi < mr_rsi_long : rsi > mr_rsi_short
    bool trend_ok3 = not mr_use_trend or (direction == "LONG" ? close > ta.ema(close, 200) : close < ta.ema(close, 200))
    float dist_ema50_pct = ema50 != 0 ? 100.0 * math.abs(close - ema50) / ema50 : 0
    bool dist_ok = dist_ema50_pct >= mr_min_dist_ema
    sig_meanrev := band_touch and rsi_extreme and trend_ok3 and dist_ok

// --- MicroBreakout (Donchian) ---
if entry_mode == "MicroBreakout"
    float mb_high = ta.highest(high[1], mb_len)   // reference high excluding the current bar
    float mb_low  = ta.lowest(low[1],  mb_len)    // reference low excluding the current bar
    float mb_eps  = mb_eps_ticks * syminfo.mintick
    bool long_ok  = mb_require_close ? (close > mb_high + mb_eps) : (high > mb_high + mb_eps)
    bool short_ok = mb_require_close ? (close < mb_low  - mb_eps) : (low  < mb_low  - mb_eps)
    sig_microbo   := direction == "LONG" ? long_ok : short_ok


bool normal_entry_signal = (entry_mode == "TrendPullback"   and sig_trendpullback) or (entry_mode == "Breakout"        and sig_breakout)      or (entry_mode == "MeanReversion"   and sig_meanrev)       or (entry_mode == "MicroBreakout"   and sig_microbo)

// Effective mode (runtime): Manual applies if user selected OR Start Price forced, and not globally disabled
bool manual_effective = ((market_entry_mode == "Manual") or start_price_forced_manual) and not manual_disabled_global

// PREVIOUSLY: bool entry_signal = (market_entry_mode == "Manual") ? sig_microbo_manual : normal_entry_signal
bool entry_signal = manual_effective ? sig_microbo_manual : normal_entry_signal

bool  in_pos_e   = strategy.position_size != 0
float pos_avg_e  = strategy.position_avg_price

float pos_avg = strategy.position_avg_price
bool in_pos = strategy.position_size != 0

// ====== Trail arming + staging (CLOSE-based, staged with buffer) ======
// Trail is disabled if TP at Price is enabled OR Follow TP is enabled
if not in_pos or not use_trail_tp or use_follow_tp
    trail_is_armed := false
    trail_arm_bar  := na
    trail_stage := "DISARMED"
    hh_since_trail_activation := na
    ll_since_trail_activation := na
else
    // STAGE 1: ARM (activation threshold reached)
    if trail_stage == "DISARMED"
        float trail_activation_price = direction == "LONG" ? (pos_avg * (1 + trail_tp_activation_pct / 100.0)) : (pos_avg * (1 - trail_tp_activation_pct / 100.0))
        bool arm_hit = direction == "LONG" ? (close >= trail_activation_price) : (close <= trail_activation_price)
        
        if arm_hit
            trail_is_armed := true
            trail_arm_bar  := bar_index
            trail_stage := "BUFFER"
            // Initialize peak at current close (not high/low)
            if direction == "LONG"
                hh_since_entry := close
            else
                ll_since_entry := close
    
    // STAGE 2→3: BUFFER to TRAILING transition (trail activation at ARM + TRAIL)
    if trail_stage == "BUFFER"
        float trail_full_activation = direction == "LONG" ? (pos_avg * (1 + (trail_tp_activation_pct + trail_tp_trail_pct) / 100.0)) : (pos_avg * (1 - (trail_tp_activation_pct + trail_tp_trail_pct) / 100.0))
        bool trail_activation_hit = direction == "LONG" ? (close >= trail_full_activation) : (close <= trail_full_activation)   

        if trail_activation_hit
            trail_stage := "TRAILING"
            // Initialize trail peak at current close
            if direction == "LONG"
                hh_since_trail_activation := close
            else
                ll_since_trail_activation := close
        
        // Update buffer zone peak (for display purposes)
        if direction == "LONG"
            hh_since_entry := na(hh_since_entry) ? close : math.max(hh_since_entry, close)
        else
            ll_since_entry := na(ll_since_entry) ? close : math.min(ll_since_entry, close)

    // Update trail peak tracking (in TRAILING stage) - MUST be before trigger check!
    if trail_stage == "TRAILING"
        if direction == "LONG"
            hh_since_trail_activation := na(hh_since_trail_activation) ? close : math.max(hh_since_trail_activation, close)
        else
            ll_since_trail_activation := na(ll_since_trail_activation) ? close : math.min(ll_since_trail_activation, close)

// ====== Follow TP: Arming logic ======
if not in_pos or not use_follow_tp
    follow_tp_armed := false
    follow_tp_activation_pct_locked := na
    follow_tp_trail_pct_locked := na
    hh_since_follow_activation := na
    ll_since_follow_activation := na
else
    // Arm only once per position when threshold reached
    if not follow_tp_armed
        float activation_price = direction == "LONG" ? (pos_avg * (1 + follow_tp_activation_pct / 100.0))
                                                      : (pos_avg * (1 - follow_tp_activation_pct / 100.0))
        bool activation_hit = direction == "LONG" ? (high >= activation_price) : (low <= activation_price)
        
        if activation_hit
            follow_tp_armed := true
            follow_tp_activation_pct_locked := follow_tp_activation_pct
            follow_tp_trail_pct_locked := follow_tp_trail_pct
            // Initialize peak tracking at activation price (not current high/low to avoid immediate trigger)
            if direction == "LONG"
                hh_since_follow_activation := high
            else
                ll_since_follow_activation := low
    
    // Update peak tracking when armed (wick-based)
    if follow_tp_armed
        if direction == "LONG"
            hh_since_follow_activation := na(hh_since_follow_activation) ? high : math.max(hh_since_follow_activation, high)
        else
            ll_since_follow_activation := na(ll_since_follow_activation) ? low : math.min(ll_since_follow_activation, low)

// ====== TP/SL at Price: Validation & Targets ======
float tp_price_target = na
float sl_price_target = na

// Reset completion flags when user disables TP/SL at Price
if not use_tp_at_price
    tp_at_price_completed := false
if not use_sl_at_price
    sl_at_price_completed := false

// Validate and set TP at Price (only if not completed - one-time trigger)
if use_tp_at_price and in_pos_e and not tp_at_price_completed
    // For LONG: TP price must be above AVG; for SHORT: below AVG
    bool valid_tp = direction == "LONG" ? (tp_price_level > pos_avg_e) : (tp_price_level < pos_avg_e)
    if valid_tp
        tp_price_target := tp_price_level

// Validate and set SL at Price (only if not completed - one-time trigger)
if use_sl_at_price and in_pos_e and not sl_at_price_completed
    // For LONG: SL price must be below AVG; for SHORT: above AVG
    bool valid_sl = direction == "LONG" ? (sl_price_level < pos_avg_e) : (sl_price_level > pos_avg_e)
    if valid_sl
        sl_price_target := sl_price_level

// Validate and LOCK Stop Loss in Profit at Price ONCE
if use_sl_profit_at_price and in_pos_e
    // Only set target if not already set (lock once)
    if na(sl_profit_price_target)
        if sl_profit_type == "Percent"
            // Calculate price from % (must be in profit zone)
            float sl_profit_calc = direction == "LONG" ? (pos_avg_e * (1 + sl_profit_value / 100.0)) : (pos_avg_e * (1 - sl_profit_value / 100.0))
            
            // Validate that it's in profit zone (between AVG and current price)
            bool valid_sl_profit_pct = false
            if direction == "LONG"
                valid_sl_profit_pct := (sl_profit_calc > pos_avg_e) and (sl_profit_calc < close)
            else
                valid_sl_profit_pct := (sl_profit_calc < pos_avg_e) and (sl_profit_calc > close)
            
            if valid_sl_profit_pct
                sl_profit_price_target := sl_profit_calc
        else  // "Price"
            // Validate absolute price
            bool valid_sl_profit_price = false
            if direction == "LONG"
                valid_sl_profit_price := (sl_profit_value > pos_avg_e) and (sl_profit_value < close)
            else
                valid_sl_profit_price := (sl_profit_value < pos_avg_e) and (sl_profit_value > close)
            
            if valid_sl_profit_price
                sl_profit_price_target := sl_profit_value
else
    sl_profit_price_target := na  // Reset samo ko se disabla

// ===== EARLY EXIT PREVIEW (blocks BO on this bar) =====
// Standalone block: does not change the global hh_since_entry/ll_since_entry.

float tp_price_e = na
float sl_price_e = na
if in_pos_e
    if direction == "LONG"
        tp_price_e := pos_avg_e * (1 + tp_pct / 100.0)
        sl_price_e := pos_avg_e * (1 - sl_pct / 100.0)
    else
        tp_price_e := pos_avg_e * (1 - tp_pct / 100.0)
        sl_price_e := pos_avg_e * (1 + sl_pct / 100.0)

// Local HH/LL for trailing (without side effects)
float hh_e = na
float ll_e = na
if in_pos_e
    if direction == "LONG"
        hh_e := na(hh_since_entry) ? high : math.max(hh_since_entry, high)
    else
        ll_e := na(ll_since_entry) ? low  : math.min(ll_since_entry,  low)

// Trail arm (preview) – conservative: arming only if already armed before this bar
bool trail_armed_e = in_pos_e and use_trail_tp and trail_is_armed

float trail_tp_trigger_price_e = na
if in_pos_e and use_trail_tp and trail_armed_e
    if direction == "LONG"
        trail_tp_trigger_price_e := hh_e * (1 - trail_tp_trail_pct / 100.0)
    else
        trail_tp_trigger_price_e := ll_e * (1 + trail_tp_trail_pct / 100.0)

// Preview triggers on THIS candle (current high/low/close)
bool tp_trig_e = use_tp and in_pos_e and not use_trail_tp and (direction == "LONG" ? high >= tp_price_e : low <= tp_price_e)
bool sl_trig_e = use_sl and in_pos_e and (direction == "LONG" ? low  <= sl_price_e : high >= sl_price_e)
// Trail TP trigger - staged system (buffer + trailing)
bool trail_tp_trig_e = false
if in_pos_e and use_trail_tp and trail_is_armed
    bool trail_age_ok_e = not na(trail_arm_bar) and (bar_index - trail_arm_bar >= trail_min_bars_after_arm)
    
    if trail_stage == "BUFFER"
        // STAGE 2: Buffer protection (exit if falls below ARM - Buffer)
        float buffer_trigger_price = direction == "LONG" ? (pos_avg_e * (1 + (trail_tp_activation_pct - trail_tp_buffer_pct) / 100.0)) : (pos_avg_e * (1 - (trail_tp_activation_pct - trail_tp_buffer_pct) / 100.0))
        trail_tp_trig_e := direction == "LONG" ? (close <= buffer_trigger_price) : (close >= buffer_trigger_price)
    else if trail_stage == "TRAILING" and trail_age_ok_e
        // STAGE 3: Trailing (exit if falls Trail% from peak)
        float trail_peak = direction == "LONG" ? hh_since_trail_activation : ll_since_trail_activation
        if not na(trail_peak)
            float trail_trigger_price = direction == "LONG" ? (trail_peak * (1 - trail_tp_trail_pct / 100.0)) : (trail_peak * (1 + trail_tp_trail_pct / 100.0))
            trail_tp_trig_e := direction == "LONG" ? (close <= trail_trigger_price) : (close >= trail_trigger_price)

// Follow TP trigger (close-based)
float follow_tp_trigger_price_e = na
bool follow_tp_trig_e = false
if in_pos_e and use_follow_tp and follow_tp_armed and not na(follow_tp_trail_pct_locked)
    if direction == "LONG" and not na(hh_since_follow_activation)
        follow_tp_trigger_price_e := hh_since_follow_activation * (1 - follow_tp_trail_pct_locked / 100.0)
        follow_tp_trig_e := close <= follow_tp_trigger_price_e
    else if direction == "SHORT" and not na(ll_since_follow_activation)
        follow_tp_trigger_price_e := ll_since_follow_activation * (1 + follow_tp_trail_pct_locked / 100.0)
        follow_tp_trig_e := close >= follow_tp_trigger_price_e

// TP at Price trigger (LONG: price goes above, SHORT: price goes below)
bool tp_at_price_trig_e = use_tp_at_price and in_pos_e and not na(tp_price_target) and 
                          (direction == "LONG" ? (close >= tp_price_target) : (close <= tp_price_target))

// SL at Price trigger (LONG: price drops below, SHORT: price rises above)
bool sl_at_price_trig_e = use_sl_at_price and in_pos_e and not na(sl_price_target) and 
                          (direction == "LONG" ? (close <= sl_price_target) : (close >= sl_price_target))

// Stop Loss in Profit at Price trigger (LONG: price drops to level, SHORT: price rises to level)
bool sl_profit_at_price_trig_e = use_sl_profit_at_price and in_pos_e and not na(sl_profit_price_target) and
                                 (direction == "LONG" ? (close <= sl_profit_price_target) : (close >= sl_profit_price_target))

// --- Preemptive TP at last SO (preview) ---
bool preemptive_last_so_exit_trig_e = false
if tp_before_last_so and not use_sl and ladder_active and (so_number > 0) and (strategy.position_size != 0)
    int szp = array.size(so_prices)
    if so_next_idx == so_number - 1 and so_next_idx < szp
        float level_next_e = array.get(so_prices, so_next_idx)
        bool touched_next_e = direction == "LONG" ? (low <= level_next_e) : (high >= level_next_e)

        // monotonic guard relative to last fill
        float ref_prev_fill_e = na(last_so_fill_price) ? (so_next_idx > 0 ? array.get(so_prices, so_next_idx - 1) : na) : last_so_fill_price
        float guard_long_max_e  = na(ref_prev_fill_e) ? level_next_e : math.min(level_next_e, ref_prev_fill_e - syminfo.mintick)
        float guard_short_min_e = na(ref_prev_fill_e) ? level_next_e : math.max(level_next_e, ref_prev_fill_e + syminfo.mintick)
        bool monotonic_ok_e = direction == "LONG" ? (close <= guard_long_max_e) : (close >= guard_short_min_e)

        // cooldowns (strict, as in SO commit logic)
        bool cooldown_ok_strict_e = na(lastSOBar) or (bar_index - lastSOBar >= so_cooldown_bars + 1)
        bool bo_cooldown_ok_e     = so_next_idx == 0 ? (na(last_entry_bar) or (bar_index - last_entry_bar >= cooldown_after_bo + 1)) : true

         // confirm_close with tolerance
        bool confirm_close_e = direction == "LONG" ? (close <= level_next_e * (1 + so_close_tolerance / 100.0))
                                                  : (close >= level_next_e * (1 - so_close_tolerance / 100.0))

        preemptive_last_so_exit_trig_e := touched_next_e and confirm_close_e and cooldown_ok_strict_e and bo_cooldown_ok_e and monotonic_ok_e


bool will_exit_this_bar = tp_trig_e or sl_trig_e or trail_tp_trig_e or tp_at_price_trig_e or sl_at_price_trig_e or sl_profit_at_price_trig_e or follow_tp_trig_e or preemptive_last_so_exit_trig_e

// "entry_ok" is TRUE only if: (1) we have an entry signal from the strategy (entry_signal),
// (2) the gates allow entering (can_enter: time window, start/pause, OFF, cooldowns ...)
// and (3) there will be no exit on this bar (not will_exit_this_bar: not TP/SL/Trail/ExitPrice)
bool entry_ok = entry_signal and can_enter() and not will_exit_this_bar

// Pause BOT — UI label (stateless visual)
if barstate.islast
    string ptxt = pause_now_paused ? "Bot paused" : (pause_now_armed ? "Pause armed" : "")
    if ptxt != ""
        pause_lbl := na(pause_lbl) ? label.new(bar_index, close, ptxt, xloc=xloc.bar_index, yloc=yloc.price, style=label.style_label_down, color=color.new(color.orange, 70), textcolor=color.white, size=size.large) : pause_lbl
        label.set_text(pause_lbl, ptxt)
        label.set_xy(pause_lbl, bar_index, close)
    else
        if not na(pause_lbl)
            label.delete(pause_lbl)
            pause_lbl := na

// ===== EARLY EXIT EXECUTION (runs BEFORE BO/SO; replaces later Exit block) =====
if will_exit_this_bar
    last_exit_bar := bar_index
    reenter_unlock_bar_normal := bar_index + cooldown_after_exit
    reenter_unlock_bar_manual := bar_index + cooldown_after_exit_manual

    // Clean up pending/manual and due alerts so that "phantoms" don’t appear
    bo_alert_due         := false
    so_alert_due         := false
    bo_alert_msg := ""      // <- ADD
    so_alert_msg := ""      // <- ADD

     // Calculate realized PnL for this session BEFORE closing
    float session_pnl_usd = 0.0
    if strategy.position_size != 0
        float pos_qty = math.abs(strategy.position_size)
        if direction == "LONG"
            session_pnl_usd := (close - pos_avg_e) * pos_qty
        else
            session_pnl_usd := (pos_avg_e - close) * pos_qty
        
        // Subtract all fees (buy + funding + projected sell)
        float fee_sell_final = (taker_fee_pct / 100.0) * (pos_qty * close)
        session_pnl_usd := session_pnl_usd - fee_buy_cum_usd - fee_funding_cum_usd - fee_sell_final
        
        // Add to cumulative total
        total_realized_pnl_usd += session_pnl_usd

    // Reset fee accounting on real exit (end of session)
    fee_buy_cum_usd     := 0.0
    fee_funding_cum_usd := 0.0
    funding_last_ms     := na

    f_end_last_line()
    string _exit_cmt = preemptive_last_so_exit_trig_e ? "TP@LastSO @ " + str.tostring(close, "#") : (tp_at_price_trig_e ? "TP@Price" : (sl_at_price_trig_e ? "SL@Price" : (sl_profit_at_price_trig_e ? "SL in Profit" : (follow_tp_trig_e ? "Follow TP" : (tp_trig_e ? "TP" : (sl_trig_e ? "SL" : (trail_tp_trig_e ? "Trail TP" : "Unknown"))))))) + " @ " + str.tostring(close, "#")
    strategy.close_all(comment=_exit_cmt)

    if (market_entry_mode == "Manual" or start_price_forced_manual) and (tp_trig_e or sl_trig_e or preemptive_last_so_exit_trig_e or trail_tp_trig_e or tp_at_price_trig_e or sl_at_price_trig_e or sl_profit_at_price_trig_e or follow_tp_trig_e)
        manual_disarmed := false
        manual_disabled_global := true
        start_price_forced_manual := false
        start_price_completed := true

    // Build EXIT payload (WT/3C)
    exit_alert_msg_q := ""
    if wt_enable and not cm_enable
        exit_alert_msg_q := "{\"code\": \"" + wt_exit_all_code + "\", \"reduceOnly\": true}"
        exit_alert_msg_q := str.replace(exit_alert_msg_q, "'", "")
        exit_alert_msg_q := str.replace(exit_alert_msg_q, "\\", "")
    else if cm_enable and not wt_enable
        if cm_bot_id > 0 and cm_email_token != ""
            exit_alert_msg_q := "{" + "\"message_type\": \"bot\", " + "\"bot_id\": " + str.tostring(cm_bot_id) + ", " + "\"email_token\": \"" + cm_email_token + "\", " + "\"delay_seconds\": " + str.tostring(cm_delay_seconds) + ", " + "\"action\": \"close_at_market_price\"" + "}"
            exit_alert_msg_q := str.replace(exit_alert_msg_q, "'", "")
            exit_alert_msg_q := str.replace(exit_alert_msg_q, "\\", "")
        else
            runtime.error("3Commas: Missing bot_id or email_token - check inputs")

    // Inline EXIT alert (guarded); if blocked, leave it for the dispatcher (due)
    if (wt_enable != cm_enable) and (exit_alert_msg_q != "")
        if can_send_alert_this_bar
            alert(exit_alert_msg_q, alert.freq_once_per_bar)
            last_alert_bar_any  := bar_index
            last_alert_bar_exit := bar_index
            exit_alert_due := false
        else
            exit_alert_due := true

    pos_session += 1

    // After EXIT always deactivate and clear the DCA ladder (even if you don’t stop the bot)
    if so_number > 0
        for i = 0 to so_number - 1
            strategy.cancel("SO" + str.tostring(i + 1))

    ladder_active := false
    bo_ref_price := na
    so_next_idx := 0
    so_armed_idx := -1
    lastSOBar := na
    last_so_fill_price := na
    array.clear(so_prices)
    array.clear(so_usds)
    array.clear(so_filled)

    // Stop the BOT only if:
    // 1. stop_on_exit is enabled
    // 2. This EXIT happened AFTER stop_on_exit was armed (live trade)
    // 3. Single-use: disarm after first trigger
    bool stop_condition_met = stop_on_exit and 
                              not na(stop_on_exit_armed_bar) and 
                              bar_index >= stop_on_exit_armed_bar
    
    if stop_condition_met
        bot_stopped := true
        stop_on_exit_armed_bar := na  // Disarm after first use

    hh_since_entry := na
    ll_since_entry := na
    trail_is_armed := false
    trail_arm_bar  := na
    trail_stage := "DISARMED"
    hh_since_trail_activation := na
    ll_since_trail_activation := na
    entry_time_ms := na

    // Reset Follow TP state
    follow_tp_armed := false
    follow_tp_activation_pct_locked := na
    follow_tp_trail_pct_locked := na
    hh_since_follow_activation := na
    ll_since_follow_activation := na

    // Mark TP/SL at Price as completed if they OR their % equivalents triggered (one-time)
    if tp_at_price_trig_e or tp_trig_e
        tp_at_price_completed := true
    if sl_at_price_trig_e or sl_trig_e
        sl_at_price_completed := true

    // Reset targets
    tp_price_target := na
    sl_price_target := na

    // Reset Stop Loss in Profit target
    sl_profit_price_target := na

    // Reset MSO state on exit
    mso_next_idx := 0
    last_mso_bar := na
    last_mso_fill_price := na
    mso_can_toggle := true
    f_clear_mso_lines()

// Precompute BO readiness (execute-on-close)
bool bo_ready = entry_ok and strategy.position_size == 0

/// ====== BO logic ======
if barstate.isconfirmed and bo_ready and not will_exit_this_bar and not f_exited_this_bar()
    float bo_qty = f_qty_from_usd(bo_usd, close)
    if bo_qty > 0
        // --- BO marker comment (Normal/Manual via Market entry mode) ---
        string _src = manual_effective ? "Manual" : "Normal"
        string _bo_cmt = "BO $" + str.tostring(bo_usd, "#") + " @ " + str.tostring(close, "#") + " | " + direction + " | " + _src
        if direction == "LONG"
            strategy.entry("BO", strategy.long, qty=bo_qty, comment=_bo_cmt)
            // Entry fee (assume taker for BO)
            fee_buy_cum_usd += (taker_fee_pct / 100.0) * bo_usd
            if wt_enable and not cm_enable
                string json_msg = "{\"code\": \"" + wt_enter_long_code + "\", \"orderType\": \"" + wt_order_type + "\", \"amountPerTradeType\": \"" + wt_amount_type + "\", \"amountPerTrade\": " + str.tostring(bo_usd) + "}"
                json_msg := str.replace(json_msg, "'", "")
                json_msg := str.replace(json_msg, "\\", "")
                bo_alert_msg := json_msg
                bo_alert_due := true   
            else if cm_enable and not wt_enable
                if cm_bot_id > 0 and cm_email_token != ""
                    string json_msg = "{\"message_type\": \"bot\", \"bot_id\": " + str.tostring(cm_bot_id) + ", \"email_token\": \"" + cm_email_token + "\", \"delay_seconds\": " + str.tostring(cm_delay_seconds) + "}"
                    json_msg := str.replace(json_msg, "'", "")
                    json_msg := str.replace(json_msg, "\\", "")
                    bo_alert_msg := json_msg
                    bo_alert_due := true
                else
                    runtime.error("3Commas: Missing bot_id or email_token - check inputs")
        else
            strategy.entry("BO", strategy.short, qty=bo_qty, comment=_bo_cmt)
            if wt_enable and not cm_enable
                string json_msg = "{\"code\": \"" + wt_enter_short_code + "\", \"orderType\": \"" + wt_order_type + "\", \"amountPerTradeType\": \"" + wt_amount_type + "\", \"amountPerTrade\": " + str.tostring(bo_usd) + "}"
                json_msg := str.replace(json_msg, "'", "")
                json_msg := str.replace(json_msg, "\\", "")
                bo_alert_msg := json_msg
                bo_alert_due := true
            else if cm_enable and not wt_enable
                if cm_bot_id > 0 and cm_email_token != ""
                    string json_msg = "{\"message_type\": \"bot\", \"bot_id\": " + str.tostring(cm_bot_id) + ", \"email_token\": \"" + cm_email_token + "\", \"delay_seconds\": " + str.tostring(cm_delay_seconds) + "}"
                    json_msg := str.replace(json_msg, "'", "")
                    json_msg := str.replace(json_msg, "\\", "")
                    bo_alert_msg := json_msg
                    bo_alert_due := true
                else
                    runtime.error("3Commas: Missing bot_id or email_token - check inputs")
        /// Auto-disarm Manual right after the first Manual BO (runtime-effective)
        if (manual_effective or start_price_forced_manual) and not manual_disarmed
            manual_disarmed := true
        pos_session += 1
        last_entry_bar := bar_index
        bo_ref_price := close
        entry_time_ms := time
        if so_number > 0
            f_build_ladder(bo_ref_price, direction)
            ladder_active := true
            so_next_idx := 0
            so_armed_idx := -1
            lastSOBar := na
            last_so_fill_price := na
            if array.size(so_prices) > 0
                float _so1 = array.get(so_prices, 0)
                f_draw_so_line(_so1, 1)
    // reset trailing references
        hh_since_entry := na
        ll_since_entry := na
        trail_is_armed := false
        trail_arm_bar  := na
        trail_stage := "DISARMED"
        hh_since_trail_activation := na
        ll_since_trail_activation := na

        if direction == "LONG"
            hh_since_entry := close
        else
            ll_since_entry := close        
        
        //label.new(bar_index, close, "BO $" + str.tostring(bo_usd) + " @ " + str.tostring(close) + "\nID: BO", color=color.new(color.green, 80), style=label.style_label_down, textcolor=color.white)
        // --- Inline BO alert emit (guarded + fallback, bar-based) ---
        if (wt_enable != cm_enable) and (bo_alert_msg != "")
            if can_send_alert_this_bar
                alert(bo_alert_msg, alert.freq_once_per_bar)
                last_alert_bar_any := bar_index
                last_alert_bar_bo  := bar_index
                bo_alert_due := false
            else
                bo_alert_due := true

/// ====== SO: Sequential Arm & Fire (no skipping) ======
bool so_filled_now       = false
bool breach_confirmed_any = false
bool deepest_touched     = false   // for the debug shape; here it means "touched_next"
bool confirm_close       = false


// SO logic runs only when the position is open (in_pos); otherwise it doesn’t “add” after exit.
if ladder_active and (strategy.position_size != 0) and in_time_window and so_number > 0 and not bot_stopped and (not use_start_price or trading_started)
    int sz = array.size(so_prices)
    if so_next_idx < sz
        // Always target ONLY the next unfilled level
        float level_next   = array.get(so_prices, so_next_idx)
        bool  touched_next = direction == "LONG" ? (low <= level_next) : (high >= level_next)
        deepest_touched := touched_next
        
        // Monotonic guard: SO cannot fill higher (LONG) or lower (SHORT) than previous fill
        float ref_prev_fill = na(last_so_fill_price) ? (so_next_idx > 0 ? array.get(so_prices, so_next_idx - 1) : na) : last_so_fill_price

        // For LONG we want: fill at close <= min(level_next, ref_prev_fill - tick)
        // For SHORT we want: fill at close >= max(level_next, ref_prev_fill + tick)
        float guard_long_max = na(ref_prev_fill) ? level_next : math.min(level_next, ref_prev_fill - syminfo.mintick)
        float guard_short_min = na(ref_prev_fill) ? level_next : math.max(level_next, ref_prev_fill + syminfo.mintick)

        bool monotonic_ok = direction == "LONG" ? (close <= guard_long_max) : (close >= guard_short_min)

        // Require at least (so_cooldown_bars + 1) bars between two SOs, which always excludes the same bar.
        bool cooldown_ok_strict = na(lastSOBar) or (bar_index - lastSOBar >= so_cooldown_bars + 1)
        // For the FIRST SO after BO, require at least (cooldown_after_bo + 1) bars from the BO bar.
        // (even if cooldown_after_bo = 0, it will be 1 ⇒ the first SO only on the NEXT candle after BO)
        bool bo_cooldown_ok     = so_next_idx == 0 ? (na(last_entry_bar) or (bar_index - last_entry_bar >= cooldown_after_bo + 1)) : true
        confirm_close := direction == "LONG" ? (close <= level_next * (1 + so_close_tolerance / 100.0))
                                             : (close >= level_next * (1 - so_close_tolerance / 100.0))
        // 6.2: intrabar detection, commit on close
        bool so_ready = touched_next and confirm_close and cooldown_ok_strict and bo_cooldown_ok and monotonic_ok
        if barstate.isconfirmed and so_ready
            float usd_amt = array.get(so_usds, so_next_idx)
            float qty     = f_qty_from_usd(usd_amt, close)
            // === INSERT: funds gate for SO alerts ===
            // conservative estimate of invested USD: BO + already filled SOs
            float invested_filled = 0.0
            for kk = 0 to so_next_idx - 1
                if array.get(so_filled, kk)
                    invested_filled += array.get(so_usds, kk)
            float invested_planned_now = invested_filled + bo_usd
            bool funds_ok = invested_planned_now + usd_amt <= strategy.initial_capital
            // =======================================

            string so_id  = "SO" + str.tostring(so_next_idx + 1)
            // --- SO marker comment (idx, dev from BO and previous SO) ---
            string so_idx   = str.tostring(so_next_idx + 1) + "/" + str.tostring(so_number)
            float _dev_bo   = na(bo_ref_price) ? na : 100.0 * (close - bo_ref_price) / bo_ref_price
            float _prev_ref = not na(last_so_fill_price) ? last_so_fill_price : (so_next_idx > 0 ? array.get(so_prices, so_next_idx - 1) : na)
            float _dev_prev = na(_prev_ref) ? na : 100.0 * (close - _prev_ref) / _prev_ref
            string _so_cmt  = "SO" + str.tostring(so_next_idx + 1) + " $" + str.tostring(usd_amt, "#") + " @ " + str.tostring(close, "#") + " | " + so_idx + " | " + (na(_dev_bo) ? "N/A" : str.tostring(_dev_bo, "#.##") + "%") + " | " + (na(_dev_prev) ? "N/A" : str.tostring(_dev_prev, "#.##") + "%")
            
            bool so_committed = false   // ← DODAJ
            
            so_alert_msg := ""
            so_alert_due := false
            
            if qty > 0
                if direction == "LONG"
                    // Build SO alert payload (WT/3C) — ALERT FUNDS GATE ONLY
                    if funds_ok
                        strategy.entry(so_id, strategy.long, qty=qty, comment=_so_cmt)
                        if wt_enable and not cm_enable
                            string json_msg = "{\"code\": \"" + (direction == "LONG" ? wt_enter_long_code : wt_enter_short_code) + "\", \"orderType\": \"" + wt_order_type + "\", \"amountPerTradeType\": \"" + wt_amount_type + "\", \"amountPerTrade\": " + str.tostring(usd_amt) + "}"
                            json_msg := str.replace(json_msg, "'", "")
                            json_msg := str.replace(json_msg, "\\", "")
                            so_alert_msg := json_msg
                            so_alert_due := true
                        else if cm_enable and not wt_enable
                            if cm_bot_id > 0 and cm_email_token != ""
                                string json_msg = "{\"message_type\": \"bot\", \"bot_id\": " + str.tostring(cm_bot_id) + ", \"email_token\": \"" + cm_email_token + "\", \"delay_seconds\": " + str.tostring(cm_delay_seconds) + ", \"action\": \"add_funds_in_quote\", \"volume\": " + str.tostring(usd_amt) + (cm_use_limit_for_so ? ", \"price\": " + str.tostring(close) : "") + "}"
                                json_msg := str.replace(json_msg, "'", "")
                                json_msg := str.replace(json_msg, "\\", "")
                                so_alert_msg := json_msg
                                so_alert_due := true
                            else
                                runtime.error("3Commas: Missing bot_id or email_token - check inputs")
                        so_committed := true
                        // Entry fee for this SO (assume taker for SO)
                        fee_buy_cum_usd += (taker_fee_pct / 100.0) * usd_amt
                    else
                         // No budget → do NOT send alert and clear any due remnants
                        so_alert_msg := ""
                        so_alert_due := false
                else
                    // Build SO alert payload (WT/3C) — ALERT FUNDS GATE ONLY
                    if funds_ok
                        strategy.entry(so_id, strategy.short, qty=qty, comment=_so_cmt)
                        if wt_enable and not cm_enable
                            string json_msg = "{\"code\": \"" + (direction == "LONG" ? wt_enter_long_code : wt_enter_short_code) + "\", \"orderType\": \"" + wt_order_type + "\", \"amountPerTradeType\": \"" + wt_amount_type + "\", \"amountPerTrade\": " + str.tostring(usd_amt) + "}"
                            json_msg := str.replace(json_msg, "'", "")
                            json_msg := str.replace(json_msg, "\\", "")
                            so_alert_msg := json_msg
                            so_alert_due := true
                        else if cm_enable and not wt_enable
                            if cm_bot_id > 0 and cm_email_token != ""
                                string json_msg = "{\"message_type\": \"bot\", \"bot_id\": " + str.tostring(cm_bot_id) + ", \"email_token\": \"" + cm_email_token + "\", \"delay_seconds\": " + str.tostring(cm_delay_seconds) + ", \"action\": \"add_funds_in_quote\", \"volume\": " + str.tostring(usd_amt) + (cm_use_limit_for_so ? ", \"price\": " + str.tostring(close) : "") + "}"
                                json_msg := str.replace(json_msg, "'", "")
                                json_msg := str.replace(json_msg, "\\", "")
                                so_alert_msg := json_msg
                                so_alert_due := true
                            else
                                runtime.error("3Commas: Missing bot_id or email_token - check inputs")
                        so_committed := true
                        // Entry fee for this SO (assume taker for SO)
                        fee_buy_cum_usd += (taker_fee_pct / 100.0) * usd_amt
                    else
                        // No budget → do NOT send alert and clear any due remnants
                        so_alert_msg := ""
                        so_alert_due := false

            // --- Ladder progression & visuals ONLY if SO is actually committed ---
            if so_committed
                breach_confirmed_any := true
                so_filled_now := true
                array.set(so_filled, so_next_idx, true)
                so_next_idx += 1
                lastSOBar := bar_index
                last_so_fill_price := close
                so_armed_idx := -1

                // Reset trail references after DCA
                trail_stage := "DISARMED"
                trail_is_armed := false
                trail_arm_bar := na
                hh_since_trail_activation := na
                ll_since_trail_activation := na
                if direction == "LONG"
                    hh_since_entry := close
                else
                    ll_since_entry := close

                // Re-anchor remaining levels (Model B)
                int sz_all = array.size(so_prices)
                if so_next_idx < sz_all
                    float prev_anchor = last_so_fill_price
                    for j = so_next_idx to sz_all - 1
                        float step_pct_j = pd_pct * math.pow(sc, j)
                        float delta_j    = bo_ref_price * (step_pct_j / 100.0)
                        float raw_j      = direction == "LONG" ? (prev_anchor - delta_j) : (prev_anchor + delta_j)
                        float q_j        = f_to_tick(raw_j)
                        // monotonic guard
                        if direction == "LONG"
                            if q_j >= prev_anchor
                                q_j := prev_anchor - syminfo.mintick
                        else
                            if q_j <= prev_anchor
                                q_j := prev_anchor + syminfo.mintick
                        array.set(so_prices, j, q_j)
                        prev_anchor := q_j

                 // End previous line and draw next one
                f_end_last_line()
                if so_next_idx < sz_all
                    float _next = array.get(so_prices, so_next_idx)
                    f_draw_so_line(_next, so_next_idx + 1)

                // --- Inline SO alert emit (only if msg is non-empty) ---
                if (wt_enable != cm_enable) and (so_alert_msg != "")
                    if can_send_alert_this_bar
                        alert(so_alert_msg, alert.freq_once_per_bar)
                        last_alert_bar_any := bar_index
                        last_alert_bar_so  := bar_index
                        so_alert_due := false
                    else
                        so_alert_due := true
                else
                    so_alert_due := false
            else
                // No capital → don't progress and don't draw anything
                so_filled_now := false

// Shorten the active SO line to the current bar
if ladder_active and array.size(so_lines) > 0
    line _last = array.get(so_lines, array.size(so_lines) - 1)
    line.set_x2(_last, bar_index)
    line.set_extend(_last, extend.none)


// ====== MSO Logic (Emergency SO - Time-based) ======
bool mso_filled_now = false
bool mso_can_fire = mso_enable and 
                     in_time_window and 
                     strategy.position_size != 0 and
                     so_next_idx == so_number and  // all normal SOs filled
                     not tp_before_last_so and     // conflict: TP@LastSO blocks MSOs
                     mso_next_idx < 3              // not all MSOs filled yet

if mso_can_fire
    // Check each MSO in priority order (0,1,2)
    for mso_idx = mso_next_idx to 2
        if f_mso_is_active(mso_idx)  // Checks time >= mso_time inside
            // One MSO per bar guard
            bool bar_ok = na(last_mso_bar) or bar_index > last_mso_bar
            
            if barstate.isconfirmed and bar_ok
                float mso_usd = f_mso_get_usd(mso_idx)
                float mso_qty = f_qty_from_usd(mso_usd, close)
                
                string mso_id = "MSO" + str.tostring(mso_idx + 1)
                string mso_cmt = "MSO" + str.tostring(mso_idx + 1) + " $" + str.tostring(mso_usd, "#") + " @ " + str.tostring(close, "#")
                
                if mso_qty > 0
                    if direction == "LONG"
                        strategy.entry(mso_id, strategy.long, qty=mso_qty, comment=mso_cmt)
                        fee_buy_cum_usd += (taker_fee_pct / 100.0) * mso_usd
                        
                        // Alert (WT/3C)
                        if wt_enable and not cm_enable
                            string json_msg = "{\"code\": \"" + wt_enter_long_code + "\", \"orderType\": \"" + wt_order_type + "\", \"amountPerTradeType\": \"" + wt_amount_type + "\", \"amountPerTrade\": " + str.tostring(mso_usd) + "}"
                            json_msg := str.replace(json_msg, "'", "")
                            json_msg := str.replace(json_msg, "\\", "")
                            if can_send_alert_this_bar
                                alert(json_msg, alert.freq_once_per_bar)
                                last_alert_bar_any := bar_index
                                last_alert_bar_so  := bar_index
                        else if cm_enable and not wt_enable
                            if cm_bot_id > 0 and cm_email_token != ""
                                string json_msg = "{\"message_type\": \"bot\", \"bot_id\": " + str.tostring(cm_bot_id) + ", \"email_token\": \"" + cm_email_token + "\", \"delay_seconds\": " + str.tostring(cm_delay_seconds) + ", \"action\": \"add_funds_in_quote\", \"volume\": " + str.tostring(mso_usd) + (cm_use_limit_for_so ? ", \"price\": " + str.tostring(close) : "") + "}"
                                json_msg := str.replace(json_msg, "'", "")
                                json_msg := str.replace(json_msg, "\\", "")
                                if can_send_alert_this_bar
                                    alert(json_msg, alert.freq_once_per_bar)
                                    last_alert_bar_any := bar_index
                                    last_alert_bar_so  := bar_index
                    else  // SHORT
                        strategy.entry(mso_id, strategy.short, qty=mso_qty, comment=mso_cmt)
                        fee_buy_cum_usd += (taker_fee_pct / 100.0) * mso_usd
                        
                        // Alert (WT/3C)
                        if wt_enable and not cm_enable
                            string json_msg = "{\"code\": \"" + wt_enter_short_code + "\", \"orderType\": \"" + wt_order_type + "\", \"amountPerTradeType\": \"" + wt_amount_type + "\", \"amountPerTrade\": " + str.tostring(mso_usd) + "}"
                            json_msg := str.replace(json_msg, "'", "")
                            json_msg := str.replace(json_msg, "\\", "")
                            if can_send_alert_this_bar
                                alert(json_msg, alert.freq_once_per_bar)
                                last_alert_bar_any := bar_index
                                last_alert_bar_so  := bar_index
                        else if cm_enable and not wt_enable
                            if cm_bot_id > 0 and cm_email_token != ""
                                string json_msg = "{\"message_type\": \"bot\", \"bot_id\": " + str.tostring(cm_bot_id) + ", \"email_token\": \"" + cm_email_token + "\", \"delay_seconds\": " + str.tostring(cm_delay_seconds) + ", \"action\": \"add_funds_in_quote\", \"volume\": " + str.tostring(mso_usd) + (cm_use_limit_for_so ? ", \"price\": " + str.tostring(close) : "") + "}"
                                json_msg := str.replace(json_msg, "'", "")
                                json_msg := str.replace(json_msg, "\\", "")
                                if can_send_alert_this_bar
                                    alert(json_msg, alert.freq_once_per_bar)
                                    last_alert_bar_any := bar_index
                                    last_alert_bar_so  := bar_index
                    
                    // Update state
                    mso_filled_now := true
                    mso_next_idx := mso_idx + 1
                    last_mso_bar := bar_index
                    last_mso_fill_price := close
                    
                    // Reset trail references after MSO
                    trail_stage := "DISARMED"
                    trail_is_armed := false
                    trail_arm_bar := na
                    hh_since_trail_activation := na
                    ll_since_trail_activation := na
                    if direction == "LONG"
                        hh_since_entry := close
                    else
                        ll_since_entry := close   

                    break  // Only one MSO per bar


// ====== TP/SL prices ======

float tp_price = na
float sl_price = na
if in_pos
    if direction == "LONG"
        tp_price := pos_avg * (1 + tp_pct / 100.0)
        sl_price := pos_avg * (1 - sl_pct / 100.0)
    else
        tp_price := pos_avg * (1 - tp_pct / 100.0)
        sl_price := pos_avg * (1 + sl_pct / 100.0)

// ====== Trailing references update (CLOSE-based) ======
if in_pos
    if direction == "LONG"
        hh_since_entry := na(hh_since_entry) ? close : math.max(hh_since_entry, close)
    else
        ll_since_entry := na(ll_since_entry) ? close : math.min(ll_since_entry, close)

// ====== Trail TP trigger price (staged system) ======
float trail_tp_trigger_price = na
bool  trail_age_ok = in_pos and use_trail_tp and trail_is_armed and not na(trail_arm_bar) and (bar_index - trail_arm_bar >= trail_min_bars_after_arm)
if in_pos and use_trail_tp and trail_is_armed
    if trail_stage == "BUFFER"
        // Buffer trigger price (ARM - Buffer)
        trail_tp_trigger_price := direction == "LONG" ? (pos_avg * (1 + (trail_tp_activation_pct - trail_tp_buffer_pct) / 100.0)) : (pos_avg * (1 - (trail_tp_activation_pct - trail_tp_buffer_pct) / 100.0))
    else if trail_stage == "TRAILING"
        // Trail trigger price (Peak - Trail%)
        float trail_peak = direction == "LONG" ? hh_since_trail_activation : ll_since_trail_activation
        if not na(trail_peak)
            trail_tp_trigger_price := direction == "LONG" ? (trail_peak * (1 - trail_tp_trail_pct / 100.0)) : (trail_peak * (1 + trail_tp_trail_pct / 100.0))

// ====== Status Table (fixed corner) ======
f_tbl_pos(sel) =>
    sel == "Bottom Right" ? position.bottom_right : sel == "Bottom Left" ? position.bottom_left : sel == "Top Right" ? position.top_right : position.top_left

var table status_tbl = na
var string status_tbl_corner_prev = ""

// Calculations (same as before, just without the label)
bool session_active = (strategy.position_size != 0) or ladder_active

float invested_total = 0.0
int   filled_so_count = 0
if session_active and array.size(so_filled) > 0
    for i = 0 to array.size(so_filled) - 1
        if array.get(so_filled, i)
            invested_total += array.get(so_usds, i)
            filled_so_count += 1
if session_active and strategy.position_size != 0
    invested_total += bo_usd

// Add filled MSOs to invested total
if session_active and mso_next_idx > 0
    for mso_i = 0 to mso_next_idx - 1

        invested_total += f_mso_get_usd(mso_i)
float remaining_funds = math.max(0, strategy.initial_capital - invested_total)
int   total_so        = so_number
//int   remaining_so    = session_active ? math.max(0, total_so - filled_so_count) : total_so
int   remaining_so    = session_active ? math.max(0, so_number - so_next_idx) : so_number
float next_so_price = na
if session_active and so_next_idx < array.size(so_prices)
    next_so_price := array.get(so_prices, so_next_idx)

// --- Compact table fields ---
float pos_size_abs   = math.abs(strategy.position_size)
string invested_size = "$" + str.tostring(invested_total, "#.##") + " / " + str.tostring(pos_size_abs, "#.####")
string avg_price_str = in_pos ? "$" + str.tostring(pos_avg, "#.##") : "N/A"

// --- Status extensions (compact) ---
int   bars_in_pos   = in_pos and not na(last_entry_bar) ? (bar_index - last_entry_bar) : 0

// Trail age OK for table display (armed & waited the min bars)
bool trail_age_ok_tbl = use_trail_tp and trail_is_armed and not na(trail_arm_bar) and (bar_index - trail_arm_bar >= trail_min_bars_after_arm)

// Show Manual (Price) when Start Price forced, otherwise normal Manual or strategy
string mode_text_display =
     manual_effective ? (manual_disarmed and in_pos ? "Manual DISARMED" : (start_price_forced_manual ? "Manual (Price)" : "Manual"))
                      : entry_mode

string dir_mode_txt = direction + " | " + mode_text_display

float unrl_pnl_pct  = in_pos and pos_avg > 0 ? (direction == "LONG" ? (close/pos_avg - 1.0) * 100.0 : (pos_avg/close - 1.0) * 100.0) : na
string unrl_pnl_str = na(unrl_pnl_pct) ? "N/A" : (unrl_pnl_pct >= 0 ? "+" : "") + str.tostring(unrl_pnl_pct, "#.##") + "%"

// USD PnL (unrealized) – calculated from quantity (base) and price difference
float pos_qty_abs      = math.abs(strategy.position_size)
float unrl_pnl_usd     = in_pos ? (direction == "LONG" ? (close - pos_avg) * pos_qty_abs : (pos_avg - close) * pos_qty_abs) : na
string unrl_pnl_usd_str = na(unrl_pnl_usd) ? "N/A" : ((unrl_pnl_usd >= 0 ? "+" : "-") + "$" + str.tostring(math.abs(unrl_pnl_usd), "#.##"))

// --- Funding accrual (piecewise-constant by bar) ---
float pos_notional_now = in_pos ? (pos_qty_abs * close) : 0.0
float funding_rate_per_ms = (funding_8h_pct / 100.0) / (8.0 * 60.0 * 60.0 * 1000.0)

if in_pos
    if na(funding_last_ms)
        funding_last_ms := time
    else
        int elapsed_ms_f = time - funding_last_ms
        if elapsed_ms_f > 0
            // sign: + means COST for LONG when funding_8h_pct>0; for SHORT it's reversed
            float signed_direction = (direction == "LONG") ? 1.0 : -1.0
            float funding_inc = pos_notional_now * funding_rate_per_ms * elapsed_ms_f * signed_direction
            fee_funding_cum_usd += funding_inc
            funding_last_ms := time
else
    // not in position → don't accumulate; reset clock
    funding_last_ms := na

// Combined display: "+X.XX% / +$Y.YY"
string unrl_pnl_both = (na(unrl_pnl_pct) or na(unrl_pnl_usd)) ? "N/A" : (unrl_pnl_str + " / " + unrl_pnl_usd_str)

// --- TP/Trail/SL/SLSO (compact, "first wins" logic for TP/SL) ---

// TP field: Show whichever will trigger first (% or Price)
string tp_field = "OFF"
if not use_follow_tp  // ← DODAJ pogoj
    if in_pos
        bool tp_pct_active = use_tp
        bool tp_price_active = use_tp_at_price and not tp_at_price_completed
        
        if tp_pct_active or tp_price_active
            if tp_pct_active and not tp_price_active
                // Only % TP active
                tp_field := str.tostring(tp_pct, "#.##") + "%"
            else if tp_price_active and not tp_pct_active
                // Only TP at Price active
                int tp_price_int = int(math.round(tp_price_level))
                tp_field := "$" + str.tostring(tp_price_int)
            else
                // Both active - show whichever is closer
                float tp_pct_price = direction == "LONG" ? (pos_avg * (1 + tp_pct / 100.0)) : (pos_avg * (1 - tp_pct / 100.0))
                bool tp_pct_closer = direction == "LONG" ? (tp_pct_price < tp_price_level) : (tp_pct_price > tp_price_level)
                
                if tp_pct_closer
                    tp_field := str.tostring(tp_pct, "#.##") + "%"
                else
                    int tp_price_int = int(math.round(tp_price_level))
                    tp_field := "$" + str.tostring(tp_price_int)
    else
        // Not in position - show configured values
        if use_tp
            tp_field := str.tostring(tp_pct, "#.##") + "%"
        else if use_tp_at_price and not tp_at_price_completed
            int tp_price_int = int(math.round(tp_price_level))
            tp_field := "$" + str.tostring(tp_price_int)

// Trail field (disabled if Follow TP ON)
string trail_field = "OFF"
if use_trail_tp and not use_follow_tp
    if trail_is_armed
        // Show stage and current trigger
        if trail_stage == "BUFFER"
            float buffer_trigger = direction == "LONG" ? (pos_avg * (1 + (trail_tp_activation_pct - trail_tp_buffer_pct) / 100.0)) : (pos_avg * (1 - (trail_tp_activation_pct - trail_tp_buffer_pct) / 100.0))
            float profit_at_buffer = direction == "LONG" ? ((buffer_trigger / pos_avg) - 1.0) * 100.0 : ((pos_avg / buffer_trigger) - 1.0) * 100.0
            trail_field := "BUF@+" + str.tostring(profit_at_buffer, "#.##") + "%"
        else if trail_stage == "TRAILING" and not na(trail_tp_trigger_price)
            float profit_at_trail = direction == "LONG" ? ((trail_tp_trigger_price / pos_avg) - 1.0) * 100.0 : ((pos_avg / trail_tp_trigger_price) - 1.0) * 100.0
            trail_field := "TRL@+" + str.tostring(profit_at_trail, "#.##") + "%"
        else
            trail_field := "ARM(wait)"
    else
        // Show config
        trail_field := str.tostring(trail_tp_activation_pct, "#.##") + "%/" + str.tostring(trail_tp_buffer_pct, "#.##") + "%/" + str.tostring(trail_tp_trail_pct, "#.##") + "%"

// Follow TP field
string follow_tp_field = "OFF"
if use_follow_tp
    if follow_tp_armed and not na(follow_tp_trigger_price_e) and not na(pos_avg)
        // Show profit % at trigger level
        float profit_pct_at_trigger = direction == "LONG" ? ((follow_tp_trigger_price_e / pos_avg) - 1.0) * 100.0 : ((pos_avg / follow_tp_trigger_price_e) - 1.0) * 100.0
        follow_tp_field := "Armed@+" + str.tostring(profit_pct_at_trigger, "#.##") + "%"
    else
        // Show config
        follow_tp_field := str.tostring(follow_tp_activation_pct, "#.##") + "%@" + str.tostring(follow_tp_trail_pct, "#.##") + "%"

// Construct Row 9 (TP exits)
string tp_row = tp_field + " / " + trail_field + " / " + follow_tp_field

// SL field: Show whichever will trigger first (% or Price)
string sl_field = "OFF"
if in_pos
    bool sl_pct_active = use_sl
    bool sl_price_active = use_sl_at_price and not sl_at_price_completed
    
    if sl_pct_active or sl_price_active
        if sl_pct_active and not sl_price_active
            // Only % SL active
            sl_field := str.tostring(sl_pct, "#.##") + "%"
        else if sl_price_active and not sl_pct_active
            // Only SL at Price active
            int sl_price_int = int(math.round(sl_price_level))
            sl_field := "$" + str.tostring(sl_price_int)
        else
            // Both active - show whichever is closer
            float sl_pct_price = direction == "LONG" ? (pos_avg * (1 - sl_pct / 100.0)) : (pos_avg * (1 + sl_pct / 100.0))
            bool sl_pct_closer = direction == "LONG" ? (sl_pct_price > sl_price_level) : (sl_pct_price < sl_price_level)
            
            if sl_pct_closer
                sl_field := str.tostring(sl_pct, "#.##") + "%"
            else
                int sl_price_int = int(math.round(sl_price_level))
                sl_field := "$" + str.tostring(sl_price_int)
else
    // Not in position - show configured values
    if use_sl
        sl_field := str.tostring(sl_pct, "#.##") + "%"
    else if use_sl_at_price and not sl_at_price_completed
        int sl_price_int = int(math.round(sl_price_level))
        sl_field := "$" + str.tostring(sl_price_int)

        
// SLSO: Shows ON only if enabled AND SL is OFF; otherwise OFF-
string slso_field =
     (tp_before_last_so and so_number > 0 and not use_sl) ? "ON" : "OFF"

// SL in Profit field (novo)
string sl_profit_field = "OFF"
if use_sl_profit_at_price and in_pos and not na(sl_profit_price_target)
    if sl_profit_type == "Percent"
        // Display % from AVG (not target, but configured value)
        sl_profit_field := str.tostring(sl_profit_value, "#.##") + "%"
    else
        int sl_profit_int = int(math.round(sl_profit_price_target))
        sl_profit_field := "$" + str.tostring(sl_profit_int)

// Construct Row 10 (SL exits)
string sl_row = sl_field + " / " + slso_field + " / " + sl_profit_field

// Composite field in new order, without spaces
//string tp_trail_sl_slso = tp_field + " / " + trail_field + " / " + sl_field + " / " + slso_field


string tp_sl_trail  = str.tostring(tp_pct, "#.##") + "% / " + (use_sl ? str.tostring(sl_pct, "#.##") + "%" : "OFF") + " / " + (use_trail_tp ? (trail_is_armed ? (na(trail_tp_trigger_price) ? "ARM" : (trail_age_ok_tbl ? "ARM@" + str.tostring(trail_tp_trigger_price, "#.##") : "ARM(wait)")) : "ON") : "OFF")

// === Start/Exit (compact) ===
string start_field = use_start_price ? "Manual Start" : "—"
string stop_field = ""
if stop_on_exit
    if not na(stop_on_exit_armed_bar)
        stop_field := "Stop ARMED"
    else
        stop_field := "Stop (waiting)"
else
    stop_field := (use_tp_at_price or use_sl_at_price) ? "TP/SL Price" : "—"

string start_exit_value = start_field + " / " + stop_field

// Time in trade (Dd Hh Mm) — integer days/hours/minutes
int elapsed_ms = (in_pos and not na(entry_time_ms)) ? (time - entry_time_ms) : na
int total_min  = not na(elapsed_ms) ? math.max(0, int(elapsed_ms / 60000)) : na

int dd = not na(total_min) ? int(total_min / 1440) : na
int hh = not na(total_min) ? int((total_min % 1440) / 60) : na
int mm = not na(total_min) ? int(total_min % 60) : na

string time_in_trade = not na(total_min)
     ? (str.tostring(dd, "#") + "d " + str.tostring(hh, "#") + "h " + str.tostring(mm, "#") + "min")
     : "—"

string avg_sz_pnl   = in_pos ? ("$" + str.tostring(pos_avg, "#.##") + " | " + str.tostring(math.abs(strategy.position_size), "#.####") + " | " + unrl_pnl_str) : "N/A"

string next_so_idx  = session_active and so_next_idx < total_so ? (str.tostring(so_next_idx + 1) + "/" + str.tostring(total_so)) : "—"
string cds_bsoex    = str.tostring(cooldown_after_bo) + "/" + str.tostring(so_cooldown_bars) + "/" + str.tostring(cooldown_after_exit)

string status_text = ""

// Check Stop on Exit first (priority)
if stop_on_exit and not na(stop_on_exit_armed_bar)
    status_text := "STOP ARMED"
// Then check other statuses
else if bot_stopped
    status_text := "OFF"
else if pause_now_paused
    status_text := "PAUSED"
else if pause_now_armed
    status_text := "PAUSE ARMED"
else if manual_effective
    if manual_disarmed and in_pos
        status_text := "MANUAL DISARMED"
    else if start_price_forced_manual
        status_text := "MANUAL (Price)"
    else
        status_text := "MANUAL"
else
    status_text := "ON"
          
// color scheme for good visibility on light/dark themes
color tbl_header_bg = color.rgb(31, 119, 180, 15)   // bluish header (slightly transparent)
color tbl_body_bg   = color.rgb(255, 255, 255, 15)  // light background (slightly transparent)
color tbl_label_txt = color.black
color tbl_value_txt = color.black

// Status (ON/PAUSED/OFF) – should stand out, therefore low transparency (~20)
color status_bg =
     bot_stopped      ? color.rgb(220, 38, 38, 20)   // OFF (red)
   : pause_now_paused ? color.rgb(245, 158, 11, 20)  // PAUSED (orange)
   : pause_now_armed  ? color.rgb(139, 92, 246, 20)  // ARMED (purple)
                      : color.rgb(16, 185, 129, 20)  // ON (green)
//text_size=size.normal // slightly smaller font

// --- Fee projection for SELL (taker) ---
float fee_sell_proj_usd = in_pos ? (taker_fee_pct / 100.0) * pos_notional_now : 0.0

// Pretty strings (2 dec places). Funding can be negative (income) → show sign.
string fees_buy_str  = "$" + str.tostring(fee_buy_cum_usd, "#.##")
string fees_fund_str = na(fee_funding_cum_usd) ? "$0.00" : (fee_funding_cum_usd < 0 ? "-$" + str.tostring(math.abs(fee_funding_cum_usd), "#.##") :  "$" + str.tostring(fee_funding_cum_usd, "#.##"))
string fees_sell_str = "$" + str.tostring(fee_sell_proj_usd, "#.##")

string fees_three = fees_buy_str + " / " + fees_fund_str + " / " + fees_sell_str

// Create/update the table
if show_status_table
    if na(status_tbl) or (status_tbl_corner_prev != status_table_corner)
        if not na(status_tbl)
            table.delete(status_tbl)
        // 2 columns (label, value), 15 rows
        status_tbl := table.new(f_tbl_pos(status_table_corner), 2, 15, border_width=1)
        status_tbl_corner_prev := status_table_corner

    // Header-like row: Status
    table.cell(status_tbl, 0, 0, "Status",      text_color=color.white, bgcolor=tbl_header_bg)
    table.cell(status_tbl, 1, 0, status_text,   text_color=color.white, bgcolor=status_bg)

    // Body
    // Row 1
    table.cell(status_tbl, 0, 1, "Invested",           text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 1, invested_size,        text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 2
    table.cell(status_tbl, 0, 2, "Rem Funds",          text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 2, "$" + str.tostring(remaining_funds, "#.##"), text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 3  (Remaining/Total)
    table.cell(status_tbl, 0, 3, "Rem SO",                 text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 3, str.tostring(remaining_so) + "/" + str.tostring(total_so), text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 4 (Emergency SO - showing remaining, like Rem SO)
    int mso_remaining = mso_enable ? math.max(0, 3 - mso_next_idx) : 0
    string mso_status = mso_enable ? (str.tostring(mso_remaining) + "/3") : "-/-"
    table.cell(status_tbl, 0, 4, "Emergency SO",      text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 4, mso_status,          text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 5 (Avg/TP Price - both as integers)
    string avg_tp_price_str = "N/A"
    if in_pos
        int avg_int = int(math.round(pos_avg))
        int tp_int = na(tp_price) ? 0 : int(math.round(tp_price))
        avg_tp_price_str := "$" + str.tostring(avg_int) + " / $" + str.tostring(tp_int)
    table.cell(status_tbl, 0, 5, "Avg/TP Price",       text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 5, avg_tp_price_str,     text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 6
    table.cell(status_tbl, 0, 6, "PnL %/USD",              text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 6, unrl_pnl_both,        text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 7
    table.cell(status_tbl, 0, 7, "Next SO Price",      text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 7, na(next_so_price) ? "N/A" : "$" + str.tostring(next_so_price, "#.##"), text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 8
    table.cell(status_tbl, 0, 8, "Dir/Strategy",           text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 8, dir_mode_txt,         text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 9: TP exits
    table.cell(status_tbl, 0, 9, "TP/Trail/Follow TP", text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 9, tp_row, text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)    

    // Row 10: SL exits
    table.cell(status_tbl, 0, 10, "SL/SLSO/SL Profit", text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 10, sl_row, text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)    

    // Row 11 (NEW): Start/Exit
    table.cell(status_tbl, 0, 11, "Start/Exit",          text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 11, start_exit_value,      text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 12 (NEW): Time in trade
    table.cell(status_tbl, 0, 12, "Time in trade",      text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 12, time_in_trade,        text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 13: Fees  (Buy / Funding / Sell)
    table.cell(status_tbl, 0, 13, "Fees",  text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 13, fees_three, text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)

    // Row 14 (NEW): Total Profit
    string total_pnl_str = (total_realized_pnl_usd >= 0 ? "+" : "") + "$" + str.tostring(total_realized_pnl_usd, "#.##")
    table.cell(status_tbl, 0, 14, "Total Profit", text_color=tbl_label_txt, bgcolor=tbl_body_bg, text_size=size.normal)
    table.cell(status_tbl, 1, 14, total_pnl_str, text_color=tbl_value_txt, bgcolor=tbl_body_bg, text_size=size.normal)  

else
    if not na(status_tbl)
        table.delete(status_tbl)
        status_tbl := na

// ====== Classic alertconditions (optional) ======
alertcondition(entry_ok and strategy.position_size == 0 and direction == "LONG", title="WT ENTER LONG", message="ENTER LONG")
alertcondition(entry_ok and strategy.position_size == 0 and direction == "SHORT", title="WT ENTER SHORT", message="ENTER SHORT")
//alertcondition(so_filled_now, title="ADD (SO filled)", message="ADD")
//alertcondition(will_exit_this_bar, title="WT EXIT ALL", message="EXIT ALL")

// ====== Visualization: horizontal segments + vertical connectors (stepline) ======
var line avg_seg = na
var line tp_seg = na
var float last_avg_val = na
var float last_tp_val = na
var int last_session = na
var line[] avg_stems = array.new_line(0)
var line[] tp_stems = array.new_line(0)

f_add_stem(line[] arr, int x, float y1, float y2, color col, int cap) =>
    line l = line.new(x, y1, x, y2, xloc=xloc.bar_index, extend=extend.none, color=col, width=1)
    array.push(arr, l)
    // hard cap (performance & under 500 line objects overall)
    while array.size(arr) > cap
        line old = array.shift(arr)
        line.delete(old)

float avg_now = strategy.position_size != 0 ? strategy.position_avg_price : na
float tp_now = (strategy.position_size != 0 and use_tp) ? (direction == "LONG" ? strategy.position_avg_price * (1 + tp_pct / 100) : strategy.position_avg_price * (1 - tp_pct / 100)) : na

bool session_changed = na(last_session) or (pos_session != last_session)
bool no_position = strategy.position_size == 0

// Extend lines by one candle on SO trigger
if so_filled_now and not na(avg_now)
    if not na(avg_seg)
        line.set_x2(avg_seg, bar_index + 1)
        line.set_y2(avg_seg, last_avg_val)
    if not na(tp_seg)
        line.set_x2(tp_seg, bar_index + 1)
        line.set_y2(tp_seg, last_tp_val)

    // Create new line at bar_index with new value
    avg_seg := line.new(bar_index, avg_now, bar_index, avg_now, xloc=xloc.bar_index, extend=extend.none, color=color.yellow, width=1)
    tp_seg := line.new(bar_index, tp_now, bar_index, tp_now, xloc=xloc.bar_index, extend=extend.none, color=color.new(color.green, 0), width=1)
    last_avg_val := avg_now
    last_tp_val := tp_now

// Basic line updates
if session_changed or no_position
    if not na(avg_seg)
        line.set_x2(avg_seg, bar_index - 1)
        line.set_y2(avg_seg, last_avg_val)
    avg_seg := na
    last_avg_val := na
else
    if not na(avg_now)
        if na(avg_seg) or na(last_avg_val) or math.abs(avg_now - last_avg_val) > 0.000001
            if not na(avg_seg) and not na(last_avg_val)
                line.set_x2(avg_seg, bar_index)
                line.set_y2(avg_seg, last_avg_val)
            if not na(last_avg_val)
                f_add_stem(avg_stems, bar_index, last_avg_val, avg_now, color.yellow, stems_cap)
            avg_seg := line.new(bar_index, avg_now, bar_index, avg_now, xloc=xloc.bar_index, extend=extend.none, color=color.yellow, width=1)
        else
            line.set_x2(avg_seg, bar_index)
            line.set_y2(avg_seg, last_avg_val)
        last_avg_val := avg_now

if session_changed or no_position
    if not na(tp_seg)
        line.set_x2(tp_seg, bar_index - 1)
        line.set_y2(tp_seg, last_tp_val)
    tp_seg := na
    last_tp_val := na
else
    if not na(tp_now)
        if na(tp_seg) or na(last_tp_val) or math.abs(tp_now - last_tp_val) > 0.000001
            if not na(tp_seg) and not na(last_tp_val)
                line.set_x2(tp_seg, bar_index)
                line.set_y2(tp_seg, last_tp_val)
            if not na(last_tp_val)
                f_add_stem(tp_stems, bar_index, last_tp_val, tp_now, color.new(color.green, 0), stems_cap)
            tp_seg := line.new(bar_index, tp_now, bar_index, tp_now, xloc=xloc.bar_index, extend=extend.none, color=color.new(color.green, 0), width=1)
        else
            line.set_x2(tp_seg, bar_index)
            line.set_y2(tp_seg, last_tp_val)
        last_tp_val := tp_now

last_session := pos_session


// AVG/TP price scale display (always visible in sidebar)
plot(not na(avg_now) ? avg_now : na, "AVG", color=color.new(color.yellow, 0), linewidth=1, display=display.price_scale)
plot(not na(tp_now) ? tp_now : na, "TP", color=color.new(color.green, 0), linewidth=1, display=display.price_scale)

// AVG/TP history (optional continuous plot line on chart)
plot(show_avg_tp_history and not na(avg_now) ? avg_now : na,
     "AVG (history)", color=color.new(color.yellow, 0), linewidth=1, style=plot.style_linebr)

plot(show_avg_tp_history and not na(tp_now) ? tp_now : na,
     "TP (history)",  color=color.new(color.green, 0), linewidth=1, style=plot.style_linebr)

// Additional visualization
plot(rsi, "RSI", linewidth=1)
hline(50, "RSI 50", color=color.gray)
plot(macdLine, "MACD Line", color=color.new(color.blue, 0))
plot(signalLine, "Signal Line", color=color.new(color.red, 0))
// Diagnostic: show trail activation levels (ARM, BUFFER exit, TRAIL activation)
float _trail_arm_level = in_pos and use_trail_tp ? (direction == "LONG" ? pos_avg * (1 + trail_tp_activation_pct / 100.0) : pos_avg * (1 - trail_tp_activation_pct / 100.0)) : na
float _trail_buffer_exit = in_pos and use_trail_tp ? (direction == "LONG" ? pos_avg * (1 + (trail_tp_activation_pct - trail_tp_buffer_pct) / 100.0) : pos_avg * (1 - (trail_tp_activation_pct - trail_tp_buffer_pct) / 100.0)) : na
float _trail_full_activation = in_pos and use_trail_tp ? (direction == "LONG" ? pos_avg * (1 + (trail_tp_activation_pct + trail_tp_trail_pct) / 100.0) : pos_avg * (1 - (trail_tp_activation_pct + trail_tp_trail_pct) / 100.0)) : na

plot(_trail_arm_level, "Trail ARM Level", color=color.new(color.orange, 70), style=plot.style_linebr)
plot(_trail_buffer_exit, "Trail BUFFER Exit", color=color.new(color.red, 70), style=plot.style_linebr)
plot(_trail_full_activation, "Trail ACTIVATION", color=color.new(color.teal, 70), style=plot.style_linebr)

plot(use_sl and in_pos ? sl_price : na, "Stop Loss", color=color.new(color.purple, 0), style=plot.style_cross)
//plot(use_trail_tp and in_pos and trail_is_armed ? trail_tp_trigger_price : na, "Trail Profit trigger", color=color.new(color.teal, 0), style=plot.style_linebr)
// TP/SL at Price levels
plot(use_tp_at_price and in_pos and not na(tp_price_target) ? tp_price_target : na, 
     "TP at Price", color=color.new(color.lime, 0), linewidth=2, style=plot.style_circles)
     
plot(use_sl_at_price and in_pos and not na(sl_price_target) ? sl_price_target : na, 
     "SL at Price", color=color.new(color.red, 0), linewidth=2, style=plot.style_circles)

plot(use_sl_profit_at_price and in_pos and not na(sl_profit_price_target) ? sl_profit_price_target : na,
     "SL in Profit at Price", color=color.new(color.orange, 0), linewidth=2, style=plot.style_cross)

// Top layer (your actual color; can be purple/white/teal)
plot(use_trail_tp and in_pos and trail_is_armed ? trail_tp_trigger_price : na,
     "Trail Profit trigger", color=color.new(color.purple, 0), linewidth=6, style=plot.style_linebr)

// Follow TP trigger line
float follow_tp_trigger_display = na
if use_follow_tp and in_pos and follow_tp_armed and not na(follow_tp_trail_pct_locked)
    if direction == "LONG" and not na(hh_since_follow_activation)
        follow_tp_trigger_display := hh_since_follow_activation * (1 - follow_tp_trail_pct_locked / 100.0)
    else if direction == "SHORT" and not na(ll_since_follow_activation)
        follow_tp_trigger_display := ll_since_follow_activation * (1 + follow_tp_trail_pct_locked / 100.0)

plot(follow_tp_trigger_display, "Follow TP Trigger", color=color.new(color.blue, 0), linewidth=3, style=plot.style_linebr)

// Visualization for debugging SO trigger
plotshape(soLabelToggle and breach_confirmed_any, title="SO Trigger", location=location.belowbar, color=color.yellow, style=shape.triangleup, size=size.tiny)
plotshape(soLabelToggle and deepest_touched, title="Deepest Touch", location=location.abovebar, color=color.green, style=shape.triangledown, size=size.tiny)

// ⇩ sem prilepi debug plotchar
plotchar(bo_alert_due, title="BO due", char='B', location=location.bottom)
plotchar(so_alert_due, title="SO due", char='S', location=location.bottom)

/// --- Send-on-close dispatcher (fallback only) ---
var int bo_due_since = na
bo_due_since := bo_alert_due ? (na(bo_due_since) ? bar_index : bo_due_since) : na
bool bo_force_flush = bo_alert_due and not na(bo_due_since) and (bar_index - bo_due_since >= 1)  // after ≥1 bar

/// --- Send-on-close dispatcher (priority: EXIT > SO > BO) ---
if barstate.isconfirmed
    // EXIT should have priority if anything is due
    if exit_alert_due and (na(last_alert_bar_exit) or bar_index > last_alert_bar_exit) and (na(last_alert_bar_any) or bar_index > last_alert_bar_any)
        alert(exit_alert_msg_q, alert.freq_once_per_bar_close)
        last_alert_bar_any  := bar_index
        last_alert_bar_exit := bar_index
        exit_alert_due := false

    // SO next
    else if so_alert_due and (so_alert_msg != "") and (na(last_alert_bar_so) or bar_index > last_alert_bar_so) and (na(last_alert_bar_any) or bar_index > last_alert_bar_any)
        alert(so_alert_msg, alert.freq_once_per_bar_close)
        last_alert_bar_any := bar_index
        last_alert_bar_so  := bar_index
        so_alert_due := false

    // BO last
    else if bo_alert_due and (na(last_alert_bar_bo) or bar_index > last_alert_bar_bo) and (na(last_alert_bar_any) or bar_index > last_alert_bar_any)
        alert(bo_alert_msg, alert.freq_once_per_bar_close)
        last_alert_bar_any := bar_index
        last_alert_bar_bo  := bar_index
        bo_alert_due := false

// Clear ladder when truly flat (after fills), not on same bar as BO/SO
if barstate.isconfirmed and strategy.position_size == 0 and ladder_active and
     (na(last_entry_bar) or bar_index > last_entry_bar) and
     (na(lastSOBar) or bar_index > lastSOBar)
    ladder_active := false
    array.clear(so_prices)
    array.clear(so_usds)
    array.clear(so_filled)
    so_next_idx := 0
    so_armed_idx := -1
    lastSOBar := na
    last_so_fill_price := na