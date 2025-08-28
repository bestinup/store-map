// 광주 지역 매장 지도 - GPS 위치 지원
class StoreMapManager {
    constructor() {
        this.map = null;
        this.leafletMap = null;
        this.currentMarkers = [];
        this.currentLocation = null;
        this.isKakaoMapLoaded = false;
        this.locationWatchId = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 매장 지도 매니저 초기화 중...');
        
        try {
            // 카카오 맵 우선 시도
            if (typeof kakao !== 'undefined' && kakao.maps) {
                await this.initKakaoMap();
                this.isKakaoMapLoaded = true;
                console.log('✅ 카카오 맵 로드 성공');
            } else {
                throw new Error('Kakao Map not available');
            }
        } catch (error) {
            console.warn('⚠️ 카카오 맵 로딩 실패, OpenStreetMap으로 전환:', error);
            this.initLeafletMap();
        }
        
        this.initEventListeners();
        this.loadInitialData();
        
        // GPS 권한 확인
        this.checkGeolocationPermission();
    }
    
    initKakaoMap() {
        return new Promise((resolve, reject) => {
            try {
                const container = document.getElementById('map');
                const options = {
                    center: new kakao.maps.LatLng(35.1595, 126.8526), // 광주시청
                    level: 8
                };
                
                this.map = new kakao.maps.Map(container, options);
                
                // 지도 클릭 이벤트
                kakao.maps.event.addListener(this.map, 'click', (mouseEvent) => {
                    const latlng = mouseEvent.latLng;
                    this.setCurrentLocation(latlng.getLat(), latlng.getLng(), '지도 클릭');
                });
                
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    initLeafletMap() {
        try {
            this.leafletMap = L.map('map').setView([35.1595, 126.8526], 11);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.leafletMap);
            
            // 지도 클릭 이벤트
            this.leafletMap.on('click', (e) => {
                this.setCurrentLocation(e.latlng.lat, e.latlng.lng, '지도 클릭');
            });
            
            console.log('✅ OpenStreetMap 초기화 완료');
        } catch (error) {
            console.error('❌ 지도 초기화 실패:', error);
        }
    }
    
    initEventListeners() {
        // 현재 위치 버튼
        const getLocationBtn = document.getElementById('getLocationBtn');
        if (getLocationBtn) {
            getLocationBtn.addEventListener('click', () => {
                this.getCurrentLocation();
            });
        }
        
        // 근처 매장 찾기 버튼
        const findNearbyBtn = document.getElementById('findNearbyBtn');
        if (findNearbyBtn) {
            findNearbyBtn.addEventListener('click', () => {
                this.findNearbyStores();
            });
        }
        
        // 필터 체크박스
        const filterGwangju = document.getElementById('filterGwangju');
        if (filterGwangju) {
            filterGwangju.addEventListener('change', () => {
                this.updateStoreDisplay();
            });
        }
        
        // 온누리상품권 필터 제거됨
        
        const showNearbyOnly = document.getElementById('showNearbyOnly');
        if (showNearbyOnly) {
            showNearbyOnly.addEventListener('change', () => {
                this.updateStoreDisplay();
            });
        }
        
        // 검색
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchStores();
            });
        }
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchStores();
                }
            });
        }
    }
    
    checkGeolocationPermission() {
        if (!navigator.geolocation) {
            console.warn('⚠️ 이 브라우저는 위치 서비스를 지원하지 않습니다.');
            return;
        }
        
        // 권한 상태 확인 (Chrome/Edge)
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                console.log(`🔍 위치 권한 상태: ${result.state}`);
                
                if (result.state === 'denied') {
                    this.showGpsHelp();
                }
            }).catch(() => {
                console.log('권한 상태 확인 불가 (Firefox/Safari)');
            });
        }
    }
    
    showGpsHelp() {
        const gpsHelp = document.getElementById('gpsHelp');
        if (gpsHelp) {
            gpsHelp.style.display = 'block';
        }
    }
    
    getCurrentLocation() {
        if (!navigator.geolocation) {
            alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
            return;
        }
        
        const btn = document.getElementById('getLocationBtn');
        const loading = document.getElementById('loadingIndicator');
        
        // UI 업데이트
        if (btn) {
            btn.textContent = '📡 위치 확인 중...';
            btn.disabled = true;
        }
        if (loading) loading.style.display = 'block';
        
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5분간 캐시
        };
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                console.log(`📍 GPS 위치 획득: ${lat}, ${lng} (정확도: ${Math.round(accuracy)}m)`);
                
                this.setCurrentLocation(lat, lng, `GPS (정확도: ${Math.round(accuracy)}m)`);
                
                // UI 복구
                if (btn) {
                    btn.textContent = '📍 현재 위치 찾기';
                    btn.disabled = false;
                }
                if (loading) loading.style.display = 'none';
                
                // 자동으로 근처 매장 찾기
                setTimeout(() => {
                    this.findNearbyStores();
                }, 500);
            },
            (error) => {
                console.error('❌ 위치 획득 실패:', error);
                
                let errorMessage = '위치 정보를 가져올 수 없습니다.';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '위치 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
                        this.showGpsHelp();
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '위치 정보를 사용할 수 없습니다.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '위치 요청 시간이 초과되었습니다. 다시 시도해주세요.';
                        break;
                }
                
                alert(errorMessage);
                
                // UI 복구
                if (btn) {
                    btn.textContent = '📍 현재 위치 찾기';
                    btn.disabled = false;
                }
                if (loading) loading.style.display = 'none';
            },
            options
        );
    }
    
    setCurrentLocation(lat, lng, source) {
        this.currentLocation = { lat, lng };
        
        console.log(`📍 위치 설정: ${source} (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
        
        // 지도 중심 이동
        if (this.isKakaoMapLoaded && this.map) {
            const moveLatLon = new kakao.maps.LatLng(lat, lng);
            this.map.setCenter(moveLatLon);
            this.map.setLevel(6);
            
            // 현재 위치 마커 표시
            const markerPosition = new kakao.maps.LatLng(lat, lng);
            const marker = new kakao.maps.Marker({
                position: markerPosition,
                map: this.map,
                image: new kakao.maps.MarkerImage(
                    'data:image/svg+xml;base64,' + btoa(`
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" fill="#FF4444" stroke="#FFF" stroke-width="3"/>
                            <circle cx="12" cy="12" r="4" fill="#FFF"/>
                        </svg>
                    `),
                    new kakao.maps.Size(24, 24),
                    { offset: new kakao.maps.Point(12, 12) }
                )
            });
            
        } else if (this.leafletMap) {
            this.leafletMap.setView([lat, lng], 14);
            
            // 현재 위치 마커
            L.circleMarker([lat, lng], {
                color: '#FF4444',
                fillColor: '#FF4444',
                fillOpacity: 0.8,
                radius: 8
            }).addTo(this.leafletMap).bindPopup('현재 위치');
        }
        
        // 위치 정보 표시
        const locationInfo = document.getElementById('locationInfo');
        if (locationInfo) {
            locationInfo.textContent = `${source}: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            locationInfo.style.display = 'inline';
        }
        
        // 근처 매장 찾기 버튼 활성화
        const findNearbyBtn = document.getElementById('findNearbyBtn');
        if (findNearbyBtn) {
            findNearbyBtn.disabled = false;
            findNearbyBtn.textContent = '🔍 근처 매장 (300m)';
        }
    }
    
    findNearbyStores() {
        if (!this.currentLocation) {
            alert('먼저 현재 위치를 설정해주세요.');
            return;
        }
        
        if (!window.gwangjuStores || !window.gwangjuStores.findNearby) {
            alert('매장 데이터가 아직 로드되지 않았습니다.');
            return;
        }
        
        console.log('🔍 반경 300m 내 매장 검색 중...');
        
        const nearby = window.gwangjuStores.findNearby(
            this.currentLocation.lat,
            this.currentLocation.lng,
            300
        );
        
        console.log(`🏪 반경 300m 내 매장: ${nearby.length}개 발견`);
        
        if (nearby.length === 0) {
            alert('반경 300m 내에 매장이 없습니다. 검색 범위를 넓혀보세요.');
            return;
        }
        
        // 근처 매장만 표시 체크박스 자동 체크
        const showNearbyOnly = document.getElementById('showNearbyOnly');
        if (showNearbyOnly) {
            showNearbyOnly.checked = true;
        }
        
        this.updateStoreDisplay();
        
        // 사용자 알림
        alert(`주변 300m 내 ${nearby.length}개 매장을 찾았습니다!`);
    }
    
    loadInitialData() {
        // 대용량 데이터가 로드되었는지 확인
        if (window.gwangjuStores && window.gwangjuStores.all) {
            const stats = window.gwangjuStores.statistics || {};
            console.log(`📊 매장 데이터 로드됨:`);
            console.log(`  - 광주상생카드: ${stats.gwangju || 0}개`);
            // 온누리상품권 통계 제거됨
            console.log(`  - 총합: ${stats.total || window.gwangjuStores.all.length}개`);
            
            this.updateStoreDisplay();
            
            // 매장 수 표시
            const storeCount = document.getElementById('storeCount');
            if (storeCount) {
                storeCount.textContent = `(${window.gwangjuStores.all.length.toLocaleString()}개)`;
            }
        } else {
            console.warn('⚠️ 매장 데이터를 찾을 수 없습니다.');
            
            // 로딩 실패 메시지
            const storeCount = document.getElementById('storeCount');
            if (storeCount) {
                storeCount.textContent = '(데이터 로드 실패)';
            }
        }
    }
    
    updateStoreDisplay() {
        if (!window.gwangjuStores) {
            console.warn('매장 데이터가 없습니다.');
            return;
        }
        
        let stores = window.gwangjuStores.all;
        
        // 필터 적용
        const showGwangju = document.getElementById('filterGwangju')?.checked ?? true;
        const showNearbyOnly = document.getElementById('showNearbyOnly')?.checked ?? false;
        
        stores = stores.filter(store => {
            // 광주상생카드만 표시 (온누리 제외)
            const hasGwangju = store.types.includes('gwangju') || store.types.includes('gwangju_saengsaeng');
            
            if (!showGwangju && hasGwangju) return false;
            
            return true;
        });
        
        // 근처 매장만 표시 필터
        if (showNearbyOnly && this.currentLocation) {
            stores = window.gwangjuStores.findNearby(
                this.currentLocation.lat,
                this.currentLocation.lng,
                300
            );
        }
        
        console.log(`🏪 표시할 매장: ${stores.length}개`);
        
        this.displayStores(stores);
        this.updateStoreList(stores);
    }
    
    displayStores(stores) {
        // 기존 마커 제거
        this.clearMarkers();
        
        // 성능을 위해 매장 수 제한
        const maxStores = 500;
        if (stores.length > maxStores) {
            console.warn(`⚠️ 성능을 위해 ${maxStores}개만 표시합니다.`);
            stores = stores.slice(0, maxStores);
        }
        
        stores.forEach(store => {
            this.addStoreMarker(store);
        });
        
        console.log(`✅ ${stores.length}개 매장 마커 표시 완료`);
    }
    
    addStoreMarker(store) {
        const types = store.types.join(', ');
        const typeClass = store.types.includes('gwangju') && store.types.includes('onnuri') 
            ? 'both' : store.types.includes('gwangju') ? 'gwangju' : 'onnuri';
            
        const content = `
            <div class="marker-info ${typeClass}">
                <strong>${store.name}</strong><br>
                <small>${store.address}</small><br>
                <span class="card-types">${types}</span>
                ${store.distance ? `<br><span class="distance">🚶‍♂️ ${store.distance}m</span>` : ''}
            </div>
        `;
        
        if (this.isKakaoMapLoaded && this.map) {
            const position = new kakao.maps.LatLng(store.lat, store.lng);
            
            // 광주상생카드 마커 색상
            let markerColor = '#FF5722'; // 주황색 (광주상생카드)
            
            const marker = new kakao.maps.Marker({
                position: position,
                map: this.map
            });
            
            const infowindow = new kakao.maps.InfoWindow({
                content: content
            });
            
            kakao.maps.event.addListener(marker, 'click', () => {
                infowindow.open(this.map, marker);
            });
            
            this.currentMarkers.push(marker);
            
        } else if (this.leafletMap) {
            // Leaflet 마커 색상
            let color = '#4285f4';
            if (store.types.includes('gwangju') && store.types.includes('onnuri')) {
                color = '#9C27B0';
            } else if (store.types.includes('gwangju')) {
                color = '#FF5722';
            } else if (store.types.includes('onnuri')) {
                color = '#4CAF50';
            }
            
            const marker = L.circleMarker([store.lat, store.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.8,
                radius: 6
            }).addTo(this.leafletMap).bindPopup(content);
            
            this.currentMarkers.push(marker);
        }
    }
    
    clearMarkers() {
        if (this.isKakaoMapLoaded) {
            this.currentMarkers.forEach(marker => {
                marker.setMap(null);
            });
        } else if (this.leafletMap) {
            this.currentMarkers.forEach(marker => {
                this.leafletMap.removeLayer(marker);
            });
        }
        
        this.currentMarkers = [];
    }
    
    updateStoreList(stores) {
        const storeList = document.getElementById('storeList');
        const storeCount = document.getElementById('storeCount');
        
        if (storeCount) {
            storeCount.textContent = `(${stores.length.toLocaleString()}개)`;
        }
        
        if (!storeList) return;
        
        // 리스트 제한
        const maxList = 50;
        let displayStores = stores;
        
        if (stores.length > maxList) {
            storeList.innerHTML = `
                <p class="store-list-notice">
                    📊 ${stores.length.toLocaleString()}개 매장이 검색되었습니다.<br>
                    성능을 위해 상위 ${maxList}개만 목록에 표시합니다.
                </p>
            `;
            displayStores = stores.slice(0, maxList);
        } else {
            storeList.innerHTML = '';
        }
        
        displayStores.forEach(store => {
            const storeItem = document.createElement('div');
            storeItem.className = 'store-item';
            
            const types = '💳 광주상생카드';
            
            storeItem.innerHTML = `
                <h4>${store.name}</h4>
                <p class="address">${store.address}</p>
                <p class="card-types"><strong>${types}</strong></p>
                ${store.distance ? `<p class="distance">🚶‍♂️ ${store.distance}m 거리</p>` : ''}
            `;
            
            storeItem.addEventListener('click', () => {
                // 지도에서 해당 매장 위치로 이동
                if (this.isKakaoMapLoaded && this.map) {
                    const moveLatLon = new kakao.maps.LatLng(store.lat, store.lng);
                    this.map.setCenter(moveLatLon);
                    this.map.setLevel(4);
                } else if (this.leafletMap) {
                    this.leafletMap.setView([store.lat, store.lng], 16);
                }
            });
            
            storeList.appendChild(storeItem);
        });
    }
    
    searchStores() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const query = searchInput.value.trim();
        if (!query) {
            alert('검색어를 입력해주세요.');
            return;
        }
        
        if (!window.gwangjuStores) {
            alert('매장 데이터가 아직 로드되지 않았습니다.');
            return;
        }
        
        console.log(`🔍 검색: "${query}"`);
        
        const results = window.gwangjuStores.all.filter(store =>
            store.name.toLowerCase().includes(query.toLowerCase()) ||
            store.address.toLowerCase().includes(query.toLowerCase()) ||
            (store.business_type && store.business_type.toLowerCase().includes(query.toLowerCase()))
        );
        
        console.log(`📋 검색 결과: ${results.length}개`);
        
        if (results.length === 0) {
            alert(`"${query}"에 대한 검색 결과가 없습니다.`);
            return;
        }
        
        // 검색 결과 표시
        this.displayStores(results);
        this.updateStoreList(results);
        
        // 첫 번째 결과로 지도 이동
        if (results.length > 0) {
            const firstStore = results[0];
            if (this.isKakaoMapLoaded && this.map) {
                const moveLatLon = new kakao.maps.LatLng(firstStore.lat, firstStore.lng);
                this.map.setCenter(moveLatLon);
                this.map.setLevel(6);
            } else if (this.leafletMap) {
                this.leafletMap.setView([firstStore.lat, firstStore.lng], 14);
            }
        }
        
        alert(`"${query}" 검색 결과: ${results.length}개 매장을 찾았습니다.`);
    }
}

// 페이지 로드 시 지도 매니저 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌍 웹페이지 로드 완료 - 지도 초기화 시작');
    
    // 약간의 지연 후 초기화 (다른 스크립트 로드 대기)
    setTimeout(() => {
        new StoreMapManager();
    }, 100);
});

// 서비스워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('❌ SW registration failed: ', registrationError);
            });
    });
}