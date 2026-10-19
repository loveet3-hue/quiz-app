// 원소 기호 보고 이름 맞히기 — 원자번호 1~118 전부 (118문제)
// 이름은 대한화학회 원소 이름 기준(2014 개정, 113·115·117·118번은 2017 추가). 예전 이름은 alias로 인정.
QUESTIONS['elements'] = [
  { big: 'H', text: '이 원소의 이름은?', answer: '수소' }, // 1
  { big: 'He', text: '이 원소의 이름은?', answer: '헬륨' }, // 2
  { big: 'Li', text: '이 원소의 이름은?', answer: '리튬' }, // 3
  { big: 'Be', text: '이 원소의 이름은?', answer: '베릴륨' }, // 4
  { big: 'B', text: '이 원소의 이름은?', answer: '붕소' }, // 5
  { big: 'C', text: '이 원소의 이름은?', answer: '탄소' }, // 6
  { big: 'N', text: '이 원소의 이름은?', answer: '질소' }, // 7
  { big: 'O', text: '이 원소의 이름은?', answer: '산소' }, // 8
  { big: 'F', text: '이 원소의 이름은?', answer: '플루오린', alias: ['불소'] }, // 9
  { big: 'Ne', text: '이 원소의 이름은?', answer: '네온' }, // 10
  { big: 'Na', text: '이 원소의 이름은?', answer: '소듐', alias: ['나트륨'] }, // 11
  { big: 'Mg', text: '이 원소의 이름은?', answer: '마그네슘' }, // 12
  { big: 'Al', text: '이 원소의 이름은?', answer: '알루미늄' }, // 13
  { big: 'Si', text: '이 원소의 이름은?', answer: '규소', alias: ['실리콘'] }, // 14
  { big: 'P', text: '이 원소의 이름은?', answer: '인' }, // 15
  { big: 'S', text: '이 원소의 이름은?', answer: '황', alias: ['유황'] }, // 16
  { big: 'Cl', text: '이 원소의 이름은?', answer: '염소' }, // 17
  { big: 'Ar', text: '이 원소의 이름은?', answer: '아르곤' }, // 18
  { big: 'K', text: '이 원소의 이름은?', answer: '포타슘', alias: ['칼륨'] }, // 19
  { big: 'Ca', text: '이 원소의 이름은?', answer: '칼슘' }, // 20
  { big: 'Sc', text: '이 원소의 이름은?', answer: '스칸듐' }, // 21
  { big: 'Ti', text: '이 원소의 이름은?', answer: '타이타늄', alias: ['티타늄'] }, // 22
  { big: 'V', text: '이 원소의 이름은?', answer: '바나듐' }, // 23
  { big: 'Cr', text: '이 원소의 이름은?', answer: '크로뮴', alias: ['크롬'] }, // 24
  { big: 'Mn', text: '이 원소의 이름은?', answer: '망가니즈', alias: ['망간'] }, // 25
  { big: 'Fe', text: '이 원소의 이름은?', answer: '철' }, // 26
  { big: 'Co', text: '이 원소의 이름은?', answer: '코발트' }, // 27
  { big: 'Ni', text: '이 원소의 이름은?', answer: '니켈' }, // 28
  { big: 'Cu', text: '이 원소의 이름은?', answer: '구리', alias: ['동'] }, // 29
  { big: 'Zn', text: '이 원소의 이름은?', answer: '아연' }, // 30
  { big: 'Ga', text: '이 원소의 이름은?', answer: '갈륨' }, // 31
  { big: 'Ge', text: '이 원소의 이름은?', answer: '저마늄', alias: ['게르마늄'] }, // 32
  { big: 'As', text: '이 원소의 이름은?', answer: '비소' }, // 33
  { big: 'Se', text: '이 원소의 이름은?', answer: '셀레늄' }, // 34
  { big: 'Br', text: '이 원소의 이름은?', answer: '브로민', alias: ['브롬'] }, // 35
  { big: 'Kr', text: '이 원소의 이름은?', answer: '크립톤' }, // 36
  { big: 'Rb', text: '이 원소의 이름은?', answer: '루비듐' }, // 37
  { big: 'Sr', text: '이 원소의 이름은?', answer: '스트론튬' }, // 38
  { big: 'Y', text: '이 원소의 이름은?', answer: '이트륨' }, // 39
  { big: 'Zr', text: '이 원소의 이름은?', answer: '지르코늄' }, // 40
  { big: 'Nb', text: '이 원소의 이름은?', answer: '나이오븀', alias: ['니오브', '니오븀'] }, // 41
  { big: 'Mo', text: '이 원소의 이름은?', answer: '몰리브데넘', alias: ['몰리브덴'] }, // 42
  { big: 'Tc', text: '이 원소의 이름은?', answer: '테크네튬' }, // 43
  { big: 'Ru', text: '이 원소의 이름은?', answer: '루테늄' }, // 44
  { big: 'Rh', text: '이 원소의 이름은?', answer: '로듐' }, // 45
  { big: 'Pd', text: '이 원소의 이름은?', answer: '팔라듐' }, // 46
  { big: 'Ag', text: '이 원소의 이름은?', answer: '은' }, // 47
  { big: 'Cd', text: '이 원소의 이름은?', answer: '카드뮴' }, // 48
  { big: 'In', text: '이 원소의 이름은?', answer: '인듐' }, // 49
  { big: 'Sn', text: '이 원소의 이름은?', answer: '주석' }, // 50
  { big: 'Sb', text: '이 원소의 이름은?', answer: '안티모니', alias: ['안티몬'] }, // 51
  { big: 'Te', text: '이 원소의 이름은?', answer: '텔루륨', alias: ['텔루르'] }, // 52
  { big: 'I', text: '이 원소의 이름은?', answer: '아이오딘', alias: ['요오드'] }, // 53
  { big: 'Xe', text: '이 원소의 이름은?', answer: '제논', alias: ['크세논'] }, // 54
  { big: 'Cs', text: '이 원소의 이름은?', answer: '세슘' }, // 55
  { big: 'Ba', text: '이 원소의 이름은?', answer: '바륨' }, // 56
  { big: 'La', text: '이 원소의 이름은?', answer: '란타넘', alias: ['란탄'] }, // 57
  { big: 'Ce', text: '이 원소의 이름은?', answer: '세륨' }, // 58
  { big: 'Pr', text: '이 원소의 이름은?', answer: '프라세오디뮴' }, // 59
  { big: 'Nd', text: '이 원소의 이름은?', answer: '네오디뮴' }, // 60
  { big: 'Pm', text: '이 원소의 이름은?', answer: '프로메튬' }, // 61
  { big: 'Sm', text: '이 원소의 이름은?', answer: '사마륨' }, // 62
  { big: 'Eu', text: '이 원소의 이름은?', answer: '유로퓸' }, // 63
  { big: 'Gd', text: '이 원소의 이름은?', answer: '가돌리늄' }, // 64
  { big: 'Tb', text: '이 원소의 이름은?', answer: '터븀', alias: ['테르븀'] }, // 65
  { big: 'Dy', text: '이 원소의 이름은?', answer: '디스프로슘' }, // 66
  { big: 'Ho', text: '이 원소의 이름은?', answer: '홀뮴' }, // 67
  { big: 'Er', text: '이 원소의 이름은?', answer: '어븀', alias: ['에르븀'] }, // 68
  { big: 'Tm', text: '이 원소의 이름은?', answer: '툴륨' }, // 69
  { big: 'Yb', text: '이 원소의 이름은?', answer: '이터븀', alias: ['이테르븀'] }, // 70
  { big: 'Lu', text: '이 원소의 이름은?', answer: '루테튬' }, // 71
  { big: 'Hf', text: '이 원소의 이름은?', answer: '하프늄' }, // 72
  { big: 'Ta', text: '이 원소의 이름은?', answer: '탄탈럼', alias: ['탄탈'] }, // 73
  { big: 'W', text: '이 원소의 이름은?', answer: '텅스텐', alias: ['볼프람'] }, // 74
  { big: 'Re', text: '이 원소의 이름은?', answer: '레늄' }, // 75
  { big: 'Os', text: '이 원소의 이름은?', answer: '오스뮴' }, // 76
  { big: 'Ir', text: '이 원소의 이름은?', answer: '이리듐' }, // 77
  { big: 'Pt', text: '이 원소의 이름은?', answer: '백금', alias: ['플래티넘', '플래티늄'] }, // 78
  { big: 'Au', text: '이 원소의 이름은?', answer: '금' }, // 79
  { big: 'Hg', text: '이 원소의 이름은?', answer: '수은' }, // 80
  { big: 'Tl', text: '이 원소의 이름은?', answer: '탈륨' }, // 81
  { big: 'Pb', text: '이 원소의 이름은?', answer: '납' }, // 82
  { big: 'Bi', text: '이 원소의 이름은?', answer: '비스무트', alias: ['비스무스'] }, // 83
  { big: 'Po', text: '이 원소의 이름은?', answer: '폴로늄' }, // 84
  { big: 'At', text: '이 원소의 이름은?', answer: '아스타틴' }, // 85
  { big: 'Rn', text: '이 원소의 이름은?', answer: '라돈' }, // 86
  { big: 'Fr', text: '이 원소의 이름은?', answer: '프랑슘' }, // 87
  { big: 'Ra', text: '이 원소의 이름은?', answer: '라듐' }, // 88
  { big: 'Ac', text: '이 원소의 이름은?', answer: '악티늄' }, // 89
  { big: 'Th', text: '이 원소의 이름은?', answer: '토륨' }, // 90
  { big: 'Pa', text: '이 원소의 이름은?', answer: '프로트악티늄' }, // 91
  { big: 'U', text: '이 원소의 이름은?', answer: '우라늄' }, // 92
  { big: 'Np', text: '이 원소의 이름은?', answer: '넵투늄' }, // 93
  { big: 'Pu', text: '이 원소의 이름은?', answer: '플루토늄' }, // 94
  { big: 'Am', text: '이 원소의 이름은?', answer: '아메리슘' }, // 95
  { big: 'Cm', text: '이 원소의 이름은?', answer: '퀴륨' }, // 96
  { big: 'Bk', text: '이 원소의 이름은?', answer: '버클륨' }, // 97
  { big: 'Cf', text: '이 원소의 이름은?', answer: '캘리포늄' }, // 98
  { big: 'Es', text: '이 원소의 이름은?', answer: '아인슈타이늄' }, // 99
  { big: 'Fm', text: '이 원소의 이름은?', answer: '페르뮴' }, // 100
  { big: 'Md', text: '이 원소의 이름은?', answer: '멘델레븀' }, // 101
  { big: 'No', text: '이 원소의 이름은?', answer: '노벨륨' }, // 102
  { big: 'Lr', text: '이 원소의 이름은?', answer: '로렌슘' }, // 103
  { big: 'Rf', text: '이 원소의 이름은?', answer: '러더포듐' }, // 104
  { big: 'Db', text: '이 원소의 이름은?', answer: '더브늄' }, // 105
  { big: 'Sg', text: '이 원소의 이름은?', answer: '시보귬' }, // 106
  { big: 'Bh', text: '이 원소의 이름은?', answer: '보륨' }, // 107
  { big: 'Hs', text: '이 원소의 이름은?', answer: '하슘' }, // 108
  { big: 'Mt', text: '이 원소의 이름은?', answer: '마이트너륨' }, // 109
  { big: 'Ds', text: '이 원소의 이름은?', answer: '다름슈타튬' }, // 110
  { big: 'Rg', text: '이 원소의 이름은?', answer: '뢴트게늄' }, // 111
  { big: 'Cn', text: '이 원소의 이름은?', answer: '코페르니슘' }, // 112
  { big: 'Nh', text: '이 원소의 이름은?', answer: '니호늄' }, // 113
  { big: 'Fl', text: '이 원소의 이름은?', answer: '플레로븀' }, // 114
  { big: 'Mc', text: '이 원소의 이름은?', answer: '모스코븀' }, // 115
  { big: 'Lv', text: '이 원소의 이름은?', answer: '리버모륨' }, // 116
  { big: 'Ts', text: '이 원소의 이름은?', answer: '테네신' }, // 117
  { big: 'Og', text: '이 원소의 이름은?', answer: '오가네손' }, // 118
];
