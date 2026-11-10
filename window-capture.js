// Each preparation creates a separate OBS scene. It never changes the program scene.
export async function prepareWindowCapture(obs) {
  const {platform}=await obs.request('GetVersion');
  const kind=platform==='macos'?'screen_capture':platform==='windows'?'window_capture':null;
  if(!kind)throw new Error('انتخاب پنجره در این سیستم‌عامل پشتیبانی نشده است.');
  const suffix=globalThis.crypto.randomUUID().slice(0,8);
  const sceneName=`Classroom window ${suffix}`,inputName=`Classroom capture ${suffix}`;
  await obs.request('CreateScene',{sceneName});
  try {
    const {sceneItemId}=await obs.request('CreateInput',{sceneName,inputName,inputKind:kind,inputSettings:platform==='macos'?{type:1,window:0}:{},sceneItemEnabled:true});
    const {propertyItems}=await obs.request('GetInputPropertiesListPropertyItems',{inputName,propertyName:'window'});
    const windows=(propertyItems||[]).filter(x=>x.itemEnabled!==false && x.itemValue && x.itemName);
    if(!windows.length)throw new Error('پنجره‌ای پیدا نشد؛ مجوز ضبط صفحه و پنجره‌های باز را در OBS بررسی کنید.');
    return {sceneName,inputName,sceneItemId,platform,windows};
  } catch(error) { try{await obs.request('RemoveScene',{sceneName});}catch{} throw error; }
}
export async function selectAndFitWindow(obs,prepared,value) {
  const item=prepared.windows.find(x=>String(x.itemValue)===String(value));
  if(!item)throw new Error('پنجرهٔ انتخاب‌شده در فهرست نیست.');
  const current=await obs.request('GetSceneList');
  if(current.currentProgramSceneName===prepared.sceneName)throw new Error('این صحنه در حال پخش است؛ برای انتخاب جدید یک صحنهٔ تازه بسازید.');
  await obs.request('SetInputSettings',{inputName:prepared.inputName,inputSettings:prepared.platform==='macos'?{type:1,window:item.itemValue}:{window:item.itemValue},overlay:true});
  const {baseWidth,baseHeight}=await obs.request('GetVideoSettings');
  await obs.request('SetSceneItemTransform',{sceneName:prepared.sceneName,sceneItemId:prepared.sceneItemId,sceneItemTransform:{positionX:0,positionY:0,alignment:5,boundsType:'OBS_BOUNDS_SCALE_INNER',boundsAlignment:0,boundsWidth:baseWidth,boundsHeight:baseHeight}});
  return item;
}
// OBS may not render an inactive scene. Borrow its Studio preview and restore it
// only if the user has not changed the preview or mode in the meantime.
export async function withTemporaryPreview(obs,sceneName,callback) {
  const initial=await obs.request('GetStudioModeEnabled');
  const previous=initial.studioModeEnabled ? (await obs.request('GetCurrentPreviewScene')).currentPreviewSceneName : null;
  if(!initial.studioModeEnabled)await obs.request('SetStudioModeEnabled',{studioModeEnabled:true});
  try {
    await obs.request('SetCurrentPreviewScene',{sceneName});
    await new Promise(resolve=>setTimeout(resolve,1800));
    return await callback();
  } finally {
    const mode=await obs.request('GetStudioModeEnabled');
    if(mode.studioModeEnabled){
      const current=await obs.request('GetCurrentPreviewScene');
      if(current.currentPreviewSceneName===sceneName){
        if(initial.studioModeEnabled && previous)await obs.request('SetCurrentPreviewScene',{sceneName:previous});
        else if(!initial.studioModeEnabled)await obs.request('SetStudioModeEnabled',{studioModeEnabled:false});
      }
    }
  }
}
