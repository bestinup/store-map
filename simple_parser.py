#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import json
import os

def read_csv_file(file_path, encodings=['utf-8', 'cp949', 'euc-kr']):
    """CSV 파일을 다양한 인코딩으로 읽기 시도"""
    for encoding in encodings:
        try:
            print(f"시도중: {encoding} 인코딩")
            with open(file_path, 'r', encoding=encoding) as file:
                reader = csv.DictReader(file)
                rows = list(reader)
                print(f"성공: {len(rows)}개 행 읽음")
                if rows:
                    print(f"컬럼: {list(rows[0].keys())[:3]}...")
                return rows
        except:
            continue
    return []

def main():
    print("=== CSV 파싱 시작 ===")
    
    # 온누리상품권 데이터
    onnuri_file = "소상공인시장진흥공단_전국 온누리상품권 가맹점 현황_20240731.csv"
    gwangju_file = "광주광역시_상생카드가맹점현황_20240915.csv"
    
    all_stores = []
    
    # 온누리상품권 파싱
    if os.path.exists(onnuri_file):
        print(f"\n온누리상품권 파일 처리: {onnuri_file}")
        rows = read_csv_file(onnuri_file)
        
        # 광주 지역만 필터링
        count = 0
        for i, row in enumerate(rows[:200]):  # 처음 200개만 확인
            # 주소 컬럼 찾기
            address = ""
            name = ""
            
            for key, value in row.items():
                if '주소' in key or '소재지' in key:
                    address = str(value).strip()
                if '상호' in key or '가맹점' in key or '업소' in key:
                    name = str(value).strip()
            
            # 광주 지역만 선택
            if address and '광주' in address and name:
                store = {
                    "id": len(all_stores) + 1,
                    "name": name,
                    "address": address,
                    "lat": 35.1595 + (count * 0.01),  # 임시 좌표
                    "lng": 126.8526 + (count * 0.01),
                    "types": ["onnuri"],
                    "category": "일반",
                    "phone": "",
                    "hours": "정보없음",
                    "description": "온누리상품권 사용가능"
                }
                all_stores.append(store)
                count += 1
                print(f"  광주매장 {count}: {name}")
                
                if count >= 30:  # 30개만 수집
                    break
    
    # 광주상생카드 파싱
    if os.path.exists(gwangju_file):
        print(f"\n광주상생카드 파일 처리: {gwangju_file}")
        rows = read_csv_file(gwangju_file)
        
        count = 0
        for i, row in enumerate(rows[:100]):  # 처음 100개만
            values = list(row.values())
            if len(values) >= 3:
                name = str(values[0]).strip()
                category = str(values[1]).strip()
                address = str(values[2]).strip()
                
                if name and address and '광주' in address:
                    store = {
                        "id": len(all_stores) + 1,
                        "name": name,
                        "address": address,
                        "lat": 35.1595 + (count * 0.008),  # 임시 좌표
                        "lng": 126.8526 + (count * 0.008),
                        "types": ["gwangju"],
                        "category": category or "일반",
                        "phone": "",
                        "hours": "정보없음",
                        "description": "광주상생카드 사용가능"
                    }
                    all_stores.append(store)
                    count += 1
                    print(f"  상생카드 {count}: {name}")
                    
                    if count >= 30:  # 30개만 수집
                        break
    
    # JSON 저장
    if all_stores:
        output_file = "real_stores_data.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_stores, f, ensure_ascii=False, indent=2)
        
        onnuri_count = sum(1 for s in all_stores if "onnuri" in s["types"])
        gwangju_count = sum(1 for s in all_stores if "gwangju" in s["types"])
        
        print(f"\n=== 완료 ===")
        print(f"총 매장수: {len(all_stores)}")
        print(f"온누리상품권: {onnuri_count}")
        print(f"광주상생카드: {gwangju_count}")
        print(f"저장파일: {output_file}")
    else:
        print("파싱된 데이터가 없습니다.")

if __name__ == "__main__":
    main()