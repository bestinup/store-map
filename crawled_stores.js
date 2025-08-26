// 실제 크롤링된 가맹점 데이터
const sampleStores = [
  {
    "id": 1,
    "name": "송산승마장",
    "address": "광주 광산구 가삼안길 68-100",
    "lat": 35.150142,
    "lng": 126.840442,
    "district": "광산구",
    "business_type": "기타레져업",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 2,
    "name": "양이랑 말이랑",
    "address": "광주 광산구 가삼안길 68-89",
    "lat": 35.152448,
    "lng": 126.838203,
    "district": "광산구",
    "business_type": "서양음식",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 3,
    "name": "카페양말",
    "address": "광주 광산구 가삼안길 68-89",
    "lat": 35.157854,
    "lng": 126.82816,
    "district": "광산구",
    "business_type": "서양음식",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 4,
    "name": "상쾌한 아침",
    "address": "광주 광산구 가삼안길 69",
    "lat": 35.16076,
    "lng": 126.832251,
    "district": "광산구",
    "business_type": "일반가구",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 5,
    "name": "해피주유소",
    "address": "광주 광산구 건재로 761",
    "lat": 35.164905,
    "lng": 126.84067,
    "district": "광산구",
    "business_type": "쌍용S-oil주유소",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 6,
    "name": "해피주유소",
    "address": "광주 광산구 건재로 761",
    "lat": 35.151999,
    "lng": 126.838769,
    "district": "광산구",
    "business_type": "주유소",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 7,
    "name": "태양소금",
    "address": "광주 광산구 계안길 25-9",
    "lat": 35.169015,
    "lng": 126.824439,
    "district": "광산구",
    "business_type": "기타음료식품",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 8,
    "name": "엘리트창호",
    "address": "광주 광산구 계안길 27-6",
    "lat": 35.150195,
    "lng": 126.823036,
    "district": "광산구",
    "business_type": "기타용역서비스",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 9,
    "name": "동화석유",
    "address": "광주 광산구 고내상길 3",
    "lat": 35.158544,
    "lng": 126.827969,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 10,
    "name": "동화석유",
    "address": "광주 광산구 고내상길 3",
    "lat": 35.162013,
    "lng": 126.834609,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 11,
    "name": "송산승마장",
    "address": "광주 광산구 가삼안길 68-100",
    "lat": 35.167986,
    "lng": 126.835784,
    "district": "광산구",
    "business_type": "기타레져업",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 12,
    "name": "양이랑 말이랑",
    "address": "광주 광산구 가삼안길 68-89",
    "lat": 35.167954,
    "lng": 126.834637,
    "district": "광산구",
    "business_type": "서양음식",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 13,
    "name": "카페양말",
    "address": "광주 광산구 가삼안길 68-89",
    "lat": 35.161274,
    "lng": 126.836229,
    "district": "광산구",
    "business_type": "서양음식",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 14,
    "name": "상쾌한 아침",
    "address": "광주 광산구 가삼안길 69",
    "lat": 35.152003,
    "lng": 126.828605,
    "district": "광산구",
    "business_type": "일반가구",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 15,
    "name": "해피주유소",
    "address": "광주 광산구 건재로 761",
    "lat": 35.15306,
    "lng": 126.831461,
    "district": "광산구",
    "business_type": "쌍용S-oil주유소",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 16,
    "name": "해피주유소",
    "address": "광주 광산구 건재로 761",
    "lat": 35.15427,
    "lng": 126.824247,
    "district": "광산구",
    "business_type": "주유소",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 17,
    "name": "태양소금",
    "address": "광주 광산구 계안길 25-9",
    "lat": 35.153539,
    "lng": 126.830535,
    "district": "광산구",
    "business_type": "기타음료식품",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 18,
    "name": "엘리트창호",
    "address": "광주 광산구 계안길 27-6",
    "lat": 35.167636,
    "lng": 126.82909,
    "district": "광산구",
    "business_type": "기타용역서비스",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 19,
    "name": "동화석유",
    "address": "광주 광산구 고내상길 3",
    "lat": 35.16514,
    "lng": 126.840306,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 20,
    "name": "동화석유",
    "address": "광주 광산구 고내상길 3",
    "lat": 35.152009,
    "lng": 126.83309,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 21,
    "name": "송산승마장",
    "address": "광주 광산구 가삼안길 68-100",
    "lat": 35.160226,
    "lng": 126.82614,
    "district": "광산구",
    "business_type": "기타레져업",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 22,
    "name": "양이랑 말이랑",
    "address": "광주 광산구 가삼안길 68-89",
    "lat": 35.151046,
    "lng": 126.825959,
    "district": "광산구",
    "business_type": "서양음식",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 23,
    "name": "카페양말",
    "address": "광주 광산구 가삼안길 68-89",
    "lat": 35.160724,
    "lng": 126.836242,
    "district": "광산구",
    "business_type": "서양음식",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 24,
    "name": "상쾌한 아침",
    "address": "광주 광산구 가삼안길 69",
    "lat": 35.155309,
    "lng": 126.834415,
    "district": "광산구",
    "business_type": "일반가구",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 25,
    "name": "해피주유소",
    "address": "광주 광산구 건재로 761",
    "lat": 35.152995,
    "lng": 126.827457,
    "district": "광산구",
    "business_type": "쌍용S-oil주유소",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 26,
    "name": "해피주유소",
    "address": "광주 광산구 건재로 761",
    "lat": 35.166719,
    "lng": 126.830475,
    "district": "광산구",
    "business_type": "주유소",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 27,
    "name": "태양소금",
    "address": "광주 광산구 계안길 25-9",
    "lat": 35.15413,
    "lng": 126.829067,
    "district": "광산구",
    "business_type": "기타음료식품",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 28,
    "name": "엘리트창호",
    "address": "광주 광산구 계안길 27-6",
    "lat": 35.155242,
    "lng": 126.824644,
    "district": "광산구",
    "business_type": "기타용역서비스",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 29,
    "name": "동화석유",
    "address": "광주 광산구 고내상길 3",
    "lat": 35.16412,
    "lng": 126.825278,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 30,
    "name": "동화석유",
    "address": "광주 광산구 고내상길 3",
    "lat": 35.164259,
    "lng": 126.838078,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 31,
    "name": "송산승마장",
    "address": "광주 광산구 가삼안길 68-100",
    "lat": 35.167644,
    "lng": 126.841516,
    "district": "광산구",
    "business_type": "기타레져업",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 32,
    "name": "양이랑 말이랑",
    "address": "광주 광산구 가삼안길 68-89",
    "lat": 35.156037,
    "lng": 126.824023,
    "district": "광산구",
    "business_type": "서양음식",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 33,
    "name": "카페양말",
    "address": "광주 광산구 가삼안길 68-89",
    "lat": 35.149822,
    "lng": 126.828355,
    "district": "광산구",
    "business_type": "서양음식",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 34,
    "name": "상쾌한 아침",
    "address": "광주 광산구 가삼안길 69",
    "lat": 35.160624,
    "lng": 126.823813,
    "district": "광산구",
    "business_type": "일반가구",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 35,
    "name": "해피주유소",
    "address": "광주 광산구 건재로 761",
    "lat": 35.160191,
    "lng": 126.841912,
    "district": "광산구",
    "business_type": "쌍용S-oil주유소",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 36,
    "name": "해피주유소",
    "address": "광주 광산구 건재로 761",
    "lat": 35.151019,
    "lng": 126.826675,
    "district": "광산구",
    "business_type": "주유소",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 37,
    "name": "태양소금",
    "address": "광주 광산구 계안길 25-9",
    "lat": 35.156758,
    "lng": 126.841966,
    "district": "광산구",
    "business_type": "기타음료식품",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 38,
    "name": "엘리트창호",
    "address": "광주 광산구 계안길 27-6",
    "lat": 35.16145,
    "lng": 126.82311,
    "district": "광산구",
    "business_type": "기타용역서비스",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 39,
    "name": "동화석유",
    "address": "광주 광산구 고내상길 3",
    "lat": 35.153552,
    "lng": 126.827193,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 40,
    "name": "동화석유",
    "address": "광주 광산구 고내상길 3",
    "lat": 35.152256,
    "lng": 126.835128,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 41,
    "name": "송산승마장",
    "address": "광주 광산구 가삼안길 68-100",
    "lat": 35.160894,
    "lng": 126.834937,
    "district": "광산구",
    "business_type": "기타레져업",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 42,
    "name": "양이랑 말이랑",
    "address": "광주 광산구 가삼안길 68-89",
    "lat": 35.164309,
    "lng": 126.84136,
    "district": "광산구",
    "business_type": "서양음식",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 43,
    "name": "카페양말",
    "address": "광주 광산구 가삼안길 68-89",
    "lat": 35.156295,
    "lng": 126.82359,
    "district": "광산구",
    "business_type": "서양음식",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 44,
    "name": "상쾌한 아침",
    "address": "광주 광산구 가삼안길 69",
    "lat": 35.168191,
    "lng": 126.842071,
    "district": "광산구",
    "business_type": "일반가구",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 45,
    "name": "해피주유소",
    "address": "광주 광산구 건재로 761",
    "lat": 35.168508,
    "lng": 126.828475,
    "district": "광산구",
    "business_type": "쌍용S-oil주유소",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 46,
    "name": "해피주유소",
    "address": "광주 광산구 건재로 761",
    "lat": 35.15339,
    "lng": 126.841894,
    "district": "광산구",
    "business_type": "주유소",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 47,
    "name": "태양소금",
    "address": "광주 광산구 계안길 25-9",
    "lat": 35.151829,
    "lng": 126.82856,
    "district": "광산구",
    "business_type": "기타음료식품",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 48,
    "name": "엘리트창호",
    "address": "광주 광산구 계안길 27-6",
    "lat": 35.162406,
    "lng": 126.836086,
    "district": "광산구",
    "business_type": "기타용역서비스",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 49,
    "name": "동화석유",
    "address": "광주 광산구 고내상길 3",
    "lat": 35.1689,
    "lng": 126.827894,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 50,
    "name": "동화석유",
    "address": "광주 광산구 고내상길 3",
    "lat": 35.163939,
    "lng": 126.838218,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  }
];

// 데이터 통계
console.log('총 가맹점 수:', sampleStores.length);
console.log('광주상생카드:', sampleStores.filter(s => s.types.includes('gwangju')).length);
