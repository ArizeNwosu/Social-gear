const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');

function htmlFiles(dir=root){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    if(entry.name==='.git'||entry.name==='node_modules')return [];
    const target=path.join(dir,entry.name);
    return entry.isDirectory()?htmlFiles(target):entry.name.endsWith('.html')?[target]:[];
  });
}

test('every HTML page opts into the mobile viewport and safe areas',()=>{
  const failures=[];
  for(const file of htmlFiles()){
    const html=fs.readFileSync(file,'utf8');
    if(!/viewport-fit=cover/.test(html)||!/interactive-widget=resizes-content/.test(html))failures.push(path.relative(root,file));
    assert.match(html,/name="theme-color" media="\(prefers-color-scheme: light\)"/,file);
    assert.match(html,/name="theme-color" media="\(prefers-color-scheme: dark\)"/,file);
    assert.doesNotMatch(html,/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i,file);
  }
  assert.deepEqual(failures,[]);
});

test('every HTML page loads the shared mobile platform layer',()=>{
  const failures=htmlFiles().filter(file=>{
    const match=fs.readFileSync(file,'utf8').match(/<link rel="stylesheet" href="([^"]*mobile\.css)">/);
    return !match||!fs.existsSync(path.resolve(path.dirname(file),match[1]));
  }).map(file=>path.relative(root,file));
  assert.deepEqual(failures,[]);
});

test('mobile layer keeps zoom, touch, hover, and safe-area behavior native',()=>{
  const css=fs.readFileSync(path.join(root,'mobile.css'),'utf8');
  assert.match(css,/-webkit-tap-highlight-color:\s*transparent/);
  assert.match(css,/@media \(pointer: coarse\)[\s\S]*font-size:\s*16px/);
  assert.match(css,/touch-action:\s*manipulation/);
  assert.match(css,/@media \(hover: none\), \(pointer: coarse\)/);
  assert.match(css,/env\(safe-area-inset-bottom/);
  assert.match(css,/100dvh/);
});
