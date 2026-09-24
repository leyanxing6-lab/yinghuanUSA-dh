import { useEffect, useState } from 'react';

// 預設美國地名座標字典
const geoCoords = {
  "America": [37.0902, -95.7129],
  "Columbia": [38.8951, -77.0364],
  "Georgetown": [38.9097, -77.0654],
  "Alexandria": [38.8048, -77.0469],
  "Maine": [45.2538, -69.4455],
  "Augusta": [44.3106, -69.7795],
  "New Hampshire": [43.1939, -71.5724],
  "Concord": [43.2081, -71.5376],
  "Portsmouth": [43.0718, -70.7626],
  "Vermont": [44.5588, -72.5778],
  "Montpelier": [44.2601, -72.5754],
  "Massachusetts": [42.4072, -71.3824],
  "Boston": [42.3601, -71.0589],
  "Rhode Island": [41.5801, -71.4774],
  "Providence": [41.8240, -71.4128],
  "Newport": [41.4901, -71.3128],
  "Connecticut": [41.6032, -73.0877],
  "New London": [41.3557, -72.0995],
  "Hartford": [41.7658, -72.6734],
  "New York": [40.7128, -74.0060],
  "Albany": [42.6526, -73.7562],
  "Troy": [42.7284, -73.6918],
  "New Jersey": [40.0583, -74.4057],
  "Trenton": [40.2206, -74.7597],
  "Pennsylvania": [41.2033, -77.1945],
  "Philadelphia": [39.9526, -75.1652],
  "Delaware": [38.9108, -75.5277],
  "Dover": [39.1582, -75.5244],
  "Maryland": [39.0458, -76.6413],
  "Annapolis": [38.9784, -76.4922],
  "Virginia": [37.4316, -78.6569],
  "Jamestown": [37.2080, -76.7773],
  "Richmond": [37.5407, -77.4360],
  "North Carolina": [35.7596, -79.0193],
  "Raleigh": [35.7796, -78.6382],
  "South Carolina": [33.8361, -81.1637],
  "Georgia": [32.1656, -82.9001],
  "Milledgeville": [33.0801, -83.2321],
  "Ohio": [40.4173, -82.9071],
  "Columbus": [39.9612, -82.9988],
  "Michigan": [44.3148, -85.6024],
  "Detroit": [42.3314, -83.0458],
  "Kentucky": [37.8393, -84.2700],
  "Harrodsburg": [37.7626, -84.8430],
  "Frankfort": [38.2009, -84.8733],
  "Louisville": [38.2527, -85.7585],
  "Lexington": [38.0406, -84.5037],
  "Florida": [27.6648, -81.5158],
  "Tallahassee": [30.4383, -84.2807],
  "Tennessee": [35.5175, -86.5804],
  "Nashville": [36.1627, -86.7816],
  "Alabama": [32.3182, -86.9023],
  "Mobile": [30.6954, -88.0399],
  "Mississippi": [32.3547, -89.3985],
  "Jackson": [32.2988, -90.1848],
  "Louisian": [30.9843, -91.9623],
  "New Orleans": [29.9511, -90.0715],
  "Indiana": [40.2672, -86.1349],
  "Indianapolis": [39.7684, -86.1581],
  "Illinois": [40.6331, -89.3985],
  "Vandalia": [38.9606, -89.0937],
  "Arkansas": [35.2010, -91.8318],
  "Little Rock": [34.7465, -92.2896],
  "Missouri": [37.9643, -91.8318],
  "Jefferson City": [38.5767, -92.1735],
  "Wisconsin": [43.7844, -88.7879],
  "Iowa": [41.8780, -93.0977]
};

export default function App() {
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markersMap, setMarkersMap] = useState({});

  // 1. 讀取 public/places.json
  useEffect(() => {
    fetch('/places.json')
      .then(res => res.json())
      .then(data => setPlaces(data))
      .catch(err => console.error('無法加載 places.json:', err));
  }, []);

  // 2. 初始化地圖
  useEffect(() => {
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initLeaflet();
      document.body.appendChild(script);
    } else {
      initLeaflet();
    }

    function initLeaflet() {
      if (document.getElementById('map') && !mapInstance) {
        const L = window.L;
        const map = L.map('map').setView([39.8283, -98.5795], 5);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 18
        }).addTo(map);
        setMapInstance(map);
      }
    }
  }, []);

  // 3. 在地圖上繪製點
  useEffect(() => {
    if (!mapInstance || !window.L || places.length === 0) return;
    const L = window.L;

    // 清理舊 Marker
    Object.values(markersMap).forEach(m => mapInstance.removeLayer(m));
    const newMarkers = {};

    filteredPlaces.forEach(item => {
      const coords = geoCoords[item.englishName];
      if (coords) {
        const marker = L.circleMarker(coords, {
          radius: item.type === '州' ? 8 : 5,
          fillColor: item.type === '州' ? '#8c2d19' : '#2b5c8f',
          color: '#ffffff',
          weight: 1.5,
          fillOpacity: 0.8
        }).addTo(mapInstance);

        marker.bindPopup(`
          <div style="font-family: sans-serif;">
            <h3 style="color:#8c2d19; margin-bottom: 4px;">${item.qingName}</h3>
            <p><strong>英文名：</strong>${item.englishName}</p>
            <p><strong>現代標準名：</strong>${item.mainlandStd} / ${item.taiwanStd}</p>
            <p><strong>語音標籤：</strong>${item.phoneticTag}</p>
            <p style="font-size:0.8rem; color:#666; margin-top:4px;">${item.notes}</p>
          </div>
        `);

        marker.on('click', () => {
          setActiveId(item.id);
        });

        newMarkers[item.id] = marker;
      }
    });

    setMarkersMap(newMarkers);
  }, [mapInstance, places, searchTerm, regionFilter, typeFilter]);

  // 數據篩選邏輯
  const filteredPlaces = places.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      item.qingName.toLowerCase().includes(q) ||
      item.englishName.toLowerCase().includes(q) ||
      item.mainlandStd.toLowerCase().includes(q) ||
      item.taiwanStd.toLowerCase().includes(q) ||
      item.phoneticTag.toLowerCase().includes(q);

    const matchesRegion = !regionFilter || item.region === regionFilter;
    const matchesType = !typeFilter || item.type === typeFilter;

    return matchesSearch && matchesRegion && matchesType;
  });

  const handleCardClick = (item) => {
    setActiveId(item.id);
    const coords = geoCoords[item.englishName];
    if (coords && mapInstance) {
      mapInstance.flyTo(coords, 7, { duration: 1 });
      if (markersMap[item.id]) {
        markersMap[item.id].openPopup();
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', background: '#f7f5f0' }}>
      {/* 側邊欄 */}
      <div style={{ width: '420px', background: '#fff', borderRight: '1px solid #e0dad0', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#8c2d19', color: 'white', padding: '16px 20px' }}>
          <h1 style={{ fontSize: '1.2rem', margin: 0 }}>瀛寰志略·美利堅篇</h1>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: '4px 0 0 0' }}>清末歷史譯名與地名空間數位檢索平台</p>
        </header>

        <div style={{ padding: '15px', background: '#faf8f5', borderBottom: '1px solid #e0dad0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="搜尋清代譯名、英文名、現代譯名..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={{ flex: 1, padding: '6px' }}>
              <option value="">所有區域</option>
              <option value="東路">東路</option>
              <option value="西路">西路</option>
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ flex: 1, padding: '6px' }}>
              <option value="">所有類型</option>
              <option value="州">州</option>
              <option value="城市">城市</option>
            </select>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            顯示筆數：<strong>{filteredPlaces.length}</strong>
          </div>
        </div>

        {/* 列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredPlaces.map(item => (
            <div 
              key={item.id}
              onClick={() => handleCardClick(item)}
              style={{
                border: item.id === activeId ? '2px solid #8c2d19' : '1px solid #e0dad0',
                background: item.id === activeId ? '#fdfaf7' : '#fff',
                borderRadius: '6px',
                padding: '12px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#8c2d19', fontSize: '1.1rem' }}>{item.qingName}</span>
                <span style={{ fontStyle: 'italic', color: '#666', fontSize: '0.85rem' }}>{item.englishName}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#444' }}>
                <div>陸譯：{item.mainlandStd} | 臺譯：{item.taiwanStd}</div>
                <div style={{ marginTop: '4px', color: '#666' }}>{item.notes}</div>
                <span style={{ display: 'inline-block', background: '#f0e6df', color: '#8c2d19', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', marginTop: '6px' }}>
                  {item.phoneticTag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 地圖 */}
      <div id="map" style={{ flex: 1, height: '100%' }}></div>
    </div>
  );
}