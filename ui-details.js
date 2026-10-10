// 頁面互動；文字與路線來源放在 trip-data.json。
const phraseAudio = new Audio();
phraseAudio.preload = 'none';
phraseAudio.id = 'phraseAudio';
let playingPhrase = '';
function phraseButtonState(id, playing) {
  document.querySelectorAll('[data-speak]').forEach(b => {
    const active = playing && b.dataset.speak === id;
    b.setAttribute('aria-pressed', String(active));
    b.textContent = active ? '停止播放' : '播放日文';
  });
}
phraseAudio.addEventListener('ended', () => {playingPhrase='';phraseButtonState('',false);});
function detailLinks(links) {
  return (links || []).map(x => safeURL(x.url) ? `<a class="nav-link resource-link" href="${safeURL(x.url)}" target="_blank" rel="noopener">${esc(x.label)} ↗</a>` : '').join('');
}
function phrasesView() {
  const groups = [...new Set(data.phrases.map(p => p.group))];
  return `<div class="page-header"><span class="eyebrow">A FEW WORDS FOR THE ROAD</span><h1>旅遊日語</h1><p>看中文，點日文旁的按鈕播放。也可以直接把畫面拿給店員看。</p></div><div class="phrase-groups">${groups.map(group=>`<section class="phrase-group"><div class="sectionline"><h3>${esc(group)}</h3></div>${data.phrases.filter(p=>p.group===group).map(p=>`<article class="phrase-card"><p class="phrase-zh">${esc(p.zh)}</p><div class="phrase-japanese"><p lang="ja">${esc(p.ja)}</p><button class="nav-link speech-button" data-speak="${esc(p.id)}" aria-label="播放日文：${esc(p.zh)}" aria-pressed="false">播放日文</button></div></article>`).join('')}</section>`).join('')}</div><p class="fine">香菇的日文是「しいたけ」。語句表達不能吃，沒有代你宣稱過敏；混合菇類、湯底與套餐也請店員確認。首次連網載入完成後，日語音訊可離線播放；iPhone 請確認媒體音量。</p>${backupSection()}${footnote()}`;
}
function backupSection() {
  return `<section class="info-card backup-section"><span class="eyebrow">A COPY FOR THE ROAD</span><h3>保存、分享與恢復</h3><p>行程調整只存於這台裝置。清除瀏覽資料或更換手機前，先匯出備份。</p><div class="backup-actions"><button class="solid editor-only" data-action="export">匯出備份</button><button class="solid light" data-action="import">匯入備份</button><button class="solid light editor-only" data-action="share-backup">分享目前版本</button><button class="solid light" data-action="share-link">分享觀看連結</button></div><div class="sharing-state">同行者看發布時的行程。想讓對方看你剛改的版本，分享備份，對方再匯入。尚未發布前，本機預覽網址無法從其他手機連入。</div><button class="subtle editor-only" data-action="reset">恢復原始規劃</button><h3>放到 iPhone 主畫面</h3><p>發布後，用 Safari 打開網址 → 分享 → 加入主畫面。先連網開一次，之後可以離線看行程、路線圖與播放日語；天氣更新與導航仍需網路。</p><p class="fine">Safari 分頁與主畫面 App 可能使用不同儲存空間，首次加入後可匯入備份。<a href="https://web.dev/learn/pwa/installation" target="_blank" rel="noopener">PWA 安裝說明 ↗</a></p></section>`;
}
function routeMapPanel(view='map') {
  const r=data.walkingRoute;
  if(view==='map'&&r.interactiveMap)return `<iframe class="walk-map-frame" title="上高地散策地圖：點數字景點導航" src="${esc(r.interactiveMap)}"></iframe><p class="fine"><a class="nav-link" href="${esc(r.interactiveMap)}" target="_blank" rel="noopener">另開完整地圖 ↗</a></p>`;
  return `<a class="route-image-link" href="${esc(r.image)}" target="_blank" rel="noopener"><img class="route-image" src="${esc(r.image)}" alt="原版步行順序示意圖：大正池、田代池、田代橋、河童橋、岳澤濕原、明神池及明神橋，最後回巴士總站。"></a><p class="fine">點圖片可另開並放大。</p>`;
}
function sizeWalkMap(frame){try{frame.style.height=frame.contentDocument.documentElement.scrollHeight+'px';}catch{}}
function returnBusPanel(){
  const b=data.walkingRoute.returnBus;if(!b)return '';
  return `<section class="route-extra return-bus-plan"><h3>17:00倒數第二班，幾點到河童橋？</h3><p><b>${esc(b.arriveKappa)}前抵達⑤河童橋、${esc(b.leaveKappa)}前出發。</b>依原路線分段上限${b.walkRange[1]}分純步行，加池內${b.pondStay}分、候車${b.queue}分與橋邊準備${b.prepare}分倒推。這是規劃估算，並非最晚保證時間。</p><p>${esc(b.condition)}</p><ol class="walk-segments">${b.timeline.map(t=>`<li><span>${esc(t.label)}</span><b>${esc(t.time)}</b></li>`).join('')}</ol><p><b>倒數第二班：</b>⑪總站${esc(b.depart)} → 平湯${esc(b.hirayu)} → あかんだな${esc(b.parking)}。<br><b>末班：</b>${esc(b.lastDepart)} → 平湯${esc(b.lastHirayu)} → 停車場${esc(b.lastParking)}。</p><p>${esc(b.boardingNote)}</p><p>${esc(b.stayNote)}</p><div class="resource-links">${detailLinks([{label:'濃飛巴士｜2026官方回程時刻表',url:b.source}])}</div></section>`;
}
document.addEventListener('load',e=>{if(e.target.matches?.('.walk-map-frame'))sizeWalkMap(e.target);},true);
window.addEventListener('resize',()=>document.querySelectorAll('.walk-map-frame').forEach(sizeWalkMap));
function openRoute() {
  const r=data.walkingRoute;
  $('#routeContent').innerHTML=`<p class="fine">數字可開Google Maps；地圖不按比例，現場請依步道指標。</p>
  <div class="map-tabs" aria-label="路線圖版本"><button class="small-button selected" data-map-view="map" aria-pressed="true">散策地圖・可點景點</button><button class="small-button" data-map-view="order" aria-pressed="false">原步行順序圖</button></div>
  <div id="routeMapPanel">${routeMapPanel()}</div>
  <div class="route-total"><b>完整散策・純步行約3小時10～3小時30分</b><p>含大正池起步、池區短程往返與過橋回程。停留、池內參觀、午餐與排隊另計；橋頭回程與池區短程為規劃估算。</p></div>
  <ol class="walk-segments">${r.segments.map(s=>`<li><span>${esc(s.start)} → ${esc(s.end)}</span><b>${s.minutes}${s.minutesMax?`–${s.minutesMax}`:''}分${s.distance?` · ${esc(s.distance)}`:''}${s.estimate?' · 估算':''}</b></li>`).join('')}</ol>
  <section class="route-extra"><h3>回程從哪裡算</h3><p>${esc(r.returnNote)}</p><p>從⑩一之池離開至⑪巴士總站，整段抓約65–75分。官方「總站到明神55分」的明神指左岸明神聚落，不能直接當作池內回程時間。</p>
  <h3>走到河童橋再決定</h3><p>輕鬆版：在河童橋休息、吃飯後回巴士總站。延伸版：過河童橋走右岸，經岳澤濕原到⑨奧宮與池區入口、⑩一之池；參觀後退出池區、過⑧明神橋，再沿左岸回總站。</p><p>明神池成人¥500，兩人¥1,000；池內參觀、拍照另留15–30分。</p>
  <h3>原目標15:30回程</h3><p>從12:35河童橋出發，含池內停留約14:55–15:25回站。15:30是原目標班次，須提早15–20分鐘排隊；走得較慢或停留較久，就依當日班表調整回程。若累了、下雨或時間不足，在河童橋選輕鬆版。</p><p class="fine">2026班表已於10/10核對；你提供的ALPICO連結現在轉至濃飛英文頁，也已標示2026。當日以業者運行公告為準。</p><div class="resource-links">${detailLinks(r.links)}</div></section>${returnBusPanel()}`;
  $('#routeDialog').showModal();$('#routeDialog').scrollTop=0;
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.action==='route-map'){openRoute();return;}
  if(b.dataset.action==='close-route'){$('#routeDialog').close();return;}
  if(b.dataset.mapView){$('#routeMapPanel').innerHTML=routeMapPanel(b.dataset.mapView);document.querySelectorAll('[data-map-view]').forEach(x=>{const active=x===b;x.classList.toggle('selected',active);x.setAttribute('aria-pressed',String(active));});return;}
  if(b.dataset.speak){
    const id=b.dataset.speak,p=data.phrases.find(x=>x.id===id);if(!p)return;
    if(playingPhrase===id&&!phraseAudio.paused){phraseAudio.pause();playingPhrase='';phraseButtonState('',false);return;}
    phraseAudio.pause();playingPhrase=id;phraseAudio.src=p.audio;phraseButtonState(id,true);
    try{await phraseAudio.play();}catch{playingPhrase='';phraseButtonState('',false);toast('音訊暫時無法播放，請連網重試並確認媒體音量。');}
  }
});
