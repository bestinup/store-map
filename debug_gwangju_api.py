#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
광주상생카드 API 디버깅 스크립트
"""

import requests
import json

def debug_gwangju_api():
    """광주상생카드 API 응답을 디버깅합니다."""
    
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
    
    print("광주상생카드 API 디버깅 시작...")
    
    # 메인 페이지 방문
    try:
        main_page = session.get(base_url + "/economy/contentsView.do?pageId=economy129")
        print(f"메인 페이지 상태코드: {main_page.status_code}")
        print(f"메인 페이지 URL: {main_page.url}")
    except Exception as e:
        print(f"메인 페이지 접근 실패: {e}")
        return
    
    # API 요청 테스트
    form_data = {
        'pageNum': '1',
        'pageSize': '10',
        'searchGu': '',
        'searchType': '',
        'searchWord': ''
    }
    
    try:
        print("\nAPI 요청 중...")
        print(f"URL: {base_url + api_endpoint}")
        print(f"Data: {form_data}")
        
        response = session.post(base_url + api_endpoint, data=form_data)
        
        print(f"응답 상태코드: {response.status_code}")
        print(f"응답 헤더: {dict(response.headers)}")
        print(f"응답 크기: {len(response.text)} bytes")
        print(f"응답 내용 (처음 500자):\n{response.text[:500]}")
        
        # JSON 파싱 시도
        try:
            data = response.json()
            print(f"\nJSON 파싱 성공!")
            print(f"JSON 구조: {json.dumps(data, indent=2, ensure_ascii=False)}")
        except json.JSONDecodeError:
            print(f"\nJSON 파싱 실패 - HTML 응답일 가능성")
            if "html" in response.text.lower():
                print("HTML 응답으로 보임")
            
    except Exception as e:
        print(f"API 요청 실패: {e}")

if __name__ == "__main__":
    debug_gwangju_api()