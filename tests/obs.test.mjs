import {test} from 'node:test';
import assert from 'node:assert/strict';
import {OBS} from '../obs.js';
class MockSocket {
 static OPEN=1;
 constructor(){this.readyState=1;MockSocket.last=this;}
 send(v){this.sent=JSON.parse(v);}
 message(m){this.onmessage({data:JSON.stringify(m)});}
 close(){this.readyState=3;this.onclose?.();}
}
globalThis.WebSocket=MockSocket;
test('identifies, sends requests and reports errors and disconnect',async()=>{
 let closed=false;const obs=new OBS(null,()=>closed=true);const connecting=obs.connect('ws://localhost:4455','');const socket=MockSocket.last;
 socket.message({op:0,d:{}});assert.equal(socket.sent.op,1);socket.message({op:2,d:{}});await connecting;
 const result=obs.request('GetStreamStatus');const id=socket.sent.d.requestId;assert.equal(socket.sent.d.requestType,'GetStreamStatus');socket.message({op:7,d:{requestId:id,requestStatus:{result:true},responseData:{outputActive:true}}});assert.equal((await result).outputActive,true);
 const failed=obs.request('Bad');socket.message({op:7,d:{requestId:socket.sent.d.requestId,requestStatus:{result:false,comment:'bad'}}});await assert.rejects(failed,/bad/);obs.disconnect();assert.equal(closed,true);
});
