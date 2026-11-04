/* eslint-disable @next/next/no-location-assign-relative-destination -- Discard protected client state through a full navigation after session expiry. */
export async function examApi<T>(action:string,body?:Record<string,unknown>,signal?:AbortSignal):Promise<T>{
 const response=await fetch(body?'/api/v1/exam-center':`/api/v1/exam-center?action=${encodeURIComponent(action)}`,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',signal,...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,action})}:{})});
 const data=await response.json();if(response.status===401){location.assign('/login?next=%2Fs%2Fmock-exam');throw new Error('Phiên đăng nhập hết hạn.');}if(!response.ok||!data.success)throw Object.assign(new Error(data.message||'Chưa xử lý được yêu cầu.'),{status:response.status});return data.data;
}
export async function attemptApi<T>(id:string):Promise<T>{const response=await fetch(`/api/v1/exam-center?action=attempt&id=${encodeURIComponent(id)}`,{cache:'no-store',credentials:'same-origin'});const data=await response.json();if(response.status===401)location.assign('/login?next=%2Fs%2Fmock-exam');if(!response.ok||!data.success)throw new Error(data.message||'Không mở được bài thi.');return data.data;}
export const skillNames:Record<string,string>={LISTENING:'Nghe',READING:'Đọc',WRITING:'Viết',TRANSLATION:'Dịch',SPEAKING:'Nói'};
export const typeNames:Record<string,string>={multiple_choice:'Trắc nghiệm',listening_choice:'Nghe · chọn đáp án',true_false:'Đúng / Sai',fill_blank:'Điền ô trống',listening_fill:'Nghe · điền ô trống',matching:'Nối cặp',sentence_order:'Sắp xếp câu',find_error:'Tìm lỗi sai',essay:'Bài viết',translation:'Dịch',speaking:'Nói',speaking_audio:'Ghi âm nói',audio:'Trả lời ghi âm',writing:'Viết',handwriting_photo:'Ảnh bài viết tay'};
export const resultNames:Record<string,string>={PASS:'Đạt',FAIL:'Chưa đạt',PENDING:'Chờ chấm',UNSET:'Chưa đặt ngưỡng đạt'};
export function timeText(seconds:number|null){if(seconds===null)return 'Không giới hạn';return `${Math.floor(Math.max(0,seconds)/60)}:${String(Math.max(0,seconds)%60).padStart(2,'0')}`;}
export const dateText=(value:string|null)=>value?new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',dateStyle:'short',timeStyle:'short'}).format(new Date(value)):'—';

export const dayKey=(value:string)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(value));
