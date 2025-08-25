// 전역 변수
let map;
let markers = [];
let allStores = [];
let filteredStores = [];

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
    }
];

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌍 OpenStreetMap 지도 서비스 시작');
    initMap();
    initEventListeners();
    loadStores();
});

// 지도 초기화
function initMap() {
    // Leaflet으로 지도 생성
    map = L.map('map').setView([35.1595, 126.8526], 13);

    // OpenStreetMap 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    console.log('✅ OpenStreetMap 지도 초기화 완료');
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
    console.log(`📍 ${allStores.length}개 매장 데이터 로드 완료`);
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
    
    console.log(`🔍 검색 결과: "${searchTerm}" - ${filteredStores.length}개 매장`);
}

// 지도 업데이트
function updateMap() {
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
            html: `<div style="background-color: ${iconColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">●</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([store.lat, store.lng], {icon: customIcon});
        
        // 마커 클릭 이벤트
        marker.on('click', function() {
            showStoreDetails(store);
        });
        
        // 툴팁 추가
        marker.bindTooltip(store.name, {
            direction: 'top',
            offset: [0, -10]
        });
        
        marker.addTo(map);
        markers.push(marker);
    });
    
    // 모든 마커가 보이도록 지도 범위 조정
    if (filteredStores.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
    
    console.log(`🗺️ 지도 업데이트 완료: ${filteredStores.length}개 마커 표시`);
}

// 매장 목록 업데이트
function updateStoreList() {
    const listContent = document.getElementById('store-list-content');
    listContent.innerHTML = '';
    
    if (filteredStores.length === 0) {
        listContent.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">조건에 맞는 매장이 없습니다.</div>';
        return;
    }
    
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
            map.setView([store.lat, store.lng], 16);
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
            <div style="margin-bottom: 15px;">
                ${store.types.includes('onnuri') ? '<span class="type-badge onnuri">온누리상품권</span>' : ''}
                ${store.types.includes('gwangju') ? '<span class="type-badge gwangju">광주상생카드</span>' : ''}
            </div>
            <p><strong>📍 주소:</strong> ${store.address}</p>
            <p><strong>🏪 카테고리:</strong> ${store.category}</p>
            <p><strong>📞 전화번호:</strong> ${store.phone}</p>
            <p><strong>🕐 운영시간:</strong> ${store.hours}</p>
            <p><strong>📝 설명:</strong> ${store.description}</p>
        </div>
    `;
    
    document.getElementById('store-modal').style.display = 'block';
    
    console.log(`ℹ️ 매장 상세정보 표시: ${store.name}`);
}

// 모달 닫기
function closeModal() {
    document.getElementById('store-modal').style.display = 'none';
}

// 유틸리티 함수들
function addStore(storeData) {
    allStores.push(storeData);
    applyFilters();
    console.log(`➕ 매장 추가: ${storeData.name}`);
}

function removeStore(storeId) {
    const store = allStores.find(s => s.id === storeId);
    allStores = allStores.filter(store => store.id !== storeId);
    applyFilters();
    console.log(`➖ 매장 제거: ${store ? store.name : storeId}`);
}

function updateStore(storeId, updatedData) {
    const index = allStores.findIndex(store => store.id === storeId);
    if (index !== -1) {
        allStores[index] = { ...allStores[index], ...updatedData };
        applyFilters();
        console.log(`✏️ 매장 정보 업데이트: ${updatedData.name || allStores[index].name}`);
    }
}