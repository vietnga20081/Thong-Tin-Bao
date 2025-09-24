import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Wind, Thermometer, Droplets, Eye, Navigation, AlertTriangle, Clock, MapPin, TrendingUp } from 'lucide-react';

const StormTracker = () => {
  const [selectedStorm, setSelectedStorm] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: 15, lng: 108 });
  const [zoom, setZoom] = useState(6);

  // Dữ liệu mẫu các cơn bão (trong thực tế sẽ lấy từ API)
  const [storms, setStorms] = useState([
    {
      id: 1,
      name: "HAIKUI",
      category: 2,
      status: "active",
      currentPosition: { lat: 16.2, lng: 110.5 },
      windSpeed: 150,
      pressure: 965,
      movement: { direction: "Tây Bắc", speed: 15 },
      forecast: [
        { time: "12:00", lat: 16.2, lng: 110.5, windSpeed: 150 },
        { time: "18:00", lat: 16.8, lng: 109.8, windSpeed: 165 },
        { time: "00:00", lat: 17.5, lng: 109.0, windSpeed: 180 },
        { time: "06:00", lat: 18.2, lng: 108.2, windSpeed: 170 },
        { time: "12:00", lat: 19.0, lng: 107.5, windSpeed: 155 },
      ],
      lastUpdate: new Date()
    },
    {
      id: 2,
      name: "KIROGI",
      category: 1,
      status: "weakening",
      currentPosition: { lat: 12.5, lng: 115.2 },
      windSpeed: 120,
      pressure: 980,
      movement: { direction: "Đông Bắc", speed: 12 },
      forecast: [
        { time: "12:00", lat: 12.5, lng: 115.2, windSpeed: 120 },
        { time: "18:00", lat: 13.1, lng: 115.8, windSpeed: 110 },
        { time: "00:00", lat: 13.8, lng: 116.5, windSpeed: 95 },
        { time: "06:00", lat: 14.5, lng: 117.2, windSpeed: 85 },
      ],
      lastUpdate: new Date()
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
      1: 'bg-yellow-500',
      2: 'bg-orange-500', 
      3: 'bg-red-500',
      4: 'bg-purple-500',
      5: 'bg-pink-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryName = (category) => {
    const names = {
      1: 'Bão Cấp 1',
      2: 'Bão Cấp 2',
      3: 'Bão Cấp 3', 
      4: 'Bão Cấp 4',
      5: 'Bão Cấp 5'
    };
    return names[category] || 'Áp thấp';
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
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(storm.category)}`}></div>
                        <span className="font-bold text-lg">{storm.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(storm.category)} text-white`}>
                        {getCategoryName(storm.category)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-200">
                      <div>Gió: {storm.windSpeed} km/h</div>
                      <div>Áp suất: {storm.pressure} hPa</div>
                      <div className="col-span-2">
                        Hướng: {storm.movement.direction} - {storm.movement.speed} km/h
                      </div>
                    </div>
                    
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
            <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-2xl border border-red-500 border-opacity-50 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                Cảnh báo Khẩn cấp
              </h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span>Bão HAIKUI đang mạnh lên, dự báo đổ bộ vào đất liền trong 18h tới</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>Khuyến cáo tàu thuyền tránh xa vùng biển nguy hiểm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span>Các tỉnh ven biển chuẩn bị phương án ứng phó</span>
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
