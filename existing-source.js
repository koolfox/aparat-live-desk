// Reuse a source already configured in OBS, without changing its settings.
export async function prepareExistingSource(obs,sourceName){
 const list=await obs.request('GetInputList');if(!list.inputs.some(x=>x.inputName===sourceName))throw Error('منبع دیگر در OBS وجود ندارد.');
 const sceneName=`Classroom source ${crypto.randomUUID().slice(0,8)}`;await obs.request('CreateScene',{sceneName});
 try{const item=await obs.request('CreateSceneItem',{sceneName,sourceName,sceneItemEnabled:true});const video=await obs.request('GetVideoSettings');await obs.request('SetSceneItemTransform',{sceneName,sceneItemId:item.sceneItemId,sceneItemTransform:{positionX:0,positionY:0,alignment:5,boundsType:'OBS_BOUNDS_SCALE_INNER',boundsAlignment:0,boundsWidth:video.baseWidth,boundsHeight:video.baseHeight}});return {sceneName,sourceName,sceneItemId:item.sceneItemId}}catch(e){try{await obs.request('RemoveScene',{sceneName})}catch{}throw e}
}
export async function removePreparedSource(obs,sceneName){const list=await obs.request('GetSceneList');if(list.currentProgramSceneName===sceneName)throw Error('این صحنه در برنامه است و حذف نمی‌شود.');await obs.request('RemoveScene',{sceneName})}
