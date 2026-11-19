const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');
const api={};
vm.runInNewContext(ts.transpileModule(readFileSync(resolve(__dirname,'../lib/employer-company.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:api,URL,crypto:require('node:crypto').webcrypto});
const details={name:'Nova Studio',city:'Алматы',industry:'Разработка ПО',size:'11–50 сотрудников',email:'team@example.com',website:'',description:'Создаём приложения и сайты для малого бизнеса и помогаем запускать новые продукты.'};
const seed={...details,id:'seed-company',name:'Демо Компания',verified:true,blocked:false,logo:''};
function fixture(){return {companies:[{...seed}],jobs:[{id:'seed-job',company:seed.name}]};}

test('Old snapshots and demo companies do not grant employer ownership or posting access',()=>{
 const data=fixture();assert.equal(api.employerCompany(data),undefined);assert.equal(api.employerCanPost(data),false);assert.equal(api.ownsJob(data,data.jobs[0]),false);
});
test('Company registration creates an independent company and preserves demo data',()=>{
 const data=fixture();const original=JSON.stringify(data.companies[0]);const company=api.createEmployerCompany(data,details);
 assert.equal(data.companies.length,2);assert.equal(JSON.stringify(data.companies[0]),original);assert.equal(data.employerCompanyId,company.id);assert.equal(company.verified,false);assert.equal(api.employerCanPost(data),true);assert.equal(api.ownsJob(data,data.jobs[0]),false);assert.equal(api.ownsJob(data,{companyId:company.id,company:company.name}),true);
});
test('Validation rejects blank descriptions, duplicate names and unsafe website protocols without mutation',()=>{
 const data=fixture();const before=JSON.stringify(data);
 for(const invalid of [{...details,description:'   '},{...details,name:'  демо   компания  '},{...details,website:'javascript:alert(1)'},{...details,email:'bad'},{...details,size:''}])assert.throws(()=>api.createEmployerCompany(data,invalid));
 assert.equal(JSON.stringify(data),before);assert.equal(Object.keys(api.companyErrors({...details,website:'https://example.com'})).length,0);
});
test('Blocked, incomplete and missing companies cannot post; a second registration cannot own earlier jobs',()=>{
 const data=fixture();const company=api.createEmployerCompany(data,details);const job={companyId:company.id,company:company.name};
 company.blocked=true;assert.equal(api.employerCanPost(data),false);company.blocked=false;company.description='short';assert.equal(api.employerCanPost(data),false);company.description=details.description;
 api.createEmployerCompany(data,{...details,name:'Another Team'});assert.equal(api.ownsJob(data,job),false);data.employerCompanyId='missing';assert.equal(api.employerCanPost(data),false);
});
test('Stable company ID keeps ownership after renaming and takes priority over a matching name',()=>{
 const data=fixture();const company=api.createEmployerCompany(data,details);const job={companyId:company.id,company:company.name};company.name='New Studio';
 assert.equal(api.ownsJob(data,job),true);assert.equal(api.ownsJob(data,{companyId:'someone-else',company:company.name}),false);assert.equal(Object.keys(api.companyErrors(company,data.companies,company.id)).length,0);
});
