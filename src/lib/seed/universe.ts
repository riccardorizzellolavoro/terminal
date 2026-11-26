import { OhlcvBar, QuoteSnapshot, TickerProfile } from "@/lib/types";

export const SYMBOL_ALIASES: Record<string, string> = {
  EURUSD: "EURUSD=X",
  USDJPY: "USDJPY=X",
  GBPUSD: "GBPUSD=X",
  USDCHF: "USDCHF=X",
  EURCHF: "EURCHF=X",
  EURGBP: "EURGBP=X",
  BTCUSD: "BTC-USD",
  ETHUSD: "ETH-USD",
  SOLUSD: "SOL-USD",
  DXY: "DX-Y.NYB",
};

export function normalizeSymbol(raw: string): string {
  const upper = raw.trim().toUpperCase();
  return SYMBOL_ALIASES[upper] ?? upper;
}

export const TICKER_UNIVERSE: Record<string, TickerProfile> = {
  // 1. Equities & Global Stocks
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetClass: "equity",
    sector: "US Tech · Consumer Hardware",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0000320193",
    description:
      "Apple designs and markets smartphones, Macs, wearables, and high-margin digital services across an installed base exceeding 2.2 billion active devices.",
    descriptionIt:
      "Apple progetta e commercializza smartphone, Mac, dispositivi indossabili e servizi digitali ad alto margine su una base installata di oltre 2,2 miliardi di dispositivi.",
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    assetClass: "equity",
    sector: "US Tech · AI Semiconductors",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0001045810",
    description:
      "NVIDIA leads accelerated computing and AI data-center infrastructure across GPUs, high-speed networking, and the CUDA software ecosystem.",
    descriptionIt:
      "NVIDIA guida il calcolo accelerato e le infrastrutture AI per data center con GPU, reti ad alta velocità ed ecosistema software CUDA.",
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    assetClass: "equity",
    sector: "US Tech · Cloud & Enterprise",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0000789019",
    description:
      "Microsoft delivers enterprise cloud via Azure, Microsoft 365 productivity tools, and developer infrastructure with durable recurring revenue.",
    descriptionIt:
      "Microsoft offre cloud aziendale tramite Azure, suite di produttività Microsoft 365 e infrastrutture per sviluppatori con ricavi ricorrenti.",
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    assetClass: "equity",
    sector: "US Consumer · EV & Energy Storage",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0001318605",
    description:
      "Tesla manufactures battery electric vehicles, grid-scale Megapack energy storage systems, and autonomous driving neural software.",
    descriptionIt:
      "Tesla produce veicoli elettrici, sistemi di accumulo energetico Megapack su scala di rete e software neurale per la guida autonoma.",
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    assetClass: "equity",
    sector: "US Tech · Search & Cloud",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0001652044",
    description:
      "Alphabet operates Google Search, YouTube, Google Cloud, and DeepMind AI infrastructure globally with strong free cash flow generation.",
    descriptionIt:
      "Alphabet gestisce Google Search, YouTube, Google Cloud e l'infrastruttura AI DeepMind a livello globale con elevata generazione di cassa.",
  },
  META: {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    assetClass: "equity",
    sector: "US Tech · Social & AI",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0001326801",
    description:
      "Meta connects over 3.2 billion daily users across Facebook, Instagram, and WhatsApp while scaling open-weight Llama AI infrastructure.",
    descriptionIt:
      "Meta connette oltre 3,2 miliardi di utenti giornalieri su Facebook, Instagram e WhatsApp sviluppando l'infrastruttura AI Llama.",
  },
  CRM: {
    symbol: "CRM",
    name: "Salesforce, Inc.",
    assetClass: "equity",
    sector: "US Tech · Enterprise CRM",
    exchange: "NYSE",
    currency: "USD",
    cik: "0001108524",
    description:
      "Salesforce provides cloud CRM, Data Cloud analytics, Slack collaboration, and enterprise Agentforce automation globally.",
    descriptionIt:
      "Salesforce fornisce CRM cloud, analisi Data Cloud, collaborazione Slack e automazione aziendale Agentforce a livello globale.",
  },
  UNH: {
    symbol: "UNH",
    name: "UnitedHealth Group",
    assetClass: "equity",
    sector: "US Healthcare · Managed Care",
    exchange: "NYSE",
    currency: "USD",
    cik: "0000731766",
    description:
      "UnitedHealth Group combines UnitedHealthcare insurance benefits with Optum clinical, pharmacy, and health analytics platforms.",
    descriptionIt:
      "UnitedHealth Group integra coperture sanitarie UnitedHealthcare con i servizi clinici, farmaceutici e analitici di Optum.",
  },
  "ENI.MI": {
    symbol: "ENI.MI",
    name: "Eni S.p.A.",
    assetClass: "equity",
    sector: "Italy · Integrated Energy",
    exchange: "MILAN",
    currency: "EUR",
    description:
      "Eni is an Italian integrated energy company active in upstream gas/LNG, refining, Plenitude renewables, and industrial bio-conversion.",
    descriptionIt:
      "Eni è una società energetica integrata italiana attiva in esplorazione gas/GNL, raffinazione, energie rinnovabili Plenitude e bioraffinazione.",
  },
  "RACE.MI": {
    symbol: "RACE.MI",
    name: "Ferrari N.V.",
    assetClass: "equity",
    sector: "Italy · Luxury Automotive",
    exchange: "MILAN",
    currency: "EUR",
    description:
      "Ferrari engineers and crafts ultra-luxury performance sports cars in Maranello with industry-leading operating margins and waitlist visibility.",
    descriptionIt:
      "Ferrari progetta e realizza auto sportive di lusso a Maranello con margini operativi leader nel settore e portafoglio ordini pluriennale.",
  },
  "UCG.MI": {
    symbol: "UCG.MI",
    name: "UniCredit S.p.A.",
    assetClass: "equity",
    sector: "Italy · Pan-European Banking",
    exchange: "MILAN",
    currency: "EUR",
    description:
      "UniCredit is a leading pan-European commercial banking group serving Italy, Germany, and Central/Eastern Europe with strong capital return.",
    descriptionIt:
      "UniCredit è un gruppo bancario commerciale paneuropeo leader in Italia, Germania ed Europa centro-orientale con elevata solidità patrimoniale.",
  },
  "SAP.DE": {
    symbol: "SAP.DE",
    name: "SAP SE",
    assetClass: "equity",
    sector: "Europe Tech · Enterprise ERP",
    exchange: "XETRA",
    currency: "EUR",
    description:
      "SAP is Europe's largest enterprise application software provider powering global ERP, supply chain, and cloud business transformation.",
    descriptionIt:
      "SAP è il principale fornitore europeo di software gestionale aziendale ERP, supply chain e trasformazione cloud.",
  },
  "ASML.AS": {
    symbol: "ASML.AS",
    name: "ASML Holding N.V.",
    assetClass: "equity",
    sector: "Europe Tech · EUV Lithography",
    exchange: "EURONEXT",
    currency: "EUR",
    description:
      "ASML holds a monopoly in extreme ultraviolet (EUV) lithography systems essential for manufacturing leading-edge semiconductor nodes.",
    descriptionIt:
      "ASML detiene il monopolio nei sistemi di litografia EUV essenziali per la produzione dei semiconduttori più avanzati.",
  },

  // 2. ETFs & Funds
  SPY: {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    assetClass: "etf",
    sector: "ETF · US Large Cap",
    exchange: "NYSE ARCA",
    currency: "USD",
    expenseRatio: 0.09,
    description:
      "Tracks the S&P 500 Index of the 500 largest US publicly traded companies with unmatched equity & options liquidity.",
    descriptionIt:
      "Replica l'indice S&P 500 delle 500 maggiori società statunitensi quotate con la massima liquidità su azioni e opzioni.",
  },
  QQQ: {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    assetClass: "etf",
    sector: "ETF · Nasdaq 100 Growth",
    exchange: "NASDAQ",
    currency: "USD",
    expenseRatio: 0.2,
    description:
      "Tracks the Nasdaq-100 Index, concentrating in mega-cap US technology, semiconductors, and consumer platforms.",
    descriptionIt:
      "Replica l'indice Nasdaq-100 concentrandosi sui titoli tecnologici, semiconduttori e piattaforme digitali USA a grande capitalizzazione.",
  },
  "IWDA.AS": {
    symbol: "IWDA.AS",
    name: "iShares Core MSCI World UCITS ETF",
    assetClass: "etf",
    sector: "UCITS ETF · Developed Global",
    exchange: "EURONEXT",
    currency: "EUR",
    expenseRatio: 0.2,
    description:
      "Accumulating UCITS ETF providing broad developed-market equity exposure across 23 countries and 1,400+ companies.",
    descriptionIt:
      "ETF UCITS ad accumulazione che offre esposizione azionaria globale sui mercati sviluppati in 23 paesi e oltre 1.400 aziende.",
  },
  "VWCE.DE": {
    symbol: "VWCE.DE",
    name: "Vanguard FTSE All-World UCITS ETF",
    assetClass: "etf",
    sector: "UCITS ETF · All-World Equity",
    exchange: "XETRA",
    currency: "EUR",
    expenseRatio: 0.22,
    description:
      "Accumulating UCITS ETF covering both developed and emerging stock markets globally in a single diversified fund.",
    descriptionIt:
      "ETF UCITS ad accumulazione che copre sia i mercati azionari sviluppati che quelli emergenti in un unico fondo globale.",
  },
  TLT: {
    symbol: "TLT",
    name: "iShares 20+ Year Treasury Bond ETF",
    assetClass: "etf",
    sector: "ETF · Long-Duration US Treasuries",
    exchange: "NASDAQ",
    currency: "USD",
    expenseRatio: 0.15,
    description:
      "Tracks US Treasury bonds with remaining maturities exceeding 20 years, offering high duration sensitivity to interest-rate shifts.",
    descriptionIt:
      "Replica titoli di Stato USA con scadenza superiore a 20 anni, con elevata sensibilità (duration) alle variazioni dei tassi.",
  },
  HYG: {
    symbol: "HYG",
    name: "iShares iBoxx $ High Yield Bond ETF",
    assetClass: "etf",
    sector: "ETF · High Yield Credit",
    exchange: "NYSE ARCA",
    currency: "USD",
    expenseRatio: 0.49,
    description:
      "Provides exposure to liquid US dollar-denominated high-yield corporate debt and serves as a benchmark for credit risk appetite.",
    descriptionIt:
      "Offre esposizione a obbligazioni societarie high yield in USD ed è un termometro chiave della propensione al rischio di credito.",
  },
  LQD: {
    symbol: "LQD",
    name: "iShares iBoxx $ Investment Grade ETF",
    assetClass: "etf",
    sector: "ETF · Investment Grade Credit",
    exchange: "NYSE ARCA",
    currency: "USD",
    expenseRatio: 0.14,
    description:
      "Tracks liquid US investment-grade corporate bonds issued by blue-chip corporations across sectors.",
    descriptionIt:
      "Replica obbligazioni societarie statunitensi investment-grade ad alta liquidità emesse da grandi gruppi industriali e finanziari.",
  },
  GLD: {
    symbol: "GLD",
    name: "SPDR Gold Shares",
    assetClass: "etf",
    sector: "ETF · Physical Gold",
    exchange: "NYSE ARCA",
    currency: "USD",
    expenseRatio: 0.4,
    description:
      "Physically backed ETF tracking the spot price of gold bullion held in allocated vaults.",
    descriptionIt:
      "ETF a replica fisica che segue il prezzo spot dell'oro detenuto in caveau allocati.",
  },
  VNQ: {
    symbol: "VNQ",
    name: "Vanguard Real Estate ETF",
    assetClass: "etf",
    sector: "ETF · US REITs",
    exchange: "NYSE ARCA",
    currency: "USD",
    expenseRatio: 0.12,
    description:
      "Invests broadly in US Real Estate Investment Trusts spanning industrial logistics, data centers, residential, and retail.",
    descriptionIt:
      "Investe in fondi immobiliari (REIT) statunitensi tra logistica industriale, data center, residenziale e commerciale.",
  },
  SHY: {
    symbol: "SHY",
    name: "iShares 1-3 Year Treasury Bond ETF",
    assetClass: "etf",
    sector: "ETF · Short-Term Treasuries",
    exchange: "NASDAQ",
    currency: "USD",
    expenseRatio: 0.15,
    description:
      "Short-duration US Treasury bond ETF providing cash-like yield with minimal interest-rate duration risk.",
    descriptionIt:
      "ETF su titoli di Stato USA a breve scadenza (1-3 anni) con rendimento vicino ai tassi monetari e basso rischio tassi.",
  },
  IEF: {
    symbol: "IEF",
    name: "iShares 7-10 Year Treasury Bond ETF",
    assetClass: "etf",
    sector: "ETF · Intermediate Treasuries",
    exchange: "NASDAQ",
    currency: "USD",
    expenseRatio: 0.15,
    description:
      "Tracks intermediate-term 7–10 year US Treasury notes, anchoring balanced fixed-income portfolios.",
    descriptionIt:
      "Replica titoli del Tesoro USA a medio termine (7-10 anni), punto di riferimento per portafogli obbligazionari bilanciati.",
  },

  // 3. Global Indices
  "^GSPC": {
    symbol: "^GSPC",
    name: "S&P 500 Index",
    assetClass: "index",
    sector: "Index · US Large Cap",
    exchange: "INDEX",
    currency: "USD",
    description:
      "Benchmark market-cap weighted index tracking 500 leading US companies across all 11 GICS sectors.",
    descriptionIt:
      "Indice benchmark ponderato per capitalizzazione che misura le 500 principali società quotate negli Stati Uniti.",
  },
  "^NDX": {
    symbol: "^NDX",
    name: "Nasdaq-100 Index",
    assetClass: "index",
    sector: "Index · US Technology & Growth",
    exchange: "INDEX",
    currency: "USD",
    description:
      "Index comprising the 100 largest non-financial companies listed on the Nasdaq Stock Market.",
    descriptionIt:
      "Indice che raggruppa le 100 maggiori società non finanziarie quotate sul mercato Nasdaq.",
  },
  "^DJI": {
    symbol: "^DJI",
    name: "Dow Jones Industrial Average",
    assetClass: "index",
    sector: "Index · US Blue Chips",
    exchange: "INDEX",
    currency: "USD",
    description:
      "Price-weighted index of 30 prominent blue-chip US industrial, financial, and consumer corporations.",
    descriptionIt:
      "Indice ponderato per prezzo composto da 30 storiche società blue-chip statunitensi.",
  },
  "FTSEMIB.MI": {
    symbol: "FTSEMIB.MI",
    name: "FTSE MIB Index",
    assetClass: "index",
    sector: "Index · Italy Benchmark",
    exchange: "BORSA ITALIANA",
    currency: "EUR",
    description:
      "Primary benchmark index for Borsa Italiana, tracking the 40 most liquid and capitalized Italian equities.",
    descriptionIt:
      "Principale indice di riferimento di Borsa Italiana che misura i 40 titoli azionari italiani più liquidi e capitalizzati.",
  },
  "^STOXX50E": {
    symbol: "^STOXX50E",
    name: "EURO STOXX 50",
    assetClass: "index",
    sector: "Index · Eurozone Blue Chips",
    exchange: "INDEX",
    currency: "EUR",
    description:
      "Tracks 50 supersector blue-chip leaders across 11 Eurozone economies.",
    descriptionIt:
      "Indice delle 50 maggiori società blue-chip dell'Area Euro in tutti i principali settori.",
  },
  "^GDAXI": {
    symbol: "^GDAXI",
    name: "DAX Performance Index",
    assetClass: "index",
    sector: "Index · Germany",
    exchange: "XETRA",
    currency: "EUR",
    description:
      "Total-return benchmark index tracking the 40 largest German companies traded on the Frankfurt Stock Exchange.",
    descriptionIt:
      "Indice total-return delle 40 maggiori società tedesche quotate alla Borsa di Francoforte.",
  },
  "^N225": {
    symbol: "^N225",
    name: "Nikkei 225",
    assetClass: "index",
    sector: "Index · Japan",
    exchange: "TSE",
    currency: "JPY",
    description:
      "Japan's flagship price-weighted equity index covering 225 top-tier companies on the Tokyo Stock Exchange.",
    descriptionIt:
      "Principale indice azionario giapponese composto dalle 225 maggiori società quotate alla Borsa di Tokyo.",
  },
  "^VIX": {
    symbol: "^VIX",
    name: "CBOE Volatility Index (VIX)",
    assetClass: "index",
    sector: "Index · Implied Volatility",
    exchange: "CBOE",
    currency: "USD",
    description:
      "Measures the market's 30-day expected implied volatility derived from S&P 500 index options.",
    descriptionIt:
      "Misura la volatilità implicita attesa a 30 giorni ricavata dalle opzioni sull'indice S&P 500.",
  },

  // 4. Forex / Currencies
  "EURUSD=X": {
    symbol: "EURUSD=X",
    name: "EUR / USD",
    assetClass: "fx",
    sector: "G10 Forex",
    exchange: "FX SPOT",
    currency: "USD",
    description:
      "World's most traded currency pair reflecting ECB vs Federal Reserve rate differentials and transatlantic capital flows.",
    descriptionIt:
      "La coppia valutaria più scambiata al mondo: riflette il differenziale tassi BCE vs Fed e i flussi transatlantici.",
  },
  "USDJPY=X": {
    symbol: "USDJPY=X",
    name: "USD / JPY",
    assetClass: "fx",
    sector: "G10 Forex",
    exchange: "FX SPOT",
    currency: "JPY",
    description:
      "Benchmark carry-trade and Treasury-yield-sensitive pair tracking US dollar strength against the Japanese yen.",
    descriptionIt:
      "Coppia valutaria sensibile ai rendimenti dei Treasury USA e alle dinamiche di carry trade con lo yen giapponese.",
  },
  "GBPUSD=X": {
    symbol: "GBPUSD=X",
    name: "GBP / USD",
    assetClass: "fx",
    sector: "G10 Forex",
    exchange: "FX SPOT",
    currency: "USD",
    description:
      "Tracks the British pound sterling against the US dollar, driven by Bank of England policy and UK gilt yields.",
    descriptionIt:
      "Misura il cambio tra sterlina britannica e dollaro USA, guidato dalla politica Bank of England e dai rendimenti Gilt.",
  },
  "USDCHF=X": {
    symbol: "USDCHF=X",
    name: "USD / CHF",
    assetClass: "fx",
    sector: "G10 Forex",
    exchange: "FX SPOT",
    currency: "CHF",
    description:
      "Pairs the US dollar with the Swiss franc, a traditional global safe-haven reserve currency.",
    descriptionIt:
      "Cambio tra dollaro USA e franco svizzero, storica valuta rifugio globale.",
  },
  "EURCHF=X": {
    symbol: "EURCHF=X",
    name: "EUR / CHF",
    assetClass: "fx",
    sector: "European Cross",
    exchange: "FX SPOT",
    currency: "CHF",
    description:
      "Barometer of European sovereign risk appetite and Swiss National Bank monetary policy.",
    descriptionIt:
      "Termometro del rischio sistemico europeo e della politica monetaria della Banca Nazionale Svizzera.",
  },
  "EURGBP=X": {
    symbol: "EURGBP=X",
    name: "EUR / GBP",
    assetClass: "fx",
    sector: "European Cross",
    exchange: "FX SPOT",
    currency: "GBP",
    description:
      "Tracks relative growth and interest-rate trajectories between the Eurozone and the United Kingdom.",
    descriptionIt:
      "Misura la forza relativa e le aspettative sui tassi tra Area Euro e Regno Unito.",
  },
  "DX-Y.NYB": {
    symbol: "DX-Y.NYB",
    name: "US Dollar Index (DXY)",
    assetClass: "fx",
    sector: "FX Basket Index",
    exchange: "ICE",
    currency: "USD",
    description:
      "Measures the US dollar against a trade-weighted basket of six major currencies (EUR, JPY, GBP, CAD, SEK, CHF).",
    descriptionIt:
      "Misura il valore del dollaro USA rispetto a un paniere ponderato di sei valute principali (EUR, JPY, GBP, CAD, SEK, CHF).",
  },

  // 5. Cryptocurrencies
  "BTC-USD": {
    symbol: "BTC-USD",
    name: "Bitcoin",
    assetClass: "crypto",
    sector: "Crypto · Layer 1 Monetary",
    exchange: "BINANCE / SPOT",
    currency: "USD",
    description:
      "Decentralized proof-of-work digital asset with a capped 21M supply, streamed live via Binance WebSocket ticks.",
    descriptionIt:
      "Asset digitale decentralizzato proof-of-work con offerta massima di 21 milioni, aggiornato in tempo reale via Binance WebSocket.",
  },
  "ETH-USD": {
    symbol: "ETH-USD",
    name: "Ethereum",
    assetClass: "crypto",
    sector: "Crypto · Smart Contracts",
    exchange: "BINANCE / SPOT",
    currency: "USD",
    description:
      "Leading programmable smart-contract network powering DeFi, tokenized real-world assets, and Layer-2 rollups.",
    descriptionIt:
      "Principale rete smart contract programmabile alla base di DeFi, asset tokenizzati e rollup Layer-2.",
  },
  "SOL-USD": {
    symbol: "SOL-USD",
    name: "Solana",
    assetClass: "crypto",
    sector: "Crypto · High-Throughput L1",
    exchange: "BINANCE / SPOT",
    currency: "USD",
    description:
      "High-throughput monolithic blockchain utilizing Proof of History for low-latency decentralized execution.",
    descriptionIt:
      "Blockchain ad alta capacità progettata per esecuzione decentralizzata a bassa latenza e commissioni minime.",
  },
  "XRP-USD": {
    symbol: "XRP-USD",
    name: "XRP",
    assetClass: "crypto",
    sector: "Crypto · Cross-Border Settlement",
    exchange: "BINANCE / SPOT",
    currency: "USD",
    description:
      "Digital settlement token designed for rapid cross-border institutional liquidity and payment corridors.",
    descriptionIt:
      "Token di regolamento progettato per pagamenti transfrontalieri rapidi e liquidità interbancaria.",
  },
  "ADA-USD": {
    symbol: "ADA-USD",
    name: "Cardano",
    assetClass: "crypto",
    sector: "Crypto · Proof-of-Stake L1",
    exchange: "BINANCE / SPOT",
    currency: "USD",
    description:
      "Peer-reviewed Proof-of-Stake blockchain focused on formal verification and decentralized governance.",
    descriptionIt:
      "Blockchain Proof-of-Stake orientata a verifica formale del codice e governance decentralizzata.",
  },
  "BNB-USD": {
    symbol: "BNB-USD",
    name: "BNB",
    assetClass: "crypto",
    sector: "Crypto · Exchange & L1 Ecosystem",
    exchange: "BINANCE / SPOT",
    currency: "USD",
    description:
      "Native utility and gas token powering the BNB Smart Chain ecosystem and global liquidity venues.",
    descriptionIt:
      "Token nativo di utilità e gas dell'ecosistema BNB Smart Chain e delle relative piattaforme di liquidità.",
  },

  // 6. Commodities & Futures
  "GC=F": {
    symbol: "GC=F",
    name: "COMEX Gold Futures",
    assetClass: "commodity",
    sector: "Precious Metals",
    exchange: "COMEX",
    currency: "USD",
    description:
      "Benchmark gold futures contract (100 troy oz) driven by real yields, central bank demand, and CFTC positioning.",
    descriptionIt:
      "Contratto futures di riferimento sull'oro (100 once troy), guidato da tassi reali, acquisti delle banche centrali e flussi CFTC.",
  },
  "SI=F": {
    symbol: "SI=F",
    name: "COMEX Silver Futures",
    assetClass: "commodity",
    sector: "Precious & Industrial Metals",
    exchange: "COMEX",
    currency: "USD",
    description:
      "Dual monetary and industrial metal futures contract with heavy solar PV and electronics demand.",
    descriptionIt:
      "Futures sull'argento, metallo sia monetario che industriale con forte domanda dal fotovoltaico ed elettronica.",
  },
  "CL=F": {
    symbol: "CL=F",
    name: "WTI Crude Oil Futures",
    assetClass: "commodity",
    sector: "Energy",
    exchange: "NYMEX",
    currency: "USD",
    description:
      "West Texas Intermediate light sweet crude benchmark for North American energy pricing and OPEC+ balance.",
    descriptionIt:
      "Petrolio greggio WTI di riferimento per il mercato nordamericano e gli equilibri di offerta OPEC+.",
  },
  "BZ=F": {
    symbol: "BZ=F",
    name: "Brent Crude Oil Futures",
    assetClass: "commodity",
    sector: "Energy",
    exchange: "ICE",
    currency: "USD",
    description:
      "Global seaborne crude oil benchmark pricing two-thirds of internationally traded crude oil supplies.",
    descriptionIt:
      "Riferimento mondiale per il petrolio greggio scambiato via mare, utilizzato per circa due terzi delle forniture globali.",
  },
  "NG=F": {
    symbol: "NG=F",
    name: "Henry Hub Natural Gas",
    assetClass: "commodity",
    sector: "Energy",
    exchange: "NYMEX",
    currency: "USD",
    description:
      "US natural gas futures benchmark sensitive to seasonal heating/cooling demand, LNG exports, and storage injections.",
    descriptionIt:
      "Futures sul gas naturale Henry Hub USA, sensibile a stagionalità termica, export GNL e scorte.",
  },
  "HG=F": {
    symbol: "HG=F",
    name: "COMEX Copper Futures",
    assetClass: "commodity",
    sector: "Industrial Metals",
    exchange: "COMEX",
    currency: "USD",
    description:
      "Dr. Copper industrial bellwether reflecting global manufacturing, grid electrification, and data-center buildouts.",
    descriptionIt:
      "Barometro industriale globale legato a manifattura, elettrificazione delle reti e costruzione di data center.",
  },
  "ZC=F": {
    symbol: "ZC=F",
    name: "CBOT Corn Futures",
    assetClass: "commodity",
    sector: "Agriculture",
    exchange: "CBOT",
    currency: "USD",
    description:
      "Benchmark North American corn grain futures tracked for weather cycles, ethanol demand, and USDA crop reports.",
    descriptionIt:
      "Futures agricolo di riferimento sul mais, influenzato da cicli climatici, domanda di etanolo e report USDA.",
  },
  "ZW=F": {
    symbol: "ZW=F",
    name: "CBOT Wheat Futures",
    assetClass: "commodity",
    sector: "Agriculture",
    exchange: "CBOT",
    currency: "USD",
    description:
      "Global soft red winter wheat benchmark futures sensitive to Black Sea exports and global grain inventories.",
    descriptionIt:
      "Futures di riferimento sul grano, sensibile alle esportazioni globali e ai livelli delle scorte cerealicole.",
  },

  // 7. Bonds, Sovereign Yields & Rates
  US2Y: {
    symbol: "US2Y",
    name: "US 2Y Treasury Yield",
    assetClass: "bond",
    sector: "US Sovereign Yield",
    exchange: "FRED / US TREASURY",
    currency: "%",
    maturity: "2 Years",
    description:
      "Tracks the 2-year US Treasury note yield, closely anchored to near-term Federal Reserve interest-rate expectations.",
    descriptionIt:
      "Rendimento del Treasury USA a 2 anni, strettamente legato alle aspettative sui tassi a breve della Federal Reserve.",
  },
  US5Y: {
    symbol: "US5Y",
    name: "US 5Y Treasury Yield",
    assetClass: "bond",
    sector: "US Sovereign Yield",
    exchange: "FRED / US TREASURY",
    currency: "%",
    maturity: "5 Years",
    description:
      "Belly of the US Treasury curve reflecting medium-term growth, inflation, and neutral-rate pricing.",
    descriptionIt:
      "Tratto intermedio della curva USA a 5 anni, indicativo di crescita a medio termine e aspettative di inflazione.",
  },
  US10Y: {
    symbol: "US10Y",
    name: "US 10Y Treasury Yield",
    assetClass: "bond",
    sector: "US Sovereign Benchmark",
    exchange: "FRED / US TREASURY",
    currency: "%",
    maturity: "10 Years",
    description:
      "Global risk-free rate benchmark anchoring corporate borrowing costs, mortgage rates, and DCF equity discount rates.",
    descriptionIt:
      "Tasso privo di rischio di riferimento mondiale che guida mutui, costo del debito aziendale e tassi di sconto DCF.",
  },
  US30Y: {
    symbol: "US30Y",
    name: "US 30Y Treasury Yield",
    assetClass: "bond",
    sector: "US Sovereign Long Bond",
    exchange: "FRED / US TREASURY",
    currency: "%",
    maturity: "30 Years",
    description:
      "Long-end US Treasury bond yield pricing multi-decade inflation expectations and fiscal term premia.",
    descriptionIt:
      "Rendimento del titolo di Stato USA trentennale, sensibile a inflazione di lungo periodo e premio a termine.",
  },
  BTP10Y: {
    symbol: "BTP10Y",
    name: "Italian BTP 10Y Yield",
    assetClass: "bond",
    sector: "EU Sovereign Yield",
    exchange: "MOT / MTS",
    currency: "%",
    maturity: "10 Years",
    description:
      "Benchmark 10-year Italian sovereign bond yield (Buoni del Tesoro Poliennali), key gauge of Italian & Eurozone sovereign debt.",
    descriptionIt:
      "Rendimento benchmark dei BTP decennali italiani (Buoni del Tesoro Poliennali), indicatore chiave del debito sovrano italiano.",
  },
  BUND10Y: {
    symbol: "BUND10Y",
    name: "German Bund 10Y Yield",
    assetClass: "bond",
    sector: "EU Sovereign Benchmark",
    exchange: "EUREX / BUND",
    currency: "%",
    maturity: "10 Years",
    description:
      "Risk-free 10-year German government bond benchmark anchoring Eurozone fixed income pricing.",
    descriptionIt:
      "Rendimento benchmark del Bund tedesco a 10 anni, tasso privo di rischio di riferimento per l'Eurozona.",
  },
  BTPBUND: {
    symbol: "BTPBUND",
    name: "BTP–Bund 10Y Spread",
    assetClass: "bond",
    sector: "EU Sovereign Spread",
    exchange: "EU RATES",
    currency: "bps",
    maturity: "10Y Spread",
    description:
      "Difference in basis points between Italian 10Y BTP and German 10Y Bund yields, measuring Italian sovereign credit risk.",
    descriptionIt:
      "Differenziale in punti base (bps) tra BTP italiano e Bund tedesco a 10 anni: misura il premio al rischio sovrano italiano.",
  },
  ECBRATE: {
    symbol: "ECBRATE",
    name: "ECB Deposit Facility Rate",
    assetClass: "bond",
    sector: "Central Bank Policy",
    exchange: "ECB",
    currency: "%",
    maturity: "Overnight",
    description:
      "Primary European Central Bank policy rate governing overnight bank deposits and Eurozone money-market liquidity.",
    descriptionIt:
      "Principale tasso di riferimento della Banca Centrale Europea sui depositi overnight bancari nell'Eurozona.",
  },
  FEDFUNDS: {
    symbol: "FEDFUNDS",
    name: "Effective Fed Funds Rate",
    assetClass: "bond",
    sector: "Central Bank Policy",
    exchange: "FRED / FED",
    currency: "%",
    maturity: "Overnight",
    description:
      "Overnight interbank interest rate targeted by the Federal Reserve FOMC to steer US monetary conditions.",
    descriptionIt:
      "Tasso interbancario overnight fissato dalla Federal Reserve per regolare la politica monetaria statunitense.",
  },
};

export const YAHOO_SYMBOL_MAP: Record<string, string> = {
  EURUSD: "EURUSD=X",
  BTCUSD: "BTC-USD",
};

export const BINANCE_STREAM_MAP: Record<string, string> = {
  BTCUSDT: "BTC-USD",
  ETHUSDT: "ETH-USD",
  SOLUSDT: "SOL-USD",
  XRPUSDT: "XRP-USD",
  ADAUSDT: "ADA-USD",
  BNBUSDT: "BNB-USD",
};

export const SEED_BASE_QUOTES: Record<
  string,
  Omit<QuoteSnapshot, "timestamp" | "source">
> = {
  // Equities
  AAPL: { symbol: "AAPL", price: 234.82, change: 3.14, changePercent: 1.36, previousClose: 231.68, open: 232.15, dayHigh: 235.9, dayLow: 231.4, week52High: 260.1, week52Low: 164.08, volume: 42_180_400, avgVolume: 48_920_000, marketCap: 3_569_264_000_000, peRatio: 32.8, forwardPe: 28.4, dividendYield: 0.43, beta: 1.24, sharesOutstanding: 15_200_000_000 },
  NVDA: { symbol: "NVDA", price: 141.65, change: 4.22, changePercent: 3.07, previousClose: 137.43, open: 138.9, dayHigh: 143.1, dayLow: 137.85, week52High: 153.13, week52Low: 47.32, volume: 214_500_000, avgVolume: 245_000_000, marketCap: 3_470_425_000_000, peRatio: 44.2, forwardPe: 31.6, dividendYield: 0.03, beta: 1.66, sharesOutstanding: 24_500_000_000 },
  MSFT: { symbol: "MSFT", price: 428.4, change: 2.85, changePercent: 0.67, previousClose: 425.55, open: 426.1, dayHigh: 430.25, dayLow: 424.3, week52High: 468.35, week52Low: 366.5, volume: 18_420_000, avgVolume: 21_100_000, marketCap: 3_183_012_000_000, peRatio: 33.9, forwardPe: 29.1, dividendYield: 0.77, beta: 0.89, sharesOutstanding: 7_430_000_000 },
  TSLA: { symbol: "TSLA", price: 338.95, change: -5.4, changePercent: -1.57, previousClose: 344.35, open: 342.8, dayHigh: 346.2, dayLow: 335.6, week52High: 488.54, week52Low: 138.8, volume: 74_890_000, avgVolume: 86_400_000, marketCap: 1_088_029_500_000, peRatio: 84.7, forwardPe: 64.2, dividendYield: null, beta: 2.08, sharesOutstanding: 3_210_000_000 },
  GOOGL: { symbol: "GOOGL", price: 172.45, change: 2.15, changePercent: 1.26, previousClose: 170.3, open: 170.8, dayHigh: 173.4, dayLow: 169.9, week52High: 193.31, week52Low: 130.67, volume: 22_400_000, avgVolume: 25_800_000, marketCap: 2_120_000_000_000, peRatio: 21.8, forwardPe: 18.9, dividendYield: 0.46, beta: 1.04, sharesOutstanding: 12_300_000_000 },
  META: { symbol: "META", price: 572.1, change: 7.45, changePercent: 1.32, previousClose: 564.65, open: 566.0, dayHigh: 575.2, dayLow: 563.1, week52High: 638.4, week52Low: 382.1, volume: 14_800_000, avgVolume: 16_900_000, marketCap: 1_445_000_000_000, peRatio: 25.4, forwardPe: 21.6, dividendYield: 0.35, beta: 1.18, sharesOutstanding: 2_525_000_000 },
  CRM: { symbol: "CRM", price: 197.21, change: 2.84, changePercent: 1.46, previousClose: 194.37, open: 195.0, dayHigh: 198.4, dayLow: 193.8, week52High: 348.8, week52Low: 185.1, volume: 6_800_000, avgVolume: 7_400_000, marketCap: 189_000_000_000, peRatio: 28.4, forwardPe: 20.1, dividendYield: 0.81, beta: 1.12, sharesOutstanding: 958_000_000 },
  UNH: { symbol: "UNH", price: 346.19, change: 4.12, changePercent: 1.2, previousClose: 342.07, open: 343.0, dayHigh: 348.1, dayLow: 341.2, week52High: 606.36, week52Low: 320.0, volume: 4_100_000, avgVolume: 4_600_000, marketCap: 318_000_000_000, peRatio: 16.4, forwardPe: 14.8, dividendYield: 2.42, beta: 0.62, sharesOutstanding: 920_000_000 },
  "ENI.MI": { symbol: "ENI.MI", price: 14.28, change: 0.16, changePercent: 1.13, previousClose: 14.12, open: 14.15, dayHigh: 14.34, dayLow: 14.08, week52High: 15.82, week52Low: 12.9, volume: 11_400_000, avgVolume: 13_200_000, marketCap: 45_200_000_000, peRatio: 9.2, forwardPe: 8.6, dividendYield: 6.75, beta: 0.94, sharesOutstanding: 3_165_000_000 },
  "RACE.MI": { symbol: "RACE.MI", price: 428.5, change: 6.4, changePercent: 1.52, previousClose: 422.1, open: 423.0, dayHigh: 431.2, dayLow: 420.5, week52High: 472.0, week52Low: 318.4, volume: 420_000, avgVolume: 490_000, marketCap: 76_800_000_000, peRatio: 49.5, forwardPe: 42.1, dividendYield: 0.58, beta: 0.88, sharesOutstanding: 179_200_000 },
  "UCG.MI": { symbol: "UCG.MI", price: 39.84, change: 0.62, changePercent: 1.58, previousClose: 39.22, open: 39.35, dayHigh: 40.12, dayLow: 39.1, week52High: 44.2, week52Low: 24.6, volume: 9_800_000, avgVolume: 11_100_000, marketCap: 63_400_000_000, peRatio: 7.4, forwardPe: 6.9, dividendYield: 5.9, beta: 1.15, sharesOutstanding: 1_591_000_000 },
  "SAP.DE": { symbol: "SAP.DE", price: 228.4, change: 3.1, changePercent: 1.38, previousClose: 225.3, open: 226.0, dayHigh: 229.6, dayLow: 224.8, week52High: 244.5, week52Low: 148.2, volume: 1_650_000, avgVolume: 1_900_000, marketCap: 266_000_000_000, peRatio: 38.2, forwardPe: 31.4, dividendYield: 0.96, beta: 0.98, sharesOutstanding: 1_165_000_000 },
  "ASML.AS": { symbol: "ASML.AS", price: 668.2, change: 11.4, changePercent: 1.74, previousClose: 656.8, open: 660.0, dayHigh: 672.5, dayLow: 655.1, week52High: 1021.0, week52Low: 598.4, volume: 780_000, avgVolume: 920_000, marketCap: 264_000_000_000, peRatio: 34.8, forwardPe: 27.6, dividendYield: 0.94, beta: 1.32, sharesOutstanding: 395_000_000 },

  // ETFs
  SPY: { symbol: "SPY", price: 598.4, change: 3.8, changePercent: 0.64, previousClose: 594.6, open: 595.2, dayHigh: 599.8, dayLow: 594.1, week52High: 608.4, week52Low: 468.2, volume: 44_200_000, avgVolume: 51_000_000, marketCap: 615_000_000_000, peRatio: 24.8, forwardPe: 21.4, dividendYield: 1.24, beta: 1.0, sharesOutstanding: null },
  QQQ: { symbol: "QQQ", price: 508.9, change: 4.5, changePercent: 0.89, previousClose: 504.4, open: 505.1, dayHigh: 510.6, dayLow: 503.8, week52High: 522.4, week52Low: 388.2, volume: 31_400_000, avgVolume: 36_800_000, marketCap: 312_000_000_000, peRatio: 31.2, forwardPe: 26.8, dividendYield: 0.58, beta: 1.18, sharesOutstanding: null },
  "IWDA.AS": { symbol: "IWDA.AS", price: 104.25, change: 0.72, changePercent: 0.7, previousClose: 103.53, open: 103.7, dayHigh: 104.48, dayLow: 103.4, week52High: 106.8, week52Low: 82.4, volume: 1_850_000, avgVolume: 2_100_000, marketCap: 88_000_000_000, peRatio: 21.6, forwardPe: 18.8, dividendYield: null, beta: 0.96, sharesOutstanding: null },
  "VWCE.DE": { symbol: "VWCE.DE", price: 132.6, change: 0.88, changePercent: 0.67, previousClose: 131.72, open: 131.9, dayHigh: 132.95, dayLow: 131.6, week52High: 135.8, week52Low: 105.1, volume: 960_000, avgVolume: 1_150_000, marketCap: 32_000_000_000, peRatio: 20.1, forwardPe: 17.5, dividendYield: null, beta: 0.95, sharesOutstanding: null },
  TLT: { symbol: "TLT", price: 92.45, change: 0.54, changePercent: 0.59, previousClose: 91.91, open: 92.1, dayHigh: 92.8, dayLow: 91.75, week52High: 101.64, week52Low: 85.4, volume: 28_400_000, avgVolume: 33_000_000, marketCap: 61_000_000_000, peRatio: null, forwardPe: null, dividendYield: 4.18, beta: -0.22, sharesOutstanding: null },
  HYG: { symbol: "HYG", price: 79.32, change: 0.14, changePercent: 0.18, previousClose: 79.18, open: 79.2, dayHigh: 79.45, dayLow: 79.12, week52High: 80.5, week52Low: 74.8, volume: 24_100_000, avgVolume: 27_500_000, marketCap: 16_500_000_000, peRatio: null, forwardPe: null, dividendYield: 5.84, beta: 0.42, sharesOutstanding: null },
  LQD: { symbol: "LQD", price: 109.12, change: 0.28, changePercent: 0.26, previousClose: 108.84, open: 108.9, dayHigh: 109.35, dayLow: 108.78, week52High: 113.8, week52Low: 103.9, volume: 19_200_000, avgVolume: 22_000_000, marketCap: 31_000_000_000, peRatio: null, forwardPe: null, dividendYield: 4.52, beta: 0.18, sharesOutstanding: null },
  GLD: { symbol: "GLD", price: 246.8, change: 1.74, changePercent: 0.71, previousClose: 245.06, open: 245.5, dayHigh: 247.4, dayLow: 244.8, week52High: 257.9, week52Low: 184.2, volume: 6_800_000, avgVolume: 7_500_000, marketCap: 74_000_000_000, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.14, sharesOutstanding: null },
  VNQ: { symbol: "VNQ", price: 93.15, change: 0.62, changePercent: 0.67, previousClose: 92.53, open: 92.7, dayHigh: 93.45, dayLow: 92.4, week52High: 98.4, week52Low: 79.8, volume: 4_100_000, avgVolume: 4_700_000, marketCap: 36_000_000_000, peRatio: 31.4, forwardPe: null, dividendYield: 3.82, beta: 0.84, sharesOutstanding: null },
  SHY: { symbol: "SHY", price: 82.18, change: 0.04, changePercent: 0.05, previousClose: 82.14, open: 82.15, dayHigh: 82.21, dayLow: 82.12, week52High: 83.2, week52Low: 80.9, volume: 3_400_000, avgVolume: 4_100_000, marketCap: 25_000_000_000, peRatio: null, forwardPe: null, dividendYield: 4.12, beta: 0.03, sharesOutstanding: null },
  IEF: { symbol: "IEF", price: 94.86, change: 0.22, changePercent: 0.23, previousClose: 94.64, open: 94.7, dayHigh: 95.05, dayLow: 94.55, week52High: 99.8, week52Low: 90.4, volume: 7_200_000, avgVolume: 8_100_000, marketCap: 30_000_000_000, peRatio: null, forwardPe: null, dividendYield: 3.74, beta: -0.1, sharesOutstanding: null },

  // Global Indices
  "^GSPC": { symbol: "^GSPC", price: 5998.74, change: 40.5, changePercent: 0.68, previousClose: 5958.24, open: 5964.1, dayHigh: 6012.4, dayLow: 5952.8, week52High: 6044.2, week52Low: 4682.1, volume: 2_840_000_000, avgVolume: 3_100_000_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 1.0, sharesOutstanding: null },
  "^NDX": { symbol: "^NDX", price: 20842.15, change: 194.2, changePercent: 0.94, previousClose: 20647.95, open: 20680.0, dayHigh: 20910.5, dayLow: 20620.0, week52High: 21240.0, week52Low: 16120.0, volume: 1_450_000_000, avgVolume: 1_600_000_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 1.18, sharesOutstanding: null },
  "^DJI": { symbol: "^DJI", price: 44722.1, change: 182.6, changePercent: 0.41, previousClose: 44539.5, open: 44560.0, dayHigh: 44810.0, dayLow: 44490.0, week52High: 45073.0, week52Low: 36010.0, volume: 320_000_000, avgVolume: 350_000_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.88, sharesOutstanding: null },
  "FTSEMIB.MI": { symbol: "FTSEMIB.MI", price: 33920.4, change: 285.2, changePercent: 0.85, previousClose: 33635.2, open: 33710.0, dayHigh: 34045.0, dayLow: 33610.0, week52High: 35410.0, week52Low: 29120.0, volume: 410_000_000, avgVolume: 440_000_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 1.06, sharesOutstanding: null },
  "^STOXX50E": { symbol: "^STOXX50E", price: 4845.2, change: 32.1, changePercent: 0.67, previousClose: 4813.1, open: 4820.0, dayHigh: 4862.0, dayLow: 4808.0, week52High: 5121.0, week52Low: 4380.0, volume: 180_000_000, avgVolume: 205_000_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.98, sharesOutstanding: null },
  "^GDAXI": { symbol: "^GDAXI", price: 19425.8, change: 142.4, changePercent: 0.74, previousClose: 19283.4, open: 19310.0, dayHigh: 19480.0, dayLow: 19250.0, week52High: 19674.0, week52Low: 16240.0, volume: 65_000_000, avgVolume: 72_000_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 1.02, sharesOutstanding: null },
  "^N225": { symbol: "^N225", price: 38442.0, change: 198.4, changePercent: 0.52, previousClose: 38243.6, open: 38290.0, dayHigh: 38560.0, dayLow: 38190.0, week52High: 42224.0, week52Low: 31156.0, volume: 1_120_000_000, avgVolume: 1_240_000_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.91, sharesOutstanding: null },
  "^VIX": { symbol: "^VIX", price: 14.12, change: -0.47, changePercent: -3.22, previousClose: 14.59, open: 14.5, dayHigh: 14.85, dayLow: 13.95, week52High: 38.57, week52Low: 11.52, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: -3.2, sharesOutstanding: null },

  // Forex
  "EURUSD=X": { symbol: "EURUSD=X", price: 1.0584, change: 0.0031, changePercent: 0.29, previousClose: 1.0553, open: 1.0558, dayHigh: 1.0602, dayLow: 1.0541, week52High: 1.1214, week52Low: 1.0332, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.42, sharesOutstanding: null },
  "USDJPY=X": { symbol: "USDJPY=X", price: 151.42, change: -0.68, changePercent: -0.45, previousClose: 152.1, open: 152.05, dayHigh: 152.4, dayLow: 151.1, week52High: 161.95, week52Low: 139.58, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.31, sharesOutstanding: null },
  "GBPUSD=X": { symbol: "GBPUSD=X", price: 1.2684, change: 0.0042, changePercent: 0.33, previousClose: 1.2642, open: 1.2648, dayHigh: 1.2705, dayLow: 1.263, week52High: 1.3434, week52Low: 1.2299, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.46, sharesOutstanding: null },
  "USDCHF=X": { symbol: "USDCHF=X", price: 0.8812, change: -0.0021, changePercent: -0.24, previousClose: 0.8833, open: 0.883, dayHigh: 0.8845, dayLow: 0.8801, week52High: 0.9224, week52Low: 0.8374, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: -0.35, sharesOutstanding: null },
  "EURCHF=X": { symbol: "EURCHF=X", price: 0.9326, change: 0.0005, changePercent: 0.05, previousClose: 0.9321, open: 0.932, dayHigh: 0.9341, dayLow: 0.9312, week52High: 0.9928, week52Low: 0.921, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.14, sharesOutstanding: null },
  "EURGBP=X": { symbol: "EURGBP=X", price: 0.8344, change: -0.0003, changePercent: -0.04, previousClose: 0.8347, open: 0.8346, dayHigh: 0.8362, dayLow: 0.8331, week52High: 0.8714, week52Low: 0.826, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.12, sharesOutstanding: null },
  "DX-Y.NYB": { symbol: "DX-Y.NYB", price: 106.14, change: -0.28, changePercent: -0.26, previousClose: 106.42, open: 106.38, dayHigh: 106.62, dayLow: 105.98, week52High: 108.07, week52Low: 100.16, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: -0.38, sharesOutstanding: null },

  // Crypto
  "BTC-USD": { symbol: "BTC-USD", price: 94_280.5, change: 1_840.25, changePercent: 1.99, previousClose: 92_440.25, open: 92_510.0, dayHigh: 95_120.0, dayLow: 91_850.0, week52High: 108_350.0, week52Low: 49_120.0, volume: 41_200_000_000, avgVolume: 38_000_000_000, marketCap: 1_865_000_000_000, peRatio: null, forwardPe: null, dividendYield: null, beta: 1.85, sharesOutstanding: 19_780_000 },
  "ETH-USD": { symbol: "ETH-USD", price: 3_412.8, change: 78.4, changePercent: 2.35, previousClose: 3_334.4, open: 3_340.0, dayHigh: 3_455.0, dayLow: 3_310.0, week52High: 4_092.0, week52Low: 2_112.0, volume: 22_400_000_000, avgVolume: 19_800_000_000, marketCap: 410_000_000_000, peRatio: null, forwardPe: null, dividendYield: null, beta: 2.02, sharesOutstanding: 120_200_000 },
  "SOL-USD": { symbol: "SOL-USD", price: 238.4, change: 7.12, changePercent: 3.08, previousClose: 231.28, open: 231.8, dayHigh: 242.5, dayLow: 229.4, week52High: 263.8, week52Low: 84.2, volume: 6_800_000_000, avgVolume: 5_900_000_000, marketCap: 113_000_000_000, peRatio: null, forwardPe: null, dividendYield: null, beta: 2.45, sharesOutstanding: 474_000_000 },
  "XRP-USD": { symbol: "XRP-USD", price: 1.48, change: 0.06, changePercent: 4.23, previousClose: 1.42, open: 1.43, dayHigh: 1.52, dayLow: 1.4, week52High: 1.63, week52Low: 0.43, volume: 4_900_000_000, avgVolume: 3_800_000_000, marketCap: 84_200_000_000, peRatio: null, forwardPe: null, dividendYield: null, beta: 1.92, sharesOutstanding: 56_900_000_000 },
  "ADA-USD": { symbol: "ADA-USD", price: 0.98, change: 0.03, changePercent: 3.16, previousClose: 0.95, open: 0.95, dayHigh: 1.01, dayLow: 0.94, week52High: 1.15, week52Low: 0.31, volume: 1_850_000_000, avgVolume: 1_400_000_000, marketCap: 34_400_000_000, peRatio: null, forwardPe: null, dividendYield: null, beta: 2.1, sharesOutstanding: 35_100_000_000 },
  "BNB-USD": { symbol: "BNB-USD", price: 648.2, change: 11.8, changePercent: 1.85, previousClose: 636.4, open: 637.0, dayHigh: 654.0, dayLow: 633.5, week52High: 721.8, week52Low: 292.4, volume: 2_100_000_000, avgVolume: 1_800_000_000, marketCap: 94_600_000_000, peRatio: null, forwardPe: null, dividendYield: null, beta: 1.54, sharesOutstanding: 145_900_000 },

  // Commodities
  "GC=F": { symbol: "GC=F", price: 2_678.4, change: 18.9, changePercent: 0.71, previousClose: 2_659.5, open: 2_662.0, dayHigh: 2_684.6, dayLow: 2_655.1, week52High: 2_801.8, week52Low: 1_984.3, volume: 162_400, avgVolume: 184_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.18, sharesOutstanding: null },
  "SI=F": { symbol: "SI=F", price: 31.18, change: 0.42, changePercent: 1.37, previousClose: 30.76, open: 30.82, dayHigh: 31.45, dayLow: 30.65, week52High: 35.07, week52Low: 21.95, volume: 68_400, avgVolume: 74_200, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.44, sharesOutstanding: null },
  "CL=F": { symbol: "CL=F", price: 69.24, change: -0.58, changePercent: -0.83, previousClose: 69.82, open: 69.75, dayHigh: 70.1, dayLow: 68.9, week52High: 87.67, week52Low: 65.27, volume: 295_000, avgVolume: 330_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.56, sharesOutstanding: null },
  "BZ=F": { symbol: "BZ=F", price: 73.12, change: -0.49, changePercent: -0.67, previousClose: 73.61, open: 73.55, dayHigh: 73.92, dayLow: 72.84, week52High: 92.18, week52Low: 68.68, volume: 210_000, avgVolume: 240_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.54, sharesOutstanding: null },
  "NG=F": { symbol: "NG=F", price: 3.34, change: 0.11, changePercent: 3.41, previousClose: 3.23, open: 3.25, dayHigh: 3.39, dayLow: 3.21, week52High: 3.56, week52Low: 1.52, volume: 142_000, avgVolume: 158_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.32, sharesOutstanding: null },
  "HG=F": { symbol: "HG=F", price: 4.14, change: 0.05, changePercent: 1.22, previousClose: 4.09, open: 4.1, dayHigh: 4.18, dayLow: 4.07, week52High: 5.2, week52Low: 3.66, volume: 58_000, avgVolume: 64_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.72, sharesOutstanding: null },
  "ZC=F": { symbol: "ZC=F", price: 428.5, change: -2.25, changePercent: -0.52, previousClose: 430.75, open: 430.0, dayHigh: 432.5, dayLow: 426.25, week52High: 495.5, week52Low: 385.0, volume: 118_000, avgVolume: 130_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.18, sharesOutstanding: null },
  "ZW=F": { symbol: "ZW=F", price: 549.75, change: 4.5, changePercent: 0.83, previousClose: 545.25, open: 546.0, dayHigh: 553.0, dayLow: 544.0, week52High: 720.0, week52Low: 514.25, volume: 54_000, avgVolume: 61_000, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: 0.15, sharesOutstanding: null },

  // Bonds & Sovereign Yields
  US2Y: { symbol: "US2Y", price: 4.01, change: -0.02, changePercent: -0.5, previousClose: 4.03, open: 4.03, dayHigh: 4.06, dayLow: 3.99, week52High: 5.04, week52Low: 3.55, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: null, sharesOutstanding: null },
  US5Y: { symbol: "US5Y", price: 4.12, change: -0.03, changePercent: -0.72, previousClose: 4.15, open: 4.14, dayHigh: 4.17, dayLow: 4.09, week52High: 4.72, week52Low: 3.41, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: null, sharesOutstanding: null },
  US10Y: { symbol: "US10Y", price: 4.24, change: -0.04, changePercent: -0.93, previousClose: 4.28, open: 4.27, dayHigh: 4.3, dayLow: 4.22, week52High: 4.74, week52Low: 3.62, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: null, sharesOutstanding: null },
  US30Y: { symbol: "US30Y", price: 4.44, change: -0.03, changePercent: -0.67, previousClose: 4.47, open: 4.46, dayHigh: 4.5, dayLow: 4.42, week52High: 4.86, week52Low: 3.92, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: null, sharesOutstanding: null },
  BTP10Y: { symbol: "BTP10Y", price: 3.58, change: -0.05, changePercent: -1.38, previousClose: 3.63, open: 3.62, dayHigh: 3.65, dayLow: 3.56, week52High: 4.18, week52Low: 3.38, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: null, sharesOutstanding: null },
  BUND10Y: { symbol: "BUND10Y", price: 2.28, change: -0.02, changePercent: -0.87, previousClose: 2.3, open: 2.29, dayHigh: 2.32, dayLow: 2.26, week52High: 2.71, week52Low: 2.02, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: null, sharesOutstanding: null },
  BTPBUND: { symbol: "BTPBUND", price: 130.0, change: -3.0, changePercent: -2.26, previousClose: 133.0, open: 132.5, dayHigh: 134.0, dayLow: 129.0, week52High: 162.0, week52Low: 118.0, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: null, sharesOutstanding: null },
  ECBRATE: { symbol: "ECBRATE", price: 3.25, change: 0.0, changePercent: 0.0, previousClose: 3.25, open: 3.25, dayHigh: 3.25, dayLow: 3.25, week52High: 4.0, week52Low: 3.25, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: null, sharesOutstanding: null },
  FEDFUNDS: { symbol: "FEDFUNDS", price: 4.08, change: -0.25, changePercent: -5.77, previousClose: 4.33, open: 4.08, dayHigh: 4.33, dayLow: 4.08, week52High: 5.33, week52Low: 4.08, volume: 0, avgVolume: 0, marketCap: null, peRatio: null, forwardPe: null, dividendYield: null, beta: null, sharesOutstanding: null },
};

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SeasonalProfile {
  annualDrift: number;
  dailyVol: number;
  startPriceRatio: number;
  monthlyBias: number[];
}

const SEASONAL_PROFILES: Record<string, SeasonalProfile> = {
  AAPL: { annualDrift: 0.18, dailyVol: 0.017, startPriceRatio: 0.012, monthlyBias: [0.0004, -0.0001, 0.0005, 0.0004, 0.0003, 0.0005, 0.0009, 0.0007, -0.0006, 0.0008, 0.0014, 0.0011] },
  NVDA: { annualDrift: 0.28, dailyVol: 0.022, startPriceRatio: 0.004, monthlyBias: [0.0009, 0.001, 0.0008, 0.0001, 0.0012, 0.0005, 0.0004, 0.0006, -0.0008, 0.0009, 0.0038, 0.0036] },
  MSFT: { annualDrift: 0.15, dailyVol: 0.015, startPriceRatio: 0.022, monthlyBias: [0.0005, 0.0002, 0.0006, 0.0008, 0.0004, 0.0004, 0.0007, 0.0003, -0.0004, 0.0009, 0.0013, 0.0009] },
  TSLA: { annualDrift: 0.22, dailyVol: 0.032, startPriceRatio: 0.015, monthlyBias: [0.0008, -0.0005, -0.0003, 0.0005, 0.0007, 0.0012, 0.0009, 0.0004, 0.0002, 0.0007, 0.0015, 0.0013] },
  GOOGL: { annualDrift: 0.17, dailyVol: 0.016, startPriceRatio: 0.018, monthlyBias: [0.0006, 0.0002, 0.0005, 0.0007, 0.0004, 0.0003, 0.0008, 0.0003, -0.0005, 0.0008, 0.0028, 0.0027] },
  META: { annualDrift: 0.21, dailyVol: 0.021, startPriceRatio: 0.014, monthlyBias: [0.0008, 0.0005, 0.0004, 0.0006, 0.0005, 0.0004, 0.0009, 0.0004, -0.0006, 0.001, 0.0018, 0.0015] },
  SPY: { annualDrift: 0.1, dailyVol: 0.011, startPriceRatio: 0.12, monthlyBias: [0.0004, 0.0001, 0.0004, 0.0006, 0.0003, 0.0002, 0.0005, -0.0001, -0.0004, 0.0006, 0.0018, 0.0016] },
  "GC=F": { annualDrift: 0.068, dailyVol: 0.0085, startPriceRatio: 0.145, monthlyBias: [0.0011, 0.0004, -0.0001, 0.0005, 0.0002, -0.0002, 0.0006, 0.0009, -0.0003, 0.0002, 0.0019, 0.0022] },
  "BTC-USD": { annualDrift: 0.34, dailyVol: 0.034, startPriceRatio: 0.001, monthlyBias: [0.0008, 0.0014, 0.0009, 0.0012, -0.0003, -0.0002, 0.0007, -0.0004, -0.0006, 0.0018, 0.0021, 0.0014] },
  "EURUSD=X": { annualDrift: -0.002, dailyVol: 0.0055, startPriceRatio: 1.06, monthlyBias: [-0.0002, -0.0001, 0.0002, 0.0003, -0.0003, 0.0002, 0.0001, -0.0001, -0.0002, -0.0001, -0.0002, 0.0005] },
};

function getDefaultProfile(sym: string, profile: TickerProfile): SeasonalProfile {
  if (SEASONAL_PROFILES[sym]) return SEASONAL_PROFILES[sym];
  if (profile.assetClass === "bond") {
    return {
      annualDrift: 0.01,
      dailyVol: 0.008,
      startPriceRatio: 0.9,
      monthlyBias: [0.0001, 0.0001, -0.0001, 0.0001, 0, -0.0001, 0, 0.0001, 0.0001, 0, -0.0002, -0.0001],
    };
  }
  if (profile.assetClass === "fx") {
    return {
      annualDrift: 0.003,
      dailyVol: 0.0055,
      startPriceRatio: 0.92,
      monthlyBias: [0.0001, 0, 0.0002, 0.0001, -0.0001, 0.0001, 0, 0, -0.0001, 0.0001, 0.0002, 0.0003],
    };
  }
  if (profile.assetClass === "crypto") {
    return {
      annualDrift: 0.28,
      dailyVol: 0.038,
      startPriceRatio: 0.005,
      monthlyBias: [0.0006, 0.0012, 0.0008, 0.001, -0.0002, -0.0003, 0.0006, -0.0003, -0.0005, 0.0015, 0.0019, 0.0012],
    };
  }
  if (profile.assetClass === "commodity") {
    return {
      annualDrift: 0.045,
      dailyVol: 0.014,
      startPriceRatio: 0.35,
      monthlyBias: [0.0006, 0.0003, 0.0002, 0.0004, 0.0001, -0.0001, 0.0004, 0.0005, -0.0002, 0.0003, 0.0012, 0.0014],
    };
  }
  return {
    annualDrift: 0.11,
    dailyVol: 0.014,
    startPriceRatio: 0.12,
    monthlyBias: [0.0004, 0.0002, 0.0004, 0.0005, 0.0003, 0.0002, 0.0005, 0.0001, -0.0004, 0.0006, 0.0014, 0.0013],
  };
}

const barCache = new Map<string, OhlcvBar[]>();

export function generateSeedOhlcv30Y(symbol: string): OhlcvBar[] {
  const sym = normalizeSymbol(symbol);
  const cached = barCache.get(sym);
  if (cached) return cached;

  const base = SEED_BASE_QUOTES[sym] ?? getSeedQuote(sym);
  const tickerProf = getTickerProfile(sym);
  const profile = getDefaultProfile(sym, tickerProf);
  const rand = mulberry32(hashString(`openterminal-ohlcv-30y-${sym}`));

  const endDate = new Date("2026-11-26T00:00:00Z");
  const startDate = new Date("1996-11-26T00:00:00Z");

  const dates: Date[] = [];
  const cur = new Date(startDate);
  while (cur <= endDate) {
    const day = cur.getUTCDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(cur));
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  const rawCloses: number[] = new Array(dates.length);
  let logVal = 0;
  const dailyBaseDrift = profile.annualDrift / 252;

  for (let i = 0; i < dates.length; i++) {
    const m = dates[i].getUTCMonth();
    const u1 = Math.max(1e-7, rand());
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const seasonal = profile.monthlyBias[m] ?? 0;
    const step = dailyBaseDrift * 0.5 + seasonal + z * profile.dailyVol;
    logVal += step;
    rawCloses[i] = Math.exp(logVal);
  }

  const lastRaw = rawCloses[rawCloses.length - 1];
  const firstRaw = rawCloses[0];
  const targetStart = Math.max(0.0001, base.price * profile.startPriceRatio);
  const targetEnd = Math.max(0.0001, base.price);

  const bars: OhlcvBar[] = new Array(dates.length);
  const precision = tickerProf.assetClass === "fx" || base.price < 5 ? 4 : 2;
  const round = (v: number) => Number(v.toFixed(precision));

  for (let i = 0; i < dates.length; i++) {
    const t = i / (dates.length - 1);
    const logRawProgress = Math.log(rawCloses[i] / firstRaw);
    const logTotalRaw = Math.log(lastRaw / firstRaw);
    const logTargetTotal = Math.log(targetEnd / targetStart);
    const adjustedLog =
      Math.log(targetStart) +
      logRawProgress +
      t * (logTargetTotal - logTotalRaw);
    const close = round(Math.exp(adjustedLog));

    const prevClose = i > 0 ? bars[i - 1].close : round(close * 0.996);
    const intraSpread = Math.abs(rand() * profile.dailyVol * 1.4) + profile.dailyVol * 0.25;
    const open = round(prevClose * (1 + (rand() - 0.5) * profile.dailyVol * 0.5));
    const high = round(Math.max(open, close) * (1 + intraSpread * 0.6));
    const low = round(Math.min(open, close) * (1 - intraSpread * 0.6));
    const baseVol = base.avgVolume > 0 ? base.avgVolume : 150_000;
    const volume = Math.round(baseVol * (0.65 + rand() * 0.85));

    bars[i] = {
      time: dates[i].toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
      volume,
    };
  }

  const lastIdx = bars.length - 1;
  bars[lastIdx] = {
    ...bars[lastIdx],
    open: base.open,
    high: base.dayHigh,
    low: base.dayLow,
    close: base.price,
    volume: base.volume || bars[lastIdx].volume,
  };

  barCache.set(sym, bars);
  return bars;
}

export function getSeedQuote(symbol: string): QuoteSnapshot {
  const sym = normalizeSymbol(symbol);
  const base = SEED_BASE_QUOTES[sym];
  if (base) {
    return {
      ...base,
      timestamp: new Date().toISOString(),
      source: "seed",
    };
  }
  const h = hashString(sym);
  const price = Number((45 + (h % 280) + (h % 99) / 100).toFixed(2));
  const changePct = Number((((h % 400) - 180) / 100).toFixed(2));
  const prev = Number((price / (1 + changePct / 100)).toFixed(2));
  return {
    symbol: sym,
    price,
    change: Number((price - prev).toFixed(2)),
    changePercent: changePct,
    previousClose: prev,
    open: prev,
    dayHigh: Number((price * 1.015).toFixed(2)),
    dayLow: Number((price * 0.985).toFixed(2)),
    week52High: Number((price * 1.24).toFixed(2)),
    week52Low: Number((price * 0.72).toFixed(2)),
    volume: 4_250_000,
    avgVolume: 5_100_000,
    marketCap: Math.round(price * 450_000_000),
    peRatio: 24.5,
    forwardPe: 20.8,
    dividendYield: 0.85,
    beta: 1.12,
    sharesOutstanding: 450_000_000,
    timestamp: new Date().toISOString(),
    source: "seed",
  };
}

export function getTickerProfile(symbol: string): TickerProfile {
  const sym = normalizeSymbol(symbol);
  if (TICKER_UNIVERSE[sym]) return TICKER_UNIVERSE[sym];

  const isFx = sym.endsWith("=X");
  const isCrypto = sym.endsWith("-USD");
  const isCommodity = sym.endsWith("=F");
  const isIndex = sym.startsWith("^") || sym === "FTSEMIB.MI";
  return {
    symbol: sym,
    name: sym,
    assetClass: isFx
      ? "fx"
      : isCrypto
        ? "crypto"
        : isCommodity
          ? "commodity"
          : isIndex
            ? "index"
            : "equity",
    sector: isFx
      ? "Foreign Exchange"
      : isCrypto
        ? "Digital Assets"
        : isCommodity
          ? "Commodities"
          : isIndex
            ? "Global Index"
            : "Public Equities",
    exchange: "GLOBAL",
    currency: "USD",
    description: `Market instrument ${sym} tracked in OpenTerminal with live pricing, seasonality, and technical charts.`,
    descriptionIt: `Strumento finanziario ${sym} monitorato in OpenTerminal con prezzi, stagionalità e grafici tecnici.`,
  };
}
