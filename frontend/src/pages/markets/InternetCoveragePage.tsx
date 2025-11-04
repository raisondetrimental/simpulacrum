import React from 'react';

const InternetCoveragePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Internet Coverage Analysis
        </h1>
        <p className="text-gray-600" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          International Internet Bandwidth per User - Global Infrastructure Assessment
        </p>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Overview
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          This interactive choropleth map displays international internet bandwidth per user (bits/second) across 170 countries worldwide.
          The metric reveals digital infrastructure capacity and internet connectivity quality, critical factors for economic development
          and digital transformation initiatives. Data years vary by country (2018-2023), with the specific year shown in hover tooltips
          for each country.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 rounded p-3">
            <span className="font-semibold text-blue-900">Data Source:</span>
            <span className="text-blue-800 ml-2">World Bank WDI</span>
          </div>
          <div className="bg-green-50 rounded p-3">
            <span className="font-semibold text-green-900">Indicator:</span>
            <span className="text-green-800 ml-2">IT.NET.BNDW.PC</span>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <span className="font-semibold text-purple-900">Coverage:</span>
            <span className="text-purple-800 ml-2">170 countries tracked</span>
          </div>
          <div className="bg-orange-50 rounded p-3">
            <span className="font-semibold text-orange-900">Classification:</span>
            <span className="text-orange-800 ml-2">Quartile-based coloring</span>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
            Interactive Map
          </h2>
          <div className="flex gap-3">
            <a
              href="/internet_coverage_data.csv"
              download
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Download CSV
            </a>
            <a
              href="/internet_coverage_map.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Open Full Screen Map
            </a>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Hover over countries to see detailed bandwidth metrics. Color intensity indicates quartile ranking.
          <strong> If the map doesn't load properly, click "Open Full Screen Map" above.</strong>
        </p>
        <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '700px' }}>
          <iframe
            src="/internet_coverage_map.html"
            title="Internet Coverage Choropleth Map"
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Key Findings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
              Top 10 Countries (Highest Bandwidth)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">1. Singapore</span>
                <span className="font-semibold text-green-600">890 Kbps</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">2. United States</span>
                <span className="font-semibold text-green-600">850 Kbps</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">3. Hong Kong SAR</span>
                <span className="font-semibold text-green-600">810 Kbps</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">4. South Korea</span>
                <span className="font-semibold text-green-600">780 Kbps</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">5. Canada</span>
                <span className="font-semibold text-green-600">780 Kbps</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">6. Netherlands</span>
                <span className="font-semibold text-green-600">780 Kbps</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">7. Luxembourg</span>
                <span className="font-semibold text-blue-600">760 Kbps</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">8. Switzerland</span>
                <span className="font-semibold text-blue-600">740 Kbps</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">9. United Kingdom</span>
                <span className="font-semibold text-blue-600">720 Kbps</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-700">10. Macao SAR</span>
                <span className="font-semibold text-blue-600">720 Kbps</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
              Bottom 10 Countries (Critical Infrastructure Gaps)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">North Korea</span>
                <span className="font-semibold text-red-600">8 Kbps (2018)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Central African Rep.</span>
                <span className="font-semibold text-red-600">8 Kbps (2019)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">South Sudan</span>
                <span className="font-semibold text-red-600">10 Kbps (2019)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Somalia</span>
                <span className="font-semibold text-red-600">12 Kbps (2019)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Chad</span>
                <span className="font-semibold text-red-600">12 Kbps (2019)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Burundi</span>
                <span className="font-semibold text-red-600">12 Kbps (2020)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Sierra Leone</span>
                <span className="font-semibold text-red-600">14 Kbps (2020)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Ethiopia</span>
                <span className="font-semibold text-orange-600">15 Kbps (2021)</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Niger</span>
                <span className="font-semibold text-orange-600">15 Kbps (2020)</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-700">Liberia</span>
                <span className="font-semibold text-orange-600">15 Kbps (2020)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Central Asia Focus */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Central Asia & Caucasus Region
        </h2>
        <p className="text-gray-700 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Regional analysis highlights significant infrastructure gaps in internet backbone capacity across Central Asian corridors.
          Data years vary reflecting availability: 2023 (Kazakhstan), 2022 (Uzbekistan, Kyrgyzstan), 2021 (Tajikistan), 2020 (Turkmenistan).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">180</div>
            <div className="text-xs text-gray-600 mb-1">Kbps · 2023</div>
            <div className="text-sm font-medium text-gray-700">Kazakhstan</div>
            <div className="text-xs text-green-600">Regional Leader</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">85</div>
            <div className="text-xs text-gray-600 mb-1">Kbps · 2022</div>
            <div className="text-sm font-medium text-gray-700">Uzbekistan</div>
            <div className="text-xs text-orange-600">Significant Gap</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">62</div>
            <div className="text-xs text-gray-600 mb-1">Kbps · 2022</div>
            <div className="text-sm font-medium text-gray-700">Kyrgyzstan</div>
            <div className="text-xs text-red-600">Critical Gap</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">45</div>
            <div className="text-xs text-gray-600 mb-1">Kbps · 2021</div>
            <div className="text-sm font-medium text-gray-700">Tajikistan</div>
            <div className="text-xs text-red-600">Critical Gap</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">38</div>
            <div className="text-xs text-gray-600 mb-1">Kbps · 2020</div>
            <div className="text-sm font-medium text-gray-700">Turkmenistan</div>
            <div className="text-xs text-red-600">Critical Gap</div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-900">
            <strong>Investment Opportunity:</strong> Countries in the bottom quartile (&lt; 33 Kbps) represent priority targets
            for digital infrastructure investment, particularly along the Middle Corridor trade routes where internet capacity
            directly impacts customs efficiency and trade facilitation. Central Asia shows a 4.7x gap between regional leader and laggard.
          </p>
        </div>
      </div>

      {/* Regional Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Regional Summary Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Europe & Central Asia (ECS)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Median:</span>
                <span className="font-medium">380 Kbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Countries:</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Range:</span>
                <span className="font-medium">38 - 780 Kbps</span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">East Asia & Pacific (EAS)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Median:</span>
                <span className="font-medium">125 Kbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Countries:</span>
                <span className="font-medium">27</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Range:</span>
                <span className="font-medium">8 - 890 Kbps</span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">South Asia (SAS)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Median:</span>
                <span className="font-medium">42 Kbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Countries:</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Range:</span>
                <span className="font-medium">18 - 180 Kbps</span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Latin America (LCN)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Median:</span>
                <span className="font-medium">110 Kbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Countries:</span>
                <span className="font-medium">25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Range:</span>
                <span className="font-medium">18 - 320 Kbps</span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Sub-Saharan Africa (SSF)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Median:</span>
                <span className="font-medium">22 Kbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Countries:</span>
                <span className="font-medium">44</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Range:</span>
                <span className="font-medium">8 - 240 Kbps</span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Middle East & North Africa (MEA)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Median:</span>
                <span className="font-medium">125 Kbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Countries:</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Range:</span>
                <span className="font-medium">18 - 580 Kbps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Methodology & Data Notes
        </h2>
        <div className="space-y-3 text-sm text-gray-700" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          <p>
            <strong>Data Source:</strong> World Bank World Development Indicators (WDI), Indicator IT.NET.BNDW.PC -
            International internet bandwidth measures the total used capacity of international internet bandwidth, in bits per second (bps) per internet user.
          </p>
          <p>
            <strong>Classification Method:</strong> Countries are color-coded using quartile-based classification, which adapts to the current sample
            distribution. This avoids hardcoded thresholds and ensures visual distinction across performance tiers.
          </p>
          <p>
            <strong>Bottom Quartile Flag:</strong> Countries in the bottom 25% (below 86 Kbps in current dataset) are flagged as priority
            infrastructure investment opportunities. These represent significant digital divide gaps requiring policy attention.
          </p>
          <p>
            <strong>Data Freshness:</strong> Countries with data from years prior to 2023 are marked with a staleness indicator.
            The dataset includes 80 countries with 2023 data, 41 from 2022, 23 from 2021, 18 from 2020, and 8 from earlier years.
            Older data points are marked with ⚠️ in hover tooltips.
          </p>
          <p>
            <strong>Maintenance:</strong> Data should be refreshed annually when World Bank releases updated WDI indicators. The Python script
            can be re-run to generate updated maps with the latest figures.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InternetCoveragePage;