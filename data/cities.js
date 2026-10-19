// 초성 보고 우리나라 도시 맞히기 — 문제 100개 (시·군 위주, 대표 명소·특산물)
QUESTIONS['cities'] = [
  // 기존 문제
  { chosung: true, answer: '부산', text: '해운대와 광안리가 있는 항구 도시' },
  { chosung: true, answer: '대구', text: '사과와 무더위로 유명한 경상도의 광역시' },
  { chosung: true, answer: '광주', alias: ['광주광역시'], text: '무등산이 있는 전라도의 광역시' },
  { chosung: true, answer: '대전', text: '엑스포와 유명 빵집으로 알려진 중부의 광역시' },
  { chosung: true, answer: '인천', alias: ['인천광역시'], text: '국제공항과 차이나타운이 있는 항구 도시' },
  { chosung: true, answer: '울산', text: '자동차·조선 공장이 모인 공업 도시' },
  { chosung: true, answer: '제주', alias: ['제주도', '제주특별자치도'], text: '한라산과 돌하르방의 섬' },
  { chosung: true, answer: '전주', text: '비빔밥과 한옥마을로 유명한 도시' },
  { chosung: true, answer: '경주', text: '불국사와 첨성대가 있는 신라의 옛 수도' },
  { chosung: true, answer: '강릉', text: '경포대와 커피 거리로 유명한 동해안 도시' },
  { chosung: true, answer: '춘천', text: '닭갈비와 호수로 유명한 강원도 도시' },
  { chosung: true, answer: '수원', text: '화성과 갈비로 유명한 경기도 도시' },
  { chosung: true, answer: '여수', text: '밤바다로 유명한 남해안 도시' },
  { chosung: true, answer: '안동', text: '하회마을과 찜닭의 도시' },
  { chosung: true, answer: '속초', text: '설악산 아래 동해안 항구 도시' },

  // 특별시·특별자치시
  { chosung: true, answer: '서울', alias: ['서울특별시'], text: '경복궁과 남산타워가 있는 대한민국의 수도' },
  { chosung: true, answer: '세종', alias: ['세종시', '세종특별자치시'], text: '정부 부처들이 옮겨 온 행정중심복합도시' },

  // 경기·인천
  { chosung: true, answer: '용인', text: '에버랜드와 한국민속촌이 있는 경기도 도시' },
  { chosung: true, answer: '파주', text: '임진각과 출판도시, 헤이리 예술마을이 있는 도시' },
  { chosung: true, answer: '고양', text: '일산 호수공원과 킨텍스 전시장이 있는 도시' },
  { chosung: true, answer: '의정부', text: '부대찌개 거리로 유명한 경기 북부 도시' },
  { chosung: true, answer: '포천', text: '이동갈비와 산정호수로 유명한 경기 북부 도시' },
  { chosung: true, answer: '가평', text: '자라섬 재즈 페스티벌과 잣으로 유명한 경기도 군' },
  { chosung: true, answer: '양평', text: '남한강과 북한강이 만나는 두물머리, 세미원이 있는 군' },
  { chosung: true, answer: '이천', text: '임금님께 올렸다는 쌀과 도자기 축제로 유명한 도시' },
  { chosung: true, answer: '여주', text: '세종대왕릉(영릉)이 있는 남한강가 도시' },
  { chosung: true, answer: '안성', text: '놋그릇 유기와 남사당 바우덕이로 유명한 도시' },
  { chosung: true, answer: '강화', alias: ['강화도'], text: '고인돌과 마니산 참성단, 인삼으로 유명한 인천의 섬 군' },

  // 강원
  { chosung: true, answer: '평창', text: '2018년 동계 올림픽을 연 강원도 군' },
  { chosung: true, answer: '정선', text: '아리랑과 5일장, 레일바이크로 유명한 강원도 군' },
  { chosung: true, answer: '영월', text: '단종의 유배지 청령포가 있는 강원도 군' },
  { chosung: true, answer: '태백', text: '한강의 발원지 검룡소와 태백산이 있는 옛 탄광 도시' },
  { chosung: true, answer: '삼척', text: '환선굴과 대금굴 같은 석회 동굴로 유명한 동해안 도시' },
  { chosung: true, answer: '동해', text: '추암 촛대바위로 유명한 해맞이 도시' },
  { chosung: true, answer: '양양', text: '낙산사와 서핑 해변으로 유명한 강원도 군' },
  { chosung: true, answer: '고성', text: '통일전망대가 있는 강원도 최북단 군' },
  { chosung: true, answer: '인제', text: '백담사와 자작나무 숲, 래프팅으로 유명한 강원도 군' },
  { chosung: true, answer: '화천', text: '겨울 산천어 축제로 유명한 강원도 군' },
  { chosung: true, answer: '원주', text: '치악산과 소금산 출렁다리가 있는 강원도 도시' },
  { chosung: true, answer: '횡성', text: '한우로 유명한 강원도 군' },
  { chosung: true, answer: '철원', text: '노동당사 건물과 오대쌀로 알려진 강원도 접경 군' },

  // 충북
  { chosung: true, answer: '청주', text: '직지를 찍은 흥덕사 터와 청남대가 있는 충북 도청 소재지' },
  { chosung: true, answer: '충주', text: '충주호와 사과로 유명한 충북 도시' },
  { chosung: true, answer: '제천', text: '의림지와 청풍호가 있는 충북 도시' },
  { chosung: true, answer: '단양', text: '도담삼봉과 마늘로 유명한 충북 군' },
  { chosung: true, answer: '보은', text: '속리산 법주사와 대추로 유명한 충북 군' },

  // 충남
  { chosung: true, answer: '천안', text: '호두과자와 독립기념관으로 유명한 충남 도시' },
  { chosung: true, answer: '아산', text: '이순신을 모신 현충사와 온양 온천이 있는 도시' },
  { chosung: true, answer: '공주', text: '공산성과 무령왕릉, 알밤으로 유명한 백제의 옛 도읍' },
  { chosung: true, answer: '부여', text: '정림사지와 낙화암이 있는 백제의 마지막 도읍' },
  { chosung: true, answer: '보령', text: '머드 축제와 대천 해수욕장으로 유명한 도시' },
  { chosung: true, answer: '서산', text: '해미읍성과 마애삼존불이 있는 충남 도시' },
  { chosung: true, answer: '태안', text: '안면도와 꽃지 해변이 있는 충남 군' },
  { chosung: true, answer: '논산', text: '딸기와 육군훈련소로 유명한 충남 도시' },
  { chosung: true, answer: '금산', text: '인삼 축제가 열리는 충남의 인삼 고장' },

  // 전북
  { chosung: true, answer: '군산', text: '근대 건축물 거리와 경암동 철길마을이 있는 항구 도시' },
  { chosung: true, answer: '익산', text: '미륵사지 석탑과 왕궁리 유적이 있는 도시' },
  { chosung: true, answer: '남원', text: '광한루가 있는 춘향전의 고장' },
  { chosung: true, answer: '정읍', text: '내장산 단풍과 동학 농민 운동의 발상지' },
  { chosung: true, answer: '고창', text: '고인돌 유적과 선운사, 풍천장어로 유명한 군' },
  { chosung: true, answer: '부안', text: '변산반도와 채석강이 있는 전북 군' },
  { chosung: true, answer: '무주', text: '덕유산 스키장과 태권도원, 반딧불 축제가 있는 군' },
  { chosung: true, answer: '임실', text: '치즈 마을로 유명한 전북 군' },
  { chosung: true, answer: '순창', text: '고추장으로 유명한 전북 군' },

  // 전남
  { chosung: true, answer: '목포', text: '유달산과 세발낙지로 유명한 서남해 항구 도시' },
  { chosung: true, answer: '순천', text: '순천만 갈대밭과 국가정원이 있는 도시' },
  { chosung: true, answer: '광양', text: '매화마을과 숯불 불고기, 제철소로 유명한 도시' },
  { chosung: true, answer: '나주', text: '배와 곰탕으로 유명한 전남 도시' },
  { chosung: true, answer: '담양', text: '대나무 숲 죽녹원과 메타세쿼이아 길이 있는 군' },
  { chosung: true, answer: '보성', text: '계단식 녹차밭으로 유명한 전남 군' },
  { chosung: true, answer: '구례', text: '지리산 화엄사와 산수유 마을이 있는 군' },
  { chosung: true, answer: '함평', text: '봄마다 나비 축제가 열리는 전남 군' },
  { chosung: true, answer: '영광', text: '굴비로 유명한 전남 군' },
  { chosung: true, answer: '신안', text: '천일염과 1004개의 섬으로 이루어진 전남 군' },
  { chosung: true, answer: '완도', text: '전복 양식과 장보고의 청해진으로 유명한 섬 군' },
  { chosung: true, answer: '진도', text: '진돗개와 신비의 바닷길로 유명한 섬 군' },
  { chosung: true, answer: '해남', text: '한반도 땅끝마을과 대흥사가 있는 군' },
  { chosung: true, answer: '강진', text: '정약용의 다산초당과 고려청자 가마터가 있는 군' },

  // 경북
  { chosung: true, answer: '포항', text: '호미곶 해맞이와 과메기, 제철소로 유명한 도시' },
  { chosung: true, answer: '구미', text: '금오산과 전자 산업 단지가 있는 경북 도시' },
  { chosung: true, answer: '영주', text: '부석사와 소수서원, 풍기 인삼이 있는 도시' },
  { chosung: true, answer: '문경', text: '문경새재 옛길과 오미자로 유명한 도시' },
  { chosung: true, answer: '상주', text: '곶감과 자전거로 유명한 경북 도시' },
  { chosung: true, answer: '성주', text: '참외로 유명한 경북 군' },
  { chosung: true, answer: '의성', text: '마늘로 유명한 경북 군' },
  { chosung: true, answer: '청송', text: '주왕산과 사과로 유명한 경북 군' },
  { chosung: true, answer: '영덕', text: '강구항 대게로 유명한 동해안 군' },
  { chosung: true, answer: '울진', text: '불영계곡과 금강소나무 숲, 덕구 온천이 있는 군' },
  { chosung: true, answer: '울릉', alias: ['울릉도'], text: '오징어와 호박엿의 섬, 독도를 관할하는 군' },

  // 경남
  { chosung: true, answer: '창원', text: '벚꽃 축제 진해 군항제가 열리는 경남 도청 소재지' },
  { chosung: true, answer: '김해', text: '금관가야 김수로왕릉이 있는 도시' },
  { chosung: true, answer: '진주', text: '진주성과 남강 유등 축제로 유명한 도시' },
  { chosung: true, answer: '통영', alias: ['충무'], text: '충무김밥과 이순신의 삼도수군통제영이 있던 항구 도시' },
  { chosung: true, answer: '거제', text: '대형 조선소와 외도 보타니아가 있는 섬 도시' },
  { chosung: true, answer: '남해', text: '독일마을과 다랭이마을이 있는 섬 군' },
  { chosung: true, answer: '하동', text: '화개장터와 녹차, 소설 "토지"의 평사리가 있는 군' },
  { chosung: true, answer: '양산', text: '통도사가 있는 경남 도시' },
  { chosung: true, answer: '밀양', text: '영남루와 한여름에도 얼음이 언다는 얼음골이 있는 도시' },
  { chosung: true, answer: '합천', text: '팔만대장경을 보관한 해인사가 있는 군' },

  // 제주
  { chosung: true, answer: '서귀포', text: '정방폭포·천지연폭포와 감귤로 유명한 제주 남쪽 도시' },
];
