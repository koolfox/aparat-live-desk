import {shapePersian} from './persian-shape.js?v=20261111b';
export async function createWaitingScene(obs,audioPath=''){
 const suffix=crypto.randomUUID().slice(0,8),sceneName=`Waiting room ${suffix}`,background=`Waiting background ${suffix}`,title=`Waiting title ${suffix}`,music=`Waiting music ${suffix}`;
 const v=await obs.request('GetVideoSettings'),k=(await obs.request('GetInputKindList')).inputKinds,platform=(await obs.request('GetVersion')).platform;
 const color=k.includes('color_source_v3')?'color_source_v3':'color_source_v2',text=platform==='windows'?(k.includes('text_gdiplus_v3')?'text_gdiplus_v3':'text_gdiplus_v2'):'text_ft2_source_v2';
 if(!k.includes(color)||!k.includes(text)||!k.includes('ffmpeg_source'))throw Error('منابع لازم برای صفحهٔ انتظار در این OBS موجود نیستند.');
 await obs.request('CreateScene',{sceneName});
 try{
  await obs.request('CreateInput',{sceneName,inputName:background,inputKind:color,inputSettings:{width:v.baseWidth,height:v.baseHeight,color:4281341981},sceneItemEnabled:true});
  const value=text.startsWith('text_ft2')?shapePersian('لطفا منتظر بمانید'):'لطفا منتظر بمانید';const settings=text.startsWith('text_ft2')?{text:value,font:{face:'Vazirmatn',size:76,flags:0},color1:4294967295,color2:4294967295}:{text:value,font:{face:'Vazirmatn',size:76},color:16777215,opacity:100};
  const titleItem=await obs.request('CreateInput',{sceneName,inputName:title,inputKind:text,inputSettings:settings,sceneItemEnabled:true});await obs.request('SetSceneItemTransform',{sceneName,sceneItemId:titleItem.sceneItemId,sceneItemTransform:{positionX:v.baseWidth/2,positionY:v.baseHeight/2,alignment:0,boundsType:'OBS_BOUNDS_SCALE_INNER',boundsAlignment:0,boundsWidth:v.baseWidth*.8,boundsHeight:v.baseHeight*.3}});
  await obs.request('CreateInput',{sceneName,inputName:music,inputKind:'ffmpeg_source',inputSettings:{is_local_file:true,local_file:audioPath,looping:true},sceneItemEnabled:true});await obs.request('SetInputMute',{inputName:music,inputMuted:true});
  return {sceneName,music};
 }catch(e){await obs.request('RemoveScene',{sceneName}).catch(()=>{});throw e}
}
