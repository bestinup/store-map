#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
광주상생카드 가맹점 크롤링 스크립트
API 엔드포인트: /pg/getGjCardList.do
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
    
    # 세션 생성 (쿠키 유지용)
    session = requests.Session()
    
    # 헤더 설정 (실제 브라우저처럼 보이게)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.gwangju.go.kr/economy/contentsView.do?pageId=economy129'
    }
    
    session.headers.update(headers)
    
    print("🔍 광주상생카드 가맹점 데이터 크롤링 시작...")
    
    # 먼저 메인 페이지 방문 (세션 설정용)
    try:
        main_page = session.get(base_url + "/economy/contentsView.do?pageId=economy129")
        print(f"✅ 메인 페이지 접근 성공 (상태코드: {main_page.status_code})")
        time.sleep(1)
    except Exception as e:
        print(f"❌ 메인 페이지 접근 실패: {e}")
        return []
    
    all_stores = []
    
    # 페이지별로 데이터 수집
    page_num = 1
    max_pages = 100  # 최대 페이지 수 제한
    
    while page_num <= max_pages:
        print(f"📄 {page_num}페이지 크롤링 중...")
        
        # API 요청 데이터 (실제 웹사이트에서 사용하는 형태)
        form_data = {
            'pageNum': str(page_num),
            'pageSize': '10',  # 한 페이지당 10개씩
            'searchGu': '',    # 구 필터 (전체)
            'searchType': '',  # 업종 필터 (전체)
            'searchWord': ''   # 검색어 (전체)
        }
        
        try:
            # API 요청
            response = session.post(base_url + api_endpoint, data=form_data)
            
            if response.status_code != 200:
                print(f"❌ API 요청 실패 (상태코드: {response.status_code})")
                break
            
            # JSON 응답 파싱
            try:
                data = response.json()
            except json.JSONDecodeError:
                print(f"❌ JSON 파싱 실패 (페이지 {page_num})")
                print(f"응답 내용: {response.text[:200]}...")
                break
            
            # 에러 체크
            if data.get('error') == 'Y':
                print(f"❌ 서버 에러 응답: {data.get('message', '알 수 없는 오류')}")
                break
            
            # 데이터 추출
            if 'dataMap' in data and 'list' in data['dataMap']:
                store_list = data['dataMap']['list']
                
                if not store_list:
                    print(f"✅ {page_num}페이지: 데이터 없음. 크롤링 완료.")
                    break
                
                print(f"✅ {page_num}페이지: {len(store_list)}개 매장 발견")
                
                # 매장 정보 처리
                for store in store_list:
                    store_info = {
                        'name': store.get('storeName', '').strip(),
                        'address': store.get('storeAddr', '').strip(),
                        'district': store.get('gu', '').strip(),
                        'business_type': store.get('storeType', '').strip(),
                        'phone': store.get('storeTel', '').strip(),
                        'card_type': 'gwangju'
                    }
                    
                    # 빈 데이터 체크
                    if store_info['name'] and store_info['address']:
                        all_stores.append(store_info)
                        print(f"   📍 {store_info['name']} ({store_info['district']}) - {store_info['business_type']}")
                
                # 총 페이지 수 확인
                total_count = data['dataMap'].get('totalCount', 0)
                page_size = 10
                total_pages = (total_count + page_size - 1) // page_size
                
                print(f"📊 진행상황: {page_num}/{total_pages} 페이지, 총 매장 수: {len(all_stores)}/{total_count}")
                
                if page_num >= total_pages:
                    print("✅ 모든 페이지 크롤링 완료!")
                    break
                    
            else:
                print(f"❌ 예상하지 못한 응답 구조: {data}")
                break
                
        except requests.RequestException as e:
            print(f"❌ 네트워크 오류 (페이지 {page_num}): {e}")
            break
        except Exception as e:
            print(f"❌ 예상하지 못한 오류 (페이지 {page_num}): {e}")
            break
        
        page_num += 1
        time.sleep(0.5)  # 서버 부하 방지
    
    print(f"\n🎉 크롤링 완료! 총 {len(all_stores)}개 매장 수집")
    return all_stores

def save_to_csv(stores, filename):
    """매장 데이터를 CSV 파일로 저장합니다."""
    if not stores:
        print("❌ 저장할 데이터가 없습니다.")
        return False
    
    print(f"💾 CSV 파일로 저장 중: {filename}")
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            fieldnames = ['name', 'address', 'district', 'business_type', 'phone', 'card_type']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            writer.writerows(stores)
        
        print(f"✅ CSV 파일 저장 완료: {filename}")
        return True
    except Exception as e:
        print(f"❌ CSV 파일 저장 실패: {e}")
        return False

def save_to_json(stores, filename):
    """매장 데이터를 JSON 파일로 저장합니다."""
    if not stores:
        print("❌ 저장할 데이터가 없습니다.")
        return False
    
    print(f"💾 JSON 파일로 저장 중: {filename}")
    
    try:
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(stores, jsonfile, ensure_ascii=False, indent=2)
        
        print(f"✅ JSON 파일 저장 완료: {filename}")
        return True
    except Exception as e:
        print(f"❌ JSON 파일 저장 실패: {e}")
        return False

def main():
    """메인 함수"""
    print("광주상생카드 가맹점 크롤러 시작")
    print("=" * 50)
    
    # 크롤링 실행
    stores = crawl_gwangju_card_stores()
    
    if not stores:
        print("❌ 크롤링된 데이터가 없습니다.")
        return
    
    # 현재 시간으로 파일명 생성
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # CSV 파일로 저장
    csv_filename = f"gwangju_card_stores_{timestamp}.csv"
    save_to_csv(stores, csv_filename)
    
    # JSON 파일로 저장
    json_filename = f"gwangju_card_stores_{timestamp}.json"
    save_to_json(stores, json_filename)
    
    # 통계 출력
    print("\n📊 크롤링 결과 통계:")
    print("=" * 30)
    print(f"총 매장 수: {len(stores)}")
    
    # 구별 통계
    district_count = {}
    for store in stores:
        district = store['district']
        district_count[district] = district_count.get(district, 0) + 1
    
    print("\n📍 구별 매장 수:")
    for district, count in sorted(district_count.items()):
        if district:
            print(f"  {district}: {count}개")
    
    # 업종별 통계
    business_count = {}
    for store in stores:
        business_type = store['business_type']
        business_count[business_type] = business_count.get(business_type, 0) + 1
    
    print("\n🏪 업종별 매장 수 (상위 10개):")
    sorted_business = sorted(business_count.items(), key=lambda x: x[1], reverse=True)[:10]
    for business_type, count in sorted_business:
        if business_type:
            print(f"  {business_type}: {count}개")
    
    print("\n✅ 프로그램 완료!")

if __name__ == "__main__":
    main()