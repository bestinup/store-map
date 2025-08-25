#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
온누리상품권 및 광주상생카드 CSV 파일을 파싱하여 JSON으로 변환하는 스크립트
"""

import csv
import json
import requests
import time
from typing import List, Dict, Optional

# 카카오 API 키 (주소 → 좌표 변환용)
KAKAO_API_KEY = "e2cdc03631e56cf5477a5fae91ffa305"

def read_csv_with_encoding(file_path: str, encodings: List[str] = ['utf-8', 'cp949', 'euc-kr']) -> List[Dict]:
    """
    여러 인코딩으로 CSV 파일 읽기 시도
    """
    for encoding in encodings:
        try:
            print(f"{encoding} 인코딩으로 파일 읽기 시도: {file_path}")
            with open(file_path, 'r', encoding=encoding) as file:
                # CSV 내용 미리보기
                content = file.read()
                print(f"{encoding} 인코딩 성공!")
                
                # 파일 포인터를 처음으로 되돌림
                file.seek(0)
                
                # CSV 리더로 읽기
                csv_reader = csv.DictReader(file)
                rows = list(csv_reader)
                
                print(f"총 {len(rows)}개 행 읽기 완료")
                print(f"컬럼: {list(rows[0].keys()) if rows else '없음'}")
                
                return rows
                
        except UnicodeDecodeError:
            print(f"{encoding} 인코딩 실패")
            continue
        except Exception as e:
            print(f"파일 읽기 오류 ({encoding}): {e}")
            continue
    
    raise Exception("모든 인코딩 방식으로 파일 읽기 실패")

def geocode_address(address: str) -> Optional[Dict[str, float]]:
    """
    카카오 API를 사용하여 주소를 좌표로 변환
    """
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {
        "Authorization": f"KakaoAK {KAKAO_API_KEY}"
    }
    params = {
        "query": address
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        if data.get('documents'):
            doc = data['documents'][0]
            return {
                "lat": float(doc['y']),
                "lng": float(doc['x'])
            }
        return None
        
    except Exception as e:
        print(f"🔍 주소 변환 실패 ({address}): {e}")
        return None

def parse_onnuri_csv(file_path: str, limit: int = 100) -> List[Dict]:
    """
    온누리상품권 CSV 파일 파싱
    """
    print(f"🏪 온누리상품권 데이터 파싱 시작...")
    
    rows = read_csv_with_encoding(file_path)
    
    # 광주지역 데이터만 필터링
    gwangju_stores = []
    processed = 0
    
    for row in rows:
        # 컬럼명 확인 (실제 CSV 구조에 맞게 수정 필요)
        columns = list(row.keys())
        print(f"📋 컬럼 구조: {columns[:3]}...")  # 처음 3개만 표시
        
        # 광주 지역 필터링
        address_col = None
        name_col = None
        category_col = None
        
        # 컬럼명 추정
        for col in columns:
            if '주소' in col or '소재지' in col:
                address_col = col
            if '상호' in col or '가맹점' in col or '점포' in col:
                name_col = col
            if '업종' in col or '품목' in col:
                category_col = col
        
        if not all([address_col, name_col]):
            print("❌ 필요한 컬럼을 찾을 수 없습니다.")
            break
            
        address = row.get(address_col, '').strip()
        name = row.get(name_col, '').strip()
        
        # 광주 지역만 필터링
        if '광주' in address and name:
            print(f"🏪 광주 매장 발견: {name}")
            
            # 좌표 변환 (API 호출 제한을 위해 일부만)
            coords = None
            if processed < limit:
                coords = geocode_address(address)
                time.sleep(0.1)  # API 호출 간격
            
            store_data = {
                "id": len(gwangju_stores) + 1,
                "name": name,
                "address": address,
                "lat": coords["lat"] if coords else 35.1595,  # 기본 광주 좌표
                "lng": coords["lng"] if coords else 126.8526,
                "types": ["onnuri"],
                "category": row.get(category_col, '일반').strip() if category_col else '일반',
                "phone": "",
                "hours": "정보 없음",
                "description": "온누리상품권 사용 가능 매장"
            }
            
            gwangju_stores.append(store_data)
            processed += 1
            
            if processed >= limit:
                print(f"⚠️ 제한({limit}개)에 도달하여 중단")
                break
    
    print(f"✅ 온누리상품권 광주 매장 {len(gwangju_stores)}개 파싱 완료")
    return gwangju_stores

def parse_gwangju_csv(file_path: str, limit: int = 100) -> List[Dict]:
    """
    광주상생카드 CSV 파일 파싱
    """
    print(f"🏪 광주상생카드 데이터 파싱 시작...")
    
    rows = read_csv_with_encoding(file_path)
    
    if not rows:
        return []
    
    # 컬럼 구조 확인
    columns = list(rows[0].keys())
    print(f"📋 컬럼 구조: {columns}")
    
    stores = []
    processed = 0
    
    for row in rows[:limit]:  # 제한된 수만 처리
        # 컬럼명 추정
        name_col = columns[0]  # 첫 번째 컬럼이 보통 상호명
        category_col = columns[1] if len(columns) > 1 else None
        address_col = columns[2] if len(columns) > 2 else None
        
        name = row.get(name_col, '').strip()
        address = row.get(address_col, '').strip()
        category = row.get(category_col, '').strip() if category_col else '일반'
        
        if name and address:
            print(f"🏪 광주상생카드 매장: {name}")
            
            # 좌표 변환
            coords = geocode_address(address)
            if coords is None:
                # 광주 시내 랜덤 좌표 생성
                import random
                coords = {
                    "lat": 35.1595 + random.uniform(-0.05, 0.05),
                    "lng": 126.8526 + random.uniform(-0.05, 0.05)
                }
            
            time.sleep(0.1)  # API 호출 간격
            
            store_data = {
                "id": len(stores) + 1000,  # 온누리상품권과 구분
                "name": name,
                "address": address,
                "lat": coords["lat"],
                "lng": coords["lng"],
                "types": ["gwangju"],
                "category": category,
                "phone": "",
                "hours": "정보 없음", 
                "description": "광주상생카드 사용 가능 매장"
            }
            
            stores.append(store_data)
            processed += 1
    
    print(f"✅ 광주상생카드 매장 {len(stores)}개 파싱 완료")
    return stores

def main():
    """
    메인 실행 함수
    """
    print("CSV 파일 파싱 시작...")
    
    # 파일 경로
    onnuri_file = "소상공인시장진흥공단_전국 온누리상품권 가맹점 현황_20240731.csv"
    gwangju_file = "광주광역시_상생카드가맹점현황_20240915.csv"
    
    all_stores = []
    
    # 온누리상품권 데이터 파싱
    try:
        onnuri_stores = parse_onnuri_csv(onnuri_file, limit=50)
        all_stores.extend(onnuri_stores)
    except Exception as e:
        print(f"❌ 온누리상품권 파일 파싱 실패: {e}")
    
    # 광주상생카드 데이터 파싱
    try:
        gwangju_stores = parse_gwangju_csv(gwangju_file, limit=50)
        all_stores.extend(gwangju_stores)
    except Exception as e:
        print(f"❌ 광주상생카드 파일 파싱 실패: {e}")
    
    # JSON 파일로 저장
    if all_stores:
        output_file = "real_stores_data.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_stores, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 총 {len(all_stores)}개 매장 데이터를 {output_file}에 저장완료")
        
        # 통계 출력
        onnuri_count = len([s for s in all_stores if "onnuri" in s["types"]])
        gwangju_count = len([s for s in all_stores if "gwangju" in s["types"]])
        
        print(f"📊 통계:")
        print(f"   온누리상품권: {onnuri_count}개")
        print(f"   광주상생카드: {gwangju_count}개")
        
    else:
        print("❌ 파싱된 데이터가 없습니다.")

if __name__ == "__main__":
    main()