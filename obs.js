/* OBS WebSocket 5 client. Credentials stay in memory. */
export class OBS {
  constructor(onEvent, onClose) { this.onEvent=onEvent; this.onClose=onClose; this.pending=new Map(); this.next=0; }
  async connect(url, password) {
    if(this.socket) this.disconnect();
    return new Promise((resolve,reject)=>{
      let settled=false;
      const socket=this.socket=new WebSocket(url);
      const fail=(message)=>{if(!settled){settled=true;reject(new Error(message));}};
      socket.onerror=()=>fail('اتصال برقرار نشد. آدرس و تنظیمات OBS را بررسی کنید.');
      socket.onclose=()=>{this.pending.forEach(p=>{clearTimeout(p.timer);p.reject(new Error('اتصال قطع شد'));});this.pending.clear(); if(this.socket===socket){this.socket=null;this.onClose?.();} fail('اتصال یا احراز هویت ناموفق بود.');};
      socket.onmessage=async ({data})=>{
        try {
          const m=JSON.parse(data);
          if(m.op===0){const d={rpcVersion:1};if(m.d.authentication){const {salt,challenge}=m.d.authentication;const digest=async s=>btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))));d.authentication=await digest(await digest(password+salt)+challenge);}socket.send(JSON.stringify({op:1,d}));}
          if(m.op===2&&!settled){settled=true;resolve();}
          if(m.op===5)this.onEvent?.(m.d);
          if(m.op===7){const p=this.pending.get(m.d.requestId);if(p){this.pending.delete(m.d.requestId);clearTimeout(p.timer);m.d.requestStatus.result?p.resolve(m.d.responseData||{}):p.reject(new Error(m.d.requestStatus.comment||'درخواست OBS ناموفق بود'));}}
        } catch(e){fail(e.message);socket.close();}
      };
    });
  }
  request(requestType,requestData={}) { return new Promise((resolve,reject)=>{if(this.socket?.readyState!==WebSocket.OPEN)return reject(new Error('OBS متصل نیست'));const requestId=String(++this.next);const timer=setTimeout(()=>{this.pending.delete(requestId);reject(new Error('پاسخ OBS دریافت نشد'));},8000);this.pending.set(requestId,{resolve,reject,timer});this.socket.send(JSON.stringify({op:6,d:{requestType,requestId,requestData}}));}); }
  disconnect(){this.socket?.close();}
}
