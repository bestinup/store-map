#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
온누리상품권 CSV에서 광주 지역 데이터를 추출하는 스크립트
"""

import csv
import json
import random

def extract_onnuri_gwangju():
    """온누리상품권 CSV에서 광주 지역 데이터를 추출합니다."""
    
    input_file = "소상공인시장진흥공단_전국 온누리상품권 가맹점 현황_20240731.csv"
    
    gwangju_stores = []
    
    print("온누리상품권 광주 지역 데이터 추출 중...")
    
    try:
        with open(input_file, 'r', encoding='cp949') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                address = row.get('가맹점주소', '').strip()
                
                # 광주광역시 포함 여부 확인
                if '광주광역시' in address or '광주시' in address:
                    # 구 정보 추출
                    district = ''
                    if '동구' in address:
                        district = '동구'
                    elif '서구' in address:
                        district = '서구'
                    elif '남구' in address:
                        district = '남구'
                    elif '북구' in address:
                        district = '북구'
                    elif '광산구' in address:
                        district = '광산구'
                    
                    store_info = {
                        'name': row.get('가맹점명', '').strip(),
                        'address': address,
                        'district': district,
                        'business_type': row.get('업종명', '').strip(),
                        'market_name': row.get('소속 시장명(또는 쇼핑몰)', '').strip(),
                        'card_type': 'onnuri'
                    }
                    
                    if store_info['name'] and store_info['address']:
                        gwangju_stores.append(store_info)
                        
                        if len(gwangju_stores) % 10 == 0:
                            print(f"추출된 매장 수: {len(gwangju_stores)}개")
    
    except Exception as e:
        print(f"파일 읽기 오류: {e}")
        return []
    
    print(f"광주 지역 온누리상품권 매장 {len(gwangju_stores)}개 추출 완료")
    return gwangju_stores

def save_onnuri_data(stores):
    """온누리상품권 데이터를 CSV와 JSON으로 저장합니다."""
    
    if not stores:
        print("저장할 데이터가 없습니다.")
        return
    
    csv_filename = "onnuri_gwangju_stores.csv"
    json_filename = "onnuri_gwangju_stores.json"
    
    # CSV 파일로 저장
    with open(csv_filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
        fieldnames = ['name', 'address', 'district', 'business_type', 'market_name', 'card_type']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        writer.writerows(stores)
    
    print(f"CSV 파일 저장: {csv_filename}")
    
    # JSON 파일로 저장
    with open(json_filename, 'w', encoding='utf-8') as jsonfile:
        json.dump(stores, jsonfile, ensure_ascii=False, indent=2)
    
    print(f"JSON 파일 저장: {json_filename}")

def main():
    """메인 함수"""
    stores = extract_onnuri_gwangju()
    
    if stores:
        save_onnuri_data(stores)
        
        # 통계 출력
        print("\n추출 결과 통계:")
        print("=" * 30)
        print(f"총 매장 수: {len(stores)}")
        
        # 구별 통계
        district_count = {}
        for store in stores:
            district = store['district']
            if district:
                district_count[district] = district_count.get(district, 0) + 1
        
        print("\n구별 매장 수:")
        for district, count in sorted(district_count.items()):
            print(f"  {district}: {count}개")
        
        # 업종별 통계
        business_count = {}
        for store in stores:
            business_type = store['business_type']
            if business_type:
                business_count[business_type] = business_count.get(business_type, 0) + 1
        
        print("\n주요 업종별 매장 수 (상위 10개):")
        sorted_business = sorted(business_count.items(), key=lambda x: x[1], reverse=True)[:10]
        for business_type, count in sorted_business:
            print(f"  {business_type}: {count}개")
    
    print("\n추출 완료!")

if __name__ == "__main__":
    main()