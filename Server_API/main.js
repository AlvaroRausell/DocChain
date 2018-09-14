const Database = require("./database");
const Organisation = require("./organisation");
const Doctor = require("./Doctor");
const Patient = require("./Patient");

var servers = ["http://localhost:3001","http://localhost:3002"]

var db =  new Database();
var organisations = [];

var addOrganisation = function(org){
    
    organisations.push(org);
    db.addData({name: org.name,
                address:org.address});
}
var org = new Organisation("Hospital",db);
addOrganisation(org);
//console.log(db.blockChain);

//console.log(db.queryData(org.address,"data"));
//module.exports.Database = db;
var doc = new Doctor("Gerardo",org); //Set Password then hash = pass+seed+address
var patient =  new Patient("Danilo",doc);
doc.patients.push(patient);
doc.addInformation(patient,"Bad state");
//console.log(db.blockChain);
console.log(patient.getInfo("Observations"));
