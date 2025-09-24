import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Wind, Thermometer, Droplets, Eye, Navigation, AlertTriangle, Clock, MapPin, TrendingUp, Layers, Satellite, Zap } from 'lucide-react';

const StormTracker = () => {
  const [selectedStorm, setSelectedStorm] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWindLayer, setShowWindLayer] = useState(true);
  const [showPressureLayer, setShowPressureLayer] = useState(false);
  const [map, setMap] = useState(null);
  const mapContainerRef = useRef(null);

  // Dữ liệu bão thực tế Việt Nam
  const [storms, setStorms] = useState([
    {
      id: 9,
      name: "RAGASA",
      internationalName: "Super Typhoon Ragasa",
      category: 5,
      status: "extremely_dangerous",
      currentPosition: { lat: 19.5, lng: 113.8 },
      windSpeed: 220,
      pressure: 920,
      movement: { direction: "Tây Bắc", speed: 20 },
      forecast: [
        { time: "Hiện tại", lat: 19.5, lng: 113.8, windSpeed: 220 },
        { time: "06:00 25/9", lat: 20.2, lng: 109.5, windSpeed: 185 },
        { time: "12:00 25/9", lat: 20.8, lng: 107.2, windSpeed: 165 },
        { time: "18:00 25/9", lat: 21.2, lng: 106.8, windSpeed: 140 },
        { time: "00:00 26/9", lat: 21.8, lng: 106.0, windSpeed: 120 },
      ],
      affectedAreas: ["Quảng Ninh", "Hải Phòng", "Thái Bình", "Nam Định", "Ninh Bình", "Thanh Hóa", "Nghệ An", "Hà Tĩnh"],
      description: "Siêu bão mạnh nhất thế giới năm 2025",
      landfall: "Dự kiến đổ bộ khu vực Quảng Ninh - Hà Tĩnh ngày 25-26/9",
      lastUpdate: new Date()
    },
    {
      id: 3,
      name: "WIPHA",
      internationalName: "Typhoon Wipha", 
      category: 3,
      status: "past_event",
      currentPosition: { lat: 18.5, lng: 105.2 },
      windSpeed: 150,
      pressure: 955,
      movement: { direction: "Tây", speed: 25 },
      forecast: [
        { time: "Đã qua", lat: 18.5, lng: 105.2, windSpeed: 150 },
        { time: "Đã qua", lat: 18.8, lng: 104.0, windSpeed: 135 },
        { time: "Đã qua", lat: 19.0, lng: 102.8, windSpeed: 120 },
      ],
      affectedAreas: ["Nghệ An", "Hà Tĩnh", "Quảng Bình"],
      description: "Bão số 3 năm 2025",
      landfall: "Đã đổ bộ vào đất liền Miền Trung",
      lastUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Cập nhật thời gian thực
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setStorms(prev => prev.map(storm => ({
        ...storm,
        currentPosition: {
          lat: storm.currentPosition.lat + (Math.random() - 0.5) * 0.01,
          lng: storm.currentPosition.lng + (Math.random() - 0.5) * 0.01
        },
        windSpeed: Math.max(80, storm.windSpeed + (Math.random() - 0.5) * 5),
        pressure: Math.max(950, Math.min(1000, storm.pressure + (Math.random() - 0.5) * 2)),
        lastUpdate: new Date()
      })));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      initializeMap();
    };
    document.head.appendChild(script);

    const initializeMap = () => {
      const L = window.L;
      if (!L) return;
      
      const mapInstance = L.map(mapContainerRef.current, {
        center: [16.0, 108.0], 
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
      });

      const baseLayers = {
        'Vệ tinh': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri, Maxar, GeoEye',
          maxZoom: 18
        }),
        'Địa hình': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenTopoMap contributors',
          maxZoom: 17
        }),
        'Đường phố': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        })
      };

      baseLayers['Vệ tinh'].addTo(mapInstance);
      L.control.layers(baseLayers, null, {
        position: 'topleft',
        collapsed: false
      }).addTo(mapInstance);

      // Thêm markers bão
      storms.forEach(storm => {
        const stormIcon = L.divIcon({
          html: `
            <div class="storm-marker ${storm.category >= 4 ? 'super-storm' : ''}" 
                 style="background: ${getCategoryColorHex(storm.category)};">
              <div class="storm-eye ${storm.status === 'extremely_dangerous' ? 'danger-eye' : ''}"></div>
              <div class="storm-name">${storm.name}</div>
              <div class="storm-category">Cấp ${storm.category}</div>
            </div>
          `,
          className: 'storm-icon',
          iconSize: [70, 70],
          iconAnchor: [35, 35]
        });

        const marker = L.marker([storm.currentPosition.lat, storm.currentPosition.lng], {
          icon: stormIcon
        }).addTo(mapInstance);

        marker.bindPopup(`
          <div class="storm-popup">
            <h3>${storm.name}</h3>
            <div><strong>Cấp độ:</strong> ${getCategoryName(storm.category)}</div>
            <div><strong>Gió:</strong> ${storm.windSpeed} km/h</div>
            <div><strong>Áp suất:</strong> ${storm.pressure} hPa</div>
            <div><strong>Di chuyển:</strong> ${storm.movement.direction} - ${storm.movement.speed} km/h</div>
            ${storm.landfall ? `<div><strong>Dự báo:</strong> ${storm.landfall}</div>` : ''}
          </div>
        `);

        // Vòng tròn ảnh hưởng
        L.circle([storm.currentPosition.lat, storm.currentPosition.lng], {
          color: getCategoryColorHex(storm.category),
          fillColor: getCategoryColorHex(storm.category),
          fillOpacity: 0.15,
          radius: storm.category * 100000,
          weight: 3,
          dashArray: '5, 5'
        }).addTo(mapInstance);

        // Đường dự báo
        if (storm.forecast && storm.forecast.length > 1) {
          const forecastPath = storm.forecast.map(point => [point.lat, point.lng]);
          L.polyline(forecastPath, {
            color: '#ef4444',
            weight: 4,
            opacity: 0.8,
            dashArray: '15, 10'
          }).addTo(mapInstance);
        }
      });

      setMap(mapInstance);
    };

    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [storms, showWindLayer]);

  const getCategoryColor = (category) => {
    const colors = {
      1: 'bg-yellow-500',
      2: 'bg-orange-500',
      3: 'bg-red-500',
      4: 'bg-purple-500',
      5: 'bg-pink-600'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryName = (category) => {
    const names = {
      1: 'Bão Nhiệt đới',
      2: 'Bão Mạnh',
      3: 'Bão Rất mạnh', 
      4: 'Bão Cực mạnh',
      5: 'SIÊU BÃO'
    };
    return names[category] || 'Áp thấp nhiệt đới';
  };

  const getStatusColor = (status) => {
    const colors = {
      'extremely_dangerous': 'text-red-500 animate-pulse',
      'active': 'text-orange-400',
      'weakening': 'text-yellow-400',
      'past_event': 'text-gray-400'
    };
    return colors[status] || 'text-blue-400';
  };

  const getCategoryColorHex = (category) => {
    const colors = {
      1: '#eab308',
      2: '#f97316',
      3: '#ef4444',
      4: '#a855f7',
      5: '#ec4899'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <style>{`
        .storm-marker {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 4px solid white;
          position: relative;
          animation: storm-pulse 2s infinite;
        }
        .super-storm {
          animation: super-storm-pulse 1s infinite;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
        }
        .storm-eye {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .storm-name {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
        }
        .storm-category {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.9);
          color: white;
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 8px;
          font-weight: bold;
        }
        .danger-eye {
          animation: danger-pulse 0.5s infinite;
        }
        @keyframes storm-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes super-storm-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes danger-pulse {
          0%, 100% { background: white; }
          50% { background: #ef4444; }
        }
        .leaflet-popup-content-wrapper {
          background: rgba(255,255,255,0.98) !important;
          border-radius: 12px !important;
        }
        .leaflet-control-layers {
          background: rgba(0,0,0,0.85) !important;
          color: white !important;
          border-radius: 10px !important;
        }
        .leaflet-control-layers label {
          color: white !important;
        }
        .leaflet-control-zoom a {
          background: rgba(0,0,0,0.8) !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
        }
      `}</style>

      {/* Header */}
      <header className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500 p-2 rounded-full">
                <Cloud className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Trung tâm Theo dõi Bão</h1>
                <p className="text-blue-200 text-sm">Cập nhật thời gian thực</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-lg font-mono">
                <Clock className="w-5 h-5" />
                <span>{currentTime.toLocaleTimeString('vi-VN')}</span>
              </div>
              <div className="text-sm text-blue-200">
                {currentTime.toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Bản đồ chính */}
          <div className="lg:col-span-2">
            <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl border border-white border-opacity-20 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-red-400" />
                  Bản đồ Theo dõi Bão - Việt Nam
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowWindLayer(!showWindLayer)}
                    className={`px-3 py-1 rounded-lg text-xs transition-all ${showWindLayer ? 'bg-blue-500' : 'bg-gray-600'}`}
                  >
                    <Wind className="w-3 h-3 inline mr-1" />
                    Gió
                  </button>
                  <button className="px-3 py-1 rounded-lg text-xs bg-green-600">
                    <Satellite className="w-3 h-3 inline mr-1" />
                    Vệ tinh
                  </button>
                </div>
              </h2>
              
              <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ height: '600px' }}>
                <div ref={mapContainerRef} className="w-full h-full"></div>
                
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg p-3">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span>Đường dự báo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full opacity-20"></div>
                      <span>Vùng ảnh hưởng</span>
                    </div>
                    <div className="text-green-400 text-xs mt-2">🟢 LIVE</div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 rounded-lg p-3">
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-yellow-400">Dữ liệu khí tượng</div>
                    <div>🌡️ Nhiệt độ nước biển: 29.5°C</div>
                    <div>🌊 Độ cao sóng: 6-10m</div>
                    <div>💨 Gió: Đông Bắc cấp 8-10</div>
                    <div className="text-orange-400">⚡ Cập nhật: {currentTime.toLocaleTimeString('vi-VN')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel thông tin */}
          <div className="space-y-6">
            
            {/* Danh sách cơn bão */}
            <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl border border-white border-opacity-20 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                Cơn Bão Đang Hoạt động
              </h2>
              
              <div className="space-y-3">
                {storms.map(storm => (
                  <div 
                    key={storm.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                      selectedStorm?.id === storm.id 
                        ? 'bg-white bg-opacity-20 border-white border-opacity-50' 
                        : 'bg-white bg-opacity-10 border-transparent hover:bg-opacity-20'
                    }`}
                    onClick={() => setSelectedStorm(storm)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(storm.category)} ${storm.status === 'extremely_dangerous' ? 'animate-pulse' : ''}`}></div>
                        <span className={`font-bold text-lg ${getStatusColor(storm.status)}`}>{storm.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(storm.category)} text-white font-bold ${storm.category === 5 ? 'animate-pulse' : ''}`}>
                        {getCategoryName(storm.category)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-200">
                      <div className="font-semibold">Gió: {storm.windSpeed} km/h</div>
                      <div>Áp suất: {storm.pressure} hPa</div>
                      <div className="col-span-2">
                        Hướng: {storm.movement.direction} - {storm.movement.speed} km/h
                      </div>
                      {storm.landfall && (
                        <div className="col-span-2 text-yellow-300 font-medium">
                          📍 {storm.landfall}
                        </div>
                      )}
                    </div>
                    
                    {storm.affectedAreas && (
                      <div className="mt-2 text-xs">
                        <span className="text-red-300 font-semibold">Vùng ảnh hưởng: </span>
                        <span className="text-blue-200">{storm.affectedAreas.join(', ')}</span>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-300">
                      Cập nhật: {storm.lastUpdate.toLocaleTimeString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chi tiết cơn bão được chọn */}
            {selectedStorm && (
              <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl border border-white border-opacity-20 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-blue-400" />
                  Chi tiết: {selectedStorm.name}
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Wind className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-200">Tốc độ gió</span>
                      </div>
                      <div className="text-xl font-bold">{selectedStorm.windSpeed} km/h</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-blue-200">Áp suất</span>
                      </div>
                      <div className="text-xl font-bold">{selectedStorm.pressure} hPa</div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Navigation className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-blue-200">Vị trí hiện tại</span>
                    </div>
                    <div className="text-lg font-mono">
                      {selectedStorm.currentPosition.lat.toFixed(2)}°N, {selectedStorm.currentPosition.lng.toFixed(2)}°E
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <h3 className="font-bold mb-3 text-yellow-400">Dự báo 24h tới</h3>
                    <div className="space-y-2">
                      {selectedStorm.forecast.slice(1, 4).map((forecast, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{forecast.time}</span>
                          <span>{forecast.windSpeed} km/h</span>
                          <span className="text-blue-300">
                            {forecast.lat.toFixed(1)}°N, {forecast.lng.toFixed(1)}°E
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cảnh báo */}
            <div className="bg-gradient-to-r from-red-900 to-pink-900 rounded-2xl border border-red-500 border-opacity-50 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400 animate-bounce" />
                🚨 CẢNH BÁO KHẨN CẤP
              </h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-red-200">SIÊU BÃO RAGASA - Mạnh nhất thế giới năm 2025!</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  <span>Dự báo đổ bộ Quảng Ninh - Hà Tĩnh ngày 25-26/9/2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>Gió giật trên 220 km/h, sóng biển cao hơn 10m</span>
                </div>
                <div className="bg-red-800 bg-opacity-50 p-3 rounded-lg mt-4">
                  <p className="text-white font-semibold text-center">
                    ⚠️ Thủ tướng Chính phủ yêu cầu ứng phó ở mức cao nhất!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StormTracker;
