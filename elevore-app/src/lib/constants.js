const STAFF_PAY   = 0.40;
const MONTHLY_GOAL = 15000;
const GOOGLE_LINK  = "https://g.page/r/TU_LINK_AQUI/review";
const ADMIN_PIN    = "2026";
const STAFF_PIN    = "staff";
const PRIVATE_PIN  = "boss";  // extra PIN to reveal finances

const ADDONS = [
    {id:'oven',    label:'Inside Oven',   p:35},
    {id:'fridge',  label:'Inside Fridge', p:30},
    {id:'windows', label:'Windows',       p:50},
    {id:'pethair', label:'Pet Hair',      p:25},
    {id:'garage',  label:'Garage',        p:40},
];
const QUICK_JOBS = [
    {id:'tv',      label:'Mount TV',        p:150},
    {id:'door',    label:'Install Door',    p:200},
    {id:'patch',   label:'Drywall Patch',   p:180},
    {id:'shelves', label:'Shelving',        p:100},
    {id:'lock',    label:'Lock Change',     p:85 },
    {id:'paint',   label:'Paint Touch-up',  p:120},
    {id:'faucet',  label:'Faucet Install',  p:130},
    {id:'caulk',   label:'Caulking',        p:75 },
];
const RISK_P = [{label:'None',v:0},{label:'Low',v:50},{label:'Mid',v:100},{label:'High',v:150}];
const CHECKLIST = ['Entrance & hallway','Kitchen counters & sink','Bathrooms scrubbed','Floors mopped','Bedrooms dusted','Windows wiped','Trash removed','Final walkthrough'];
const SVC_LEVELS = {regular:'Bronze',deep:'Silver',moveout:'Gold',postcon:'Gold',handyman:'Silver'};
const CLIENT_LEVELS = [{name:'Bronze',min:0,color:'#cd7f32'},{name:'Silver',min:3,color:'#c0c0c0'},{name:'Gold',min:7,color:'#fbbf24'},{name:'Platinum',min:15,color:'#e5e4e2'}];

const INITIAL = {
    name:"",phone:"",address:"",svc:'regular',
    beds:2,baths:2,living:1,laundryRoom:0,complexity:1,
    sqft:2000,oven:false,fridge:false,windows:false,pethair:false,garage:false,
    laundryLoads:0,expenses:0,deposit:0,discount:0,
    frequency:'one-time',team:"",date:"",status:'lead',totalPrice:0,
    laborHours:2,materialCost:0,riskMargin:50,selectedQuickJobs:[],
    audit_link:"",notes:"",urgencyHours:24
};

export {
  STAFF_PAY,
  MONTHLY_GOAL,
  GOOGLE_LINK,
  ADMIN_PIN,
  STAFF_PIN,
  PRIVATE_PIN,
  ADDONS,
  QUICK_JOBS,
  RISK_P,
  CHECKLIST,
  SVC_LEVELS,
  CLIENT_LEVELS,
  INITIAL
};