// 설정값. 바꾼 뒤에는 python3 tools/bump_version.py 로 버전을 올리고 올릴 것.
const CONFIG = {
  // 익명 참여 수 집계 서버 (Apps Script 웹 앱, count_server/). 비우면 집계·인기순 정렬을 안 함.
  COUNT_API: 'https://script.google.com/macros/s/AKfycbxwiyNDSkizFdIYR9GHn5Ps1LmoMxxjaiR9U0gusBWb4IsVhHYW3Pa90_VsiSbQ_7G3/exec',

  // 광고 (Google 애드센스). 승인 후 client와 슬롯 번호를 넣으면 실제 광고가 나온다.
  ADS: {
    client: 'ca-pub-3499693117852626', // 애드센스 게시자 번호 (광고 단위 번호는 아래 slots에)
    slots: {
      homeFeed: '', // 목록 중간 (카드 6개 뒤)
      homeBottom: '', // 목록 맨 아래
      result: '', // 결과 화면
    },
    placeholder: false, // client가 비어 있을 때 '광고 영역' 자리 표시를 보여줄지 (지금은 숨김)
  },
};
