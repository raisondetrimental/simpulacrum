import React from 'react';

const TransitFrictionPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Transit Friction Analysis
        </h1>
        <p className="text-gray-600" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          CPMM Border Crossing Points (BCPs) in Central Asia - Transit Friction Indicators
        </p>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Overview
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          This interactive map displays Transit Friction Indicators (TFI) for 75 road border-crossing points across Central Asia.
          TFI1 measures time delays (hours), while TFI2 measures economic costs (USD) for both inbound and outbound traffic.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 rounded p-3">
            <span className="font-semibold text-blue-900">TFI1:</span>
            <span className="text-blue-800 ml-2">Transit time delays (hours)</span>
          </div>
          <div className="bg-green-50 rounded p-3">
            <span className="font-semibold text-green-900">TFI2:</span>
            <span className="text-green-800 ml-2">Economic cost (USD, 20 Tons)</span>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <span className="font-semibold text-purple-900">75 BCPs</span>
            <span className="text-purple-800 ml-2">Across 7 countries</span>
          </div>
          <div className="bg-orange-50 rounded p-3">
            <span className="font-semibold text-orange-900">4 Layers:</span>
            <span className="text-orange-800 ml-2">Toggle to compare metrics</span>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
            Interactive Map
          </h2>
          <a
            href="/cpmm_central_asia_road_map.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Open Full Screen Map
          </a>
        </div>
        <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Use the layer control (top right) to toggle between different metrics. Click on markers for detailed BCP information.
          <strong> If the map doesn't load properly, click "Open Full Screen Map" above.</strong>
        </p>
        <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '700px' }}>
          <iframe
            src="/cpmm_central_asia_road_map.html"
            title="CPMM Central Asia Transit Friction Map"
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
              Top 5 Slowest BCPs (TFI1 - Transit Time)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Horgos (China)</span>
                <span className="font-semibold text-red-600">51.4 hours</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Alashankou (China)</span>
                <span className="font-semibold text-red-600">37.2 hours</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Dostyk (Kazakhstan)</span>
                <span className="font-semibold text-orange-600">22.2 hours</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Shirkhan Bandar (Afghanistan)</span>
                <span className="font-semibold text-orange-600">14.2 hours</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-700">Torghondi (Afghanistan)</span>
                <span className="font-semibold text-yellow-600">11.3 hours</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
              Top 5 Most Expensive BCPs (TFI2 - Economic Cost)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Alashankou (China)</span>
                <span className="font-semibold text-red-600">$821 USD</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Horgos (China)</span>
                <span className="font-semibold text-red-600">$723 USD</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Dostyk (Kazakhstan)</span>
                <span className="font-semibold text-orange-600">$601 USD</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-700">Irkeshtam (Kyrgyz Republic)</span>
                <span className="font-semibold text-orange-600">$583 USD</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-700">Shirkhan Bandar (Afghanistan)</span>
                <span className="font-semibold text-yellow-600">$295 USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countries Coverage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}>
          Coverage by Country
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">23</div>
            <div className="text-xs text-gray-600">Kazakhstan</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">15</div>
            <div className="text-xs text-gray-600">Uzbekistan</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">11</div>
            <div className="text-xs text-gray-600">Tajikistan</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">10</div>
            <div className="text-xs text-gray-600">Kyrgyzstan</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">7</div>
            <div className="text-xs text-gray-600">Turkmenistan</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">5</div>
            <div className="text-xs text-gray-600">China</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">4</div>
            <div className="text-xs text-gray-600">Afghanistan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransitFrictionPage;