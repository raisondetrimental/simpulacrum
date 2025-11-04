export const COMPANY_DIAGRAM = `---
config:
  theme: redux
  layout: elk
---
flowchart TB
 subgraph BOP["Pillar 4: Organisation"]
    direction TB
        OPSOFT["Operations Software"]
        MUF["MUF: Meridian Universal Internal Fund"]
        ORG["Efficiency of Operations"]
        CRMS("CRM Software")
        OFFICE("Full Microsoft Integration")
  end
 subgraph GOVPOL["Pillar 3: Governance"]
    direction LR
        CONTEXT["Existing Market (merchant banking context)<br>Investors = liquidity; Sponsors = assets; Investment Banks &amp; Commercial Banks = competition/partners; Regulators = compliance; Governments = allies/clients; Legal = administration; Accounting = reporting."]
        TMRK["Markets to focus on"]
        TMKTS["Target Markets<br>Developed: US, UK, Western Europe<br>Emerging: West Africa (Senegal, Côte d'Ivoire, Nigeria); East Africa (Rwanda); Central Asia (Georgia, Azerbaijan, Kazakhstan); North Asia (Mongolia, China); South Asia (Sri Lanka)"]
        PD["PD"]
        KUSH["Kush: Analyst"]
        NAV["Nav: Managing Director"]
        LAVINIA["Lavinia: Administration Officer"]
        CM["Cameron: Economist"]
        AIJAN["Aijan: Senior Advisor"]
        AMGALAN["Amgalan: Mongolia Country Lead"]
        MAX["Max: Asia Regional Lead"]
        ROLES("Well Defined Team Roles")
        CON("Relations with DBT and Foreign Office")
  end
 subgraph PD["Personal Development"]
    direction LR
        PDG("Personal Development Goals and Wellbeing Goals")
        DISC("DISC Personality Types")
        EXRC("Three times weekly exercise and gym")
  end
 subgraph STRATS1["Tools"]
    direction LR
        DEFBSO["Broad Strategic Objectives (BSOs)"]
        KAs["Knowledge Areas (KAs)<br>1) Government (policy)<br>2) Industry News (market)<br>3) Research (analysis)"]
        MTs["Master Tools (MTs)<br>MT1 Infrastructure<br>MT2 Real Estate<br>MT3 Sovereign Programs<br>MT4 Banking Sector"]
        DES@{ label: "Dam Effect Strategy (DES)<br>Create demand per MT/ST/BSO; prepare investor 'dams' by risk/tenor/format/currency." }
        FTs["Financing Tools (FTs)"]
  end
 subgraph STRATS["Strategies"]
    direction LR
        PILLAR4["Sculpt to be highly specialised in managing agents globally, similar to an intelligence agency (e.g. MI5, MI6 and CIA)"]
        TEAM["Keep a small but highly effective team"]
        UK["Create a firm aligned with UK strategic interest, to support the strengthening of the UK economy, international market access and intelligence, supporting UKs allies globally, and being one of the foremost UK tax contributors"]
  end
 subgraph IR["Inbetweens"]
    direction LR
        DP1("Transaction Toolkit")
        DES1("Dam Effect Strategy")
        INT("Intelligence Base")
        EFFOPS("Efficient Operation")
  end
 subgraph OPS["Business Operations"]
    direction TB
        IRBAL["CRM (Investor and Sponsor Relations)"]
        MATER["Marketing (materials)"]
        LEG["Legal (Agreements, contracts)"]
        COMP["Compliance (reporting, ensuring compliance)"]
        FMOD["Financial Model"]
        BIZMGMT["Business Management (accounts, Companies House, HMRC, HR)"]
  end
 subgraph FEPS["Financial Evaluation Parameters"]
    direction TB
        FEP_INFRA["FEPs – MT1 Infrastructure (examples)<br>Renewable Energy: EBITDA; Cap Rate; DSCR; PPA; Guarantee/Guarantor; PPA Tenor; Contracted vs Merchant %; PPA Credit Rating; Holdco LTV; LTC (Project SPV); Balloon at Maturity; Solar Tax Equity.<br>Transport/Telecoms/Digital: (sector-specific add-ons)"]
        FEP_RE["FEPs – MT2 Real Estate (extracts)<br>NPLs: Asset Value; Asset Price; Legal status; Current ownership.<br>Residential: Cash-on-Cash; Debt Yield; Cost Basis; ROI; IRR; Cash Multiple; Cost/Unit; Sale Price/Unit; Return Multiple; EBITDA; Asset Value; LTV; DSCR.<br>Industrial &amp; Logistics: EBITDA; Tenant Credit Rating; Lease Guarantor; Lease Tenor; Asset Value; Cost/ft²; Value/ft²; Cost Basis; Debt Yield; LTV; DSCR."]
        FEP_SOV["FEPs – MT3 Sovereign (general)<br>Public Bond YTM; Debt/GDP; Current Account Deficit; Debt Service Ratio; GDP Growth; Growth in Domestic Money Supply; Import Ratio; Export Revenue Variance; FX Reserves &amp; Currency; Balance of Payments; Bank Dollarisation.<br>Country focus examples: Mongolia; Senegal; Georgia; Kazakhstan; Sri Lanka."]
  end
 subgraph FT_BASKET["Financing Tools (FTs)"]
    direction TB
        FT_DEBT["Debt (secured/unsecured):<br>• Project Finance** (secured vs project construction)<br>• Bridge Loan** (&lt;24m)<br>• Bond** (Public [listed]/Private)<br>• Loan Agreement** (&gt;24m, direct, unlisted/private)"]
        FT_EQUITY["Equity:<br>• Preferred equity; Equity"]
        FT_CAP["Capital type summary:<br>• Debt: High Yield**, Investment Grade**<br>• Equity: Ordinary shares, Preferred shares"]
        FT_TYPES["Financing types (debt focus):<br>• Holding Company Financing (Corporate Finance)**<br>• Project Level Financing (Project Finance)**<br>• Acquisition Finance** (Senior Secured vs acquisition assets)<br>• Development Finance (Entitlement risk)"]
  end
 subgraph BSO["Broad Strategic Objectives (BSOs)"]
    direction TB
        BSO1["BSO1: Energy (inc. Renewable/ cleaner energy)<br>Newest technologies; stable, high-quality cleaner energy for conversion/early-stage systems."]
        BSO2["BSO2: Boost trade/ support national economic development (GDP growth)<br>Ports/transport; industrial &amp; manufacturing; data centre &amp; digital; real-estate that lifts GDP."]
        BSO3["BSO3: Sovereign debt solvency stabilisation and strengthening<br>Debt profile/liquidity mgmt; invest in critical infra with evidence; align with national growth &amp; IMF stability."]
        BSO4["BSO4: Better Health Outcomes<br>Healthcare/social-infra; state-backed health programmes."]
  end
 subgraph AGENTS["Transaction Agents"]
    direction TB
        UWR["Underwriter"]
        BR["Bookrunner"]
        LENDERS["Lender Syndicate"]
        SPONSOR["Sponsor"]
        COUNSEL("Counsel")
  end
 subgraph RESEARCH["Consistent Intelligence Base"]
    direction TB
        ID["Internal Dashboard"]
        NF["RSS News Feed"]
        MD["Market Dashboard"]
        MI["Market Intelligence Platforms like bloomberg"]
  end
 subgraph DSTs["Sub-Tools (STs)"]
    direction TB
        STs_MT1["• MT1: Energy Infra; Port/Transport Infra; Utilities/Digital; Water; Healthcare/Social"]
        STs_MT2["• MT2: Residential; Commercial; Logistics Warehousing; Cargo Facilities; NPL portfolios"]
        STs_MT3["• MT3: Sovereign Bonds; Bilateral Loans; Credit Enhancement; Debt Refinancing/Alleviation; SDG Healthcare"]
        STs_MT4["• MT4: Private Banks; State-Banks"]
  end
 subgraph ST["The Mission Equipment"]
    direction TB
        T["Strategy: hard-security remuneration; align with government policy; connect buyers of paper; connect sponsors; keep team small, discreet, MI6-style network."]
        S["Tools (how we execute)<br>• BSOs<br>• Master Tools (MTs)<br>• Sub-Tools (STs)<br>• Financing Tools (FTs)<br>• Knowledge Areas (KAs)<br>• Financial Evaluation Parameters (FEPs)"]
  end
 subgraph INTEL["Intelligence"]
    direction TB
        INTELSPONSORS["Sponsor universe (top-quality, per MT/ST/BSO)"]
        RS["Investor mapping (by risk/tenor/mandate)"]
        TR("Transaction Precedents")
  end
 subgraph RE["Pillar 1: Research"]
        RP["Research Paths"]
        CONSTRAINT["Constraint to Prosperity"]
        DH["Dual Hurdles"]
        WV["Wider View"]
        H1["Hurdle 1: Is this socially efficient?"]
        H2["Hurdle 2: Can private financing efficiently solve this constraint?"]
        EVID["Granular and Microeconomic Evidence"]
        WHATMT["What is the correct MT and sub-MT?"]
        H1F["Credit markets and capital markets"]
        WHATFT["What financing tool should be used?"]
        ORIG["Financial and Structural Toolkit"]
        RESEARCH
        DD("LSEG/LSEG market data: yields, macro, rates")
        II("Private infrastructure trend and fund data")
        PP("Structuring and benchmark pricing transactions")
        WT("Trends in global infrstructure")
        PROP("Deal Intelligence")
        CNTC["Research and Professional Contacts"]
        PROP1("Deal Proposition")
        IP("Intelligence Pool")
        PR("Past Research")
        PR1["-Infrastructure and Sovereign Debt<br>-Mongolia Sovereign Debt<br>-Social Sustainability &amp; ESG<br>-Eurasia Economic Security"]
  end
 subgraph TRANSACT["Pillar 2: Transaction"]
    direction TB
        OPS
        FT_BASKET
        LIQ["Liquidity Pool"]
        SPONSORPOOL["Sponsor Pool"]
        INTEL
        WHATSPONSOR["What sponsor should we approach"]
        MKT["Marketing Tools and Collateral"]
        FM["Financial Structuring for each MT"]
        SM["Structured Model"]
        FEPS
        COMPPRICE["Competitive Pricing"]
        PLAG["Placement Agents"]
        DEBTISS["Debt Issuance"]
        AGENTS
        COMPOFFER["Competitive Offer"]
        OFF["Offering to lenders"]
        FUNDS["Funds disbursed to SPV"]
        SPV["SPV"]
        BUILD["Project Construction Begins"]
        PROFITS["Project Profits"]
        CLEAR["Clearing House"]
        AFS["Agreed Financial Structure"]
        KYC["Due Diligence & KYC"]
  end
    ORG --> OPSOFT & MUF
    OPSOFT --> CRMS & OFFICE
    PILLAR4 --> ORG
    TEAM --> ROLES & PD
    TMRK --> CONTEXT & TMKTS
    ROLES -.- KUSH & NAV & LAVINIA & CM & AIJAN & AMGALAN & MAX
    UK --> TMRK
    UK ---> CON
    CNTC -.- PROP
    INTELSPONSORS -.- SPONSORPOOL
    MI --> DD & II & PP
    ID --> WT
    II -.- ORIG
    PP -.- ORIG
    WHATMT --> PROP
    WHATFT --> PROP
    KAs -.-> IP
    IP --> PR & RESEARCH & CNTC
    DSTs -.-> WHATMT & FM
    ORIG -.- DP1
    COMP -. KYC/AML .-> KYC
    LEG --> COUNSEL
    COUNSEL --> KYC
    KYC -.-> DEBTISS
    DES -.- DES1
    WT -.- INT
    DD -.- INT
    INT -.- TR & INTELSPONSORS
    TR --> FM
    DES1 -.- IRBAL & RS
    RP --> DH & WV
    MTs -.-> DSTs
    DP1 -.- FMOD
    PROSPERITY{"MERIDIAN UNIVERSAL"} --> PURPOSE["Purpose<br>Provide economic stability for others; the fund is core stability so we can act fast for corporate/sovereign sponsors."] & VISION["Vision<br>Finance &gt;US$100bn of infrastructure, real estate, and sovereign assets with net-positive impact."] & OBJECTIVE["Objective<br>Merchant-banking vehicle: fully integrated with global capital markets, matching investor capital with sponsor assets selected against BSOs."] & GOAL["Goal<br>Private fund: ~US$100m by 2028 → ~US$2bn by 2040 (prove model, capability, execution, metrics)."]
    STRAT{"THE MISSION"} --> S & T
    T --> STRATS
    VISION --> STRAT
    OBJECTIVE --> STRAT
    GOAL --> STRAT
    PURPOSE --> STRAT
    RS --> LIQ
    S --> STRATS1
    DEFBSO --> BSO
    BSO --> CONSTRAINT
    CONSTRAINT --> RP
    DEAL{"Infrastructure Pipeline and Mandates"} -- Stage 2 --> TRANSACT
    DH --> H1 & H2
    H1 --> EVID
    EVID --> WHATMT
    FM --> FT_BASKET & FEPS
    FMOD --> FM
    H2 --> H1F
    H1F --> WHATFT
    PROP -.- ORIG
    PROP --> PROP1
    PROP1 --> DEAL
    SPONSORPOOL --> WHATSPONSOR
    WHATSPONSOR --> MKT
    MKT --> SPONSOR
    FT_BASKET --> SM
    FEPS --> SM
    SM --> COMPPRICE
    PLAG --> UWR & BR
    UWR --> DEBTISS
    BR --> DEBTISS
    COMPOFFER --> DEBTISS
    COMPPRICE --> OFF
    LIQ -- DES --> OFF
    OFF --> LENDERS
    LENDERS --> COMPOFFER
    DEBTISS --> FUNDS
    SPONSOR --> SPV
    SPV --> FUNDS
    FUNDS --> BUILD
    BUILD --> PROFITS
    PROFITS --> CLEAR
    CLEAR --> AFS
    MATER -. inputs .-> MKT
    IRBAL -. relations .-> LIQ
    BIZMGMT -. docs .-> PLAG
    TRANSACT --> FEP_INFRA
    PR --> PR1
    PR1 -.- PROP
     OPSOFT:::strat
     MUF:::strat
     ORG:::strat
     CRMS:::strat
     OFFICE:::strat
     CONTEXT:::strat
     TMRK:::strat
     TMKTS:::strat
     CON:::strat
     PDG:::strat
     DISC:::strat
     EXRC:::strat
     DEFBSO:::core
     KAs:::core
     MTs:::core
     DES:::core
     FTs:::core
     PILLAR4:::strat
     TEAM:::strat
     UK:::strat
     DP1:::process
     DES1:::process
     INT:::process
     IRBAL:::process
     MATER:::process
     LEG:::process
     COMP:::process
     FMOD:::process
     BIZMGMT:::process
     FEP_INFRA:::output
     FEP_RE:::output
     FEP_SOV:::output
     FT_DEBT:::output
     FT_EQUITY:::output
     FT_CAP:::output
     FT_TYPES:::output
     BSO1:::core
     BSO2:::core
     BSO3:::core
     BSO4:::core
     UWR:::process
     BR:::process
     LENDERS:::output
     ID:::decision
     NF:::decision
     MD:::decision
     MI:::decision
     STs_MT1:::core
     STs_MT2:::core
     STs_MT3:::core
     STs_MT4:::core
     T:::strat
     S:::CORE
     S:::core
     RP:::decision
     CONSTRAINT:::risk
     CONSTRAINT:::decision
     DH:::decision
     WV:::decision
     H1:::decision
     H1:::decision
     H2:::decision
     H2:::decision
     EVID:::process
     EVID:::decision
     WHATMT:::decision
     H1F:::decision
     WHATFT:::decision
     ORIG:::decision
     DD:::decision
     II:::decision
     PP:::decision
     WT:::decision
     PROP:::decision
     CNTC:::decision
     PROP1:::decision
     IP:::decision
     PR:::decision
     PR1:::decision
     LIQ:::output
     INTEL:::process
     WHATSPONSOR:::output
     MKT:::process
     COMPPRICE:::output
     PLAG:::process
     DEBTISS:::output
     COMPOFFER:::output
     FUNDS:::output
     SPV:::core
     BUILD:::process
     PROFITS:::output
     CLEAR:::process
     AFS:::core
     KYC:::risk
     PROSPERITY:::risk
     PURPOSE:::risk
     VISION:::risk
     OBJECTIVE:::risk
     GOAL:::risk
     STRAT:::risk
     DEAL:::risk
    classDef anchor fill:transparent,stroke:transparent,color:transparent
    classDef core fill:#e7f5ff,stroke:#339af0,stroke-width:1px,color:#001f3f
    classDef process fill:#f8f9fa,stroke:#6c757d,stroke-width:1px,color:#202020
    classDef risk fill:#fff0f6,stroke:#d6336c,stroke-width:5px,color:#5c0730
    classDef decision fill:#fff3cd,stroke:#f0ad4e,stroke-width:1px,color:#3f2d00
    classDef output fill:#e6fcf5,stroke:#20c997,stroke-width:1px,color:#073d2d
    classDef strat fill:#ffcccc,stroke:#ff9999,stroke-width:1px,color:#073d2d
`;