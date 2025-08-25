// 전역 변수
let map;
let markers = [];
let allStores = [];
let filteredStores = [];
let mapType = 'none'; // 'kakao', 'leaflet', 'none'

// 카카오맵 API 키 설정 (실제 사용시에는 본인의 API 키로 교체하세요)
// const KAKAO_API_KEY = 'YOUR_KAKAO_API_KEY';

// 샘플 매장 데이터
const sampleStores = [
    {
        id: 1,
        name: "행복마트",
        address: "광주광역시 서구 농성로 123",
        lat: 35.1595, 
        lng: 126.8526,
        types: ["onnuri", "gwangju"],
        category: "마트/편의점",
        phone: "062-123-4567",
        hours: "09:00 - 22:00",
        description: "신선한 농산물과 생활용품을 판매하는 동네 마트입니다."
    },
    {
        id: 2,
        name: "맛집 한우불고기",
        address: "광주광역시 남구 봉선로 456",
        lat: 35.1323,
        lng: 126.9026,
        types: ["onnuri"],
        category: "음식점",
        phone: "062-234-5678",
        hours: "11:30 - 21:00",
        description: "정성으로 만든 한우불고기 전문점입니다."
    },
    {
        id: 3,
        name: "청춘카페",
        address: "광주광역시 동구 충장로 789",
        lat: 35.1468,
        lng: 126.9218,
        types: ["gwangju"],
        category: "카페",
        phone: "062-345-6789",
        hours: "08:00 - 22:00",
        description: "아늑한 분위기의 동네 카페입니다."
    },
    {
        id: 4,
        name: "건강약국",
        address: "광주광역시 북구 용봉로 321",
        lat: 35.1742,
        lng: 126.9113,
        types: ["onnuri", "gwangju"],
        category: "약국",
        phone: "062-456-7890",
        hours: "09:00 - 20:00",
        description: "믿을 수 있는 동네 약국입니다."
    },
    {
        id: 5,
        name: "스타일헤어샵",
        address: "광주광역시 서구 상무대로 654",
        lat: 35.1533,
        lng: 126.8447,
        types: ["gwangju"],
        category: "미용실",
        phone: "062-567-8901",
        hours: "10:00 - 20:00",
        description: "트렌디한 헤어 스타일링 전문샵입니다."
    },
    {
        id: 6,
        name: "우리분식",
        address: "광주광역시 남구 월산로 987",
        lat: 35.1289,
        lng: 126.8956,
        types: ["onnuri"],
        category: "음식점",
        phone: "062-678-9012",
        hours: "11:00 - 20:30",
        description: "정통 한국 분식을 맛볼 수 있는 곳입니다."
    },
    {
        id: 7,
        name: "광주편의점",
        address: "광주광역시 북구 첨단과기로 145",
        lat: 35.2281,
        lng: 126.8435,
        types: ["onnuri", "gwangju"],
        category: "편의점",
        phone: "062-717-8901",
        hours: "24시간",
        description: "24시간 언제든지 이용 가능한 편의점입니다."
    },
    {
        id: 8,
        name: "맛있는 치킨집",
        address: "광주광역시 서구 치평로 234",
        lat: 35.1521,
        lng: 126.8723,
        types: ["gwangju"],
        category: "음식점",
        phone: "062-384-5678",
        hours: "16:00 - 24:00",
        description: "바삭하고 맛있는 치킨 전문점입니다."
    },
    {
        id: 9,
        name: "동네서점",
        address: "광주광역시 동구 금남로 156",
        lat: 35.1456,
        lng: 126.9167,
        types: ["onnuri"],
        category: "서점",
        phone: "062-233-4567",
        hours: "09:30 - 22:00",
        description: "다양한 도서와 문구용품을 판매하는 서점입니다."
    },
    {
        id: 10,
        name: "건강식품점",
        address: "광주광역시 남구 대남대로 567",
        lat: 35.1398,
        lng: 126.9134,
        types: ["onnuri", "gwangju"],
        category: "건강식품",
        phone: "062-652-7890",
        hours: "10:00 - 19:00",
        description: "천연 건강식품과 영양제를 전문으로 판매합니다."
    }
];

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
    
    // 상태 표시
    document.getElementById('map-status').innerHTML = '🌍 OpenStreetMap 사용 중 (카카오 맵 로드 실패)';
}

// 이벤트 리스너 초기화
function initEventListeners() {
    // 필터 체크박스
    document.getElementById('onnuri-filter').addEventListener('change', applyFilters);
    document.getElementById('gwangju-filter').addEventListener('change', applyFilters);
    
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
    
    filteredStores = allStores.filter(store => {
        const hasOnnuri = store.types.includes('onnuri');
        const hasGwangju = store.types.includes('gwangju');
        
        return (onnuriChecked && hasOnnuri) || (gwangjuChecked && hasGwangju);
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

// 현재 위치 찾기 (선택사항)
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const locPosition = new kakao.maps.LatLng(lat, lng);
            
            map.setCenter(locPosition);
            
            // 현재 위치 마커 표시
            const currentMarker = new kakao.maps.Marker({
                position: locPosition,
                image: createMarkerImage('#2ecc71') // 녹색
            });
            currentMarker.setMap(map);
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