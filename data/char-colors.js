// 색 조합 보고 캐릭터 맞히기 — 문제 100개 (캐릭터 그림 없이 색만 보여줌)
QUESTIONS['char-colors'] = [
  // 포켓몬
  { image: PALETTE([['#f6d21b', 4], ['#e3350d', 1], ['#2b2b2b', 1], ['#8b5a2b', 1]]), text: '포켓몬', answer: '피카츄', alias: ['피카추', 'Pikachu'] },
  { image: PALETTE([['#f08030', 4], ['#f8e0a0', 1], ['#ffcf3f', 1], ['#e8471c', 1]]), text: '포켓몬', answer: '파이리', alias: ['Charmander', '히토카게'] },
  { image: PALETTE([['#7ec8e3', 3], ['#a0622d', 2], ['#f5e2a8', 1], ['#ffffff', 1]]), text: '포켓몬', answer: '꼬부기', alias: ['Squirtle', '제니거북'] },
  { image: PALETTE([['#6cc4a1', 3], ['#3e9a54', 2], ['#2f6b5a', 1], ['#c0392b', 1]]), text: '포켓몬', answer: '이상해씨', alias: ['Bulbasaur', '이상해'] },
  { image: PALETTE([['#2c5d74', 4], ['#f1e4c3', 2], ['#ffffff', 1]]), text: '포켓몬', answer: '잠만보', alias: ['Snorlax', '카비곤'] },
  { image: PALETTE([['#f8b8c8', 4], ['#3aa6c4', 1], ['#ffffff', 1]]), text: '포켓몬', answer: '푸린', alias: ['Jigglypuff', '푸링'] },
  { image: PALETTE([['#f8d84a', 4], ['#f3e3a8', 1], ['#2b2b2b', 1]]), text: '포켓몬', answer: '고라파덕', alias: ['Psyduck', '코다크'] },
  { image: PALETTE([['#b5764a', 3], ['#f0dfb5', 2], ['#5b3a29', 1]]), text: '포켓몬', answer: '이브이', alias: ['Eevee'] },
  { image: PALETTE([['#b48ccc', 5], ['#2b2b2b', 1]]), text: '포켓몬', answer: '메타몽', alias: ['Ditto'] },
  { image: PALETTE([['#6b4c9a', 4], ['#e3242b', 1], ['#ffffff', 1]]), text: '포켓몬', answer: '팬텀', alias: ['Gengar', '겐가'] },

  // 닌텐도 · 슈퍼 마리오
  { image: PALETTE([['#e52521', 3], ['#0047bb', 2], ['#f6c6a0', 1], ['#6b3e1f', 1], ['#ffffff', 1]]), text: '닌텐도', answer: '마리오', alias: ['슈퍼마리오', 'Mario'] },
  { image: PALETTE([['#2fa84f', 3], ['#1f3fa8', 2], ['#f6c6a0', 1], ['#6b3e1f', 1], ['#ffffff', 1]]), text: '슈퍼 마리오', answer: '루이지', alias: ['Luigi'] },
  { image: PALETTE([['#5cc34b', 3], ['#ffffff', 2], ['#e3311d', 1], ['#f28c28', 1]]), text: '슈퍼 마리오', answer: '요시', alias: ['Yoshi'] },
  { image: PALETTE([['#f6a5c8', 4], ['#f8d64e', 2], ['#f6d2b8', 1], ['#3aa0e0', 1]]), text: '슈퍼 마리오', answer: '피치공주', alias: ['피치', 'Peach'] },
  { image: PALETTE([['#6a2c91', 3], ['#f8d21e', 2], ['#f6c6a0', 1], ['#2fa84f', 1]]), text: '슈퍼 마리오', answer: '와리오', alias: ['Wario'] },
  { image: PALETTE([['#f3c13a', 3], ['#3a8a3a', 2], ['#e04a1b', 1], ['#ffffff', 1]]), text: '슈퍼 마리오', answer: '쿠파', alias: ['바우저', '쿠파대왕', 'Bowser'] },
  { image: PALETTE([['#ffffff', 3], ['#e32b2b', 2], ['#1e50b4', 1], ['#f6d2b8', 1]]), text: '슈퍼 마리오', answer: '키노피오', alias: ['토드', 'Toad'] },
  { image: PALETTE([['#f7a7c3', 5], ['#d6243a', 1], ['#1d3c8f', 1]]), text: '닌텐도', answer: '커비', alias: ['Kirby'] },
  { image: PALETTE([['#7b4a26', 4], ['#d9a675', 1], ['#d6201f', 1]]), text: '닌텐도', answer: '동키콩', alias: ['동키', 'Donkey Kong'] },
  { image: PALETTE([['#3a8c3a', 3], ['#f2d36b', 1], ['#7b5a3a', 1], ['#ffffff', 1]]), text: '젤다의 전설', answer: '링크', alias: ['Link'] },

  // 그 밖의 게임
  { image: PALETTE([['#1f5ec9', 4], ['#f2c9a0', 1], ['#d62828', 1], ['#ffffff', 1]]), text: '세가', answer: '소닉', alias: ['Sonic', '소닉더헤지혹'] },
  { image: PALETTE([['#f5a623', 4], ['#ffffff', 2], ['#d62828', 1]]), text: '소닉 더 헤지혹', answer: '테일즈', alias: ['테일스', 'Tails'] },
  { image: PALETTE([['#ffe600', 4], ['#111111', 2]]), text: '고전 게임', answer: '팩맨', alias: ['Pac-Man', '패크맨'] },
  { image: PALETTE([['#5ea33c', 3], ['#8ed16a', 2], ['#1a1a1a', 1]]), text: '마인크래프트', answer: '크리퍼', alias: ['Creeper'] },
  { image: PALETTE([['#d42424', 4], ['#f1dcb3', 1], ['#f6b12b', 1], ['#1b1b1b', 1]]), text: '앵그리버드', answer: '레드', alias: ['레드버드', '빨간새', 'Red'] },

  // 카카오프렌즈 · 라인프렌즈
  { image: PALETTE([['#e9a94b', 4], ['#ffffff', 1], ['#2b2b2b', 1]]), text: '카카오프렌즈', answer: '라이언', alias: ['Ryan'] },
  { image: PALETTE([['#f9b3b6', 4], ['#f48a95', 1], ['#2b2b2b', 1]]), text: '카카오프렌즈', answer: '어피치', alias: ['Apeach'] },
  { image: PALETTE([['#ffffff', 3], ['#f8e04b', 2], ['#f39cb8', 1]]), text: '카카오프렌즈', answer: '무지', alias: ['Muzi'] },
  { image: PALETTE([['#8b5a3c', 4], ['#f3e3c7', 1], ['#1a1a1a', 1]]), text: '라인프렌즈', answer: '브라운', alias: ['Brown'] },
  { image: PALETTE([['#ffd400', 4], ['#f28c00', 1], ['#1a1a1a', 1]]), text: '라인프렌즈', answer: '샐리', alias: ['Sally'] },

  // 산리오
  { image: PALETTE([['#ffffff', 4], ['#e60033', 1], ['#f6d400', 1], ['#1a1a1a', 1]]), text: '산리오', answer: '헬로키티', alias: ['키티', 'Hello Kitty'] },
  { image: PALETTE([['#f7b6d2', 3], ['#ffffff', 2], ['#1a1a1a', 1]]), text: '산리오', answer: '마이멜로디', alias: ['멜로디', 'My Melody'] },
  { image: PALETTE([['#2b2b2b', 3], ['#ffffff', 2], ['#ff7eb6', 1], ['#9b7bc9', 1]]), text: '산리오', answer: '쿠로미', alias: ['Kuromi'] },
  { image: PALETTE([['#ffffff', 4], ['#8fd3f4', 1], ['#f8b8c8', 1]]), text: '산리오', answer: '시나모롤', alias: ['시나모', 'Cinnamoroll'] },
  { image: PALETTE([['#f6d27a', 4], ['#7a4a2a', 1], ['#2b2b2b', 1]]), text: '산리오', answer: '폼폼푸린', alias: ['폼푸린', 'Pompompurin'] },
  { image: PALETTE([['#5ec44a', 4], ['#ffffff', 1], ['#f39cb8', 1]]), text: '산리오', answer: '케로케로케로피', alias: ['케로피', 'Keroppi'] },

  // 디즈니
  { image: PALETTE([['#1b1b1b', 3], ['#e31b23', 2], ['#f6c90e', 1], ['#ffffff', 1], ['#f3c9a0', 1]]), text: '디즈니', answer: '미키마우스', alias: ['미키', 'Mickey'] },
  { image: PALETTE([['#ffffff', 3], ['#1f4db0', 2], ['#f7941d', 1], ['#e31b23', 1]]), text: '디즈니', answer: '도널드덕', alias: ['도날드덕', '도널드', '도날드', 'Donald Duck'] },
  { image: PALETTE([['#f47b20', 2], ['#1b1b1b', 2], ['#1c3c8c', 1], ['#3a8c3a', 1], ['#ffffff', 1]]), text: '디즈니', answer: '구피', alias: ['Goofy'] },
  { image: PALETTE([['#f6b31b', 4], ['#d7261e', 2]]), text: '디즈니', answer: '곰돌이 푸', alias: ['푸', '푸우', '곰돌이푸우', 'Pooh', 'Winnie the Pooh'] },
  { image: PALETTE([['#f58025', 3], ['#1b1b1b', 1], ['#f5e0a8', 1]]), text: '곰돌이 푸', answer: '티거', alias: ['Tigger'] },
  { image: PALETTE([['#3f7fd9', 3], ['#9ccbf0', 1], ['#1d3b8a', 1], ['#ef9ac1', 1]]), text: '디즈니', answer: '스티치', alias: ['Stitch'] },
  { image: PALETTE([['#a9d8f0', 3], ['#f4e7b5', 2], ['#6fb6e0', 1]]), text: '겨울왕국', answer: '엘사', alias: ['Elsa'] },
  { image: PALETTE([['#ffffff', 4], ['#f28c28', 1], ['#6b4226', 1], ['#1b1b1b', 1]]), text: '겨울왕국', answer: '올라프', alias: ['Olaf'] },
  { image: PALETTE([['#f6d21b', 3], ['#1a4c9c', 2], ['#c8102e', 1], ['#1b1b1b', 1]]), text: '디즈니 공주', answer: '백설공주', alias: ['스노우화이트', 'Snow White'] },
  { image: PALETTE([['#2fa36b', 3], ['#d7261e', 2], ['#8a4fbf', 1]]), text: '디즈니 공주', answer: '에리얼', alias: ['아리엘', '인어공주', 'Ariel'] },

  // 픽사 · 드림웍스 · 일루미네이션
  { image: PALETTE([['#f37021', 3], ['#ffffff', 2], ['#1b1b1b', 1]]), text: '픽사', answer: '니모', alias: ['Nemo'] },
  { image: PALETTE([['#2a62c6', 3], ['#f6d11d', 2], ['#1b1b1b', 1]]), text: '픽사', answer: '도리', alias: ['Dory'] },
  { image: PALETTE([['#d71920', 4], ['#f8c400', 1], ['#f58025', 1]]), text: '픽사', answer: '라이트닝 맥퀸', alias: ['맥퀸', '맥킨', 'McQueen'] },
  { image: PALETTE([['#f2c94c', 2], ['#2e5aa8', 2], ['#8b5a2b', 2], ['#c62828', 1]]), text: '토이 스토리', answer: '우디', alias: ['Woody'] },
  { image: PALETTE([['#ffffff', 3], ['#4caf50', 2], ['#6a3fa0', 2]]), text: '토이 스토리', answer: '버즈 라이트이어', alias: ['버즈', 'Buzz', 'Buzz Lightyear'] },
  { image: PALETTE([['#9bd341', 4], ['#ffffff', 1], ['#3a8c3a', 1]]), text: '몬스터 주식회사', answer: '마이크 와조스키', alias: ['마이크', 'Mike'] },
  { image: PALETTE([['#4ab3d8', 4], ['#7b4ea0', 2], ['#f0e0c0', 1]]), text: '몬스터 주식회사', answer: '설리', alias: ['설리반', 'Sulley'] },
  { image: PALETTE([['#7bc043', 2], ['#f8e36b', 2], ['#2e78c2', 1]]), text: '인사이드 아웃', answer: '기쁨이', alias: ['조이', 'Joy'] },
  { image: PALETTE([['#5b8fd6', 3], ['#ffffff', 2], ['#1f3c88', 1]]), text: '인사이드 아웃', answer: '슬픔이', alias: ['새드니스', 'Sadness'] },
  { image: PALETTE([['#f6d21b', 3], ['#1f5fa8', 2], ['#8c8c8c', 1], ['#1b1b1b', 1]]), text: '슈퍼배드', answer: '미니언즈', alias: ['미니언', 'Minion', 'Minions'] },
  { image: PALETTE([['#8bb53c', 3], ['#e8d8b0', 2], ['#6b4226', 2]]), text: '드림웍스', answer: '슈렉', alias: ['Shrek'] },

  // 세서미 스트리트 · 스폰지밥
  { image: PALETTE([['#e2231a', 5], ['#f28c00', 1], ['#ffffff', 1]]), text: '세서미 스트리트', answer: '엘모', alias: ['Elmo'] },
  { image: PALETTE([['#1e74c6', 5], ['#ffffff', 1], ['#a0682d', 1]]), text: '세서미 스트리트', answer: '쿠키몬스터', alias: ['Cookie Monster'] },
  { image: PALETTE([['#f8d21b', 5], ['#f5795f', 1]]), text: '세서미 스트리트', answer: '빅버드', alias: ['Big Bird'] },
  { image: PALETTE([['#f8e52c', 4], ['#ffffff', 1], ['#8b5a2b', 1], ['#e3242b', 1]]), text: '비키니 시티', answer: '스폰지밥', alias: ['스펀지밥', '네모바지 스폰지밥', 'SpongeBob'] },
  { image: PALETTE([['#f6a6b4', 4], ['#9acd32', 2], ['#8a4fbf', 1]]), text: '비키니 시티', answer: '뚱이', alias: ['패트릭', 'Patrick'] },
  { image: PALETTE([['#a3cfc6', 4], ['#8b5a2b', 2]]), text: '비키니 시티', answer: '징징이', alias: ['스퀴드워드', 'Squidward'] },

  // 한국 애니메이션
  { image: PALETTE([['#2a7fd4', 3], ['#ffffff', 2], ['#f58025', 2], ['#f8d21b', 1]]), text: '한국 애니', answer: '뽀로로', alias: ['Pororo'] },
  { image: PALETTE([['#6abf4b', 4], ['#f6f0c8', 1], ['#ffffff', 1]]), text: '뽀롱뽀롱 뽀로로', answer: '크롱', alias: ['Crong'] },
  { image: PALETTE([['#f7b0c5', 4], ['#ffffff', 1], ['#d9708f', 1]]), text: '뽀롱뽀롱 뽀로로', answer: '루피', alias: ['Loopy'] },
  { image: PALETTE([['#ff6ea8', 4], ['#ffffff', 1], ['#ffd1e3', 1]]), text: '아기상어 노래', answer: '핑크퐁', alias: ['Pinkfong'] },
  { image: PALETTE([['#ffd53b', 4], ['#ffffff', 1], ['#1b1b1b', 1]]), text: '핑크퐁', answer: '아기상어', alias: ['베이비샤크', 'Baby Shark'] },
  { image: PALETTE([['#2a7fd4', 4], ['#ffffff', 1], ['#2b2b2b', 1]]), text: '꼬마버스', answer: '타요', alias: ['Tayo'] },
  { image: PALETTE([['#1e5bc6', 3], ['#ffffff', 2], ['#e2231a', 1]]), text: '로보카', answer: '폴리', alias: ['로보카폴리', 'Poli'] },
  { image: PALETTE([['#5fb848', 4], ['#f3ecc0', 1], ['#1b1b1b', 1]]), text: '한국 애니', answer: '둘리', alias: ['아기공룡 둘리', 'Dooly'] },

  // 일본 애니메이션
  { image: PALETTE([['#e2231a', 3], ['#f8d21b', 2], ['#f6c9a0', 1], ['#1b1b1b', 1]]), text: '일본 애니', answer: '신짱구', alias: ['짱구', '신노스케'] },
  { image: PALETTE([['#0096e0', 4], ['#ffffff', 2], ['#e2231a', 1], ['#f8d21b', 1]]), text: '일본 애니', answer: '도라에몽', alias: ['Doraemon'] },
  { image: PALETTE([['#f8d21b', 3], ['#1f3c88', 2], ['#f6c9a0', 1], ['#1b1b1b', 1]]), text: '도라에몽', answer: '노진구', alias: ['진구', '노비타', 'Nobita'] },
  { image: PALETTE([['#d32f2f', 3], ['#2b4c9c', 2], ['#e9c46a', 2], ['#f6c9a0', 1]]), text: '원피스', answer: '몽키 D. 루피', alias: ['루피', '몽키디루피', 'Luffy'] },
  { image: PALETTE([['#8b5a2b', 3], ['#f39cb8', 2], ['#ffffff', 1], ['#4aa3df', 1]]), text: '원피스', answer: '쵸파', alias: ['쵸퍼', '초파', '토니토니 쵸파', 'Chopper'] },
  { image: PALETTE([['#f58220', 3], ['#1b1b2b', 2], ['#f8d21b', 2], ['#2b5ca8', 1]]), text: '일본 애니', answer: '나루토', alias: ['우즈마키 나루토', 'Naruto'] },
  { image: PALETTE([['#f58025', 3], ['#1b1b1b', 2], ['#1f4db0', 1]]), text: '드래곤볼', answer: '손오공', alias: ['오공', 'Goku'] },
  { image: PALETTE([['#1f4db0', 2], ['#ffffff', 2], ['#f8d21b', 2], ['#e2231a', 1]]), text: '일본 애니', answer: '세일러문', alias: ['세라문', 'Sailor Moon'] },
  { image: PALETTE([['#7f8a8f', 4], ['#efe6cf', 2], ['#1b1b1b', 1]]), text: '지브리', answer: '토토로', alias: ['이웃집 토토로', 'Totoro'] },

  // 마블 · DC
  { image: PALETTE([['#d32f2f', 3], ['#1f4db0', 2], ['#1b1b1b', 1]]), text: '마블', answer: '스파이더맨', alias: ['스파이디', 'Spider-Man'] },
  { image: PALETTE([['#b71c1c', 3], ['#f2b632', 2], ['#7fe0f5', 1]]), text: '마블', answer: '아이언맨', alias: ['토니 스타크', 'Iron Man'] },
  { image: PALETTE([['#1f3c88', 3], ['#d32f2f', 1], ['#ffffff', 1], ['#c0c0c0', 1]]), text: '마블', answer: '캡틴 아메리카', alias: ['캡틴', '캡아', 'Captain America'] },
  { image: PALETTE([['#5a9e3a', 4], ['#6a3fa0', 1], ['#1b1b1b', 1]]), text: '마블', answer: '헐크', alias: ['Hulk'] },
  { image: PALETTE([['#b71c1c', 4], ['#1b1b1b', 2]]), text: '마블', answer: '데드풀', alias: ['Deadpool'] },
  { image: PALETTE([['#f8d21b', 3], ['#1f4db0', 2], ['#1b1b1b', 1]]), text: '마블', answer: '울버린', alias: ['로건', 'Wolverine'] },
  { image: PALETTE([['#1f4db0', 3], ['#d32f2f', 2], ['#f8d21b', 1]]), text: 'DC', answer: '슈퍼맨', alias: ['Superman'] },
  { image: PALETTE([['#1b1b1b', 3], ['#4a4a4a', 2], ['#f8d21b', 1]]), text: 'DC', answer: '배트맨', alias: ['Batman'] },
  { image: PALETTE([['#6a3fa0', 3], ['#4caf50', 2], ['#ffffff', 1], ['#d32f2f', 1]]), text: 'DC', answer: '조커', alias: ['Joker'] },

  // 해외 만화
  { image: PALETTE([['#4a90d9', 3], ['#ffffff', 3]]), text: '벨기에 만화', answer: '스머프', alias: ['개구쟁이 스머프', 'Smurf'] },
  { image: PALETTE([['#fed90f', 3], ['#ffffff', 2], ['#4a6fa5', 2]]), text: '심슨 가족', answer: '호머 심슨', alias: ['호머', 'Homer'] },
  { image: PALETTE([['#fed90f', 3], ['#f05a28', 2], ['#3a5fa8', 1]]), text: '심슨 가족', answer: '바트 심슨', alias: ['바트', 'Bart'] },
  { image: PALETTE([['#6f8fa8', 4], ['#ffffff', 1], ['#f39cb8', 1]]), text: '미국 만화', answer: '톰', alias: ['톰캣', 'Tom'] },
  { image: PALETTE([['#c07a3a', 4], ['#f3dcb0', 1], ['#f39cb8', 1]]), text: '미국 만화', answer: '제리', alias: ['Jerry'] },
  { image: PALETTE([['#ffffff', 4], ['#1b1b1b', 2], ['#d32f2f', 1]]), text: '피너츠', answer: '스누피', alias: ['Snoopy'] },
  { image: PALETTE([['#f8d21b', 3], ['#1b1b1b', 2], ['#f6c9a0', 1]]), text: '피너츠', answer: '찰리 브라운', alias: ['찰리', 'Charlie Brown'] },

  // 텔레토비
  { image: PALETTE([['#7d4fa0', 4], ['#c0c0c0', 1], ['#f3d1b0', 1]]), text: '텔레토비', answer: '보라돌이', alias: ['팅키윙키', 'Tinky Winky'] },
  { image: PALETTE([['#7cc243', 4], ['#c0c0c0', 1], ['#f3d1b0', 1]]), text: '텔레토비', answer: '뚜비', alias: ['딥시', 'Dipsy'] },
  { image: PALETTE([['#f8e04b', 4], ['#c0c0c0', 1], ['#f3d1b0', 1]]), text: '텔레토비', answer: '나나', alias: ['랄라', 'Laa-Laa'] },
  { image: PALETTE([['#e2231a', 4], ['#c0c0c0', 1], ['#f3d1b0', 1]]), text: '텔레토비', answer: '뽀', alias: ['Po'] },
];
