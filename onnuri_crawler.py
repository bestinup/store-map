#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
온누리상품권 공식 사이트에서 광주광역시 가맹점 데이터 추출
사이트: https://www.sbiz.or.kr/sijangtong/nation/onnuri/onnuriMktList.do
"""

import requests
import json
import time
from bs4 import BeautifulSoup
import csv
from typing import List, Dict

class OnnuriCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html, */*; q=0.01',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'X-Requested-With': 'XMLHttpRequest'
        })
        self.base_url = "https://www.sbiz.or.kr"
        
    def get_regions(self):
        """지역 코드 정보 가져오기"""
        print("지역 코드 정보 조회 중...")
        
        # 메인 페이지에서 지역 정보 추출
        main_url = "https://www.sbiz.or.kr/sijangtong/nation/onnuri/onnuriMktList.do"
        response = self.session.get(main_url)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 시도 선택 옵션 찾기
            sido_select = soup.find('select', {'name': 'sido'})
            if sido_select:
                for option in sido_select.find_all('option'):
                    value = option.get('value', '')
                    text = option.get_text().strip()
                    if '광주' in text:
                        print(f"광주 지역 코드 발견: {value} - {text}")
                        return value
        
        # 광주광역시 코드 (일반적으로 사용되는 코드)
        return "29"  # 광주광역시 행정구역 코드
    
    def get_districts(self, sido_code):
        """특정 시도의 군구 목록 가져오기"""
        print(f"광주광역시(코드:{sido_code}) 구군 정보 조회 중...")
        
        # 구군 목록 조회 API
        district_url = f"{self.base_url}/sijangtong/nation/onnuri/getGunguList.do"
        
        params = {
            'sido': sido_code
        }
        
        try:
            response = self.session.get(district_url, params=params)
            if response.status_code == 200:
                # JSON 응답인지 확인
                try:
                    districts = response.json()
                    print(f"구군 목록 조회 성공: {len(districts)}개")
                    return districts
                except:
                    # HTML 응답일 경우 파싱
                    soup = BeautifulSoup(response.content, 'html.parser')
                    print("HTML 응답으로 파싱 시도")
                    return []
        except Exception as e:
            print(f"구군 목록 조회 실패: {e}")
            
        # 기본 광주 구군 목록 (수동 입력)
        return [
            {'code': '29010', 'name': '동구'},
            {'code': '29020', 'name': '서구'}, 
            {'code': '29030', 'name': '남구'},
            {'code': '29040', 'name': '북구'},
            {'code': '29050', 'name': '광산구'}
        ]
    
    def search_stores(self, sido_code="29", gungu_code="", page=1):
        """가맹점 검색 API 호출"""
        print(f"가맹점 검색 중... (시도:{sido_code}, 군구:{gungu_code}, 페이지:{page})")
        
        # Ajax 검색 API
        search_url = f"{self.base_url}/sijangtong/nation/onnuri/onnuriMktListAjax.do"
        
        # 검색 파라미터
        data = {
            'sido': sido_code,           # 광주광역시 코드
            'gungu': gungu_code,         # 구군 코드 (빈값은 전체)
            'sijang': '',                # 시장명 (빈값은 전체)
            'searchType': 'A',          # 검색 타입
            'searchKeyword': '',         # 검색 키워드
            'currentPageNo': str(page),  # 페이지 번호
            'recordCountPerPage': '100'  # 페이지당 결과 수
        }
        
        try:
            response = self.session.post(search_url, data=data, timeout=10)
            
            if response.status_code == 200:
                print(f"API 호출 성공 (페이지 {page})")
                return response.text
            else:
                print(f"API 호출 실패: HTTP {response.status_code}")
                return None
                
        except Exception as e:
            print(f"검색 요청 오류: {e}")
            return None
    
    def parse_search_results(self, html_content):
        """검색 결과 HTML 파싱"""
        if not html_content:
            return []
            
        stores = []
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 테이블 행 찾기
        rows = soup.find_all('tr')
        
        for row in rows:
            cells = row.find_all('td')
            
            if len(cells) >= 6:  # 충분한 컬럼이 있는 경우
                try:
                    # 데이터 추출
                    store_name = cells[0].get_text().strip()
                    market_name = cells[1].get_text().strip() 
                    address = cells[2].get_text().strip()
                    category = cells[3].get_text().strip()
                    
                    # 상품권 유형 (체크박스나 아이콘으로 표시)
                    card_types = []
                    if '종이' in cells[4].get_text() or '지류' in cells[4].get_text():
                        card_types.append('paper')
                    if '카드' in cells[4].get_text() or '충전식' in cells[4].get_text():
                        card_types.append('card')  
                    if '모바일' in cells[5].get_text():
                        card_types.append('mobile')
                    
                    if store_name and '광주' in address:
                        store_data = {
                            'name': store_name,
                            'market_name': market_name,
                            'address': address,
                            'category': category,
                            'card_types': card_types,
                            'source': 'onnuri_official'
                        }
                        stores.append(store_data)
                        print(f"  매장 발견: {store_name}")
                        
                except Exception as e:
                    print(f"  행 파싱 오류: {e}")
                    continue
        
        return stores
    
    def crawl_gwangju_stores(self):
        """광주광역시 온누리상품권 가맹점 전체 크롤링"""
        print("=== 온누리상품권 광주광역시 가맹점 크롤링 시작 ===")
        
        all_stores = []
        
        # 광주광역시 코드 확인
        gwangju_code = self.get_regions()
        
        # 전체 검색 (구군 구분 없이)
        print("\n전체 광주 지역 검색...")
        for page in range(1, 10):  # 최대 10페이지까지
            html_result = self.search_stores(sido_code=gwangju_code, page=page)
            
            if html_result:
                page_stores = self.parse_search_results(html_result)
                
                if not page_stores:  # 더 이상 결과가 없으면 중단
                    print(f"페이지 {page}에서 결과 없음. 검색 완료")
                    break
                    
                all_stores.extend(page_stores)
                print(f"페이지 {page}: {len(page_stores)}개 매장 수집")
                
                # API 호출 간격 (서버 부하 방지)
                time.sleep(1)
            else:
                print(f"페이지 {page} 검색 실패")
                break
        
        # 구군별 상세 검색 (추가 데이터 수집)
        districts = self.get_districts(gwangju_code)
        
        for district in districts:
            if isinstance(district, dict):
                district_code = district.get('code', '')
                district_name = district.get('name', '')
            else:
                continue
                
            print(f"\n{district_name} 상세 검색...")
            
            for page in range(1, 5):  # 구군별 최대 5페이지
                html_result = self.search_stores(
                    sido_code=gwangju_code, 
                    gungu_code=district_code, 
                    page=page
                )
                
                if html_result:
                    page_stores = self.parse_search_results(html_result)
                    
                    if not page_stores:
                        break
                        
                    # 중복 제거
                    for store in page_stores:
                        if not any(s['name'] == store['name'] and s['address'] == store['address'] for s in all_stores):
                            all_stores.append(store)
                    
                    time.sleep(0.5)  # 짧은 간격
                else:
                    break
        
        print(f"\n=== 크롤링 완료: 총 {len(all_stores)}개 매장 수집 ===")
        return all_stores
    
    def save_to_json(self, stores, filename="onnuri_gwangju_official.json"):
        """JSON 파일로 저장"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(stores, f, ensure_ascii=False, indent=2)
        print(f"데이터 저장 완료: {filename}")
    
    def save_to_csv(self, stores, filename="onnuri_gwangju_official.csv"):
        """CSV 파일로 저장"""
        if not stores:
            print("저장할 데이터가 없습니다.")
            return
            
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=stores[0].keys())
            writer.writeheader()
            writer.writerows(stores)
        print(f"CSV 저장 완료: {filename}")

def main():
    """메인 실행 함수"""
    crawler = OnnuriCrawler()
    
    try:
        # 광주 가맹점 크롤링
        gwangju_stores = crawler.crawl_gwangju_stores()
        
        if gwangju_stores:
            # 파일 저장
            crawler.save_to_json(gwangju_stores)
            crawler.save_to_csv(gwangju_stores)
            
            # 통계 출력
            print(f"\n=== 수집 통계 ===")
            print(f"총 매장 수: {len(gwangju_stores)}")
            
            # 카테고리별 통계
            categories = {}
            for store in gwangju_stores:
                cat = store.get('category', '기타')
                categories[cat] = categories.get(cat, 0) + 1
            
            print("\n카테고리별 분포:")
            for cat, count in sorted(categories.items()):
                print(f"  {cat}: {count}개")
                
        else:
            print("수집된 데이터가 없습니다.")
            
    except Exception as e:
        print(f"크롤링 중 오류 발생: {e}")

if __name__ == "__main__":
    main()