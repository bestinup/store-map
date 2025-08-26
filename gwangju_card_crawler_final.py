#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
광주상생카드 가맹점 크롤링 스크립트 (최종 버전)
"""

import requests
import json
import csv
import time
from datetime import datetime

def crawl_gwangju_card_stores():
    """광주상생카드 가맹점 데이터를 크롤링합니다."""
    
    base_url = "https://www.gwangju.go.kr"
    api_endpoint = "/pg/getGjCardList.do"
    
    session = requests.Session()
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.gwangju.go.kr/economy/contentsView.do?pageId=economy129'
    }
    
    session.headers.update(headers)
    
    print("광주상생카드 가맹점 데이터 크롤링 시작...")
    
    # 메인 페이지 방문
    try:
        main_page = session.get(base_url + "/economy/contentsView.do?pageId=economy129")
        print(f"메인 페이지 접근 성공 (상태코드: {main_page.status_code})")
        time.sleep(1)
    except Exception as e:
        print(f"메인 페이지 접근 실패: {e}")
        return []
    
    all_stores = []
    page_num = 1
    max_pages = 100  # 제한적으로 100페이지만 (1000개 매장)
    
    while page_num <= max_pages:
        print(f"{page_num}페이지 크롤링 중...")
        
        form_data = {
            'pageNum': str(page_num),
            'pageSize': '10',
            'searchGu': '',
            'searchType': '',
            'searchWord': ''
        }
        
        try:
            response = session.post(base_url + api_endpoint, data=form_data)
            
            if response.status_code != 200:
                print(f"API 요청 실패 (상태코드: {response.status_code})")
                break
            
            try:
                data = response.json()
            except json.JSONDecodeError:
                print(f"JSON 파싱 실패 (페이지 {page_num})")
                break
            
            if data.get('error') == 'Y':
                print(f"서버 에러 응답: {data.get('message', '알 수 없는 오류')}")
                break
            
            if 'dataMap' in data and 'list' in data['dataMap']:
                store_list = data['dataMap']['list']
                
                if not store_list:
                    print(f"{page_num}페이지: 데이터 없음. 크롤링 완료.")
                    break
                
                print(f"{page_num}페이지: {len(store_list)}개 매장 발견")
                
                for store in store_list:
                    # JSON 필드명을 정확히 사용
                    store_info = {
                        'name': store.get('storeNm', '').strip(),
                        'address': store.get('storeAddr', '').strip(),
                        'district': store.get('gu', '').strip(),
                        'business_type': store.get('storeCtgy', '').strip(),
                        'phone': '',  # 전화번호 필드가 없음
                        'card_type': 'gwangju'
                    }
                    
                    if store_info['name'] and store_info['address']:
                        all_stores.append(store_info)
                        # 인코딩 문제로 매장 이름은 출력하지 않음
                        print(f"   매장 추가: {len(all_stores)}번째")
                
                total_count = data['dataMap'].get('totalCnt', 0)
                page_size = 10
                total_pages = min(max_pages, int((total_count + page_size - 1) // page_size))
                
                print(f"진행상황: {page_num}/{total_pages} 페이지, 현재 매장 수: {len(all_stores)}")
                
                if page_num >= total_pages:
                    print("지정된 페이지 크롤링 완료!")
                    break
                    
            else:
                print(f"예상하지 못한 응답 구조")
                break
                
        except Exception as e:
            print(f"오류 (페이지 {page_num}): {e}")
            break
        
        page_num += 1
        time.sleep(0.3)  # 서버 부하 방지
    
    print(f"크롤링 완료! 총 {len(all_stores)}개 매장 수집")
    return all_stores

def save_to_csv(stores, filename):
    """매장 데이터를 CSV 파일로 저장"""
    if not stores:
        print("저장할 데이터가 없습니다.")
        return False
    
    print(f"CSV 파일로 저장 중: {filename}")
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            fieldnames = ['name', 'address', 'district', 'business_type', 'phone', 'card_type']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            writer.writerows(stores)
        
        print(f"CSV 파일 저장 완료: {filename}")
        return True
    except Exception as e:
        print(f"CSV 파일 저장 실패: {e}")
        return False

def save_to_json(stores, filename):
    """매장 데이터를 JSON 파일로 저장"""
    if not stores:
        print("저장할 데이터가 없습니다.")
        return False
    
    print(f"JSON 파일로 저장 중: {filename}")
    
    try:
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(stores, jsonfile, ensure_ascii=False, indent=2)
        
        print(f"JSON 파일 저장 완료: {filename}")
        return True
    except Exception as e:
        print(f"JSON 파일 저장 실패: {e}")
        return False

def main():
    """메인 함수"""
    print("광주상생카드 가맹점 크롤러 시작")
    print("=" * 50)
    
    stores = crawl_gwangju_card_stores()
    
    if not stores:
        print("크롤링된 데이터가 없습니다.")
        return
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # CSV 파일로 저장
    csv_filename = f"gwangju_card_stores_{timestamp}.csv"
    save_to_csv(stores, csv_filename)
    
    # JSON 파일로 저장  
    json_filename = f"gwangju_card_stores_{timestamp}.json"
    save_to_json(stores, json_filename)
    
    print("\n크롤링 결과 통계:")
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
    
    print("\n프로그램 완료!")

if __name__ == "__main__":
    main()