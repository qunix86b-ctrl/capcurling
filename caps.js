// Shared crown-cap artwork for the field, player card and scoreboard.
function capArtwork(id) {
  const colors=['#d71920','#087b43','#f57c16','#0756a4','#57247b','#f5fcff','#efcf20','#971b42'];
  let edge='';
  for(let i=0;i<168;i++){
    const a=i*Math.PI*2/168-Math.PI/2;
    const r=45.4+2.1*Math.cos(i*Math.PI/4);
    edge+=`${i?'L':'M'}${(50+Math.cos(a)*r).toFixed(2)},${(49+Math.sin(a)*r).toFixed(2)} `;
  }
  edge+='Z';
  const labels=[
    '<text x="50" y="50" font-family="Georgia,serif" font-style="italic" font-weight="bold" font-size="17" transform="rotate(-12 50 49)">Coca-Cola</text><path d="M23 60 Q40 68 60 60 T79 59" fill="none" stroke="white" stroke-width="2"/><text x="50" y="28" font-size="5" letter-spacing="2">ORIGINAL TASTE</text><text x="50" y="77" font-size="5" letter-spacing="1">TRADE MARK REGISTERED</text>',
    '<path d="M50 17 53 25 62 25 55 31 58 39 50 34 42 39 45 31 38 25 47 25Z"/><text x="50" y="58" font-size="23" font-weight="900">칠성</text><text x="50" y="71" font-size="10" font-weight="bold" letter-spacing="2">사이다</text><text x="50" y="82" font-size="4.5" letter-spacing="1">CHILSUNG CIDER</text>',
    '<path d="M48 28Q52 14 70 20Q62 32 48 28" fill="#4ba52d"/><text x="50" y="57" font-size="25" font-weight="900" font-style="italic" stroke="#174583" stroke-width="3" paint-order="stroke">Fanta</text><text x="50" y="73" font-size="7" letter-spacing="1">ORANGE</text>',
    '<circle cx="50" cy="43" r="22" fill="white"/><path d="M29 39 A22 22 0 0 1 72 40 Q50 53 29 39" fill="#ed2939"/><path d="M29 46 Q49 59 71 46 A22 22 0 0 1 29 46" fill="#1767b0"/><text x="50" y="78" font-size="12" font-weight="900" letter-spacing="2">PEPSI</text>',
    '<text x="50" y="40" font-family="Georgia,serif" font-size="18" font-weight="bold">Welch’s</text><g fill="#b592cd" stroke="#eee" stroke-width=".6"><circle cx="43" cy="52" r="5"/><circle cx="54" cy="52" r="5"/><circle cx="38" cy="60" r="5"/><circle cx="49" cy="60" r="5"/><circle cx="59" cy="60" r="5"/><circle cx="44" cy="68" r="5"/><circle cx="54" cy="68" r="5"/><circle cx="49" cy="76" r="5"/></g><path d="M49 50Q37 34 35 45Q36 50 49 50" fill="#80b357"/>',
    '<g fill="#218baa"><text x="50" y="31" font-size="6" letter-spacing="2">LOTTE</text><text x="50" y="54" font-size="22" font-weight="900">밀키스</text><text x="50" y="69" font-size="8" font-style="italic">Milkis</text><path d="M25 76 Q40 67 50 77 T77 76" fill="none" stroke="#72cbd2" stroke-width="2"/></g>',
    '<g fill="#276542"><path d="M40 34 Q45 18 64 27 Q61 38 40 34"/><text x="50" y="53" font-size="16" font-weight="900">LEMON</text><text x="50" y="67" font-size="8" letter-spacing="2">SODA</text><text x="50" y="78" font-size="4">NATURALLY REFRESHING</text></g>',
    '<path d="M43 46Q49 32 57 26Q64 35 62 47" fill="none" stroke="#a9c274" stroke-width="2"/><circle cx="40" cy="48" r="10" fill="#ec4860"/><circle cx="63" cy="49" r="10" fill="#df3852"/><text x="50" y="71" font-size="12" font-family="Georgia,serif" font-weight="bold">CHERRY</text><text x="50" y="80" font-size="5" letter-spacing="2">CRAFT SODA</text>'
  ];
  const flutes=Array.from({length:21},(_,i)=>`<path d="M50 3L50 10" transform="rotate(${i*360/21} 50 49)" stroke="#fff" stroke-opacity=".55" stroke-width="1.3"/><path d="M53 4L52 10" transform="rotate(${i*360/21} 50 49)" stroke="#202326" stroke-opacity=".6" stroke-width="1.6"/>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 103"><defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffce7"/><stop offset=".23" stop-color="#bfc1b9"/><stop offset=".46" stop-color="#f3f2dd"/><stop offset=".72" stop-color="#686b63"/><stop offset="1" stop-color="#d6d2ba"/></linearGradient><radialGradient id="glaze" cx=".3" cy=".18" r=".85"><stop stop-color="white" stop-opacity=".38"/><stop offset=".42" stop-color="white" stop-opacity="0"/><stop offset=".8" stop-color="black" stop-opacity=".06"/><stop offset="1" stop-color="black" stop-opacity=".4"/></radialGradient></defs><ellipse cx="51" cy="55" rx="46" ry="46" fill="#172219" opacity=".22"/><path d="${edge}" fill="#575b50" transform="translate(0 3)"/><path d="${edge}" fill="url(#metal)" stroke="#74776c" stroke-width=".6"/>${flutes}<circle cx="50" cy="49" r="40" fill="${colors[id]}" stroke="#393c30" stroke-width="1"/><circle cx="50" cy="49" r="37.8" fill="none" stroke="white" stroke-opacity=".48" stroke-width=".65"/><g fill="white" text-anchor="middle" font-family="Arial,Noto Sans KR,sans-serif">${labels[id]}</g><circle cx="50" cy="49" r="39.4" fill="url(#glaze)"/><path d="M17 43A34 34 0 0 1 65 18" fill="none" stroke="white" stroke-opacity=".52" stroke-width="1.4"/><path d="M23 77A39 39 0 0 0 86 57" fill="none" stroke="#0b1510" stroke-opacity=".4" stroke-width="1.5"/></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
const capTextures=Array.from({length:8},(_,id)=>{const image=new Image();image.src=capArtwork(id);return image;});
