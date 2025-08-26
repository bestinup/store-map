#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
크롤링된 데이터를 JavaScript 파일로 변환하는 스크립트
"""

import csv
import json
import random

def convert_csv_to_js(csv_filename, js_filename, max_stores=100):
    """CSV 파일을 JavaScript 배열로 변환합니다."""
    
    stores = []
    
    # CSV 파일 읽기
    with open(csv_filename, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
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
                'id': len(stores) + 1,
                'name': row['name'].strip(),
                'address': row['address'].strip(),
                'lat': round(lat, 6),
                'lng': round(lng, 6),
                'district': district,
                'business_type': row['business_type'].strip(),
                'phone': row.get('phone', '').strip(),
                'types': [row['card_type']]
            }
            
            stores.append(store)
            
            # 최대 개수 제한
            if len(stores) >= max_stores:
                break
    
    # JavaScript 파일 생성
    js_content = f"""// 실제 크롤링된 가맹점 데이터
const sampleStores = {json.dumps(stores, ensure_ascii=False, indent=2)};

// 데이터 통계
console.log('총 가맹점 수:', sampleStores.length);
console.log('광주상생카드:', sampleStores.filter(s => s.types.includes('gwangju')).length);
"""
    
    # 파일 저장
    with open(js_filename, 'w', encoding='utf-8') as jsfile:
        jsfile.write(js_content)
    
    print(f"JavaScript 파일 생성 완료: {js_filename}")
    print(f"총 {len(stores)}개 매장 데이터 변환")
    
    return stores

def main():
    """메인 함수"""
    csv_filename = "gwangju_card_stores_20250826_183910.csv"
    js_filename = "crawled_stores.js"
    
    print("크롤링 데이터를 JavaScript로 변환 중...")
    
    stores = convert_csv_to_js(csv_filename, js_filename, max_stores=50)
    
    # 통계 출력
    print("\n변환 결과 통계:")
    print("=" * 30)
    print(f"총 매장 수: {len(stores)}")
    
    # 구별 통계
    district_count = {}
    for store in stores:
        district = store['district']
        district_count[district] = district_count.get(district, 0) + 1
    
    print("\n구별 매장 수:")
    for district, count in sorted(district_count.items()):
        if district:
            print(f"  {district}: {count}개")
    
    print("\n변환 완료!")

if __name__ == "__main__":
    main()