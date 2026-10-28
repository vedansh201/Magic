// Re-encode decoded pixels as PNG; no generative processing, resizing or filters.
export async function toPNG(blob){
 const url=URL.createObjectURL(blob);
 try{
  const img=new Image();img.src=url;await img.decode();
  const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
  canvas.getContext('2d').drawImage(img,0,0);
  const png=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG encoding failed')),'image/png'));
  return new File([png],'time-stone.png',{type:'image/png'});
 }finally{URL.revokeObjectURL(url);}
}
export async function downloadPNG(src){
 const response=await fetch(src);if(!response.ok)throw new Error('Image unavailable');
 const png=await toPNG(await response.blob());const url=URL.createObjectURL(png);
 const link=document.createElement('a');link.href=url;link.download='time-stone.png';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),10000);
}
