const u="http://localhost:5001/uploads",r=t=>{if(!t)return"";if(t.startsWith("http"))return t;const s=t.startsWith("/")?t.slice(1):t;return`${u}/${s}`},o=(t,s="optimized")=>{var n;return t.thumbnails&&((n=t.thumbnails[s])!=null&&n.path)?r(t.thumbnails[s].path):r(t.file_path)},p=t=>o(t,"medium");export{p as a,r as g};
//# sourceMappingURL=image-CG6tEh5z.js.map
