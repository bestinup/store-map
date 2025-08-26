#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
광주상생카드 크롤링 데이터와 기존 온누리상품권 데이터를 결합하는 스크립트
"""

import csv
import json
import random

def create_combined_stores():
    """광주상생카드와 온누리상품권 데이터를 결합합니다."""
    
    all_stores = []
    
    # 1. 광주상생카드 크롤링 데이터 읽기
    print("광주상생카드 크롤링 데이터 읽는 중...")
    
    gwangju_file = "gwangju_card_stores_20250826_183910.csv"
    
    try:
        with open(gwangju_file, 'r', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for i, row in enumerate(reader):
                if i >= 30:  # 30개만 선택
                    break
                    
                # 기본 좌표 (광주 중심)
                base_lat = 35.1595
                base_lng = 126.8526
                
                # 구별로 좌표 조정
                district = row['district']
                if district == '동구':
                    lat_offset = random.uniform(0.01, 0.03)
                    lng_offset = random.uniform(0.01, 0.03)
                elif district == '서구':
                    lat_offset = random.uniform(-0.01, 0.01)
                    lng_offset = random.uniform(-0.03, -0.01)
                elif district == '남구':
                    lat_offset = random.uniform(-0.03, -0.01)
                    lng_offset = random.uniform(-0.01, 0.01)
                elif district == '북구':
                    lat_offset = random.uniform(0.01, 0.03)
                    lng_offset = random.uniform(-0.01, 0.01)
                elif district == '광산구':
                    lat_offset = random.uniform(-0.01, 0.01)
                    lng_offset = random.uniform(-0.03, -0.01)
                else:
                    lat_offset = random.uniform(-0.02, 0.02)
                    lng_offset = random.uniform(-0.02, 0.02)
                
                # 좌표 생성
                lat = base_lat + lat_offset
                lng = base_lng + lng_offset
                
                store = {
                    'id': len(all_stores) + 1,
                    'name': row['name'].strip(),
                    'address': row['address'].strip(),
                    'lat': round(lat, 6),
                    'lng': round(lng, 6),
                    'district': district,
                    'business_type': row['business_type'].strip(),
                    'phone': row.get('phone', '').strip(),
                    'types': ['gwangju']
                }
                
                all_stores.append(store)
        
        print(f"광주상생카드: {len(all_stores)}개 매장 추가")
    
    except Exception as e:
        print(f"광주상생카드 데이터 읽기 오류: {e}")
    
    # 2. 온누리상품권 샘플 데이터 추가 (기존 real_stores.js에서)
    print("온누리상품권 샘플 데이터 추가...")
    
    onnuri_samples = [
        {'name': '화신상회', 'address': '광주광역시 광산구 사암로 300(월곡동) 월곡시장', 'district': '광산구', 'business_type': '식품', 'types': ['onnuri']},
        {'name': '송죽식품', 'address': '광주광역시 광산구 사암로 300(월곡동) 월곡시장', 'district': '광산구', 'business_type': '가공식품', 'types': ['onnuri']},
        {'name': '무안수산', 'address': '광주광역시 광산구 사암로 300(월곡동) 월곡시장', 'district': '광산구', 'business_type': '수산물', 'types': ['onnuri']},
        {'name': '시장통닭', 'address': '광주광역시 동구 동명로 62(동명동)', 'district': '동구', 'business_type': '닭', 'types': ['onnuri']},
        {'name': '대성청과', 'address': '광주광역시 동구 동명로 62(동명동)', 'district': '동구', 'business_type': '야채', 'types': ['onnuri']},
        {'name': '광주한식당', 'address': '광주광역시 서구 양동로 17', 'district': '서구', 'business_type': '한식', 'types': ['onnuri']},
        {'name': '남도홍어', 'address': '광주광역시 남구 중앙로 160', 'district': '남구', 'business_type': '홍어', 'types': ['onnuri']},
        {'name': '북구김치', 'address': '광주광역시 북구 용봉로 77', 'district': '북구', 'business_type': '김치', 'types': ['onnuri']},
        {'name': '한우정육점', 'address': '광주광역시 광산구 첨단과기로 123', 'district': '광산구', 'business_type': '식육', 'types': ['onnuri']},
        {'name': '전통시장카페', 'address': '광주광역시 동구 충장로 15', 'district': '동구', 'business_type': '음료', 'types': ['onnuri']},
        
        # 둘 다 사용 가능한 매장 몇 개 추가
        {'name': '광주마트', 'address': '광주광역시 서구 상무대로 312', 'district': '서구', 'business_type': '대형마트', 'types': ['onnuri', 'gwangju']},
        {'name': '종합할인점', 'address': '광주광역시 남구 봉선로 89', 'district': '남구', 'business_type': '할인점', 'types': ['onnuri', 'gwangju']},
    ]
    
    for i, onnuri_store in enumerate(onnuri_samples):
        # 좌표 생성 (각 구별로)
        base_lat = 35.1595
        base_lng = 126.8526
        
        district = onnuri_store['district']
        if district == '동구':
            lat_offset = random.uniform(0.01, 0.03)
            lng_offset = random.uniform(0.01, 0.03)
        elif district == '서구':
            lat_offset = random.uniform(-0.01, 0.01)
            lng_offset = random.uniform(-0.03, -0.01)
        elif district == '남구':
            lat_offset = random.uniform(-0.03, -0.01)
            lng_offset = random.uniform(-0.01, 0.01)
        elif district == '북구':
            lat_offset = random.uniform(0.01, 0.03)
            lng_offset = random.uniform(-0.01, 0.01)
        elif district == '광산구':
            lat_offset = random.uniform(-0.01, 0.01)
            lng_offset = random.uniform(-0.03, -0.01)
        
        lat = base_lat + lat_offset
        lng = base_lng + lng_offset
        
        store = {
            'id': len(all_stores) + 1,
            'name': onnuri_store['name'],
            'address': onnuri_store['address'],
            'lat': round(lat, 6),
            'lng': round(lng, 6),
            'district': district,
            'business_type': onnuri_store['business_type'],
            'phone': '',
            'types': onnuri_store['types']
        }
        
        all_stores.append(store)
    
    print(f"온누리상품권: {len(onnuri_samples)}개 매장 추가")
    print(f"총 매장 수: {len(all_stores)}개")
    
    return all_stores

def save_combined_data(stores):
    """결합된 데이터를 JavaScript 파일로 저장합니다."""
    
    js_content = f"""// 실제 크롤링된 가맹점 데이터 (광주상생카드 + 온누리상품권)
const sampleStores = {json.dumps(stores, ensure_ascii=False, indent=2)};

// 데이터 통계 출력
console.log('=== 가맹점 데이터 통계 ===');
console.log('총 가맹점 수:', sampleStores.length);

const onnuriStores = sampleStores.filter(s => s.types.includes('onnuri'));
const gwangjuStores = sampleStores.filter(s => s.types.includes('gwangju'));
const bothStores = sampleStores.filter(s => s.types.includes('onnuri') && s.types.includes('gwangju'));

console.log('온누리상품권 가맹점:', onnuriStores.length + '개');
console.log('광주상생카드 가맹점:', gwangjuStores.length + '개');
console.log('둘 다 사용 가능:', bothStores.length + '개');

// 구별 통계
const districtStats = {{}};
sampleStores.forEach(store => {{
    if (!districtStats[store.district]) {{
        districtStats[store.district] = 0;
    }}
    districtStats[store.district]++;
}});
console.log('구별 매장 수:', districtStats);
"""
    
    # 파일 저장
    with open('real_stores_updated.js', 'w', encoding='utf-8') as jsfile:
        jsfile.write(js_content)
    
    print("결합된 JavaScript 파일 저장 완료: real_stores_updated.js")

def main():
    """메인 함수"""
    print("광주상생카드 + 온누리상품권 데이터 결합 시작")
    print("=" * 50)
    
    stores = create_combined_stores()
    
    if stores:
        save_combined_data(stores)
        
        # 통계 출력
        print("\n최종 결과 통계:")
        print("=" * 30)
        
        onnuri_count = len([s for s in stores if 'onnuri' in s['types']])
        gwangju_count = len([s for s in stores if 'gwangju' in s['types']])
        both_count = len([s for s in stores if 'onnuri' in s['types'] and 'gwangju' in s['types']])
        
        print(f"총 매장 수: {len(stores)}개")
        print(f"온누리상품권: {onnuri_count}개")
        print(f"광주상생카드: {gwangju_count}개")
        print(f"둘 다 사용 가능: {both_count}개")
        
        # 구별 통계
        district_count = {}
        for store in stores:
            district = store['district']
            district_count[district] = district_count.get(district, 0) + 1
        
        print("\n구별 매장 수:")
        for district, count in sorted(district_count.items()):
            if district:
                print(f"  {district}: {count}개")
    
    print("\n데이터 결합 완료!")

if __name__ == "__main__":
    main()