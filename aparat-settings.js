export function secureObsEndpoint(address){try{const u=new URL(address);return u.protocol==='wss:'||(u.protocol==='ws:'&&['localhost','127.0.0.1','[::1]'].includes(u.hostname.toLowerCase()))}catch{return false}}
export function validateAparat(server,key){
 const address=server.trim(),streamKey=key.trim();let parsed;
 try{parsed=new URL(address)}catch{throw Error('آدرس سرور معتبر نیست.')}
 if(!['rtmp:','rtmps:'].includes(parsed.protocol)||!parsed.hostname||parsed.username||parsed.password||parsed.hash)throw Error('آدرس باید با rtmp:// یا rtmps:// شروع شود و نام کاربری یا رمز در آن نباشد.');
 if(!streamKey||/[\r\n]/.test(streamKey))throw Error('کلید پخش را به‌درستی وارد کنید.');
 return {server:address,key:streamKey};
}
export async function getProfileAndStatus(obs){const [profile,status]=await Promise.all([obs.request('GetProfileList'),obs.request('GetStreamStatus')]);return {profileName:profile.currentProfileName,active:status.outputActive}}
export async function applyAparatSettings(obs,server,key,expectedProfile){
 const values=validateAparat(server,key);const current=await getProfileAndStatus(obs);
 if(current.active)throw Error('ابتدا پخش OBS را متوقف کنید.');if(!expectedProfile||current.profileName!==expectedProfile)throw Error('پروفایل OBS عوض شده است؛ تنظیمات را دوباره باز کنید.');
 await obs.request('SetStreamServiceSettings',{streamServiceType:'rtmp_custom',streamServiceSettings:{server:values.server,key:values.key,use_auth:false}});
 try{const actual=await obs.request('GetStreamServiceSettings');return actual.streamServiceType==='rtmp_custom'&&actual.streamServiceSettings.server===values.server&&actual.streamServiceSettings.key===values.key}catch{return false}
}
