const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const cache=new Map();
function load(relative){
  const filename=path.resolve(__dirname,'..',relative);
  if(cache.has(filename))return cache.get(filename);
  const api={};cache.set(filename,api);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
    exports:api,require:request=>load(path.relative(path.resolve(__dirname,'..'),path.resolve(path.dirname(filename),request+'.ts'))),
    URL,URLSearchParams,Date,crypto:require('node:crypto').webcrypto,
  });return api;
}
const company=load('lib/employer-company.ts');const team=load('lib/company-team.ts');const {initialPlatform}=load('lib/platform.ts');const {cities,cityOptions}=load('lib/cities.ts');
const details={name:'Nova Studio',city:'Аральск',industry:'Разработка',size:'11–50 сотрудников',email:'team@example.com',website:'',description:'Разрабатываем полезные приложения для небольших компаний по всему Казахстану.'};
function fixture(){const data=structuredClone(initialPlatform);company.createEmployerCompany(data,details);return data;}
function request(data,userId='employee',companyId=data.employerCompanyId){team.requestTeamAccess(data,{companyId,userId,name:'Тест Сотрудник',email:'employee@example.com',role:'recruiter',message:'Хочу помогать вашей компании с подбором сотрудников.',accountRole:'seeker'});return data.teamRequests[0];}

test('All 90 Kazakhstan cities are unique; stored legacy values remain editable',()=>{
 assert.equal(cities.length,90);assert.equal(new Set(cities).size,90);
 for(const name of ['Алатау','Косшы','Аральск','Байконур','Конаев','Мамлютка','Эмба','Курчатов'])assert.ok(cities.includes(name));
 assert.equal(cityOptions('Старое значение')[0],'Старое значение');assert.equal(cityOptions('Аральск').length,90);
});
test('One employer owns several independent companies and can switch back after creating another',()=>{
 const data=fixture();const first=data.employerCompanyId;const job={companyId:first,company:details.name};
 company.createEmployerCompany(data,{...details,name:'Second Studio'});const second=data.employerCompanyId;
 assert.equal(company.accessibleCompanies(data).length,2);assert.equal(company.ownsJob(data,job),false);
 company.switchCompany(data,first);assert.equal(company.ownsJob(data,job),true);assert.equal(company.employerCanPost(data),true);
 company.switchCompany(data,second);assert.equal(company.employerCompany(data).name,'Second Studio');
 assert.throws(()=>company.switchCompany(data,'liniya'));data.employerAccountId='new-account';data.employerCompanyId=null;
 assert.equal(company.accessibleCompanies(data).length,0);assert.throws(()=>company.switchCompany(data,first));
});
test('Requests require an owned available company and cannot be duplicated or sent by its owner',()=>{
 const data=fixture();request(data);assert.throws(()=>request(data));assert.throws(()=>request(data,'hr'));assert.throws(()=>request(data,'other','liniya'));
 data.companies.find(c=>c.id===data.employerCompanyId).blocked=true;assert.throws(()=>request(data,'other'));
 assert.equal(data.teamRequests.length,1);
});
test('Acceptance grants the chosen role only for the requested company and only once',()=>{
 const data=fixture();const first=data.employerCompanyId;const application=request(data);company.createEmployerCompany(data,{...details,name:'Second Studio'});
 assert.throws(()=>team.decideTeamRequest(data,application.id,'stranger','Accepted','admin',''));
 team.decideTeamRequest(data,application.id,'hr','Accepted','moderator','Добро пожаловать');
 assert.equal(data.companyMembers.length,1);assert.equal(application.status,'Accepted');
 assert.equal(company.canManageCompany(data,'jobs','employee',first),true);assert.equal(company.canManageCompany(data,'applications','employee',first),false);
 assert.equal(company.canManageCompany(data,'jobs','employee',data.employerCompanyId),false);
 assert.throws(()=>team.decideTeamRequest(data,application.id,'hr','Accepted','admin',''));
 assert.equal(data.notifications[0].recipientId,'employee');
});
test('Role changes and removal immediately update permissions; owner is not a removable member',()=>{
 const data=fixture();const application=request(data);team.decideTeamRequest(data,application.id,'hr','Accepted','recruiter','');const member=data.companyMembers[0];
 assert.equal(company.canManageCompany(data,'applications','employee'),true);assert.equal(company.canManageCompany(data,'profile','employee'),false);
 assert.throws(()=>team.changeCompanyMember(data,member.id,'employee','admin'));
 team.changeCompanyMember(data,member.id,'hr','admin');assert.equal(company.canManageCompany(data,'team','employee'),true);
 assert.throws(()=>team.changeCompanyMember(data,member.id,'employee','moderator'));
 team.changeCompanyMember(data,member.id,'hr','moderator');assert.equal(company.canManageCompany(data,'applications','employee'),false);
 team.changeCompanyMember(data,member.id,'hr',null);assert.equal(company.accessibleCompanies(data,'employee').length,0);
 assert.throws(()=>company.requireCompanyPermission(data,'jobs','employee'));
 assert.throws(()=>team.changeCompanyMember(data,'owner','hr',null));assert.equal(company.companyRole(data,'hr'),'owner');
});
test('Withdrawal and rejection give no access and allow a later application',()=>{
 const data=fixture();const withdrawn=request(data);assert.throws(()=>team.withdrawTeamRequest(data,withdrawn.id,'stranger'));
 team.withdrawTeamRequest(data,withdrawn.id,'employee');assert.throws(()=>team.decideTeamRequest(data,withdrawn.id,'hr','Accepted','admin',''));
 const rejected=request(data);assert.throws(()=>team.decideTeamRequest(data,rejected.id,'hr','Rejected','recruiter',''));
 team.decideTeamRequest(data,rejected.id,'hr','Rejected','recruiter','Нет свободного места');assert.equal(company.accessibleCompanies(data,'employee').length,0);
 request(data);assert.equal(data.teamRequests.length,3);
});
