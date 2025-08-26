// 전역 변수
let map;
let markers = [];
let allStores = [];
let filteredStores = [];
let mapType = 'none'; // 'kakao', 'leaflet', 'none'

// 위치 관련 변수
let userLocation = null;
let userLocationMarker = null;
let isLocationMode = false;
let nearbyRadius = 300; // 300m 반경

// 카카오맵 API 키 설정 (실제 사용시에는 본인의 API 키로 교체하세요)
// const KAKAO_API_KEY = 'YOUR_KAKAO_API_KEY';

// sampleStores는 real_stores.js에서 정의됨

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 카카오 API 완전 로드 대기 후 초기화
    waitForKakaoAPI();
});

// 카카오 API 완전 로드 대기 (SDK load() 메서드 활용)
function waitForKakaoAPI() {
    let attempts = 0;
    
    function checkKakaoAPI() {
        attempts++;
        console.log(`🔍 카카오 API 확인 시도 ${attempts}번째`);
        
        // 카카오 SDK가 로드되고 kakao.maps.load()가 완료되었는지 확인
        if (typeof kakao !== 'undefined' && 
            kakao.maps && 
            kakao.maps.LatLng && 
            typeof kakao.maps.LatLng === 'function' &&
            kakao.maps.Map &&
            typeof kakao.maps.Map === 'function') {
            
            console.log('✅ 카카오 API 완전 로드 확인됨! 지도 초기화를 시작합니다.');
            initializeMap();
        } else {
            // 상세한 로드 상태 체크
            if (typeof kakao === 'undefined') {
                console.log('⏳ kakao 객체 로드 대기 중...');
            } else if (!kakao.maps) {
                console.log('⏳ kakao.maps 모듈 로드 대기 중...');
            } else if (!kakao.maps.LatLng) {
                console.log('⏳ kakao.maps.LatLng 클래스 로드 대기 중...');
            } else if (typeof kakao.maps.LatLng !== 'function') {
                console.log('⏳ kakao.maps.LatLng 생성자 초기화 대기 중...');
            } else if (!kakao.maps.Map) {
                console.log('⏳ kakao.maps.Map 클래스 로드 대기 중...');
            } else if (typeof kakao.maps.Map !== 'function') {
                console.log('⏳ kakao.maps.Map 생성자 초기화 대기 중...');
            }
            
            // 300ms 후 다시 시도 (더 빠른 반응성)
            setTimeout(checkKakaoAPI, 300);
        }
    }
    
    // 즉시 체크 시작 (SDK load() 콜백 후 바로 실행)
    setTimeout(checkKakaoAPI, 100);
}

// 지도 초기화 로직 (카카오 맵만 사용)
function initializeMap() {
    console.log('🗺️ 카카오 맵 시스템 초기화 중...');
    
    // 카카오 맵 초기화
    console.log('kakao.maps.Map:', typeof kakao.maps.Map);
    console.log('kakao.maps.LatLng:', typeof kakao.maps.LatLng);
    
    try {
        mapType = 'kakao';
        initKakaoMap();
        console.log('🎉 카카오 맵 초기화 완료');
    } catch (error) {
        console.error('❌ 카카오 맵 초기화 중 오류 발생:', error);
        console.error('에러 상세:', error.message);
        console.error('에러 스택:', error.stack);
        
        // 에러가 발생해도 다시 시도
        console.log('🔄 3초 후 카카오 맵 초기화 재시도...');
        setTimeout(() => {
            initKakaoMap();
        }, 3000);
        return;
    }
    
    initEventListeners();
    loadStores();
}

// 카카오 지도 초기화
function initKakaoMap() {
    // 로딩 인디케이터 제거
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    const container = document.getElementById('map');
    const options = {
        center: new kakao.maps.LatLng(35.1595, 126.8526), // 광주광역시 중심
        level: 3
    };
    
    map = new kakao.maps.Map(container, options);
    
    // 지도 타입 컨트롤 추가
    const mapTypeControl = new kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
    
    // 확대/축소 컨트롤 추가
    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
    
    // 지도 클릭 이벤트 설정
    setupMapClick();
    
    // 상태 표시
    document.getElementById('map-status').innerHTML = '🗺️ 카카오 맵 사용 중';
}

// OpenStreetMap 지도 초기화
function initLeafletMap() {
    // 로딩 인디케이터 제거
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // Leaflet으로 지도 생성
    map = L.map('map').setView([35.1595, 126.8526], 13);

    // OpenStreetMap 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // 지도 클릭 이벤트 설정
    setupMapClick();
    
    // 상태 표시
    document.getElementById('map-status').innerHTML = '🌍 OpenStreetMap 사용 중 (카카오 맵 로드 실패)';
}

// 이벤트 리스너 초기화
function initEventListeners() {
    // 필터 체크박스
    document.getElementById('onnuri-filter').addEventListener('change', applyFilters);
    document.getElementById('gwangju-filter').addEventListener('change', applyFilters);
    document.getElementById('nearby-filter').addEventListener('change', function() {
        if (this.checked && !userLocation) {
            alert('먼저 위치를 설정해주세요.');
            this.checked = false;
            return;
        }
        applyFilters();
    });
    
    // 위치 관련 기능
    document.getElementById('get-location-btn').addEventListener('click', getCurrentLocation);
    
    // 검색 기능
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 모달 닫기
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('store-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// 매장 데이터 로드
function loadStores() {
    allStores = [...sampleStores];
    applyFilters();
}

// 필터 적용
function applyFilters() {
    const onnuriChecked = document.getElementById('onnuri-filter').checked;
    const gwangjuChecked = document.getElementById('gwangju-filter').checked;
    const nearbyChecked = document.getElementById('nearby-filter').checked;
    
    filteredStores = allStores.filter(store => {
        // 카드 타입 필터
        const hasOnnuri = store.types.includes('onnuri');
        const hasGwangju = store.types.includes('gwangju');
        const typeMatch = (onnuriChecked && hasOnnuri) || (gwangjuChecked && hasGwangju);
        
        if (!typeMatch) return false;
        
        // 300m 반경 필터
        if (nearbyChecked && userLocation) {
            const distance = calculateDistance(
                userLocation.lat, 
                userLocation.lng, 
                store.lat, 
                store.lng
            );
            return distance <= nearbyRadius;
        }
        
        return true;
    });
    
    updateMap();
    updateStoreList();
    updateStats();
}

// 검색 수행
function performSearch() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    
    if (searchTerm === '') {
        applyFilters();
        return;
    }
    
    const onnuriChecked = document.getElementById('onnuri-filter').checked;
    const gwangjuChecked = document.getElementById('gwangju-filter').checked;
    
    filteredStores = allStores.filter(store => {
        const hasOnnuri = store.types.includes('onnuri');
        const hasGwangju = store.types.includes('gwangju');
        const matchesFilter = (onnuriChecked && hasOnnuri) || (gwangjuChecked && hasGwangju);
        
        const matchesSearch = store.name.toLowerCase().includes(searchTerm) ||
                             store.address.toLowerCase().includes(searchTerm) ||
                             store.category.toLowerCase().includes(searchTerm);
        
        return matchesFilter && matchesSearch;
    });
    
    updateMap();
    updateStoreList();
    updateStats();
}

// 지도 업데이트 (하이브리드 버전)
function updateMap() {
    if (mapType === 'kakao') {
        updateKakaoMap();
    } else if (mapType === 'leaflet') {
        updateLeafletMap();
    }
}

// 카카오 지도 업데이트
function updateKakaoMap() {
    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    // 새 마커 생성
    filteredStores.forEach(store => {
        const markerPosition = new kakao.maps.LatLng(store.lat, store.lng);
        
        // 마커 색상 결정
        let markerImage;
        if (store.types.includes('onnuri') && store.types.includes('gwangju')) {
            markerImage = createMarkerImage('#9b59b6'); // 보라색
        } else if (store.types.includes('onnuri')) {
            markerImage = createMarkerImage('#ff6b6b'); // 빨간색
        } else {
            markerImage = createMarkerImage('#4ecdc4'); // 청록색
        }
        
        const marker = new kakao.maps.Marker({
            position: markerPosition,
            image: markerImage
        });
        
        marker.setMap(map);
        
        // 마커 클릭 이벤트
        kakao.maps.event.addListener(marker, 'click', function() {
            showStoreDetails(store);
        });
        
        markers.push(marker);
    });
    
    // 모든 마커가 보이도록 지도 범위 조정
    if (filteredStores.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        filteredStores.forEach(store => {
            bounds.extend(new kakao.maps.LatLng(store.lat, store.lng));
        });
        map.setBounds(bounds);
    }
}

// Leaflet 지도 업데이트
function updateLeafletMap() {
    // 기존 마커 제거
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // 새 마커 생성
    filteredStores.forEach(store => {
        // 마커 색상 결정
        let iconColor = '#3388ff'; // 기본 파란색
        if (store.types.includes('onnuri') && store.types.includes('gwangju')) {
            iconColor = '#9b59b6'; // 보라색
        } else if (store.types.includes('onnuri')) {
            iconColor = '#ff6b6b'; // 빨간색
        } else {
            iconColor = '#4ecdc4'; // 청록색
        }
        
        // 커스텀 아이콘 생성
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });
        
        const marker = L.marker([store.lat, store.lng], {icon: customIcon});
        
        // 마커 클릭 이벤트
        marker.on('click', function() {
            showStoreDetails(store);
        });
        
        marker.addTo(map);
        markers.push(marker);
    });
    
    // 모든 마커가 보이도록 지도 범위 조정
    if (filteredStores.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// 커스텀 마커 이미지 생성
function createMarkerImage(color) {
    const imageSrc = `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
            <path fill="${color}" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"/>
            <circle fill="white" cx="12" cy="12" r="6"/>
        </svg>
    `)}`; 
    
    const imageSize = new kakao.maps.Size(24, 36);
    const imageOption = {offset: new kakao.maps.Point(12, 36)};
    
    return new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
}

// 매장 목록 업데이트
function updateStoreList() {
    const listContent = document.getElementById('store-list-content');
    listContent.innerHTML = '';
    
    filteredStores.forEach(store => {
        const storeItem = document.createElement('div');
        storeItem.className = 'store-item';
        
        // 매장 타입에 따라 클래스 추가
        if (store.types.includes('onnuri') && store.types.includes('gwangju')) {
            storeItem.classList.add('both');
        } else if (store.types.includes('onnuri')) {
            storeItem.classList.add('onnuri');
        } else {
            storeItem.classList.add('gwangju');
        }
        
        storeItem.innerHTML = `
            <div class="store-name">${store.name}</div>
            <div class="store-address">${store.address}</div>
            <div class="store-types">
                ${store.types.includes('onnuri') ? '<span class="type-badge onnuri">온누리상품권</span>' : ''}
                ${store.types.includes('gwangju') ? '<span class="type-badge gwangju">광주상생카드</span>' : ''}
            </div>
        `;
        
        storeItem.addEventListener('click', () => {
            showStoreDetails(store);
            // 지도 중심을 해당 매장으로 이동
            if (mapType === 'kakao') {
                map.setCenter(new kakao.maps.LatLng(store.lat, store.lng));
                map.setLevel(2);
            } else if (mapType === 'leaflet') {
                map.setView([store.lat, store.lng], 16);
            }
        });
        
        listContent.appendChild(storeItem);
    });
}

// 통계 업데이트
function updateStats() {
    const onnuriCount = filteredStores.filter(store => store.types.includes('onnuri')).length;
    const gwangjuCount = filteredStores.filter(store => store.types.includes('gwangju')).length;
    
    document.getElementById('onnuri-count').textContent = onnuriCount;
    document.getElementById('gwangju-count').textContent = gwangjuCount;
}

// 매장 상세 정보 표시
function showStoreDetails(store) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>${store.name}</h2>
        <div style="margin: 20px 0;">
            <div style="margin-bottom: 10px;">
                ${store.types.includes('onnuri') ? '<span class="type-badge onnuri">온누리상품권</span>' : ''}
                ${store.types.includes('gwangju') ? '<span class="type-badge gwangju">광주상생카드</span>' : ''}
            </div>
            <p><strong>주소:</strong> ${store.address}</p>
            <p><strong>카테고리:</strong> ${store.category}</p>
            <p><strong>전화번호:</strong> ${store.phone}</p>
            <p><strong>운영시간:</strong> ${store.hours}</p>
            <p><strong>설명:</strong> ${store.description}</p>
        </div>
    `;
    
    document.getElementById('store-modal').style.display = 'block';
}

// 모달 닫기
function closeModal() {
    document.getElementById('store-modal').style.display = 'none';
}

// 유틸리티 함수들
function addStore(storeData) {
    allStores.push(storeData);
    applyFilters();
}

function removeStore(storeId) {
    allStores = allStores.filter(store => store.id !== storeId);
    applyFilters();
}

function updateStore(storeId, updatedData) {
    const index = allStores.findIndex(store => store.id === storeId);
    if (index !== -1) {
        allStores[index] = { ...allStores[index], ...updatedData };
        applyFilters();
    }
}

// 거리 계산 함수 (Haversine 공식)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 지구 반경 (미터)
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // 미터 단위
}

// GPS 위치 가져오기
function getCurrentLocation() {
    const locationBtn = document.getElementById('get-location-btn');
    const locationInfo = document.getElementById('location-info');
    const locationStatus = document.getElementById('location-status');
    
    if (!navigator.geolocation) {
        alert('GPS를 지원하지 않는 브라우저입니다.');
        return;
    }
    
    locationBtn.disabled = true;
    locationBtn.textContent = '📍 위치 찾는 중...';
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            setUserLocation(lat, lng, '현재 GPS 위치');
            locationBtn.disabled = false;
            locationBtn.textContent = '📍 내 위치 찾기';
        },
        function(error) {
            let errorMessage = '';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '위치 접근이 거부되었습니다.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '위치 정보를 사용할 수 없습니다.';
                    break;
                case error.TIMEOUT:
                    errorMessage = '위치 요청이 시간 초과되었습니다.';
                    break;
                default:
                    errorMessage = '알 수 없는 오류가 발생했습니다.';
                    break;
            }
            
            locationStatus.textContent = errorMessage;
            locationInfo.style.display = 'block';
            locationBtn.disabled = false;
            locationBtn.textContent = '📍 내 위치 찾기';
            
            setTimeout(() => {
                locationInfo.style.display = 'none';
            }, 3000);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

// 사용자 위치 설정
function setUserLocation(lat, lng, source = '클릭') {
    userLocation = { lat, lng };
    
    const locationInfo = document.getElementById('location-info');
    const locationStatus = document.getElementById('location-status');
    
    locationStatus.textContent = `${source}: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    locationInfo.style.display = 'block';
    
    // 지도에 사용자 위치 마커 표시
    updateUserLocationMarker();
    
    // 지도 중심을 사용자 위치로 이동
    if (mapType === 'kakao' && map) {
        const locPosition = new kakao.maps.LatLng(lat, lng);
        map.setCenter(locPosition);
        map.setLevel(4); // 적절한 줌 레벨로 설정
    } else if (mapType === 'leaflet' && map) {
        map.setView([lat, lng], 16);
    }
    
    // 근처 매장 필터 체크박스가 활성화되어 있으면 필터링 적용
    const nearbyFilter = document.getElementById('nearby-filter');
    if (nearbyFilter.checked) {
        applyFilters();
    }
}

// 사용자 위치 마커 업데이트
function updateUserLocationMarker() {
    if (!userLocation) return;
    
    // 기존 마커 제거
    if (userLocationMarker) {
        if (mapType === 'kakao') {
            userLocationMarker.setMap(null);
        } else if (mapType === 'leaflet') {
            map.removeLayer(userLocationMarker);
        }
        userLocationMarker = null;
    }
    
    // 새 마커 생성
    if (mapType === 'kakao' && map) {
        const locPosition = new kakao.maps.LatLng(userLocation.lat, userLocation.lng);
        userLocationMarker = new kakao.maps.Marker({
            position: locPosition,
            image: createUserLocationMarkerImage()
        });
        userLocationMarker.setMap(map);
    } else if (mapType === 'leaflet' && map) {
        userLocationMarker = L.marker([userLocation.lat, userLocation.lng], {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: '📍',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map);
    }
}

// 사용자 위치 마커 이미지 생성 (카카오맵용)
function createUserLocationMarkerImage() {
    return new kakao.maps.MarkerImage(
        'data:image/svg+xml;base64,' + btoa(`
            <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" fill="#2ecc71" stroke="white" stroke-width="3"/>
                <text x="15" y="20" font-size="14" text-anchor="middle" fill="white">📍</text>
            </svg>
        `),
        new kakao.maps.Size(30, 30),
        { offset: new kakao.maps.Point(15, 15) }
    );
}

// 지도 클릭으로 위치 설정
function setupMapClick() {
    if (mapType === 'kakao' && map) {
        kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
            const latlng = mouseEvent.latLng;
            setUserLocation(latlng.getLat(), latlng.getLng(), '지도 클릭');
        });
    } else if (mapType === 'leaflet' && map) {
        map.on('click', function(e) {
            setUserLocation(e.latlng.lat, e.latlng.lng, '지도 클릭');
        });
    }
}

// 지도 없이 매장 목록만 표시하는 함수
function loadStoresWithoutMap() {
    allStores = [...sampleStores];
    filteredStores = [...allStores];
    updateStoreList();
    updateStats();
}