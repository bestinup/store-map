#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
온누리상품권 가맹점 크롤링 스크립트
API 엔드포인트: /sijangtong/nation/onnuri/onnuriMktListAjax.do
"""

import requests
import json
import csv
import time
from datetime import datetime
from bs4 import BeautifulSoup
import re

def get_location_codes():
    """시/도 및 시/군/구 코드를 가져옵니다."""
    # 광주광역시 코드 (실제 사이트에서 확인한 값)
    locations = {
        '광주광역시': {
            'sido_code': '062',  # 광주광역시 코드
            'districts': {
                '동구': '001',
                '서구': '002',
                '남구': '003',
                '북구': '004',
                '광산구': '005'
            }
        }
    }
    return locations

def crawl_onnuri_stores():
    """온누리상품권 가맹점 데이터를 크롤링합니다."""
    
    base_url = "https://www.sbiz.or.kr"
    api_endpoint = "/sijangtong/nation/onnuri/onnuriMktListAjax.do"
    
    # 세션 생성
    session = requests.Session()
    
    # 헤더 설정
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.sbiz.or.kr/sijangtong/nation/onnuri/onnuriMktList.do'
    }
    
    session.headers.update(headers)
    
    print("🔍 온누리상품권 가맹점 데이터 크롤링 시작...")
    
    # 메인 페이지 방문
    try:
        main_page = session.get(base_url + "/sijangtong/nation/onnuri/onnuriMktList.do?menu_type_a=A&menu_cms=&menu_id=070400")
        print(f"✅ 메인 페이지 접근 성공 (상태코드: {main_page.status_code})")
        time.sleep(1)
    except Exception as e:
        print(f"❌ 메인 페이지 접근 실패: {e}")
        return []
    
    all_stores = []
    locations = get_location_codes()
    
    # 광주광역시의 각 구별로 크롤링
    for city_name, city_info in locations.items():
        print(f"\n🏙️ {city_name} 크롤링 시작...")
        
        for district_name, district_code in city_info['districts'].items():
            print(f"📍 {district_name} 크롤링 중...")
            
            page_num = 1
            max_pages = 50
            
            while page_num <= max_pages:
                print(f"   📄 {page_num}페이지...")
                
                # 검색 파라미터 설정
                form_data = {
                    'cpage': str(page_num),
                    'cIdx': '20',  # 페이지당 20개
                    'searchKind': 'mktName',  # 시장명으로 검색
                    'searchText': '',
                    'txtKey': 'mktName',
                    'txtParam': '',
                    'sido': city_info['sido_code'],  # 광주광역시 코드
                    'sgg': district_code,            # 구 코드
                    'mkt': '',
                    'shopType': '',
                    'cardCd': '04'  # 모든 카드 유형
                }
                
                try:
                    # API 요청
                    response = session.post(base_url + api_endpoint, data=form_data)
                    
                    if response.status_code != 200:
                        print(f"      ❌ API 요청 실패 (상태코드: {response.status_code})")
                        break
                    
                    # HTML 응답 파싱
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # 매장 목록 테이블 찾기
                    rows = soup.find_all('tr')
                    current_page_stores = []
                    
                    for row in rows:
                        cells = row.find_all('td')
                        if len(cells) >= 6:  # 충분한 컬럼이 있는 경우
                            try:
                                # 데이터 추출
                                sequence = cells[0].get_text(strip=True)
                                market_name = cells[1].get_text(strip=True)
                                store_name = cells[2].get_text(strip=True)
                                store_type = cells[3].get_text(strip=True)
                                address = cells[4].get_text(strip=True)
                                phone = cells[5].get_text(strip=True) if len(cells) > 5 else ''
                                
                                # 숫자 시퀀스가 있는 유효한 데이터인지 확인
                                if sequence.isdigit() and store_name and address:
                                    store_info = {
                                        'name': store_name,
                                        'address': address,
                                        'district': district_name,
                                        'market_name': market_name,
                                        'business_type': store_type,
                                        'phone': phone,
                                        'card_type': 'onnuri'
                                    }
                                    
                                    current_page_stores.append(store_info)
                                    all_stores.append(store_info)
                                    print(f"      📍 {store_name} - {store_type}")
                            
                            except Exception as e:
                                print(f"      ⚠️ 데이터 파싱 오류: {e}")
                                continue
                    
                    if not current_page_stores:
                        print(f"      ✅ {district_name} {page_num}페이지: 데이터 없음. 다음 구로 이동.")
                        break
                    
                    print(f"      ✅ {district_name} {page_num}페이지: {len(current_page_stores)}개 매장 발견")
                    
                    # 페이지네이션 체크 (다음 페이지가 있는지 확인)
                    pagination = soup.find('div', class_='paging')
                    if pagination and '다음' not in pagination.get_text():
                        print(f"      ✅ {district_name} 마지막 페이지 도달")
                        break
                    
                except requests.RequestException as e:
                    print(f"      ❌ 네트워크 오류 (페이지 {page_num}): {e}")
                    break
                except Exception as e:
                    print(f"      ❌ 예상하지 못한 오류 (페이지 {page_num}): {e}")
                    break
                
                page_num += 1
                time.sleep(0.5)  # 서버 부하 방지
            
            print(f"   ✅ {district_name} 완료: {len([s for s in all_stores if s['district'] == district_name])}개 매장")
            time.sleep(1)  # 구 변경 시 대기
    
    print(f"\n🎉 온누리상품권 크롤링 완료! 총 {len(all_stores)}개 매장 수집")
    return all_stores

def save_to_csv(stores, filename):
    """매장 데이터를 CSV 파일로 저장합니다."""
    if not stores:
        print("❌ 저장할 데이터가 없습니다.")
        return False
    
    print(f"💾 CSV 파일로 저장 중: {filename}")
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            fieldnames = ['name', 'address', 'district', 'market_name', 'business_type', 'phone', 'card_type']
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
    print("🚀 온누리상품권 가맹점 크롤러 시작")
    print("=" * 50)
    
    # 크롤링 실행
    stores = crawl_onnuri_stores()
    
    if not stores:
        print("❌ 크롤링된 데이터가 없습니다.")
        return
    
    # 현재 시간으로 파일명 생성
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # CSV 파일로 저장
    csv_filename = f"onnuri_stores_{timestamp}.csv"
    save_to_csv(stores, csv_filename)
    
    # JSON 파일로 저장
    json_filename = f"onnuri_stores_{timestamp}.json"
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