/**
 * Country fundamentals data types
 */

export interface Industry {
  name: string;
  isic_code: string;
  gdp_percentage: number;
}

export interface PopulationData {
  value: number;
  unit: string;
  date: string;
}

export interface EconomicIndicator {
  value: number;
  unit: string;
  year: number;
  projection_source?: string;
}

export interface GDPGrowthDataPoint {
  year: number;
  value: number;
  is_projection: boolean;
}

export interface TradeData {
  value: number;
  unit: string;
  year: number;
}

export interface CountryFundamentals {
  name: string;
  slug: string;
  capital: string;
  region: string;
  government_type: string;
  international_organizations: string[];
  population: PopulationData;
  gdp: EconomicIndicator;
  gdp_growth_rate: EconomicIndicator;
  gdp_growth_history: GDPGrowthDataPoint[];
  gdp_per_capita: EconomicIndicator;
  inflation_cpi: EconomicIndicator;
  exports: TradeData;
  imports: TradeData;
  top_industries: Industry[];
  data_year: number;
  sources: string[];
}

export interface CountryListItem {
  name: string;
  slug: string;
  capital: string;
  region: string;
}

/**
 * IMF Article IV Consultation Data
 * Supports both narrative format (Vietnam) and structured format (other countries)
 */
export interface IMFArticleIV {
  // Common fields
  country?: string;
  source_name?: string;
  publication_date: string;
  consultation_date?: string;
  imf_country_report_no?: string;
  mission_dates?: string;
  data_vintage?: string;
  report_links?: string;

  // Macroeconomic Overview (narrative or structured)
  macro_overview: string;
  policy_stance?: string;
  key_risks: string;

  // Narrative format fields (Vietnam)
  gdp_growth_current?: string;
  gdp_growth_forecast?: string;
  inflation_current?: string;
  inflation_outlook?: string;
  fiscal_balance_current?: string;
  fiscal_balance_outlook?: string;
  public_debt_current?: string;
  public_debt_trajectory?: string;
  monetary_policy_current?: string;
  monetary_policy_outlook?: string;
  exchange_rate_current?: string;
  exchange_rate_policy?: string;
  reserves_current?: string;
  reserves_adequacy?: string;
  current_account_current?: string;
  current_account_outlook?: string;
  external_assessment?: string;
  trade_balance_goods?: string;
  trade_projections?: string;
  fdi_current?: string;
  fdi_outlook?: string;
  capital_flows?: string;
  bop_outlook?: string;
  financial_sector_overview?: string;
  banking_sector_risks?: string;
  financial_sector_reforms?: string;
  npl_ratio?: string;
  capital_adequacy?: string;
  profitability_liquidity?: string;
  structural_challenges?: string;
  infrastructure_needs?: string;
  climate_vulnerability?: string;
  energy_transition?: string;
  poverty_inequality?: string;
  social_protection?: string;
  institutional_reform?: string;
  governance_business_environment?: string;
  policy_recommendations?: string;
  data_issues?: string;

  // Structured format fields (Armenia, Mongolia, Turkey, Uzbekistan)
  // GDP and Growth
  'real_gdp_growth_t-1'?: number;
  'real_gdp_growth_t'?: number;
  'real_gdp_growth_t+1'?: number;
  cpi_eop_latest?: number;
  output_gap?: number;
  nominal_gdp_lcu?: number;
  nominal_gdp_usd?: number;
  population?: number;

  // Fiscal
  overall_balance_gdp?: number;
  primary_balance_gdp?: number;
  revenues_gdp?: number;
  expenditure_gdp?: number;
  public_debt_gdp?: number;
  debt_profile?: string;
  fiscal_rules?: string;

  // External Sector
  current_account_gdp?: number;
  reserves_usd_bn?: number;
  reserves_months_imports?: number;
  ara_percent?: number;
  exchange_rate_regime?: string;
  fx_intervention_notes?: string;

  // Monetary Policy
  policy_rate?: number;
  real_policy_rate?: number;
  credit_growth?: number;
  dollarisation?: number;

  // Financial Sector Indicators (FSI)
  fsi_car?: number;  // Capital Adequacy Ratio
  fsi_npl?: number;  // Non-Performing Loans
  fsi_roe?: number;  // Return on Equity
  fsi_lcr?: number;  // Liquidity Coverage Ratio
  macroprudential_measures?: string;

  // Outlook and Scenarios
  baseline_growth_outlook?: string;
  fiscal_consolidation_path?: string;

  // Risk Assessment (structured)
  risk_1_label?: string;
  risk_1_likelihood?: string;
  risk_1_impact?: string;
  risk_2_label?: string;
  risk_2_likelihood?: string;
  risk_2_impact?: string;
  risk_3_label?: string;
  risk_3_likelihood?: string;
  risk_3_impact?: string;

  // Debt Sustainability Analysis (DSA)
  dsa_risk_rating?: string;
  dsa_heatmap_summary?: string;
  gross_financing_needs_gdp?: number;
  stress_tests_bind?: string;

  // Capital Markets
  sovereign_issuance_notes?: string;
  investor_base_notes?: string;
  market_depth_notes?: string;

  // FSAP and Programme
  fsap_links?: string;
  programme_status?: string;
  board_date?: string;
  next_article_iv_cycle?: string;

  // Allow for additional fields
  [key: string]: any;
}

/**
 * Development Bank Strategy (EBRD/ADB)
 */
export interface DevelopmentBankStrategy {
  country?: string;
  source_name?: string;
  publication_date: string;
  strategy_period?: string;
  link?: string;

  // Strategic Priorities
  strategic_priorities_overview?: string;
  priority_1?: string;
  priority_2?: string;
  priority_3?: string;
  priority_4?: string;
  cross_cutting_themes?: string;

  // EBRD Transition Quality Gaps
  competitive_gaps?: string;
  well_governed_gaps?: string;
  green_gaps?: string;
  inclusive_gaps?: string;
  resilient_gaps?: string;
  integrated_gaps?: string;

  // Policy and Governance
  business_climate?: string;
  soe_governance?: string;
  competition_policy?: string;
  ppp_legal_framework?: string;
  sector_bottlenecks?: string;
  policy_dialogue_focus?: string;

  // Flagship Projects
  flagship_projects_summary?: string;
  flagship_1_name?: string;
  flagship_1_description?: string;
  flagship_1_scope?: string; // Alternative to description
  flagship_1_capex?: string;
  flagship_1_capex_usd?: string; // Alternative to capex
  flagship_1_revenue?: string;
  flagship_1_revenue_model?: string; // Alternative to revenue
  flagship_1_government_support?: string;
  flagship_1_gov_support?: string; // Alternative to government_support

  flagship_2_name?: string;
  flagship_2_description?: string;

  // Regional and Cross-Cutting
  regional_cooperation?: string;

  // Additional fields
  [key: string]: any;
}

/**
 * Market Intelligence / Infrastructure Project Report
 */
export interface IMIProjectReport {
  country?: string;
  source_name?: string;
  publication_date?: string;
  report_date?: string;
  prepared_by?: string;
  author_unit?: string;
  scope?: string;

  // Overview (narrative format)
  imi_overview?: string;
  imi_macroeconomic_context?: string;
  imi_infrastructure_assessment?: string;
  imi_ppp_framework?: string;
  imi_sovereign_credit?: string;
  imi_climate_exposure?: string;
  imi_legal_regulatory?: string;

  // PPP Legal Framework (structured format)
  ppp_law_name?: string;
  ppp_law_year?: number;
  sector_laws?: string;
  procurement_rules?: string;
  tariff_indexation_rules?: string;
  dispute_resolution?: string;

  // PPP Institutional Framework
  ppp_unit_name?: string;
  fiscal_risk_unit?: string;
  line_ministry_roles?: string;
  approval_workflow?: string;

  // Pipeline Data
  pipeline_total_usd?: string | number;
  pipeline_percent_gdp?: number;
  pipeline_by_sector?: string;
  pipeline_by_stage?: string;

  // Flagship Projects
  flagship_1_name?: string;
  flagship_1_sector?: string;
  flagship_1_description?: string;
  flagship_1_capex?: string;
  flagship_1_status?: string;
  flagship_1_sponsor?: string;
  flagship_1_mdb_role?: string;

  flagship_2_name?: string;
  flagship_2_sector?: string;

  // Additional fields
  [key: string]: any;
}

/**
 * Complete Country Data (all sections combined)
 */
export interface CountryCompleteData {
  country: string;
  year: number;
  source_documents: string[];

  IMF_Article_IV: IMFArticleIV;
  EBRD_Country_Strategy?: DevelopmentBankStrategy;
  ADB_Country_Strategy?: DevelopmentBankStrategy;
  IMI_Project_Report: IMIProjectReport;
}
