import {shapePersian} from './persian-shape.js?v=20261111b';
export function formatClock(seconds){const s=Math.max(0,Math.floor(seconds));return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
export async function addViewerOverlay(obs,sceneName,label){
 const version=await obs.request('GetVersion');const kinds=(await obs.request('GetInputKindList')).inputKinds;
 const kind=version.platform==='windows'?(kinds.includes('text_gdiplus_v3')?'text_gdiplus_v3':'text_gdiplus_v2'):'text_ft2_source_v2';
 if(!kinds.includes(kind))throw Error('منبع متن در این نسخهٔ OBS در دسترس نیست.');
 const inputName=`Classroom overlay ${crypto.randomUUID().slice(0,8)}`;
 const text=kind.startsWith('text_ft2')?shapePersian(label):label;
 const settings=kind.startsWith('text_ft2')?{text,font:{face:'Vazirmatn',size:64,flags:0},color1:4294967295,color2:4294967295}:{text,font:{face:'Vazirmatn',size:64},color:16777215,opacity:100};
 const created=await obs.request('CreateInput',{sceneName,inputName,inputKind:kind,inputSettings:settings,sceneItemEnabled:true});
 try{const v=await obs.request('GetVideoSettings');await obs.request('SetSceneItemTransform',{sceneName,sceneItemId:created.sceneItemId,sceneItemTransform:{positionX:v.baseWidth/2,positionY:v.baseHeight*0.12,alignment:0,boundsType:'OBS_BOUNDS_SCALE_INNER',boundsAlignment:0,boundsWidth:v.baseWidth*0.85,boundsHeight:v.baseHeight*0.17}});return {sceneName,inputName,sceneItemId:created.sceneItemId,kind};}catch(e){await obs.request('RemoveSceneItem',{sceneName,sceneItemId:created.sceneItemId}).catch(()=>{});throw e}
}
export function overlayRenderedText(overlay,label,timer){const text=overlay.kind.startsWith('text_ft2')?shapePersian(label):label;return timer?timer+'  '+text:text}
export async function addCameraInset(obs,sceneName,sourceName){
 const items=await obs.request('GetSceneItemList',{sceneName});if(items.sceneItems.some(x=>x.sourceName===sourceName))throw Error('این منبع از قبل در صحنه هست؛ برای حفظ چیدمان، منبع دیگری انتخاب کنید.');
 const v=await obs.request('GetVideoSettings');const created=await obs.request('CreateSceneItem',{sceneName,sourceName,sceneItemEnabled:true});
 try{await obs.request('SetSceneItemTransform',{sceneName,sceneItemId:created.sceneItemId,sceneItemTransform:{positionX:v.baseWidth*0.98,positionY:v.baseHeight*0.98,alignment:10,boundsType:'OBS_BOUNDS_SCALE_INNER',boundsAlignment:0,boundsWidth:v.baseWidth*0.28,boundsHeight:v.baseHeight*0.28}});return {sceneName,sceneItemId:created.sceneItemId}}catch(e){await obs.request('RemoveSceneItem',{sceneName,sceneItemId:created.sceneItemId}).catch(()=>{});throw e}
}
