import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Wind, Thermometer, Droplets, Eye, Navigation, AlertTriangle, Clock, MapPin, TrendingUp, Layers, Satellite, Zap } from 'lucide-react';

const StormTracker = () => {
  const [selectedStorm, setSelectedStorm] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWindLayer, setShowWindLayer] = useState(true);
  const [showPressureLayer, setShowPressureLayer] = useState(false);
  const [map, setMap] = useState(null);
  const mapContainerRef = useRef(null);

  // Dữ liệu bão thực tế Việt Nam (cập nhật từ nguồn khí tượng)
  const [storms, setStorms] = useState([
    {
      id: 9,
      name: "RAGASA",
      internationalName: "Super Typhoon Ragasa",
      category: 5,
      status: "extremely_dangerous",
      currentPosition: { lat: 19.5, lng: 113.8 },
      windSpeed: 220, // cấp 17, giật trên cấp 17
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
      description: "Siêu bão mạnh nhất thế giới năm 2025, vượt cả bão Yagi 2024",
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
      description: "Bão số 3 năm 2025, di chuyển nhanh và nguy hiểm",
      landfall: "Đã đổ bộ vào đất liền Miền Trung",
      lastUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 ngày trước
    }
  ]);

  // Cập nhật thời gian và dữ liệu thực
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Mô phỏng cập nhật vị trí bão
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

  // Khởi tạo bản đồ Leaflet thực tế
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    // Import Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);

    // Import Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      initializeMap();
    };
    document.head.appendChild(script);

    const initializeMap = () => {
      const L = window.L;
      if (!L) return;
      
      // Tạo bản đồ tập trung vào Biển Đông và Việt Nam
      const mapInstance = L.map(mapContainerRef.current, {
        center: [16.0, 108.0], 
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true
      });

      // Các layer bản đồ chất lượng cao
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

      // Thêm layer mặc định (vệ tinh)
      baseLayers['Vệ tinh'].addTo(mapInstance);

      // Thêm điều khiển layer
      L.control.layers(baseLayers, null, {
        position: 'topleft',
        collapsed: false
      }).addTo(mapInstance);

      // Thêm các tỉnh thành Việt Nam
      const vietnamProvinces = [
        { name: 'Quảng Ninh', coords: [21.006, 107.293], risk: 'high' },
        { name: 'Hải Phòng', coords: [20.846, 106.688], risk: 'high' },
        { name: 'Thái Bình', coords: [20.448, 106.336], risk: 'high' },
        { name: 'Nam Định', coords: [20.434, 106.178], risk: 'medium' },
        { name: 'Thanh Hóa', coords: [19.806, 105.785], risk: 'medium' },
        { name: 'Nghệ An', coords: [18.674, 105.690], risk: 'medium' },
        { name: 'Hà Tĩnh', coords: [18.343, 105.905], risk: 'high' },
        { name: 'Quảng Bình', coords: [17.531, 106.042], risk: 'low' }
      ];

      vietnamProvinces.forEach(province => {
        const riskColors = {
          'high': '#ef4444',
          'medium': '#f97316', 
          'low': '#eab308'
        };
        
        L.circleMarker(province.coords, {
          color: riskColors[province.risk],
          fillColor: riskColors[province.risk],
          fillOpacity: 0.3,
          radius: 15,
          weight: 2
        }).addTo(mapInstance)
        .bindPopup(`<strong>${province.name}</strong><br>Mức độ rủi ro: ${province.risk.toUpperCase()}`);
      });

      // Thêm markers cho các cơn bão
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

        // Popup chi tiết
        marker.bindPopup(`
          <div class="storm-popup">
            <h3>${storm.name} ${storm.internationalName ? `(${storm.internationalName})` : ''}</h3>
            <div class="popup-grid">
              <div><strong>Cấp độ:</strong> ${getCategoryName(storm.category)}</div>
              <div><strong>Gió:</strong> ${storm.windSpeed} km/h</div>
              <div><strong>Áp suất:</strong> ${storm.pressure} hPa</div>
              <div><strong>Di chuyển:</strong> ${storm.movement.direction} - ${storm.movement.speed} km/h</div>
              ${storm.landfall ? `<div class="landfall"><strong>Dự báo đổ bộ:</strong><br>${storm.landfall}</div>` : ''}
              ${storm.affectedAreas ? `<div class="affected"><strong>Vùng ảnh hưởng:</strong><br>${storm.affectedAreas.slice(0,3).join(', ')}...</div>` : ''}
            </div>
            <div class="last-update">Cập nhật: ${storm.lastUpdate.toLocaleTimeString('vi-VN')}</div>
          </div>
        `);

        // Vòng tròn ảnh hưởng
        const dangerRadius = storm.category * 100000; // 100km per category
        const warningRadius = dangerRadius * 1.5;
        
        // Vùng nguy hiểm
        L.circle([storm.currentPosition.lat, storm.currentPosition.lng], {
          color: getCategoryColorHex(storm.category),
          fillColor: getCategoryColorHex(storm.category),
          fillOpacity: 0.15,
          radius: dangerRadius,
          weight: 3,
          dashArray: '5, 5'
        }).addTo(mapInstance);

        // Vùng cảnh báo
        L.circle([storm.currentPosition.lat, storm.currentPosition.lng], {
          color: getCategoryColorHex(storm.category),
          fillColor: getCategoryColorHex(storm.category),
          fillOpacity: 0.05,
          radius: warningRadius,
          weight: 1,
          dashArray: '10, 10'
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

          // Các điểm dự báo
          storm.forecast.slice(1).forEach((point, index) => {
            const intensity = point.windSpeed;
            const color = intensity > 180 ? '#dc2626' : intensity > 150 ? '#f97316' : '#eab308';
            
            L.circleMarker([point.lat, point.lng], {
              color: color,
              fillColor: color,
              fillOpacity: 0.8,
              radius: 8,
              weight: 2
            }).addTo(mapInstance)
            .bindPopup(`
              <div class="forecast-popup">
                <strong>Dự báo: ${point.time}</strong><br>
                Gió: ${point.windSpeed} km/h<br>
                Vị trí: ${point.lat.toFixed(2)}°N, ${point.lng.toFixed(2)}°E
              </div>
            `);
          });
        }
      });

      // Thêm layer gió nếu được bật
      if (showWindLayer) {
        addWindLayer(mapInstance);
      }

      // Thêm layer nhiệt độ biển
      addSeaTemperatureLayer(mapInstance);

      setMap(mapInstance);
    };

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [storms, showWindLayer]);

  // Hàm thêm layer gió thực tế
  const addWindLayer = (mapInstance) => {
    const windData = [
      { lat: 20.5, lng: 110.5, direction: 225, speed: 180, type: 'extreme' },
      { lat: 19.8, lng: 109.2, direction: 240, speed: 165, type: 'strong' },
      { lat: 18.5, lng: 108.0, direction: 270, speed: 120, type: 'moderate' },
      { lat: 17.0, lng: 107.5, direction: 285, speed: 90, type: 'light' },
      { lat: 16.0, lng: 109.0, direction: 300, speed: 75, type: 'light' },
      { lat: 15.0, lng: 110.5, direction: 45, speed: 60, type: 'light' }
    ];

    windData.forEach(wind => {
      const windStrength = wind.speed / 200;
      const color = wind.type === 'extreme' ? '#dc2626' : 
                   wind.type === 'strong' ? '#f97316' : 
                   wind.type === 'moderate' ? '#eab308' : '#3b82f6';
      
      const windIcon = window.L.divIcon({
        html: `
          <div class="wind-arrow ${wind.type}" 
               style="transform: rotate(${wind.direction}deg); 
                      color: ${color}; 
                      opacity: ${windStrength + 0.3}">
            →
            <div class="wind-speed">${wind.speed}</div>
          </div>
        `,
        className: 'wind-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      window.L.marker([wind.lat, wind.lng], { icon: windIcon }).addTo(mapInstance);
    });
  };

  // Thêm layer nhiệt độ nước biển
  const addSeaTemperatureLayer = (mapInstance) => {
    const temperatureData = [
      { lat: 20.0, lng: 110.0, temp: 30.2, type: 'hot' },
      { lat: 18.0, lng: 112.0, temp: 29.8, type: 'warm' },
      { lat: 16.0, lng: 108.0, temp: 28.5, type: 'normal' },
      { lat: 14.0, lng: 109.0, temp: 27.8, type: 'cool' }
    ];

    temperatureData.forEach(temp => {
      const tempColor = temp.type === 'hot' ? '#dc2626' :
                       temp.type === 'warm' ? '#f97316' :
                       temp.type === 'normal' ? '#22c55e' : '#3b82f6';
      
      window.L.circleMarker([temp.lat, temp.lng], {
        color: tempColor,
        fillColor: tempColor,
        fillOpacity: 0.6,
        radius: 12,
        weight: 2
      }).addTo(mapInstance)
      .bindPopup(`Nhiệt độ nước biển: ${temp.temp}°C`);
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      1: 'bg-yellow-500',    // Bão nhiệt đới
      2: 'bg-orange-500',    // Bão mạnh
      3: 'bg-red-500',       // Bão rất mạnh
      4: 'bg-purple-500',    // Bão cực mạnh
      5: 'bg-pink-600'       // Siêu bão
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
      1: '#eab308', // yellow-500
      2: '#f97316', // orange-500  
      3: '#ef4444', // red-500
      4: '#a855f7', // purple-500
      5: '#ec4899'  // pink-500
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
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
                  <button 
                    onClick={() => setShowPressureLayer(!showPressureLayer)}
                    className={`px-3 py-1 rounded-lg text-xs transition-all ${showPressureLayer ? 'bg-purple-500' : 'bg-gray-600'}`}
                  >
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Áp suất
                  </button>
                  <button className="px-3 py-1 rounded-lg text-xs bg-green-600">
                    <Satellite className="w-3 h-3 inline mr-1" />
                    Vệ tinh
                  </button>
                </div>
              </h2>
              
              <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ height: '600px' }}>
                {/* Container cho bản đồ Leaflet */}
                <div ref={mapContainerRef} className="w-full h-full"></div>
                
                {/* Overlay điều khiển */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg p-3 space-y-2">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span>Đường dự báo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full opacity-20"></div>
                      <span>Vùng ảnh hưởng</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Đất liền VN</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span>Mắt bão</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-500 pt-2">
                    <div className="text-xs text-gray-300">
                      <div>Tọa độ: {selectedStorm ? 
                        `${selectedStorm.currentPosition.lat.toFixed(2)}°N, ${selectedStorm.currentPosition.lng.toFixed(2)}°E` 
                        : '16.0°N, 108.0°E'}
                      </div>
                      <div>Zoom: {map ? Math.round(map.getZoom()) : 6}</div>
                      <div className="text-green-400">🟢 LIVE</div>
                    </div>
                  </div>
                </div>

                {/* Weather data overlay */}
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
                  {/* Thông số hiện tại */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Wind className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-200">Tốc độ gió</span>
                      </div>
                      <div className="text-xl font-bold">{selectedStorm.windSpeed} km/h</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
