// 목록 카드 표지 중 바깥 사진(위키미디어)·국기를 쓰는 것 목록. tools/make_thumbs.py 가 씀.
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=process.argv[2];
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=[...html.matchAll(/<script src="\/([^"?]+\.js)/g)].map(m=>m[1]).filter(f=>!f.endsWith('app.js'));
const ctx={localStorage:{getItem:()=>null,setItem(){}},console};vm.createContext(ctx);
vm.runInContext(files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n;\n')+';this.Q=QUIZZES;',ctx);
for(const q of ctx.Q){const c=q.cover; if(c.flags) console.log(q.id,'FLAGS',c.flags.join(',')); else if(c.image&&!c.image.startsWith('data:')) console.log(q.id,'IMG',c.image);}
