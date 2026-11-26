export interface GlossaryEntry {
  titleEn: string;
  titleIt: string;
  en: {
    what: string;
    read: string;
    why: string;
  };
  it: {
    what: string;
    read: string;
    why: string;
  };
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // Valuation & Fundamentals
  marketCap: {
    titleEn: "Market Capitalization",
    titleIt: "Capitalizzazione di Mercato",
    en: {
      what: "Total market value of all a company's outstanding shares (Price × Shares).",
      read: "Mega-cap (> $200B), Large-cap ($10B–$200B), Mid-cap ($2B–$10B).",
      why: "Shows the true size of the business, not just the price of a single share.",
    },
    it: {
      what: "Valore totale di borsa di tutte le azioni emesse dalla società (Prezzo × Azioni).",
      read: "Mega-cap (> 200 Mld), Large-cap (10–200 Mld), Mid-cap (2–10 Mld).",
      why: "Indica la reale dimensione dell'azienda, molto più del prezzo di una singola azione.",
    },
  },
  peRatio: {
    titleEn: "P/E Ratio",
    titleIt: "Rapporto P/E (Prezzo/Utili)",
    en: {
      what: "Share price divided by annual Earnings Per Share over the past 12 months.",
      read: "Higher P/E means investors pay more per $1 of profit—often expecting faster growth.",
      why: "Quickly compares how expensive a stock is relative to its current profits.",
    },
    it: {
      what: "Prezzo dell'azione diviso per l'utile per azione degli ultimi 12 mesi.",
      read: "Un P/E alto indica che il mercato paga di più per ogni euro di utile, spesso attendendosi forte crescita.",
      why: "Permette di confrontare rapidamente quanto è caro un titolo rispetto ai profitti attuali.",
    },
  },
  forwardPe: {
    titleEn: "Forward P/E",
    titleIt: "P/E Stimato (Forward)",
    en: {
      what: "Share price divided by analysts' expected earnings over the next 12 months.",
      read: "If Forward P/E is much lower than trailing P/E, earnings are projected to grow.",
      why: "Markets price the future rather than the past—useful for growing businesses.",
    },
    it: {
      what: "Prezzo dell'azione diviso per gli utili attesi nei prossimi 12 mesi.",
      read: "Se è molto più basso del P/E storico, gli utili sono previsti in forte aumento.",
      why: "I mercati guardano avanti: aiuta a valutare l'azienda sui profitti futuri.",
    },
  },
  evEbitda: {
    titleEn: "EV / EBITDA",
    titleIt: "EV / EBITDA",
    en: {
      what: "Enterprise Value (equity + debt − cash) divided by operating cash earnings before taxes and depreciation.",
      read: "Under 10x is often seen as reasonable in mature industries; compare within the same sector.",
      why: "Unlike P/E, it accounts for company debt and cash balances fairly.",
    },
    it: {
      what: "Valore d'impresa (Borsa + Debiti − Cassa) diviso per il margine operativo lordo (EBITDA).",
      read: "Sotto 10x è spesso moderato nei settori maturi; va sempre confrontato con i concorrenti.",
      why: "A differenza del P/E, include l'impatto di debito e liquidità aziendale.",
    },
  },
  dividendYield: {
    titleEn: "Dividend Yield",
    titleIt: "Rendimento da Dividendo",
    en: {
      what: "Annual cash dividends paid per share as a percentage of the current share price.",
      read: "2%–5% is steady income; unusually high yields (>8%) can signal a price drop or cut risk.",
      why: "Tells you the yearly cash payout you earn just for holding the asset.",
    },
    it: {
      what: "Dividendo annuo pagato per azione espresso in percentuale del prezzo attuale.",
      read: "Tra 2% e 5% è un flusso stabile; rendimenti troppo alti (>8%) possono segnalare rischi di taglio.",
      why: "Misura il ritorno in contanti annuo ricevuto semplicemente detenendo il titolo.",
    },
  },
  revenueGrowth: {
    titleEn: "Revenue Growth",
    titleIt: "Crescita dei Ricavi",
    en: {
      what: "Percentage increase in total sales compared to the previous year or quarter.",
      read: "Consistent positive growth shows rising customer demand and market share.",
      why: "Top-line sales growth fuels long-term earnings and cash flow expansion.",
    },
    it: {
      what: "Variazione percentuale del fatturato totale rispetto all'anno precedente.",
      read: "Una crescita costante indica domanda solida e acquisizione di quote di mercato.",
      why: "L'espansione dei ricavi è il motore primario dei profitti futuri.",
    },
  },
  grossProfit: {
    titleEn: "Gross Profit",
    titleIt: "Utile Lordo",
    en: {
      what: "Total Revenue minus direct costs of producing goods or services.",
      read: "Higher gross margins (>50%) point to strong pricing power or software-like economics.",
      why: "Shows how much money remains to fund R&D, marketing, and net profit.",
    },
    it: {
      what: "Ricavi totali meno i costi diretti di produzione o erogazione del servizio.",
      read: "Margini lordi alti (>50%) indicano forte potere di prezzo e vantaggio competitivo.",
      why: "Mostra quante risorse restano per finanziare ricerca, gestione e utile netto.",
    },
  },
  operatingIncome: {
    titleEn: "Operating Income",
    titleIt: "Risultato Operativo (EBIT)",
    en: {
      what: "Profit earned from core business operations after subtracting operating expenses.",
      read: "Rising operating margins mean the company scales efficiently without bloated costs.",
      why: "Reflects core business profitability before taxes and debt interest.",
    },
    it: {
      what: "Profitto generato dall'attività principale dopo aver sottratto i costi operativi.",
      read: "Margini operativi in crescita indicano efficienza e leva operativa positiva.",
      why: "Misura la redditività pura del business prima di interessi finanziari e tasse.",
    },
  },
  netIncome: {
    titleEn: "Net Income",
    titleIt: "Utile Netto",
    en: {
      what: "The bottom-line profit left after all expenses, interest, and taxes are paid.",
      read: "Positive and growing net income confirms overall business profitability.",
      why: "Determines Earnings Per Share (EPS) and funds dividends or buybacks.",
    },
    it: {
      what: "Il profitto finale rimasto dopo aver pagato costi, interessi sul debito e imposte.",
      read: "Un utile netto positivo e crescente conferma la sostenibilità economica dell'azienda.",
      why: "Determina l'utile per azione e finanzia dividendi o riacquisti di azioni.",
    },
  },
  operatingCashFlow: {
    titleEn: "Operating Cash Flow",
    titleIt: "Flusso di Cassa Operativo",
    en: {
      what: "Actual cash generated by normal day-to-day business operations.",
      read: "Healthy companies have Operating Cash Flow equal to or above Net Income.",
      why: "Cash cannot be easily manipulated by accounting rules—it shows real cash coming in.",
    },
    it: {
      what: "Liquidità reale generata dalle attività operative quotidiane dell'azienda.",
      read: "Le aziende sane hanno un flusso operativo pari o superiore all'utile netto contabile.",
      why: "La cassa reale è molto più difficile da alterare contabilmente rispetto all'utile.",
    },
  },
  capex: {
    titleEn: "CapEx (Capital Expenditures)",
    titleIt: "CapEx (Investimenti in Capitale)",
    en: {
      what: "Cash spent to buy or upgrade physical assets like factories, servers, or equipment.",
      read: "High CapEx can mean heavy AI/infrastructure expansion—or a capital-intensive business.",
      why: "Subtracting CapEx from Operating Cash Flow reveals true Free Cash Flow.",
    },
    it: {
      what: "Spese per acquistare o potenziare beni durevoli come fabbriche, server o macchinari.",
      read: "CapEx elevati possono indicare espansione (es. data center AI) o business pesanti.",
      why: "Sottraendo il CapEx dal flusso operativo si ottiene il flusso di cassa libero.",
    },
  },
  freeCashFlow: {
    titleEn: "Free Cash Flow (FCF)",
    titleIt: "Flusso di Cassa Libero (FCF)",
    en: {
      what: "Cash left over after paying operating expenses and CapEx (OCF − CapEx).",
      read: "Positive and growing FCF funds buybacks, dividends, debt payoff, and acquisitions.",
      why: "The gold standard metric for what a business actually earns for its owners.",
    },
    it: {
      what: "Liquidità residua dopo costi operativi e investimenti CapEx (OCF − CapEx).",
      read: "Un FCF positivo e crescente finanzia dividendi, buyback e riduzione del debito.",
      why: "È l'indicatore principale della cassa effettivamente disponibile per gli azionisti.",
    },
  },
  yoyPct: {
    titleEn: "YoY % (Year-over-Year)",
    titleIt: "Var. % Anno su Anno (YoY)",
    en: {
      what: "Percentage change comparing a metric to the exact same period one year earlier.",
      read: "Positive numbers show expansion; removes seasonal distortion across quarters.",
      why: "Standard way to measure true growth momentum without seasonal noise.",
    },
    it: {
      what: "Variazione percentuale rispetto allo stesso periodo dell'anno precedente.",
      read: "Valori positivi indicano crescita eliminando gli effetti stagionali trimestrali.",
      why: "Consente di misurare il ritmo di crescita reale in modo omogeneo.",
    },
  },
  xbrl: {
    titleEn: "XBRL & Normalized Q4",
    titleIt: "XBRL e Q4 Normalizzato",
    en: {
      what: "Standardized machine-readable financial tags filed with the US SEC.",
      read: "Because companies file annual 10-K totals without a standalone Q4 report, Q4 is derived as FY − (Q1+Q2+Q3).",
      why: "Gives clean, auditable quarterly numbers straight from official filings.",
    },
    it: {
      what: "Formato digitale standardizzato dei bilanci depositati presso la SEC statunitense.",
      read: "Poiché il 4° trimestre non ha un 10-Q separato, viene calcolato come Anno − (Q1+Q2+Q3).",
      why: "Garantisce dati trimestrali ufficiali, puliti e confrontabili.",
    },
  },
  dcf: {
    titleEn: "Discounted Cash Flow (DCF)",
    titleIt: "Flussi di Cassa Scontati (DCF)",
    en: {
      what: "Estimates fair share value by projecting future Free Cash Flow and discounting it back to today's dollars.",
      read: "If DCF fair value exceeds the current price, the stock may be undervalued based on cash generation.",
      why: "Anchors stock valuation in fundamental cash flows rather than market hype.",
    },
    it: {
      what: "Stima il valore equo proiettando i flussi di cassa futuri e attualizzandoli ad oggi.",
      read: "Se il valore DCF supera il prezzo attuale, il titolo può risultare sottovalutato.",
      why: "Fonda la valutazione sulla capacità di generare cassa nel lungo periodo.",
    },
  },
  eva: {
    titleEn: "Economic Value Added (EVA)",
    titleIt: "Valore Economico Aggiunto (EVA)",
    en: {
      what: "Measures profit generated above the true cost of the capital invested in the business.",
      read: "Positive EVA (ROIC > WACC) means the company creates wealth rather than merely burning capital.",
      why: "Rewards capital-efficient compounders that earn high returns on every dollar invested.",
    },
    it: {
      what: "Misura il profitto generato oltre il costo del capitale investito nell'impresa.",
      read: "Un EVA positivo (ROIC > WACC) significa che l'azienda crea reale valore economico.",
      why: "Premia le aziende efficienti che ottengono rendimenti elevati sul capitale.",
    },
  },
  peterLynch: {
    titleEn: "Peter Lynch Fair Value",
    titleIt: "Valore Equo Peter Lynch",
    en: {
      what: "Values a company by comparing its P/E ratio to its earnings growth rate (PEG logic).",
      read: "Fast-growing companies justify higher multiples if growth is durable and profitable.",
      why: "Classic growth-at-a-reasonable-price (GARP) sanity check popularized by Fidelity's Peter Lynch.",
    },
    it: {
      what: "Valuta un titolo confrontando il multiplo P/E con il tasso di crescita degli utili.",
      read: "Aziende con crescita elevata e sostenibile giustificano multipli più alti.",
      why: "Classico criterio GARP (crescita a prezzo ragionevole) reso celebre da Peter Lynch.",
    },
  },
  piotroskiFScore: {
    titleEn: "Piotroski F-Score (0–9)",
    titleIt: "Piotroski F-Score (0–9)",
    en: {
      what: "A 9-point financial health checklist testing profitability, debt, liquidity, and margin trends.",
      read: "7–9 signals strong financial quality; 0–3 flags deteriorating fundamentals.",
      why: "Separates genuinely healthy value stocks from cheap 'value traps'.",
    },
    it: {
      what: "Test a 9 punti sulla salute finanziaria: redditività, leva finanziaria, liquidità e margini.",
      read: "7–9 indica qualità finanziaria elevata; 0–3 segnala fondamentali deboli.",
      why: "Aiuta a distinguere le aziende solide dalle trappole di valore.",
    },
  },
  altmanZScore: {
    titleEn: "Altman Z-Score",
    titleIt: "Altman Z-Score",
    en: {
      what: "A five-ratio bankruptcy & balance-sheet stress indicator.",
      read: "Above 2.99 = Safe Zone; 1.81–2.99 = Grey Zone; below 1.81 = Distress risk.",
      why: "Provides an early warning check on debt solvency and financial resilience.",
    },
    it: {
      what: "Indicatore statistico a 5 indici per valutare il rischio di insolvenza aziendale.",
      read: "Sopra 2,99 = Zona Sicura; 1,81–2,99 = Zona Grigia; sotto 1,81 = Rischio stress.",
      why: "Fornisce una verifica rapida della solidità patrimoniale contro il rischio fallimento.",
    },
  },
  beneishMScore: {
    titleEn: "Beneish M-Score",
    titleIt: "Beneish M-Score",
    en: {
      what: "Forensic accounting score detecting aggressive revenue or earnings manipulation.",
      read: "Below -1.78 = Clean earnings quality; above -1.78 warrants closer accounting review.",
      why: "Protects investors from overly aggressive financial reporting.",
    },
    it: {
      what: "Modello forense che rileva potenziali manipolazioni contabili su ricavi o margini.",
      read: "Sotto -1,78 = qualità contabile pulita; sopra -1,78 richiede cautela e verifica.",
      why: "Tutela l'investitore da pratiche contabili troppo aggressive.",
    },
  },
  fairValue: {
    titleEn: "Intrinsic / Fair Value",
    titleIt: "Valore Intrinseco / Equo",
    en: {
      what: "Estimated true worth of a share averaged across active valuation models.",
      read: "Positive % upside suggests undervalued; negative % suggests the market price exceeds model estimates.",
      why: "Gives a calm anchor before buying or selling based on price swings alone.",
    },
    it: {
      what: "Stima del valore fondamentale di un'azione calcolata come media dei modelli attivi.",
      read: "Uno scarto positivo (%) indica potenziale sottovalutazione; negativo indica premio di mercato.",
      why: "Offre un riferimento oggettivo al di là delle oscillazioni emotive di breve termine.",
    },
  },

  // Charting & Technicals
  ohlcv: {
    titleEn: "OHLCV Data",
    titleIt: "Dati OHLCV",
    en: {
      what: "Open, High, Low, Close prices and Trading Volume recorded for each time interval.",
      read: "Forms the foundation of every candlestick and bar chart.",
      why: "Shows both the full trading range and investor participation behind price moves.",
    },
    it: {
      what: "Prezzi di Apertura (Open), Massimo (High), Minimo (Low), Chiusura (Close) e Volume di scambio.",
      read: "Costituisce la base di ogni grafico a candele giapponesi.",
      why: "Mostra l'escursione completa del prezzo e l'intensità degli scambi.",
    },
  },
  candlestick: {
    titleEn: "Candlestick Chart",
    titleIt: "Grafico a Candele",
    en: {
      what: "Each candle shows open-to-close body (green = up, red = down) plus high/low wicks.",
      read: "Long upper/lower wicks show price rejection; full bodies show strong buyer or seller conviction.",
      why: "Packs four price points into one clear visual shape.",
    },
    it: {
      what: "Ogni candela mostra il corpo apertura-chiusura (verde = rialzo, rosso = ribasso) e le ombre max/min.",
      read: "Ombre lunghe indicano rifiuto di un livello; corpi ampi mostrano forte direzionalità.",
      why: "Riassume quattro prezzi chiave in un'unica figura leggibile a colpo d'occhio.",
    },
  },
  volume: {
    titleEn: "Trading Volume",
    titleIt: "Volume di Scambio",
    en: {
      what: "Total number of shares or contracts traded during a session.",
      read: "Breakouts on high volume carry stronger institutional conviction than low-volume moves.",
      why: "Confirms whether big money is participating in a price move.",
    },
    it: {
      what: "Numero totale di azioni o contratti scambiati in una seduta.",
      read: "Movimenti accompagnati da alti volumi hanno maggiore affidabilità istituzionale.",
      why: "Conferma la reale partecipazione del mercato dietro un movimento di prezzo.",
    },
  },
  sma: {
    titleEn: "Simple Moving Average (SMA)",
    titleIt: "Media Mobile Semplice (SMA)",
    en: {
      what: "Average closing price over the last 20, 50, or 200 trading days.",
      read: "Price above SMA-200 signals a long-term uptrend; SMA-50 crossing above SMA-200 is a bullish trend shift.",
      why: "Smooths out daily noise so you can see the primary trend clearly.",
    },
    it: {
      what: "Prezzo medio di chiusura calcolato sugli ultimi 20, 50 o 200 giorni di borsa.",
      read: "Prezzo sopra la SMA-200 indica trend rialzista di lungo periodo; SMA-50 sopra SMA-200 conferma forza.",
      why: "Attenua il rumore giornaliero rendendo evidente la tendenza di fondo.",
    },
  },
  rsi14: {
    titleEn: "RSI-14 (Relative Strength Index)",
    titleIt: "RSI-14 (Indice di Forza Relativa)",
    en: {
      what: "Momentum oscillator ranging from 0 to 100 measuring recent gain vs loss speed.",
      read: "Above 70 often signals overbought conditions; below 30 signals oversold conditions.",
      why: "Helps spot stretched short-term rallies or pullbacks before chasing price.",
    },
    it: {
      what: "Oscillatore da 0 a 100 che misura la velocità e l'ampiezza dei rialzi rispetto ai ribassi.",
      read: "Sopra 70 segnala possibile ipercomprato; sotto 30 possibile ipervenduto.",
      why: "Aiuta a evitare ingressi tardivi dopo rialzi o ribassi eccessivi.",
    },
  },
  macd: {
    titleEn: "MACD (12, 26, 9)",
    titleIt: "MACD (12, 26, 9)",
    en: {
      what: "Trend-following momentum indicator comparing a fast (12-day) and slow (26-day) exponential average.",
      read: "MACD crossing above its signal line suggests upward momentum building.",
      why: "Combines trend direction and momentum acceleration in one gauge.",
    },
    it: {
      what: "Indicatore di momentum che confronta una media esponenziale veloce (12g) e una lenta (26g).",
      read: "Quando la linea MACD incrocia al rialzo la linea segnale, la spinta rialzista aumenta.",
      why: "Unisce direzione del trend e forza del momentum.",
    },
  },
  week52Range: {
    titleEn: "52-Week Range",
    titleIt: "Range a 52 Settimane",
    en: {
      what: "Lowest and highest price traded over the past 12 months.",
      read: "Shows where today's price sits relative to its annual extremes.",
      why: "Provides instant perspective on recent volatility and upside/downside room.",
    },
    it: {
      what: "Prezzo minimo e massimo registrati negli ultimi 12 mesi.",
      read: "Mostra dove si colloca la quotazione odierna rispetto agli estremi annuali.",
      why: "Offre un immediato contesto storico sulla volatilità recente.",
    },
  },
  maxDrawdown: {
    titleEn: "Max Drawdown",
    titleIt: "Drawdown Massimo",
    en: {
      what: "Worst peak-to-trough percentage drop during a given period.",
      read: "Smaller negative numbers (e.g. -3% vs -20%) indicate steadier risk control.",
      why: "Measures the real pain an investor could experience even in a winning trade.",
    },
    it: {
      what: "La perdita massima registrata dal picco al punto più basso in un determinato periodo.",
      read: "Valori contenuti (es. -3% vs -20%) indicano un profilo di rischio più stabile.",
      why: "Misura il rischio reale sopportato anche all'interno di finestre statisticamente positive.",
    },
  },
  vix: {
    titleEn: "Volatility Index (VIX)",
    titleIt: "Indice di Volatilità (VIX)",
    en: {
      what: "Market 'fear gauge' reflecting expected 30-day S&P 500 price swings.",
      read: "Under 15 = calm market; 20–30 = elevated caution; >35 = acute stress.",
      why: "Gauges option hedging costs and broader equity market stress.",
    },
    it: {
      what: "Indice della paura del mercato: stima la volatilità attesa a 30 giorni sull'S&P 500.",
      read: "Sotto 15 = mercato calmo; 20–30 = cautela; sopra 35 = forte tensione.",
      why: "Misura il costo delle coperture in opzioni e lo stress sistemico.",
    },
  },

  // Seasonality & Smart Money
  detrendedSeasonality: {
    titleEn: "Detrended Seasonality",
    titleIt: "Stagionalità Detrendizzata",
    en: {
      what: "Average calendar-year pattern after mathematically removing multi-year upward or downward trend.",
      read: "Rising curves show calendar windows that consistently outperformed the asset's annual baseline.",
      why: "Prevents a multi-year bull market from making every single month look artificially bullish.",
    },
    it: {
      what: "Andamento medio annuale ottenuto rimuovendo matematicamente il trend pluriennale di fondo.",
      read: "Curve in salita evidenziano periodi dell'anno storicamente più forti della media.",
      why: "Evita che un lungo mercato rialzista faccia sembrare favorevole ogni mese dell'anno.",
    },
  },
  winRate: {
    titleEn: "Historical Win Rate",
    titleIt: "Tasso di Successo Storico",
    en: {
      what: "Percentage of past years in which this exact calendar window ended with a positive return.",
      read: "Above 70%–75% over 20–30 years signals a notably consistent seasonal tendency.",
      why: "Measures repeatability—not just one lucky outlier year skewing the average.",
    },
    it: {
      what: "Percentuale di anni passati in cui la finestra di calendario selezionata ha chiuso in positivo.",
      read: "Valori superiori al 70%–75% su 20–30 anni indicano una forte ripetitività storica.",
      why: "Misura la costanza statistica evitando distorsioni dovute a un singolo anno eccezionale.",
    },
  },
  cftcCot: {
    titleEn: "CFTC COT Report",
    titleIt: "Report CFTC COT",
    en: {
      what: "Weekly US regulatory report showing net long/short futures positions across trader groups.",
      read: "Extreme crowded positioning can precede trend reversals or confirm institutional accumulation.",
      why: "Reveals how real futures capital is positioned behind the scenes.",
    },
    it: {
      what: "Report settimanale USA sulle posizioni nette lunghe/corte sui futures divise per categoria.",
      read: "Posizionamenti estremi possono anticipare inversioni o confermare accumulazione.",
      why: "Mostra come si stanno muovendo i grandi capitali nei mercati futures.",
    },
  },
  commercialHedgers: {
    titleEn: "Commercial Hedgers",
    titleIt: "Commercial Hedgers (Produttori)",
    en: {
      what: "Producers, miners, airlines, and physical users hedging real-world business exposure.",
      read: "Often step in aggressively as buyers when prices fall below production value.",
      why: "Considered 'smart physical money' with deep supply-chain visibility.",
    },
    it: {
      what: "Produttori, compagnie minerarie e utilizzatori industriali che coprono rischi reali.",
      read: "Spesso aumentano gli acquisti quando i prezzi scendono sotto i costi fondamentali.",
      why: "Rappresentano operatori con profonda conoscenza diretta della domanda fisica.",
    },
  },
  largeSpeculators: {
    titleEn: "Large Speculators",
    titleIt: "Grandi Speculatori (Hedge Fund)",
    en: {
      what: "Hedge funds, CTAs, and institutional asset managers trading futures for profit.",
      read: "Tend to follow momentum; extreme net longs (>90th pct) can signal crowded trades.",
      why: "Drives medium-term trend liquidity across commodities, FX, and indices.",
    },
    it: {
      what: "Hedge fund, CTA e gestori istituzionali che operano sui futures per rendimento.",
      read: "Seguono spesso il momentum; eccessi oltre il 90° percentile indicano posizionamenti affollati.",
      why: "Alimentano la liquidità e la forza delle tendenze di medio termine.",
    },
  },
  smallTraders: {
    titleEn: "Small Traders",
    titleIt: "Piccoli Trader (Retail)",
    en: {
      what: "Smaller non-reportable market participants trading below institutional threshold sizes.",
      read: "Often watched as a contrarian sentiment indicator at major turning points.",
      why: "Completes the zero-sum positioning breakdown alongside Commercials and Hedge Funds.",
    },
    it: {
      what: "Partecipanti minori sotto le soglie di segnalazione istituzionale CFTC.",
      read: "Spesso osservati come indicatore contrarian vicino ai massimi o minimi di mercato.",
      why: "Completa il quadro a somma zero insieme a Commercial e Grandi Speculatori.",
    },
  },
  extremePercentile: {
    titleEn: "COT Percentile",
    titleIt: "Percentile Storico COT",
    en: {
      what: "Where current net positioning ranks compared to the past 1–3 years (0 = lowest, 100 = highest).",
      read: "Above 85th or below 15th percentile flags historically stretched institutional positioning.",
      why: "Helps spot crowded trades where reversal risk or breakout fuel is highest.",
    },
    it: {
      what: "Posizione attuale rispetto agli ultimi 1–3 anni (0 = minimo storico, 100 = massimo storico).",
      read: "Sopra l'85° o sotto il 15° percentile segnala posizionamenti storicamente tesi.",
      why: "Evidenzia eccessi di posizionamento dove aumenta il rischio di inversione.",
    },
  },
  secForm4: {
    titleEn: "SEC Form 4",
    titleIt: "Modulo SEC Form 4",
    en: {
      what: "Mandatory filing within 2 business days whenever a company executive or director buys or sells shares.",
      read: "Open-market cash purchases carry far more signal than routine scheduled sales.",
      why: "Company insiders know their business best—buying with personal cash shows strong conviction.",
    },
    it: {
      what: "Comunicazione obbligatoria entro 2 giorni quando dirigenti o consiglieri comprano o vendono azioni.",
      read: "Gli acquisti diretti sul mercato hanno molto più valore delle vendite automatiche programmate.",
      why: "Chi guida l'azienda conosce bene i conti: investire capitale proprio è un forte segnale di fiducia.",
    },
  },
  insiderCluster: {
    titleEn: "Insider Cluster",
    titleIt: "Cluster di Acquisti Insider",
    en: {
      what: "Multiple executives or directors purchasing shares around the same time window.",
      read: "Bullish clusters suggest leadership views the stock as attractively priced.",
      why: "Multiple independent insiders buying together carries higher statistical weight than one trade.",
    },
    it: {
      what: "Più dirigenti o amministratori che acquistano azioni nello stesso arco temporale.",
      read: "Un cluster rialzista indica che il management ritiene il titolo sottovalutato.",
      why: "Acquisti coordinati da più figure chiave sono più significativi di una singola operazione.",
    },
  },

  // Options & Derivatives
  callOption: {
    titleEn: "Call Option",
    titleIt: "Opzione Call",
    en: {
      what: "Contract giving the buyer the right (not obligation) to buy an asset at a fixed Strike Price before expiry.",
      read: "Call prices rise when the underlying stock rises or implied volatility increases.",
      why: "Used to bet on upside moves with capped loss or hedge short positions.",
    },
    it: {
      what: "Contratto che dà il diritto (non l'obbligo) di acquistare un asset a un prezzo prefissato entro la scadenza.",
      read: "Il valore cresce quando il titolo sale o aumenta la volatilità implicita.",
      why: "Usata per esporsi a rialzi con rischio massimo limitato al premio pagato.",
    },
  },
  putOption: {
    titleEn: "Put Option",
    titleIt: "Opzione Put",
    en: {
      what: "Contract giving the buyer the right to sell an asset at a fixed Strike Price before expiry.",
      read: "Put prices rise when the stock drops, acting like portfolio crash insurance.",
      why: "Used to protect existing holdings from drops or profit from downward moves.",
    },
    it: {
      what: "Contratto che dà il diritto di vendere un asset a un prezzo prefissato entro la scadenza.",
      read: "Il valore sale quando il titolo scende, fungendo da assicurazione contro i ribassi.",
      why: "Utilizzata per proteggere un portafoglio o trarre profitto da fasi ribassiste.",
    },
  },
  strikePrice: {
    titleEn: "Strike Price",
    titleIt: "Prezzo Strike",
    en: {
      what: "The locked-in price at which an option contract can buy (Call) or sell (Put) the underlying shares.",
      read: "Strikes close to the current market price have the highest trading volume and sensitivity.",
      why: "Determines whether an option finishes profitable at expiration.",
    },
    it: {
      what: "Il prezzo fisso a cui l'opzione consente di comprare (Call) o vendere (Put) il sottostante.",
      read: "Gli strike vicini al prezzo attuale concentrano la maggiore liquidità.",
      why: "Stabilisce la soglia oltre la quale l'opzione genera valore a scadenza.",
    },
  },
  bidAskSpread: {
    titleEn: "Bid / Ask Spread",
    titleIt: "Spread Denaro / Lettera",
    en: {
      what: "Bid is the highest buyer price; Ask is the lowest seller price.",
      read: "Tight spreads (a few cents) mean high liquidity; wide spreads increase trading costs.",
      why: "Shows how easily you can enter or exit a position without slippage.",
    },
    it: {
      what: "Denaro (Bid) è il miglior prezzo in acquisto; Lettera (Ask) è il miglior prezzo in vendita.",
      read: "Spread stretti indicano alta liquidità; spread ampi aumentano il costo implicito.",
      why: "Misura la facilità di entrare o uscire senza perdere margine nell'esecuzione.",
    },
  },
  openInterest: {
    titleEn: "Open Interest (OI)",
    titleIt: "Open Interest (OI)",
    en: {
      what: "Total number of active, unsettled option or futures contracts currently open.",
      read: "High OI strikes often act as price magnets or support/resistance levels near expiration.",
      why: "Measures institutional liquidity and where big bets are concentrated.",
    },
    it: {
      what: "Numero totale di contratti di opzione o futures attualmente aperti e non ancora chiusi.",
      read: "Strike con Open Interest elevato fungono spesso da livelli di supporto o resistenza.",
      why: "Mostra dove si concentrano le grandi posizioni istituzionali.",
    },
  },
  impliedVolatility: {
    titleEn: "Implied Volatility (IV)",
    titleIt: "Volatilità Implicita (IV)",
    en: {
      what: "Expected future annualized price swing priced into current option premiums.",
      read: "High IV makes options expensive (often before earnings); low IV makes options cheaper.",
      why: "Tells you whether option buyers are paying a high fear or event premium.",
    },
    it: {
      what: "Ampiezza delle oscillazioni future attesa dal mercato e riflessa nel prezzo dell'opzione.",
      read: "IV alta rende le opzioni costose (es. prima delle trimestrali); IV bassa le rende economiche.",
      why: "Indica se il mercato sta scontando forte incertezza imminente.",
    },
  },
  inTheMoney: {
    titleEn: "In-The-Money (ITM)",
    titleIt: "In-The-Money (ITM)",
    en: {
      what: "An option that already has immediate intrinsic value if exercised right now.",
      read: "Calls are ITM when Strike < Spot; Puts are ITM when Strike > Spot.",
      why: "ITM options move more closely dollar-for-dollar with the underlying stock.",
    },
    it: {
      what: "Un'opzione che possiede già un valore intrinseco positivo immediato.",
      read: "Le Call sono ITM con Strike < Prezzo attuale; le Put con Strike > Prezzo attuale.",
      why: "Le opzioni ITM replicano con maggiore fedeltà i movimenti del titolo sottostante.",
    },
  },
  delta: {
    titleEn: "Delta (Δ)",
    titleIt: "Delta (Δ)",
    en: {
      what: "How much an option price moves for every $1 move in the underlying asset.",
      read: "0.50 means +$0.50 option move per $1 stock move; also approximates probability of finishing ITM.",
      why: "Measures directional exposure—100 shares equal Delta 1.00.",
    },
    it: {
      what: "Variazione stimata del prezzo dell'opzione per ogni variazione di 1$ del sottostante.",
      read: "Un Delta di 0,50 significa +0,50$ per ogni +1$ del titolo; stima anche la probabilità ITM.",
      why: "Misura la sensibilità direzionale rispetto al movimento del prezzo.",
    },
  },
  gamma: {
    titleEn: "Gamma (Γ)",
    titleIt: "Gamma (Γ)",
    en: {
      what: "Rate at which Delta changes for each $1 move in the underlying stock.",
      read: "Highest near the current price and close to expiration.",
      why: "Shows how rapidly your directional exposure accelerates during sharp moves.",
    },
    it: {
      what: "Velocità con cui varia il Delta al muoversi di 1$ del titolo sottostante.",
      read: "È massimo sugli strike vicini al prezzo attuale e a ridosso della scadenza.",
      why: "Indica quanto rapidamente accelera l'esposizione durante movimenti bruschi.",
    },
  },
  theta: {
    titleEn: "Theta (Θ)",
    titleIt: "Theta (Θ)",
    en: {
      what: "Daily dollar value an option loses purely from the passage of one calendar day (time decay).",
      read: "Negative for option buyers—time decay accelerates in the final 30 days.",
      why: "Reminds buyers how much the stock must move just to offset daily time erosion.",
    },
    it: {
      what: "Perdita giornaliera di valore dell'opzione dovuta al solo trascorrere del tempo.",
      read: "Negativo per chi acquista opzioni; accelera negli ultimi 30 giorni prima della scadenza.",
      why: "Quantifica il costo quotidiano del tempo per chi detiene opzioni.",
    },
  },
  vega: {
    titleEn: "Vega (ν)",
    titleIt: "Vega (ν)",
    en: {
      what: "Option price change for each 1 percentage-point change in Implied Volatility.",
      read: "Higher Vega means option value reacts strongly when market fear spikes or fades.",
      why: "Explains why options can lose value after earnings even if you guessed the direction right ('IV crush').",
    },
    it: {
      what: "Variazione del prezzo dell'opzione per ogni punto percentuale di variazione della Volatilità Implicita.",
      read: "Vega alto implica forte sensibilità ai cambiamenti dell'incertezza di mercato.",
      why: "Spiega perché dopo le trimestrali il valore delle opzioni può calare al crollare della volatilità.",
    },
  },

  // Bonds, FX & Macro
  yieldCurve: {
    titleEn: "Yield Curve",
    titleIt: "Curva dei Rendimenti",
    en: {
      what: "Chart plotting government bond interest rates across maturities from 2 years to 30 years.",
      read: "Normally slopes upward (longer bonds pay more); flat or inverted curves signal tight policy.",
      why: "Widely watched bond-market barometer for future economic growth and Fed policy.",
    },
    it: {
      what: "Grafico dei rendimenti dei titoli di Stato lungo le diverse scadenze (da 2 a 30 anni).",
      read: "In condizioni normali è inclinata verso l'alto; curve piatte o invertite indicano politica restrittiva.",
      why: "È il principale termometro obbligazionario delle aspettative su crescita e tassi.",
    },
  },
  spread2y10y: {
    titleEn: "2Y–10Y Yield Spread",
    titleIt: "Spread 2A–10A (Treasury USA)",
    en: {
      what: "Difference between the 10-Year US Treasury yield and the 2-Year US Treasury yield.",
      read: "Positive (>0 bps) = normal curve; negative (<0 bps) = inverted curve historically preceding slowdowns.",
      why: "Signals whether banks and markets expect rate cuts or economic cooling ahead.",
    },
    it: {
      what: "Differenza tra il rendimento del Treasury USA a 10 anni e quello a 2 anni.",
      read: "Positivo (>0 bps) = curva normale; negativo (<0 bps) = curva invertita.",
      why: "Anticipa spesso svolte nella politica della Federal Reserve e nel ciclo economico.",
    },
  },
  btpBundSpread: {
    titleEn: "BTP–Bund Spread",
    titleIt: "Spread BTP–Bund",
    en: {
      what: "Yield difference between Italian 10Y BTP bonds and German 10Y Bund bonds, measured in basis points.",
      read: "100 bps = 1.00% extra yield paid by Italy; lower spread reflects calmer Eurozone confidence.",
      why: "Key benchmark for Italian sovereign credit risk, European banks, and FTSE MIB sentiment.",
    },
    it: {
      what: "Differenza di rendimento tra BTP decennale italiano e Bund decennale tedesco in punti base.",
      read: "100 bps equivalgono all'1,00% di rendimento extra pagato dall'Italia; spread bassi indicano fiducia.",
      why: "Riferimento chiave per il merito di credito italiano, le banche e il FTSE MIB.",
    },
  },
  bps: {
    titleEn: "Basis Points (bps)",
    titleIt: "Punti Base (bps)",
    en: {
      what: "One hundredth of one percentage point (100 bps = 1.00%).",
      read: "A 25 bps rate cut equals 0.25%.",
      why: "Standard precision unit used in bond yields, central bank policy, and spreads.",
    },
    it: {
      what: "Un centesimo di punto percentuale (100 bps = 1,00%).",
      read: "Un taglio dei tassi da 25 bps equivale allo 0,25%.",
      why: "Unità di misura standard per rendimenti obbligazionari, tassi centrali e spread.",
    },
  },
  cpi: {
    titleEn: "CPI (Consumer Price Index)",
    titleIt: "CPI (Inflazione al Consumo)",
    en: {
      what: "Year-over-year percentage change in prices paid by consumers for a basket of goods and services.",
      read: "Central banks generally target ~2.0% inflation; readings well above 2% keep rates higher longer.",
      why: "Primary driver of Fed and ECB interest-rate decisions and bond yields.",
    },
    it: {
      what: "Variazione annua dei prezzi di un paniere rappresentativo di beni e servizi al consumo.",
      read: "Le banche centrali puntano a circa il 2,0%; valori più alti mantengono i tassi restrittivi.",
      why: "Guida direttamente le decisioni di Fed e BCE sui tassi di interesse.",
    },
  },
  fedFunds: {
    titleEn: "Fed Funds Rate",
    titleIt: "Tasso Fed Funds",
    en: {
      what: "Overnight interest rate set by the US Federal Reserve for interbank lending.",
      read: "Lower rates reduce borrowing costs and tend to support stocks, gold, and long-duration assets.",
      why: "Sets the baseline cost of money for the entire US dollar financial system.",
    },
    it: {
      what: "Tasso di interesse di riferimento fissato dalla Federal Reserve per i prestiti interbancari overnight.",
      read: "Tassi più bassi riducono il costo del denaro favorendo azioni, oro e asset a lunga durata.",
      why: "Stabilisce il costo base della liquidità in dollari a livello globale.",
    },
  },
  ecbRate: {
    titleEn: "ECB Deposit Rate",
    titleIt: "Tasso Depositi BCE",
    en: {
      what: "Primary policy rate paid by the European Central Bank on commercial banks' overnight deposits.",
      read: "Directly anchors Eurozone Euribor rates, Italian BTPs, and EUR/USD movements.",
      why: "Core driver of European borrowing costs and Eurozone equity valuations.",
    },
    it: {
      what: "Principale tasso di politica monetaria della Banca Centrale Europea sui depositi overnight.",
      read: "Guida direttamente Euribor, mutui europei, BTP italiani e tasso di cambio EUR/USD.",
      why: "Determina il costo del credito nell'intera Area Euro.",
    },
  },
  spotRate: {
    titleEn: "Spot Exchange Rate",
    titleIt: "Tasso di Cambio Spot",
    en: {
      what: "Current market exchange rate for immediate currency settlement (e.g. 1 EUR = 1.0584 USD).",
      read: "Rising EUR/USD means the Euro is strengthening against the US Dollar.",
      why: "Impacts international portfolio returns and multinational company revenues.",
    },
    it: {
      what: "Tasso di cambio corrente per regolamento immediato tra due valute (es. 1 EUR = 1,0584 USD).",
      read: "EUR/USD in salita indica un rafforzamento dell'Euro rispetto al Dollaro USA.",
      why: "Incide sul rendimento degli investimenti esteri e sui ricavi delle multinazionali.",
    },
  },
  futuresContract: {
    titleEn: "Futures Contract",
    titleIt: "Contratto Futures",
    en: {
      what: "Standardized exchange-traded contract to buy or sell an asset (like Gold or Oil) at a future date.",
      read: "Front-month futures prices reflect spot demand plus storage and financing costs.",
      why: "Primary venue where producers and institutions discover global commodity prices.",
    },
    it: {
      what: "Contratto standardizzato negoziato in borsa per acquistare o vendere un asset a una data futura.",
      read: "Il prezzo riflette domanda immediata più costi di stoccaggio e finanziamento.",
      why: "È il mercato principale in cui si formano i prezzi globali delle materie prime.",
    },
  },
};
