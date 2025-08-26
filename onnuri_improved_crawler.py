#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
온누리상품권 공식 사이트 개선된 크롤러
실제 웹사이트 구조에 맞춰 수정
"""

import requests
import json
import time
from bs4 import BeautifulSoup
import re
from typing import List, Dict

class ImprovedOnnuriCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        self.base_url = "https://www.sbiz.or.kr"
        
    def get_initial_page(self):
        """초기 페이지 로드 및 세션 설정"""
        print("초기 페이지 로드 중...")
        
        main_url = "https://www.sbiz.or.kr/sijangtong/nation/onnuri/onnuriMktList.do"
        
        try:
            response = self.session.get(main_url, timeout=15)
            
            if response.status_code == 200:
                print("초기 페이지 로드 성공")
                
                # 페이지에서 시도 코드 추출
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # 광주광역시 코드 찾기
                sido_select = soup.find('select', {'id': 'city_cd'})
                if sido_select:
                    for option in sido_select.find_all('option'):
                        text = option.get_text().strip()
                        value = option.get('value', '')
                        if '광주' in text and value:
                            print(f"광주광역시 코드 발견: {value} - {text}")
                            return value
                            
                # 광주광역시 표준 코드
                return "8"  # 일반적인 광주광역시 코드
                
        except Exception as e:
            print(f"초기 페이지 로드 실패: {e}")
            return "8"
    
    def search_gwangju_stores(self, city_code="8"):
        """광주광역시 가맹점 검색"""
        print(f"광주광역시(코드:{city_code}) 가맹점 검색 중...")
        
        # Ajax 검색 URL
        ajax_url = f"{self.base_url}/sijangtong/nation/onnuri/onnuriMktListAjax.do"
        
        all_stores = []
        
        # 다양한 검색 방식으로 시도
        search_configs = [
            {
                'city_cd': city_code,
                'county_cd': '',
                'shop_table': 'SJTT.MKT_PAPER_SHOP',
                'txtKey': '',  
                'txtParam': '광주',
                'cpage': '1'
            },
            {
                'city_cd': city_code,
                'county_cd': '',
                'shop_table': 'SJTT.MKT_CARD_SHOP', 
                'txtKey': '',
                'txtParam': '광주',
                'cpage': '1'
            },
            {
                'city_cd': city_code,
                'county_cd': '',
                'shop_table': 'SJTT.MKT_MOBILE_SHOP',
                'txtKey': '',
                'txtParam': '광주', 
                'cpage': '1'
            }
        ]
        
        for config in search_configs:
            print(f"검색 설정: {config['shop_table']}")
            
            try:
                response = self.session.post(
                    ajax_url, 
                    data=config,
                    headers={
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Referer': 'https://www.sbiz.or.kr/sijangtong/nation/onnuri/onnuriMktList.do'
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    print(f"  API 호출 성공: {len(response.text)} bytes")
                    
                    # 응답 파싱
                    stores = self.parse_ajax_response(response.text, config['shop_table'])
                    all_stores.extend(stores)
                    
                    print(f"  추출된 매장: {len(stores)}개")
                else:
                    print(f"  API 호출 실패: {response.status_code}")
                    
            except Exception as e:
                print(f"  검색 오류: {e}")
                
            time.sleep(1)  # API 호출 간격
        
        print(f"\n총 수집된 매장: {len(all_stores)}개")
        return all_stores
    
    def parse_ajax_response(self, html_content, shop_type):
        """Ajax 응답 HTML 파싱"""
        stores = []
        
        if not html_content.strip():
            print("  빈 응답")
            return stores
            
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 테이블이나 목록에서 매장 정보 추출
        # 여러 가능한 구조를 시도
        
        # 방법 1: 테이블 행
        table_rows = soup.find_all('tr')
        for row in table_rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 3:  # 최소 3개 컬럼
                try:
                    texts = [cell.get_text().strip() for cell in cells]
                    
                    # 광주 관련 데이터만 필터링
                    if any('광주' in text for text in texts):
                        store_data = {
                            'name': texts[0] if len(texts) > 0 else '',
                            'market': texts[1] if len(texts) > 1 else '',
                            'address': texts[2] if len(texts) > 2 else '',
                            'category': texts[3] if len(texts) > 3 else '',
                            'shop_type': shop_type,
                            'source': 'onnuri_official'
                        }
                        
                        if store_data['name'] and '광주' in store_data['address']:
                            stores.append(store_data)
                            print(f"    매장: {store_data['name']} - {store_data['address']}")
                            
                except Exception as e:
                    continue
        
        # 방법 2: 리스트 아이템
        list_items = soup.find_all(['li', 'div'], class_=re.compile(r'(item|store|shop|list)', re.I))
        for item in list_items:
            text_content = item.get_text().strip()
            if '광주' in text_content:
                # 텍스트에서 정보 추출 시도
                lines = [line.strip() for line in text_content.split('\n') if line.strip()]
                if len(lines) >= 2:
                    stores.append({
                        'name': lines[0],
                        'address': next((line for line in lines if '광주' in line), ''),
                        'shop_type': shop_type,
                        'source': 'onnuri_official_list'
                    })
        
        return stores
    
    def try_direct_search(self):
        """직접 검색 시도 (단순 텍스트 검색)"""
        print("직접 텍스트 검색 시도...")
        
        search_url = f"{self.base_url}/sijangtong/nation/onnuri/onnuriMktListAjax.do"
        
        # 광주로 직접 검색
        search_data = {
            'searchType': 'shop_name',  # 매장명으로 검색
            'searchKeyword': '광주',
            'currentPageNo': '1',
            'recordCountPerPage': '100'
        }
        
        try:
            response = self.session.post(search_url, data=search_data, timeout=10)
            
            if response.status_code == 200:
                print(f"직접 검색 성공: {len(response.text)} bytes")
                
                # 간단한 텍스트 매칭
                stores = []
                lines = response.text.split('\n')
                
                for line in lines:
                    if '광주' in line and ('상회' in line or '마트' in line or '식품' in line):
                        # 간단한 매장 정보 추출
                        clean_line = re.sub(r'<[^>]+>', '', line).strip()
                        if clean_line:
                            stores.append({
                                'name': clean_line[:50],  # 첫 50자만
                                'address': '광주광역시 (상세주소 확인필요)',
                                'source': 'onnuri_direct_search'
                            })
                
                print(f"직접 검색으로 발견된 매장: {len(stores)}개")
                return stores
                
        except Exception as e:
            print(f"직접 검색 오류: {e}")
            
        return []
    
    def save_results(self, stores):
        """결과 저장"""
        if not stores:
            print("저장할 데이터가 없습니다.")
            return
            
        # JSON 저장
        json_file = "onnuri_gwangju_crawled.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(stores, f, ensure_ascii=False, indent=2)
        
        print(f"JSON 파일 저장: {json_file}")
        
        # 요약 정보 저장
        summary = {
            'total_stores': len(stores),
            'shop_types': {},
            'sample_stores': stores[:5] if stores else []
        }
        
        for store in stores:
            shop_type = store.get('shop_type', 'unknown')
            summary['shop_types'][shop_type] = summary['shop_types'].get(shop_type, 0) + 1
        
        summary_file = "onnuri_gwangju_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
            
        print(f"요약 파일 저장: {summary_file}")

def main():
    """메인 실행 함수"""
    print("=== 개선된 온누리상품권 광주 가맹점 크롤러 ===")
    
    crawler = ImprovedOnnuriCrawler()
    
    try:
        # 1. 초기 페이지 로드
        city_code = crawler.get_initial_page()
        
        # 2. 광주 가맹점 검색
        stores = crawler.search_gwangju_stores(city_code)
        
        # 3. 추가 직접 검색
        additional_stores = crawler.try_direct_search()
        stores.extend(additional_stores)
        
        # 4. 중복 제거
        unique_stores = []
        seen = set()
        
        for store in stores:
            key = f"{store.get('name', '')}-{store.get('address', '')}"
            if key not in seen:
                unique_stores.append(store)
                seen.add(key)
        
        print(f"\n=== 최종 결과 ===")
        print(f"총 수집 매장: {len(stores)}개")
        print(f"중복 제거 후: {len(unique_stores)}개")
        
        # 5. 결과 저장
        crawler.save_results(unique_stores)
        
        # 6. 샘플 출력
        if unique_stores:
            print(f"\n샘플 매장 (처음 3개):")
            for i, store in enumerate(unique_stores[:3]):
                print(f"{i+1}. {store.get('name', 'N/A')} - {store.get('address', 'N/A')}")
        
    except Exception as e:
        print(f"크롤링 중 오류: {e}")

if __name__ == "__main__":
    main()