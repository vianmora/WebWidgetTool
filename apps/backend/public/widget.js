"use strict";(()=>{function M(t,e){if(document.getElementById(`ww-styles-${e}`))return;let o=document.createElement("style");o.id=`ww-styles-${e}`,o.textContent=t,document.head.appendChild(o)}var z=`
  .ww-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; box-sizing: border-box; }
  .ww-widget *, .ww-widget *::before, .ww-widget *::after { box-sizing: inherit; }
  .ww-widget a { color: inherit; }
  .ww-stars { display: inline-flex; gap: 2px; }
  .ww-star { color: #f59e0b; font-size: 16px; }
  .ww-star.empty { color: #d1d5db; }
  .ww-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .ww-powered-by { text-align: center; padding: 8px; font-size: 11px; color: #9ca3af; margin-top: 8px; }
  .ww-powered-by a { color: #621B7A; text-decoration: none; font-weight: 600; }
  .ww-quota-banner { background: #fef3c7; border: 1px solid #f59e0b; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #92400e; text-align: center; margin-bottom: 8px; }
`;function $(t){let e=Math.round(t),o='<span class="ww-stars" aria-label="'+t+' \xE9toiles">';for(let n=1;n<=5;n++)o+=`<span class="ww-star${n>e?" empty":""}">\u2605</span>`;return o+"</span>"}function C(){return'<div class="ww-powered-by">Propuls\xE9 par <a href="https://webwidget.app" target="_blank" rel="noopener">WebWidget</a></div>'}function T(){return'<div class="ww-quota-banner">Quota de vues atteint pour ce mois. <a href="https://webwidget.app/billing" target="_blank">Passer au plan sup\xE9rieur</a></div>'}function H(t,e,o){let n=o.reviews||[],c=e.theme||"light",f=e.accentColor||"#621B7A",r=e.layout||"list",a=c==="dark",i=a?"#1f2937":"#ffffff",l=a?"#374151":"#f9fafb",p=a?"#f9fafb":"#1D1E18",x=a?"#9ca3af":"#6b7280",m=`background:${l};border-radius:8px;padding:16px;margin-bottom:12px;border:1px solid ${a?"#4b5563":"#e5e7eb"}`,g=r==="grid"?"display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px":"",s=`<div style="background:${i};padding:16px;border-radius:8px;font-family:inherit">`;if(n.length===0)s+=`<p style="color:${x};text-align:center">Aucun avis disponible.</p>`;else{s+=`<div style="${g}">`;for(let d of n){let h=new Date(d.time*1e3).toLocaleDateString("fr-FR");s+=`
        <div style="${m}">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            ${d.profile_photo_url?`<img src="${d.profile_photo_url}" alt="${d.author_name}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`:`<div style="width:40px;height:40px;border-radius:50%;background:${f};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px">${d.author_name.charAt(0)}</div>`}
            <div>
              <div style="font-weight:600;color:${p};font-size:14px">${S(d.author_name)}</div>
              <div style="font-size:12px;color:${x}">${d.relative_time_description||h}</div>
            </div>
          </div>
          ${$(d.rating)}
          ${d.text?`<p style="margin:10px 0 0;color:${p};font-size:13px;line-height:1.5">${S(d.text)}</p>`:""}
        </div>`}s+="</div>"}s+="</div>",t.innerHTML=s}function S(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function _(t,e){let o=(e.phone||"").replace(/\D/g,""),n=encodeURIComponent(e.message||""),c=e.position||"bottom-right",f=e.label||"",r=e.size||56,a="#25D366",i=c==="bottom-left"?"bottom:20px;left:20px":"bottom:20px;right:20px",l=document.createElement("div");l.innerHTML=`
    <a href="https://wa.me/${o}${n?"?text="+n:""}"
       target="_blank" rel="noopener"
       style="position:fixed;${i};z-index:9999;
              display:flex;align-items:center;gap:8px;
              background:${a};color:#fff;
              border-radius:${f?"28px":"50%"};
              width:${f?"auto":r+"px"};
              height:${r}px;
              padding:${f?"0 16px 0 14px":"0"};
              justify-content:center;
              box-shadow:0 4px 12px rgba(0,0,0,.25);
              text-decoration:none;font-weight:600;font-size:14px;
              transition:transform .2s,box-shadow .2s"
       onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 6px 16px rgba(0,0,0,.3)'"
       onmouseout="this.style.transform='';this.style.boxShadow='0 4px 12px rgba(0,0,0,.25)'"
       aria-label="Nous contacter sur WhatsApp">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L0 24l6.335-1.502A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.013-1.375l-.36-.214-3.724.883.93-3.617-.235-.372A9.817 9.817 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818 5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818z"/>
      </svg>
      ${f?`<span>${f}</span>`:""}
    </a>`,document.body.appendChild(l.firstElementChild)}function A(t,e){let o=e.username||"",n=e.label||"",c=e.position||"bottom-right",f=e.size||56,r="#0088cc",a=c==="bottom-left"?"bottom:20px;left:20px":"bottom:20px;right:20px",i=document.createElement("a");i.href=`https://t.me/${o}`,i.target="_blank",i.rel="noopener",i.setAttribute("aria-label","Nous contacter sur Telegram"),i.style.cssText=`position:fixed;${a};z-index:9999;display:flex;align-items:center;gap:8px;
    background:${r};color:#fff;border-radius:${n?"28px":"50%"};
    width:${n?"auto":f+"px"};height:${f}px;
    padding:${n?"0 16px 0 14px":"0"};justify-content:center;
    box-shadow:0 4px 12px rgba(0,0,0,.25);text-decoration:none;font-weight:600;font-size:14px;
    transition:transform .2s,box-shadow .2s`,i.innerHTML=`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.16 13.48l-2.952-.924c-.643-.203-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.98.079z"/>
    </svg>
    ${n?`<span>${n}</span>`:""}`,i.addEventListener("mouseover",()=>{i.style.transform="scale(1.05)"}),i.addEventListener("mouseout",()=>{i.style.transform=""}),document.body.appendChild(i)}var Z={facebook:'<path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.428c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>',instagram:'<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>',twitter:'<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',linkedin:'<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',youtube:'<path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>',tiktok:'<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',github:'<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',pinterest:'<path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>',whatsapp:'<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>'};function B(t,e){let o=e.links||[],n=e.size||32,c=e.color||"brand",f=e.layout||"row",r={facebook:"#1877F2",instagram:"#E4405F",twitter:"#000000",linkedin:"#0A66C2",youtube:"#FF0000",tiktok:"#010101",github:"#181717",pinterest:"#BD081C",whatsapp:"#25D366"},i=`<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;${f==="column"?"flex-direction:column":""}">`;for(let l of o){let p=Z[l.network];if(!p)continue;let x=c==="brand"?r[l.network]||"#621B7A":c==="custom"?e.customColor||"#621B7A":"#374151";i+=`
      <a href="${l.url}" target="_blank" rel="noopener"
         aria-label="${l.network}"
         style="display:inline-flex;align-items:center;justify-content:center;
                width:${n}px;height:${n}px;color:${x};
                transition:opacity .2s;text-decoration:none"
         onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">
        <svg width="${n*.6}" height="${n*.6}" viewBox="0 0 24 24" fill="currentColor">${p}</svg>
      </a>`}i+="</div>",t.innerHTML=i}function D(t,e){let o=e.networks||["facebook","x","linkedin","whatsapp","copy"],n=e.url||"",c=e.title||"",f=e.position||"inline",r=e.orientation||"horizontal",a={facebook:()=>`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(n||location.href)}`,x:()=>`https://x.com/intent/tweet?url=${encodeURIComponent(n||location.href)}&text=${encodeURIComponent(c)}`,linkedin:()=>`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(n||location.href)}`,whatsapp:()=>`https://wa.me/?text=${encodeURIComponent((c?c+" ":"")+(n||location.href))}`},i={facebook:"Facebook",x:"X",linkedin:"LinkedIn",whatsapp:"WhatsApp",copy:"Copier"},l={facebook:"#1877F2",x:"#000",linkedin:"#0A66C2",whatsapp:"#25D366",copy:"#6b7280"},g=`<div style="display:flex;gap:8px;flex-wrap:wrap;${r==="vertical"?"flex-direction:column":""}${f==="floating"?"position:fixed;right:16px;top:50%;transform:translateY(-50%);z-index:9999;flex-direction:column":""}">`;for(let s of o){let d=l[s]||"#621B7A";g+=`<button
      data-ww-share="${s}"
      style="display:inline-flex;align-items:center;gap:6px;background:${d};color:#fff;
             border:none;border-radius:5px;padding:8px 12px;font-size:13px;font-weight:600;
             cursor:pointer;transition:opacity .2s"
      onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'"
      aria-label="Partager sur ${i[s]||s}">
      ${i[s]||s}
    </button>`}g+="</div>",t.innerHTML=g,t.querySelectorAll("[data-ww-share]").forEach(s=>{s.addEventListener("click",()=>{var h;let d=s.dataset.wwShare;d==="copy"?navigator.clipboard.writeText(n||location.href).then(()=>{s.textContent="Copi\xE9 !",setTimeout(()=>{s.textContent="Copier"},2e3)}):window.open((h=a[d])==null?void 0:h.call(a),"_blank","width=600,height=400")})})}function I(t,e){let o=new Date(e.targetDate||Date.now()+864e5),n=e.labels||{days:"Jours",hours:"Heures",minutes:"Minutes",seconds:"Secondes"},c=e.expiredMessage||"\xC9v\xE9nement termin\xE9",f=e.accentColor||"#621B7A",a=(e.theme||"light")==="dark",i=a?"#1f2937":"#f9fafb",l=a?"#f9fafb":"#1D1E18";t.innerHTML=`
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;padding:16px;background:${i};border-radius:8px">
      ${["days","hours","minutes","seconds"].map(m=>`
        <div style="text-align:center;min-width:64px">
          <div id="ww-ct-${t.id}-${m}"
               style="font-size:36px;font-weight:700;color:${f};line-height:1">00</div>
          <div style="font-size:12px;color:${l};margin-top:4px">${n[m]||m}</div>
        </div>
      `).join('<div style="font-size:36px;font-weight:700;color:'+l+';align-self:center">:</div>')}
    </div>`;let p=`ww-ct-${t.id}`;function x(){let m=Date.now(),g=Math.max(0,o.getTime()-m);if(g===0){t.innerHTML=`<div style="text-align:center;padding:16px;color:${l};background:${i};border-radius:8px">${c}</div>`;return}let s=Math.floor(g/864e5),d=Math.floor(g%864e5/36e5),h=Math.floor(g%36e5/6e4),u=Math.floor(g%6e4/1e3),y=w=>String(w).padStart(2,"0");document.getElementById(`${p}-days`).textContent=y(s),document.getElementById(`${p}-hours`).textContent=y(d),document.getElementById(`${p}-minutes`).textContent=y(h),document.getElementById(`${p}-seconds`).textContent=y(u),setTimeout(x,1e3)}t.id||(t.id="ww-"+Math.random().toString(36).slice(2)),x()}var ee=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];function R(t,e){let o=e.hours||[],n=e.timezone||"Europe/Paris",c=e.openLabel||"Ouvert",f=e.closedLabel||"Ferm\xE9",r=e.accentColor||"#621B7A",i=(e.theme||"light")==="dark",l=i?"#1f2937":"#ffffff",p=i?"#f9fafb":"#1D1E18",x=i?"#374151":"#e5e7eb",m=new Date(new Date().toLocaleString("en-US",{timeZone:n})),g=m.getDay(),s=`${String(m.getHours()).padStart(2,"0")}:${String(m.getMinutes()).padStart(2,"0")}`,d=o.find(b=>b.day===g),h=d&&!d.closed&&s>=d.open&&s<d.close,u=h?"#16a34a":"#dc2626",w=`<div style="background:${l};border-radius:8px;overflow:hidden;border:1px solid ${x}">
    <div style="padding:16px;border-bottom:1px solid ${x};display:flex;align-items:center;justify-content:space-between">
      <span style="font-weight:700;color:${p};font-size:15px">Horaires</span>
      <span style="background:${u}20;color:${u};border-radius:4px;padding:3px 10px;font-size:12px;font-weight:600">${h?c:f}</span>
    </div>
    <div>`,k=[1,2,3,4,5,6,0];for(let b of k){let v=o.find(K=>K.day===b),L=b===g;w+=`
      <div style="display:flex;justify-content:space-between;padding:10px 16px;background:${L?i?"#374151":"#f9fafb":"transparent"};border-bottom:1px solid ${x}">
        <span style="color:${p};font-size:13px;font-weight:${L?"700":"400"}">${ee[b]}</span>
        <span style="color:${v&&!v.closed?p:"#9ca3af"};font-size:13px">
          ${v&&!v.closed?`${v.open} \u2013 ${v.close}`:f}
        </span>
      </div>`}w+="</div></div>",t.innerHTML=w}function j(t,e){var s,d;let o=e.items||[],n=(s=e.allowMultiple)!=null?s:!1,c=(d=e.defaultOpen)!=null?d:-1,f=e.accentColor||"#621B7A",a=(e.theme||"light")==="dark",i=a?"#1f2937":"#ffffff",l=a?"#f9fafb":"#1D1E18",p=a?"#374151":"#e5e7eb",x="ww-faq-"+Math.random().toString(36).slice(2),m=`<div id="${x}" style="background:${i};border-radius:8px;overflow:hidden;border:1px solid ${p}">`;o.forEach((h,u)=>{let y=u===c;m+=`
      <div style="border-bottom:1px solid ${p}">
        <button data-faq="${u}" style="width:100%;text-align:left;padding:16px;background:none;border:none;
          cursor:pointer;display:flex;justify-content:space-between;align-items:center;
          color:${l};font-size:14px;font-weight:600;gap:12px"
          aria-expanded="${y}">
          <span>${h.question}</span>
          <span data-faq-icon="${u}" style="font-size:18px;color:${f};transition:transform .2s;transform:${y?"rotate(45deg)":"none"};flex-shrink:0">+</span>
        </button>
        <div data-faq-panel="${u}" style="max-height:${y?"1000px":"0"};overflow:hidden;transition:max-height .3s ease">
          <div style="padding:0 16px 16px;color:${a?"#d1d5db":"#4b5563"};font-size:13px;line-height:1.6">${h.answer}</div>
        </div>
      </div>`}),m+="</div>",t.innerHTML=m;let g=t.querySelector(`#${x}`);g.querySelectorAll("[data-faq]").forEach(h=>{h.addEventListener("click",()=>{let u=h.dataset.faq,y=g.querySelector(`[data-faq-panel="${u}"]`),w=g.querySelector(`[data-faq-icon="${u}"]`),k=h.getAttribute("aria-expanded")==="true";n||(g.querySelectorAll("[data-faq-panel]").forEach(b=>{b.style.maxHeight="0"}),g.querySelectorAll("[data-faq-icon]").forEach(b=>{b.style.transform="none"}),g.querySelectorAll("[data-faq]").forEach(b=>b.setAttribute("aria-expanded","false"))),k?(y.style.maxHeight="0",w.style.transform="none",h.setAttribute("aria-expanded","false")):(y.style.maxHeight="1000px",w.style.transform="rotate(45deg)",h.setAttribute("aria-expanded","true"))})})}function q(t,e){let o=e.plans||[],n=e.currency||"\u20AC",c=e.accentColor||"#621B7A",r=(e.theme||"light")==="dark",a=r?"#f9fafb":"#1D1E18",i=r?"#1f2937":"#ffffff",l=r?"#374151":"#f9fafb",p=r?"#4b5563":"#e5e7eb",x='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">';for(let m of o){let g=m.highlighted?c:r?"#374151":"#ffffff",s=m.highlighted?"#ffffff":a,d=m.highlighted?c:p;x+=`
      <div style="background:${g};border:2px solid ${d};border-radius:8px;padding:24px;
                  display:flex;flex-direction:column;gap:12px;position:relative">
        ${m.highlighted?`<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);
          background:#9EE992;color:#1D1E18;padding:3px 14px;border-radius:4px;font-size:11px;font-weight:700">
          Recommand\xE9</div>`:""}
        <div style="font-size:16px;font-weight:700;color:${s}">${m.name}</div>
        <div style="display:flex;align-items:baseline;gap:4px">
          <span style="font-size:32px;font-weight:800;color:${m.highlighted?"#9EE992":c}">${m.price}</span>
          <span style="color:${s};opacity:.7;font-size:13px">${n}${m.period?" / "+m.period:""}</span>
        </div>
        <ul style="list-style:none;padding:0;margin:0;flex:1;display:flex;flex-direction:column;gap:8px">
          ${m.features.map(h=>`
            <li style="display:flex;align-items:center;gap:8px;font-size:13px;color:${s}">
              <span style="color:${m.highlighted?"#9EE992":c};font-weight:700">\u2713</span>${h}
            </li>`).join("")}
        </ul>
        ${m.ctaLabel?`<a href="${m.ctaUrl||"#"}"
          style="display:block;text-align:center;padding:10px;border-radius:5px;font-weight:700;
                 font-size:14px;text-decoration:none;
                 background:${m.highlighted?"#9EE992":c};
                 color:${m.highlighted?"#1D1E18":"#ffffff"};
                 transition:opacity .2s"
          onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
          ${m.ctaLabel}
        </a>`:""}
      </div>`}x+="</div>",t.innerHTML=x}function U(t,e){let o=e.members||[],n=e.layout||"grid",c=e.columns||3,f=e.accentColor||"#621B7A",a=(e.theme||"light")==="dark",i=a?"#1f2937":"#ffffff",l=a?"#374151":"#f9fafb",p=a?"#f9fafb":"#1D1E18",x=a?"#9ca3af":"#6b7280",m=a?"#4b5563":"#e5e7eb",s=`<div style="${n==="grid"?`display:grid;grid-template-columns:repeat(${c},1fr);gap:16px`:"display:flex;flex-direction:column;gap:12px"}">`;for(let d of o)s+=`
      <div style="background:${l};border:1px solid ${m};border-radius:8px;padding:20px;text-align:center">
        ${d.photoUrl?`<img src="${d.photoUrl}" alt="${d.name}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;margin:0 auto 12px">`:`<div style="width:72px;height:72px;border-radius:50%;background:${f};display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#fff;font-size:24px;font-weight:700">${d.name.charAt(0)}</div>`}
        <div style="font-weight:700;color:${p};font-size:15px;margin-bottom:4px">${d.name}</div>
        <div style="color:${f};font-size:12px;font-weight:600;margin-bottom:${d.bio?"8px":"0"}">${d.role}</div>
        ${d.bio?`<p style="color:${x};font-size:12px;line-height:1.5;margin:0 0 12px">${d.bio}</p>`:""}
        ${d.links&&d.links.length?`
          <div style="display:flex;gap:8px;justify-content:center">
            ${d.links.map(h=>`<a href="${h.url}" target="_blank" rel="noopener" style="color:${f};font-size:12px;text-decoration:none;font-weight:600">${h.network}</a>`).join("")}
          </div>`:""}
      </div>`;s+="</div>",t.innerHTML=s}var F="ww-cookie-consent";function O(t,e){if(localStorage.getItem(F))return;let o=e.message||"Nous utilisons des cookies pour am\xE9liorer votre exp\xE9rience.",n=e.acceptLabel||"Accepter",c=e.rejectLabel||"Refuser",f=e.position||"bottom",r=e.privacyUrl||"",a=e.accentColor||"#621B7A",i=f==="top"?"top:0;left:0;right:0":"bottom:0;left:0;right:0",l=document.createElement("div");l.style.cssText=`position:fixed;${i};z-index:99999;background:#1D1E18;color:#fff;
    padding:16px 24px;display:flex;align-items:center;justify-content:space-between;
    gap:16px;flex-wrap:wrap;box-shadow:0 -2px 12px rgba(0,0,0,.2)`,l.innerHTML=`
    <span style="font-size:13px;line-height:1.5">
      ${o}
      ${r?` <a href="${r}" target="_blank" style="color:#9EE992;font-weight:600">En savoir plus</a>`:""}
    </span>
    <div style="display:flex;gap:8px;flex-shrink:0">
      <button id="ww-cookie-reject" style="background:transparent;border:1px solid #fff;color:#fff;
        padding:8px 16px;border-radius:5px;font-size:13px;cursor:pointer;font-weight:600">
        ${c}
      </button>
      <button id="ww-cookie-accept" style="background:${a};border:none;color:#fff;
        padding:8px 16px;border-radius:5px;font-size:13px;cursor:pointer;font-weight:600">
        ${n}
      </button>
    </div>`,document.body.appendChild(l);let p=x=>{localStorage.setItem(F,x),l.style.transform="translateY(100%)",l.style.transition="transform .3s",setTimeout(()=>l.remove(),300)};l.querySelector("#ww-cookie-accept").addEventListener("click",()=>p("accepted")),l.querySelector("#ww-cookie-reject").addEventListener("click",()=>p("rejected"))}function W(t,e){let o=e.threshold||300,n=e.position||"bottom-right",c=e.shape||"circle",f=e.accentColor||"#621B7A",r=n==="bottom-left"?"bottom:24px;left:24px":"bottom:24px;right:24px",a=c==="circle"?"50%":"8px",i=document.createElement("button");i.setAttribute("aria-label","Retour en haut"),i.style.cssText=`position:fixed;${r};z-index:9999;width:44px;height:44px;
    border-radius:${a};background:${f};color:#fff;border:none;
    cursor:pointer;display:none;align-items:center;justify-content:center;
    box-shadow:0 4px 12px rgba(0,0,0,.25);transition:opacity .2s,transform .2s;
    font-size:20px`,i.innerHTML="\u2191",document.body.appendChild(i);let l=()=>{window.scrollY>o?i.style.display="flex":i.style.display="none"};window.addEventListener("scroll",l,{passive:!0}),i.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}))}function P(t,e){let o=e.logos||[],n=e.speed||30,c=e.pauseOnHover!==!1,f=e.height||60,r="ww-lc-"+Math.random().toString(36).slice(2),i=[...o,...o].map(p=>{let x=`<img src="${p.imageUrl}" alt="${p.altText||""}" style="height:${f}px;max-width:160px;object-fit:contain;filter:grayscale(60%);transition:filter .2s" onmouseover="this.style.filter='grayscale(0)'" onmouseout="this.style.filter='grayscale(60%)'">`;return p.linkUrl?`<a href="${p.linkUrl}" target="_blank" rel="noopener" style="display:flex;align-items:center;padding:0 24px;flex-shrink:0">${x}</a>`:`<div style="display:flex;align-items:center;padding:0 24px;flex-shrink:0">${x}</div>`}).join(""),l=document.createElement("style");l.textContent=`
    @keyframes ww-scroll-${r} {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    #${r} .ww-track { animation: ww-scroll-${r} ${n}s linear infinite; }
    ${c?`#${r}:hover .ww-track { animation-play-state: paused; }`:""}
  `,document.head.appendChild(l),t.innerHTML=`
    <div id="${r}" style="overflow:hidden;position:relative;width:100%">
      <div class="ww-track" style="display:flex;width:max-content">${i}</div>
    </div>`}function N(t,e){let o=e.images||[],n=e.layout||"grid",c=e.columns||3,f=e.lightbox!==!1,r="ww-ig-"+Math.random().toString(36).slice(2),a=`display:grid;grid-template-columns:repeat(${c},1fr);gap:8px`,l=`<div id="${r}" style="${n==="carousel"?"display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory":a}">`;if(o.forEach((p,x)=>{l+=`
      <div style="${n==="carousel"?"flex-shrink:0;scroll-snap-align:start;width:280px":""}position:relative;overflow:hidden;border-radius:6px;cursor:${f?"pointer":"default"};aspect-ratio:1"
           ${f?`data-ww-lb="${x}"`:""}>
        <img src="${p.url}" alt="${p.caption||""}"
             style="width:100%;height:100%;object-fit:cover;transition:transform .3s"
             onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform=''">
        ${p.caption?`<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.6);color:#fff;font-size:11px;padding:6px 8px">${p.caption}</div>`:""}
      </div>`}),l+="</div>",f&&(l+=`
      <div id="${r}-lb" style="display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.9);
           align-items:center;justify-content:center;flex-direction:column;gap:16px" role="dialog">
        <button id="${r}-lb-close" style="position:absolute;top:16px;right:24px;background:none;border:none;
          color:#fff;font-size:32px;cursor:pointer;line-height:1">\xD7</button>
        <img id="${r}-lb-img" src="" alt="" style="max-width:90vw;max-height:80vh;object-fit:contain;border-radius:6px">
        <p id="${r}-lb-cap" style="color:#fff;font-size:13px;text-align:center"></p>
        <div style="display:flex;gap:16px">
          <button id="${r}-lb-prev" style="background:#fff3;border:none;color:#fff;font-size:24px;padding:8px 16px;border-radius:5px;cursor:pointer">\u2039</button>
          <button id="${r}-lb-next" style="background:#fff3;border:none;color:#fff;font-size:24px;padding:8px 16px;border-radius:5px;cursor:pointer">\u203A</button>
        </div>
      </div>`),t.innerHTML=l,f&&o.length){let p=document.getElementById(`${r}-lb`),x=document.getElementById(`${r}-lb-img`),m=document.getElementById(`${r}-lb-cap`),g=0,s=d=>{g=(d+o.length)%o.length,x.src=o[g].url,m.textContent=o[g].caption||"",p.style.display="flex"};t.querySelectorAll("[data-ww-lb]").forEach(d=>{d.addEventListener("click",()=>s(parseInt(d.dataset.wwLb)))}),document.getElementById(`${r}-lb-close`).addEventListener("click",()=>{p.style.display="none"}),document.getElementById(`${r}-lb-prev`).addEventListener("click",()=>s(g-1)),document.getElementById(`${r}-lb-next`).addEventListener("click",()=>s(g+1)),p.addEventListener("click",d=>{d.target===p&&(p.style.display="none")})}}function V(t,e){let o=e.address||"",n=e.placeId||"",c=e.zoom||15,f=e.height||400,r=e.showMarker!==!1,a="";n?a=`https://www.google.com/maps/embed/v1/place?key=AIzaSyD-placeholder&q=place_id:${n}&zoom=${c}`:o&&(a=`https://maps.google.com/maps?q=${encodeURIComponent(o)}&t=m&z=${c}&output=embed&iwloc=near`),t.innerHTML=`
    <div style="border-radius:8px;overflow:hidden;width:100%;height:${f}px">
      <iframe
        src="${a}"
        width="100%" height="100%"
        style="border:0;display:block"
        allowfullscreen loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Google Maps">
      </iframe>
    </div>`}function G(t,e){let o=e.pdfUrl||"",n=e.height||600,c=e.showToolbar!==!1;t.innerHTML=`
    <div style="width:100%;height:${n}px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
      <iframe
        src="${o}${c?"":"#toolbar=0&navpanes=0"}"
        width="100%" height="100%"
        style="border:0;display:block"
        title="Document PDF">
      </iframe>
    </div>`}function Y(t,e){let o=e.items||[],n=e.layout||"grid",c=e.accentColor||"#621B7A",r=(e.theme||"light")==="dark",a=r?"#1f2937":"#ffffff",i=r?"#374151":"#f9fafb",l=r?"#f9fafb":"#1D1E18",p=r?"#9ca3af":"#6b7280",x=r?"#4b5563":"#e5e7eb",g=`<div style="${n==="grid"?"display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px":"display:flex;flex-direction:column;gap:12px"}">`;for(let s of o)g+=`
      <div style="background:${i};border:1px solid ${x};border-radius:8px;padding:20px">
        ${s.rating?`<div style="margin-bottom:10px">${$(s.rating)}</div>`:""}
        <p style="color:${l};font-size:13px;line-height:1.6;margin:0 0 16px;font-style:italic">"${s.text}"</p>
        <div style="display:flex;align-items:center;gap:10px">
          ${s.photoUrl?`<img src="${s.photoUrl}" alt="${s.name}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`:`<div style="width:40px;height:40px;border-radius:50%;background:${c};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">${s.name.charAt(0)}</div>`}
          <div>
            <div style="font-weight:700;color:${l};font-size:13px">${s.name}</div>
            ${s.role||s.company?`<div style="color:${p};font-size:11px">${[s.role,s.company].filter(Boolean).join(" \u2014 ")}</div>`:""}
          </div>
        </div>
      </div>`;g+="</div>",t.innerHTML=g}function X(t,e,o){let n=e.source||"google",c=o.rating||e.rating||0,f=o.reviewCount||e.reviewCount||0,r=e.sourceUrl||"#",a=e.shape||"pill",i=e.accentColor||"#621B7A",p=(e.theme||"light")==="dark",x=p?"#1f2937":"#ffffff",m=p?"#f9fafb":"#1D1E18",g=p?"#374151":"#e5e7eb",s={google:"Google",trustpilot:"Trustpilot",yelp:"Yelp",tripadvisor:"TripAdvisor"},d=a==="pill"?"50px":"8px";t.innerHTML=`
    <a href="${r}" target="_blank" rel="noopener" style="
      display:inline-flex;align-items:center;gap:10px;
      background:${x};border:1px solid ${g};
      border-radius:${d};padding:10px 16px;
      text-decoration:none;
      box-shadow:0 2px 8px rgba(0,0,0,.08)">
      <div>
        <div style="font-weight:700;font-size:20px;color:${i};line-height:1">${c.toFixed(1)}</div>
        <div style="margin-top:2px">${$(c)}</div>
        ${f?`<div style="font-size:11px;color:${m};opacity:.7;margin-top:2px">${f} avis</div>`:""}
      </div>
      <div style="width:1px;background:${g};height:40px"></div>
      <div style="font-size:12px;font-weight:600;color:${m}">${s[n]||n}</div>
    </a>`}var te=window.__WW_API_BASE__||"",Q=new Set(["whatsapp_button","telegram_button","back_to_top","cookie_banner"]),oe={google_reviews:(t,e,o)=>H(t,e,o),testimonials:(t,e)=>Y(t,e),rating_badge:(t,e,o)=>X(t,e,o),whatsapp_button:(t,e)=>_(t,e),telegram_button:(t,e)=>A(t,e),social_icons:(t,e)=>B(t,e),social_share:(t,e)=>D(t,e),countdown_timer:(t,e)=>I(t,e),business_hours:(t,e)=>R(t,e),faq:(t,e)=>j(t,e),pricing_table:(t,e)=>q(t,e),team_members:(t,e)=>U(t,e),cookie_banner:(t,e)=>O(t,e),back_to_top:(t,e)=>W(t,e),logo_carousel:(t,e)=>P(t,e),image_gallery:(t,e)=>N(t,e),google_map:(t,e)=>V(t,e),pdf_viewer:(t,e)=>G(t,e)};async function J(t){let e=t.dataset.wwId;if(e&&!t.dataset.wwInit){t.dataset.wwInit="1",M(z,"base"),t.classList.add("ww-widget");try{let o=await fetch(`${te}/widget/${e}/data`);if(!o.ok){t.innerHTML='<div style="color:#9ca3af;font-size:12px;padding:8px">Widget introuvable.</div>';return}let{widget:n,data:c,_poweredBy:f,_quotaExceeded:r}=await o.json(),a=n.type,i=n.config,l=oe[a];r&&t.insertAdjacentHTML("beforeend",T()),l?(Q.has(a),l(t,i,c)):t.innerHTML=`<div style="color:#9ca3af;font-size:12px;padding:8px">Type de widget non support\xE9 : ${a}</div>`,f&&!Q.has(a)&&t.insertAdjacentHTML("beforeend",C())}catch(o){t.innerHTML='<div style="color:#9ca3af;font-size:12px;padding:8px">Erreur de chargement du widget.</div>'}}}function E(){document.querySelectorAll("[data-ww-id]").forEach(J)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",E):E();window.WebWidget={init:J,initAll:E};})();
