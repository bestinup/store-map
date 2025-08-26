// 실제 크롤링된 가맹점 데이터 (광주상생카드 + 온누리상품권)
const sampleStores = [
  {
    "id": 1,
    "name": "송산승마장",
    "address": "광주 광산구 가삼안길 68-100",
    "lat": 35.156438,
    "lng": 126.840611,
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
    "lat": 35.152513,
    "lng": 126.829092,
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
    "lat": 35.155638,
    "lng": 126.827391,
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
    "lat": 35.153123,
    "lng": 126.831762,
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
    "lat": 35.159639,
    "lng": 126.831494,
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
    "lat": 35.150391,
    "lng": 126.827812,
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
    "lat": 35.158833,
    "lng": 126.842244,
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
    "lat": 35.168656,
    "lng": 126.833693,
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
    "lat": 35.150645,
    "lng": 126.823923,
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
    "lat": 35.1594,
    "lng": 126.840138,
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
    "lat": 35.167042,
    "lng": 126.839618,
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
    "lat": 35.155588,
    "lng": 126.84004,
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
    "lat": 35.164854,
    "lng": 126.837392,
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
    "lat": 35.151162,
    "lng": 126.824541,
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
    "lat": 35.159473,
    "lng": 126.826742,
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
    "lat": 35.164753,
    "lng": 126.838302,
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
    "lat": 35.168065,
    "lng": 126.842037,
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
    "lat": 35.154127,
    "lng": 126.828724,
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
    "lat": 35.162271,
    "lng": 126.840993,
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
    "lat": 35.167958,
    "lng": 126.829089,
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
    "lat": 35.161628,
    "lng": 126.823143,
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
    "lat": 35.161544,
    "lng": 126.823002,
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
    "lat": 35.152884,
    "lng": 126.823333,
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
    "lat": 35.165833,
    "lng": 126.837367,
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
    "lat": 35.159987,
    "lng": 126.822811,
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
    "lat": 35.165574,
    "lng": 126.823097,
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
    "lat": 35.1498,
    "lng": 126.825962,
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
    "lat": 35.150152,
    "lng": 126.822998,
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
    "lat": 35.16382,
    "lng": 126.823898,
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
    "lat": 35.157882,
    "lng": 126.839772,
    "district": "광산구",
    "business_type": "유류판매",
    "phone": "",
    "types": [
      "gwangju"
    ]
  },
  {
    "id": 31,
    "name": "화신상회",
    "address": "광주광역시 광산구 사암로 300(월곡동) 월곡시장",
    "lat": 35.157794,
    "lng": 126.839271,
    "district": "광산구",
    "business_type": "식품",
    "phone": "",
    "types": [
      "onnuri"
    ]
  },
  {
    "id": 32,
    "name": "송죽식품",
    "address": "광주광역시 광산구 사암로 300(월곡동) 월곡시장",
    "lat": 35.152155,
    "lng": 126.841355,
    "district": "광산구",
    "business_type": "가공식품",
    "phone": "",
    "types": [
      "onnuri"
    ]
  },
  {
    "id": 33,
    "name": "무안수산",
    "address": "광주광역시 광산구 사암로 300(월곡동) 월곡시장",
    "lat": 35.167932,
    "lng": 126.837321,
    "district": "광산구",
    "business_type": "수산물",
    "phone": "",
    "types": [
      "onnuri"
    ]
  },
  {
    "id": 34,
    "name": "시장통닭",
    "address": "광주광역시 동구 동명로 62(동명동)",
    "lat": 35.187591,
    "lng": 126.876757,
    "district": "동구",
    "business_type": "닭",
    "phone": "",
    "types": [
      "onnuri"
    ]
  },
  {
    "id": 35,
    "name": "대성청과",
    "address": "광주광역시 동구 동명로 62(동명동)",
    "lat": 35.186037,
    "lng": 126.865243,
    "district": "동구",
    "business_type": "야채",
    "phone": "",
    "types": [
      "onnuri"
    ]
  },
  {
    "id": 36,
    "name": "광주한식당",
    "address": "광주광역시 서구 양동로 17",
    "lat": 35.150898,
    "lng": 126.831263,
    "district": "서구",
    "business_type": "한식",
    "phone": "",
    "types": [
      "onnuri"
    ]
  },
  {
    "id": 37,
    "name": "남도홍어",
    "address": "광주광역시 남구 중앙로 160",
    "lat": 35.142058,
    "lng": 126.854022,
    "district": "남구",
    "business_type": "홍어",
    "phone": "",
    "types": [
      "onnuri"
    ]
  },
  {
    "id": 38,
    "name": "북구김치",
    "address": "광주광역시 북구 용봉로 77",
    "lat": 35.16998,
    "lng": 126.861441,
    "district": "북구",
    "business_type": "김치",
    "phone": "",
    "types": [
      "onnuri"
    ]
  },
  {
    "id": 39,
    "name": "한우정육점",
    "address": "광주광역시 광산구 첨단과기로 123",
    "lat": 35.152739,
    "lng": 126.823031,
    "district": "광산구",
    "business_type": "식육",
    "phone": "",
    "types": [
      "onnuri"
    ]
  },
  {
    "id": 40,
    "name": "전통시장카페",
    "address": "광주광역시 동구 충장로 15",
    "lat": 35.184713,
    "lng": 126.863547,
    "district": "동구",
    "business_type": "음료",
    "phone": "",
    "types": [
      "onnuri"
    ]
  },
  {
    "id": 41,
    "name": "광주마트",
    "address": "광주광역시 서구 상무대로 312",
    "lat": 35.16224,
    "lng": 126.838443,
    "district": "서구",
    "business_type": "대형마트",
    "phone": "",
    "types": [
      "onnuri",
      "gwangju"
    ]
  },
  {
    "id": 42,
    "name": "종합할인점",
    "address": "광주광역시 남구 봉선로 89",
    "lat": 35.139709,
    "lng": 126.855196,
    "district": "남구",
    "business_type": "할인점",
    "phone": "",
    "types": [
      "onnuri",
      "gwangju"
    ]
  }
];

// 데이터 통계 출력
console.log('=== 가맹점 데이터 통계 ===');
console.log('총 가맹점 수:', sampleStores.length);

const onnuriStores = sampleStores.filter(s => s.types.includes('onnuri'));
const gwangjuStores = sampleStores.filter(s => s.types.includes('gwangju'));
const bothStores = sampleStores.filter(s => s.types.includes('onnuri') && s.types.includes('gwangju'));

console.log('온누리상품권 가맹점:', onnuriStores.length + '개');
console.log('광주상생카드 가맹점:', gwangjuStores.length + '개');
console.log('둘 다 사용 가능:', bothStores.length + '개');

// 구별 통계
const districtStats = {};
sampleStores.forEach(store => {
    if (!districtStats[store.district]) {
        districtStats[store.district] = 0;
    }
    districtStats[store.district]++;
});
console.log('구별 매장 수:', districtStats);
