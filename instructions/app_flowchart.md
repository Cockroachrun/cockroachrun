flowchart TD
    LS[Loading Screen] --> SM[Start Menu]
    SM --> MS[Mode Selection]
    MS --> CS[Character Selection]
    CS --> GP[Gameplay]
    GP --> PO[Pause and Game Over Screen]
    SM --> SET[Settings and Credits]
    SM --> WAL[Wallet Integration]
    GP --> ERR[Error / Fallback Handling]
    ERR --> GP
    PO --> SM
    SET --> SM
    WAL --> SM