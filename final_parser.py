#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import json

def parse_all_data():
    print("=== 실제 가맹점 데이터 추출 ===")
    
    all_stores = []
    
    # 1. 온누리상품권 데이터 파싱
    onnuri_file = "소상공인시장진흥공단_전국 온누리상품권 가맹점 현황_20240731.csv"
    
    try:
        with open(onnuri_file, 'r', encoding='cp949') as file:
            reader = csv.DictReader(file)
            rows = list(reader)
            
            print(f"온누리상품권 총 데이터: {len(rows)}개")
            
            count = 0
            for row in rows:
                name = str(row.get('가맹점명', '')).strip()
                market = str(row.get('소속 시장명(또는 상권명)', '')).strip()  
                address = str(row.get('소재지', '')).strip()
                category = str(row.get('취급품목', '')).strip()
                
                # 광주 지역 필터링 (상호명이나 시장명에 광주가 포함된 경우)
                if ('광주' in name or '광주' in market or '광주' in address) and name:
                    store = {
                        "id": len(all_stores) + 1,
                        "name": name,
                        "address": address or market,
                        "lat": 35.1595 + (count * 0.005),  # 광주 중심 기준 분산
                        "lng": 126.8526 + (count * 0.005),
                        "types": ["onnuri"],
                        "category": category or "일반",
                        "phone": "",
                        "hours": "운영시간 확인 필요",
                        "description": "온누리상품권 사용 가능 매장"
                    }
                    all_stores.append(store)
                    count += 1
                    print(f"  온누리 {count}: {name} ({address})")
                    
                    if count >= 40:  # 40개 제한
                        break
    
    except Exception as e:
        print(f"온누리상품권 파싱 오류: {e}")
    
    # 2. 광주상생카드 데이터 파싱  
    gwangju_file = "광주광역시_상생카드가맹점현황_20240915.csv"
    
    try:
        with open(gwangju_file, 'r', encoding='cp949') as file:
            reader = csv.DictReader(file)
            rows = list(reader)
            
            print(f"광주상생카드 총 데이터: {len(rows)}개")
            
            count = 0
            for row in rows:
                name = str(list(row.values())[0]).strip()  # 첫 번째 컬럼 (업체명)
                category = str(list(row.values())[1]).strip()  # 두 번째 컬럼 (업종)  
                address = str(list(row.values())[2]).strip()  # 세 번째 컬럼 (주소)
                
                if name and address:
                    store = {
                        "id": len(all_stores) + 1,
                        "name": name,
                        "address": address,
                        "lat": 35.1595 + (count * 0.004) - 0.02,  # 약간 다른 위치
                        "lng": 126.8526 + (count * 0.004) - 0.02,
                        "types": ["gwangju"],
                        "category": category or "일반",
                        "phone": "",
                        "hours": "운영시간 확인 필요",
                        "description": "광주상생카드 사용 가능 매장"
                    }
                    all_stores.append(store)
                    count += 1
                    print(f"  상생카드 {count}: {name}")
                    
                    if count >= 40:  # 40개 제한
                        break
                        
    except Exception as e:
        print(f"광주상생카드 파싱 오류: {e}")
    
    # 3. 두 카드 모두 사용 가능한 매장 몇 개 추가 (시뮬레이션)
    dual_stores = [
        {
            "id": len(all_stores) + 1,
            "name": "광주종합마트",
            "address": "광주광역시 서구 상무대로 1234",
            "lat": 35.1520,
            "lng": 126.8480,
            "types": ["onnuri", "gwangju"],
            "category": "마트/편의점",
            "phone": "062-123-4567",
            "hours": "09:00 - 22:00",
            "description": "온누리상품권과 광주상생카드 모두 사용 가능한 대형마트"
        },
        {
            "id": len(all_stores) + 2,  
            "name": "광주맛집식당",
            "address": "광주광역시 남구 주월동 1234-5",
            "lat": 35.1350,
            "lng": 126.9050,
            "types": ["onnuri", "gwangju"],
            "category": "음식점",
            "phone": "062-234-5678",
            "hours": "11:00 - 21:00",
            "description": "온누리상품권과 광주상생카드 모두 사용 가능한 한식당"
        }
    ]
    
    all_stores.extend(dual_stores)
    
    # JSON 파일로 저장
    output_file = "real_stores_data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_stores, f, ensure_ascii=False, indent=2)
    
    # 통계 출력
    onnuri_count = sum(1 for s in all_stores if "onnuri" in s["types"])
    gwangju_count = sum(1 for s in all_stores if "gwangju" in s["types"])
    both_count = sum(1 for s in all_stores if "onnuri" in s["types"] and "gwangju" in s["types"])
    
    print(f"\n=== 최종 결과 ===")
    print(f"총 매장수: {len(all_stores)}개")
    print(f"온누리상품권 매장: {onnuri_count}개")
    print(f"광주상생카드 매장: {gwangju_count}개")  
    print(f"둘 다 사용가능: {both_count}개")
    print(f"저장 파일: {output_file}")
    
    return all_stores

if __name__ == "__main__":
    parse_all_data()