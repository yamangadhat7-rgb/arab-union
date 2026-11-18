import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://qdsggxnqvwmayiwiopxs.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Vwi4Twxehv6isUAaXo6UgA_tWrvoRGF';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const countries = [
  ['JO','الأردن'],['SA','السعودية'],['AE','الإمارات'],['QA','قطر'],['KW','الكويت'],
  ['BH','البحرين'],['OM','عُمان'],['YE','اليمن'],['IQ','العراق'],['SY','سوريا'],
  ['LB','لبنان'],['PS','فلسطين'],['EG','مصر'],['SD','السودان'],['LY','ليبيا'],
  ['TN','تونس'],['DZ','الجزائر'],['MA','المغرب'],['MR','موريتانيا'],['SO','الصومال'],
  ['DJ','جيبوتي'],['KM','جزر القمر']
];

const shell = document.createElement('div');
shell.id = 'authLayer';
shell.innerHTML = `
  <div class="auth-backdrop"></div>
  <section class="auth-card" role="dialog" aria-modal="true" aria-labelledby="authTitle">
    <button class="auth-close" type="button" aria-label="إغلاق">×</button>
    <div class="auth-emblem">AU</div>
    <p class="auth-kicker">ARAB UNION ACCOUNT</p>
    <h2 id="authTitle">مرحباً بك في اتحاد العرب</h2>
    <p class="auth-intro">سجّل دخولك لمتابعة رحلتك وحفظ تقدمك.</p>
    <div id="authForm">
      <label>البريد الإلكتروني<input id="authEmail" type="email" autocomplete="email" placeholder="name@example.com" required></label>
      <label>كلمة المرور<input id="authPassword" type="password" autocomplete="current-password" minlength="8" placeholder="8 أحرف على الأقل" required></label>
      <div id="signupFields" hidden>
        <label>اسم اللاعب<input id="authUsername" type="text" autocomplete="nickname" autocapitalize="off" spellcheck="false" inputmode="text" minlength="3" maxlength="20" pattern="[A-Za-z0-9_]+" placeholder="مثال: ArabPlayer"></label>
        <label>الدولة<select id="authCountry">${countries.map(([code,name])=>`<option value="${code}" ${code==='JO'?'selected':''}>${name}</option>`).join('')}</select></label>
      </div>
      <p id="authMessage" class="auth-message" role="status" aria-live="polite"></p>
      <button id="authSubmit" class="auth-submit" type="button">تسجيل الدخول</button>
      <button id="authSwitch" class="auth-switch" type="button">ليس لديك حساب؟ أنشئ حساباً</button><button id="authForgot" class="auth-switch" type="button">نسيت كلمة المرور؟</button>
    </div>
    <div id="authAccount" hidden>
      <div class="auth-user-icon">✓</div>
      <h3 id="authAccountName">لاعب اتحاد العرب</h3>
      <p id="authAccountEmail" class="auth-intro"></p>
      <p id="authAccountBalance" class="auth-balance"></p>
      <p id="authAccountNote" class="auth-message"></p>
      <button id="authLogout" class="auth-submit" type="button">تسجيل الخروج</button>
    </div>
  </section>`;
document.body.append(shell);

// Keep game shortcuts from ever consuming characters typed into account fields.
shell.addEventListener('keydown', event => {
  if (event.target instanceof Element && event.target.closest('input,select,textarea')) {
    event.stopPropagation();
    if (event.key === 'Enter' && event.target.tagName !== 'SELECT') {
      event.preventDefault();
      $('authSubmit')?.click();
    }
  }
}, true);
shell.addEventListener('keyup', event => {
  if (event.target instanceof Element && event.target.closest('input,select,textarea')) event.stopPropagation();
}, true);

const openButton = document.createElement('button');
openButton.id = 'accountBtn';
openButton.className = 'account-btn';
openButton.type = 'button';
openButton.textContent = 'دخول / حسابي';
document.querySelector('.topbar').insertBefore(openButton, document.querySelector('#cameraBtn'));

const $ = (id) => document.getElementById(id);
let mode = 'login';
let currentUser = null;

function message(text, kind='') {
  const node=$('authMessage');
  if(node){node.textContent=text;node.className='auth-message '+kind;}
}
function showLayer(){shell.classList.add('visible');}
function hideLayer(){shell.classList.remove('visible');}
function setMode(next){
  mode=next;
  $('signupFields').hidden=mode!=='signup';
  $('authTitle').textContent=mode==='signup'?'إنشاء حساب جديد':'مرحباً بعودتك';
  $('authSubmit').textContent=mode==='signup'?'إنشاء الحساب':'تسجيل الدخول';
  $('authSwitch').textContent=mode==='signup'?'لديك حساب؟ سجّل الدخول':'ليس لديك حساب؟ أنشئ حساباً';
  $('authPassword').autocomplete=mode==='signup'?'new-password':'current-password';
  message('');
}
async function syncAccount(user){
  currentUser=user||null;
  openButton.textContent=user?'حسابي':'دخول / حسابي';
  if(!user){$('authForm').hidden=false;$('authAccount').hidden=true;return;}
  $('authForm').hidden=true;$('authAccount').hidden=false;
  $('authAccountEmail').textContent=user.email||'';
  $('authAccountName').textContent=user.user_metadata?.username||'لاعب اتحاد العرب';
  $('playerName').textContent=user.user_metadata?.username||'لاعب اتحاد العرب';
  try{
    const [{data:profile,error:profileError},{data:wallet,error:walletError}]=await Promise.all([
      supabase.from('profiles').select('username,country_code,level,xp').eq('id',user.id).maybeSingle(),
      supabase.from('wallets').select('balance').eq('player_id',user.id).maybeSingle()
    ]);
    if(profileError) throw profileError;
    if(profile){
      $('authAccountName').textContent=profile.username;
      $('playerName').textContent=profile.username;
      const country=countries.find(c=>c[0]===profile.country_code);
      $('authAccountNote').textContent=(country?country[1]+' · ':'')+'المستوى '+profile.level+' · الخبرة '+profile.xp;
    } else {
      $('authAccountNote').textContent='تم تسجيل الدخول. ملف اللاعب قيد التهيئة؛ حدّث الصفحة بعد لحظات.';
    }
    if(walletError) throw walletError;
    if(wallet){
      $('authAccountBalance').textContent='رصيدك: '+Number(wallet.balance).toLocaleString('ar-JO')+' دينار';
      document.querySelector('.wallet b').innerHTML=Number(wallet.balance).toLocaleString('en-US')+' <small>د.أ</small>';
      document.querySelector('.wallet em').textContent='رصيد حسابك المحفوظ';
    }
  }catch(error){
    $('authAccountNote').textContent='تعذر تحميل بيانات اللاعب: '+(error.message||'خطأ غير معروف');
  }
}
openButton.addEventListener('click',async()=>{if(currentUser){await syncAccount(currentUser);}else{setMode('login');}showLayer();});
shell.querySelector('.auth-close').addEventListener('click',hideLayer);
shell.querySelector('.auth-backdrop').addEventListener('click',hideLayer);
$('authSwitch').addEventListener('click',()=>setMode(mode==='login'?'signup':'login'));
$('authForgot').addEventListener('click',async()=>{
  const email=$('authEmail').value.trim();
  if(!email){message('أدخل بريدك الإلكتروني أولاً.','error');return;}
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
  message(error?error.message:'إذا كان البريد مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور.','success');
});
$('authSubmit').addEventListener('click',async()=>{
  const email=$('authEmail').value.trim();
  const password=$('authPassword').value;
  if(!email||!password){message('أدخل البريد الإلكتروني وكلمة المرور.','error');return;}
  if(password.length<8){message('كلمة المرور يجب أن تكون 8 أحرف على الأقل.','error');return;}
  const button=$('authSubmit');button.disabled=true;button.textContent='جارٍ الاتصال...';message('');
  try{
    if(mode==='signup'){
      const username=$('authUsername').value.trim();
      const country_code=$('authCountry').value;
      if(!/^[A-Za-z0-9_]{3,20}$/.test(username)) throw new Error('اسم اللاعب يجب أن يكون 3–20 حرفاً إنجليزياً أو رقماً أو _.');
      const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin,data:{username,country_code}}});
      if(error) throw error;
      if(data.session){
        message('تم إنشاء حسابك بنجاح. أهلاً بك!','success');
        await syncAccount(data.user);
      }else{
        message('تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيده ثم سجّل الدخول.','success');
      }
    }else{
      const {data,error}=await supabase.auth.signInWithPassword({email,password});
      if(error) throw error;
      await syncAccount(data.user);
      message('تم تسجيل الدخول بنجاح.','success');
    }
  }catch(error){message(error.message||'تعذر إكمال العملية.','error');}
  finally{button.disabled=false;button.textContent=mode==='signup'?'إنشاء الحساب':'تسجيل الدخول';}
});
$('authLogout').addEventListener('click',async()=>{
  const {error}=await supabase.auth.signOut();
  if(error){$('authAccountNote').textContent=error.message;return;}
  await syncAccount(null);setMode('login');hideLayer();
  document.querySelector('.wallet b').innerHTML='— <small>د.أ</small>';
  document.querySelector('.wallet em').textContent='سجّل الدخول لعرض رصيدك';
});
supabase.auth.onAuthStateChange((_event,session)=>{queueMicrotask(()=>syncAccount(session?.user||null));});
supabase.auth.getSession().then(({data})=>syncAccount(data.session?.user||null));
