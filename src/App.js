import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Wind, Thermometer, Droplets, Eye, Navigation, AlertTriangle, Clock, MapPin, TrendingUp } from 'lucide-react';

const StormTracker = () => {
  const [selectedStorm, setSelectedStorm] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: 15, lng: 108 });
  const [zoom, setZoom] = useState(6);

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

  // Cập nhật thời gian thực
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

  const StormIcon = ({ storm, onClick, isSelected }) => (
    <div 
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125' : 'hover:scale-110'}`}
      style={{ 
        left: `${((storm.currentPosition.lng - 100) / 20) * 100}%`,
        top: `${(100 - ((storm.currentPosition.lat - 5) / 20) * 100)}%`
      }}
      onClick={() => onClick(storm)}
    >
      <div className={`relative ${getCategoryColor(storm.category)} rounded-full p-3 shadow-lg border-4 border-white`}>
        <Wind className="w-6 h-6 text-white" />
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {storm.name}
        </div>
      </div>
      
      {/* Vòng tròn ảnh hưởng */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${getCategoryColor(storm.category)} opacity-20 rounded-full animate-ping`}
           style={{ width: `${storm.category * 40}px`, height: `${storm.category * 40}px` }}>
      </div>
    </div>
  );

  const ForecastPath = ({ storm }) => {
    const pathPoints = storm.forecast.map((point, index) => ({
      x: ((point.lng - 100) / 20) * 100,
      y: 100 - ((point.lat - 5) / 20) * 100,
      time: point.time,
      windSpeed: point.windSpeed
    }));

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {pathPoints.map((point, index) => {
          if (index === 0) return null;
          const prevPoint = pathPoints[index - 1];
          return (
            <g key={index}>
              <line
                x1={`${prevPoint.x}%`}
                y1={`${prevPoint.y}%`}
                x2={`${point.x}%`}
                y2={`${point.y}%`}
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="10,5"
                opacity="0.8"
              />
              <circle
                cx={`${point.x}%`}
                cy={`${point.y}%`}
                r="4"
                fill="#ef4444"
                opacity="0.8"
              />
            </g>
          );
        })}
      </svg>
    );
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
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-400" />
                Bản đồ Theo dõi Bão
              </h2>
              
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl overflow-hidden" style={{ height: '500px' }}>
                {/* Grid tọa độ */}
                <div className="absolute inset-0">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="absolute border-white border-opacity-20" 
                         style={{ 
                           left: `${i * 25}%`, 
                           top: 0, 
                           width: '1px', 
                           height: '100%',
                           borderLeft: '1px dashed'
                         }} />
                  ))}
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="absolute border-white border-opacity-20" 
                         style={{ 
                           top: `${i * 25}%`, 
                           left: 0, 
                           height: '1px', 
                           width: '100%',
                           borderTop: '1px dashed'
                         }} />
                  ))}
                </div>

                {/* Vùng đất liền (mô phỏng) */}
                <div className="absolute inset-0">
                  <div className="absolute bg-green-800 opacity-60" 
                       style={{ 
                         left: '10%', 
                         top: '20%', 
                         width: '30%', 
                         height: '60%',
                         clipPath: 'polygon(0 20%, 100% 0, 100% 80%, 0 100%)'
                       }} />
                </div>

                {/* Đường dự báo */}
                {selectedStorm && <ForecastPath storm={selectedStorm} />}
                
                {/* Các cơn bão */}
                {storms.map(storm => (
                  <StormIcon 
                    key={storm.id} 
                    storm={storm} 
                    onClick={setSelectedStorm}
                    isSelected={selectedStorm?.id === storm.id}
                  />
                ))}
                
                {/* Chú thích */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 rounded-lg p-3">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span>Đường dự báo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-800 rounded"></div>
                      <span>Vùng đất liền</span>
                    </div>
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
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-blue-200">Áp suất</span>
                      </div>
                      <div className="text-xl font-bold">{selectedStorm.pressure} hPa</div>
                    </div>
                  </div>

                  {/* Vị trí hiện tại */}
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Navigation className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-blue-200">Vị trí hiện tại</span>
                    </div>
                    <div className="text-lg font-mono">
                      {selectedStorm.currentPosition.lat.toFixed(2)}°N, {selectedStorm.currentPosition.lng.toFixed(2)}°E
                    </div>
                  </div>

                  {/* Dự báo */}
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
                  <span className="font-bold text-red-200">SIÊU BÃO RAGASA - Mạnh nhất thế giới năm 2025, cấp 17!</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  <span>Dự báo đổ bộ Quảng Ninh - Hà Tĩnh ngày 25-26/9/2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>Gió giật trên 220 km/h, sóng biển cao hơn 10m</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span>Các tỉnh miền Bắc và Bắc Trung Bộ chuẩn bị sơ tán khẩn cấp</span>
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
