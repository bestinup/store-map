#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv

def debug_csv():
    print("=== CSV 구조 분석 ===")
    
    # 온누리상품권 파일 분석
    onnuri_file = "소상공인시장진흥공단_전국 온누리상품권 가맹점 현황_20240731.csv"
    
    try:
        with open(onnuri_file, 'r', encoding='cp949') as file:
            reader = csv.DictReader(file)
            rows = list(reader)
            
            print(f"\n온누리상품권 파일:")
            print(f"총 행수: {len(rows)}")
            print(f"컬럼들: {list(rows[0].keys())}")
            
            print(f"\n처음 3행 데이터:")
            for i, row in enumerate(rows[:3]):
                print(f"행 {i+1}:")
                for key, value in row.items():
                    print(f"  {key}: {value}")
                print()
            
            # 광주 지역 검색
            print(f"\n광주 지역 매장 검색:")
            gwangju_count = 0
            for i, row in enumerate(rows):
                for key, value in row.items():
                    if '광주' in str(value):
                        print(f"  발견! 행 {i+1}, {key}: {value}")
                        gwangju_count += 1
                        if gwangju_count >= 5:  # 처음 5개만
                            break
                if gwangju_count >= 5:
                    break
    
    except Exception as e:
        print(f"온누리상품권 파일 분석 실패: {e}")

if __name__ == "__main__":
    debug_csv()