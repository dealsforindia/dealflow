export function filterOffers(offers,{query='',store='all',category='All',maxPrice=Infinity,sort='newest'}={}){
 const result=offers.filter(o=>(!query||`${o.title} ${o.store} ${o.category}`.toLowerCase().includes(query.toLowerCase()))&&(store==='all'||o.store===store)&&(category==='All'||o.category===category)&&o.price<=maxPrice);
 return sort==='price'?result.sort((a,b)=>a.price-b.price):sort==='discount'?result.sort((a,b)=>(1-b.price/b.mrp)-(1-a.price/a.mrp)):result;
}
export function toggleSelection(ids,id,limit=Infinity){return ids.includes(id)?ids.filter(x=>x!==id):ids.length>=limit?ids:[...ids,id];}
export function calculateEMI(principal,annualRate,months){if(!Number.isFinite(principal)||!Number.isFinite(annualRate)||!Number.isFinite(months)||principal<=0||annualRate<0||months<=0)throw new Error('Enter a positive amount and term.');const r=annualRate/1200;const monthly=r?principal*r*(1+r)**months/((1+r)**months-1):principal/months;return {monthly,total:monthly*months,interest:monthly*months-principal};}
export function makeWatch(offer,target){if(!Number.isFinite(target)||target<=0||target>=offer.price)throw new Error('Choose a target below the listed price.');return {offerId:offer.id,target};}
