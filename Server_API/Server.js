var twilio = require("twilio");


class SMSManager {
  constructor(pubKey,privKey,phoneNo){
    this.client  = new twilio(pubKey,privKey);
    this.phoneList = [];
    this.phoneNo = phoneNo;
  }
  signUp(fullName,id,phoneNo,usr,pass){
    this.phoneList.push(phoneNo);
    //console.log(`Sending message to ${phoneNo}`);
    this.client.messages.create({
      body:`Welcome, ${fullName} (ID:${id}) to DocChain!\nYour Credentials are:
      \nUser:${usr}\nPassword:${pass}`,
      to:phoneNo,
      from:this.phoneNo
    }).then(()=>{
      //console.log("Message sent");
    });
  }
  sendMsg(number,msg){
    this.client.messages.create({
      body:msg,
      to:number,
      from:this.phoneNo
    }).then(()=>{
      //console.log("Message sent");
    });
  }
  
}
const ADMIN_PASS = "alpaca2403";
const decrypt = require("./node_modules/crypto-js/enc-utf8");
const Doctor = require("./Doctor");
const Patient = require("./Patient");
const cypher = require("./node_modules/crypto-js/aes"); 
var client = new SMSManager("AC78277f01424a4fc8efa95053c36b9171","cbf65259d8db58bb2dbb6fe1eb5cc4cd","+441392690306");
var port = process.argv[2];
var CircularJSON = require('circular-json');
var partner = process.argv[3];
var express = require('express');
var app =express();
var http = require("http").Server(app);
var crypto = require('crypto-js/aes');
var bodyParser = require('body-parser');
var blockchainClass = require("./blockChain");
var blockchain = new blockchainClass();
var request = require('request');
var ioClient = require("./node_modules/socket.io-client")('http://localhost:'+partner);
var ioServer = require("./node_modules/socket.io")(http);
var _ = require("underscore");
const SHA256 = require("./node_modules/crypto-js/sha256");
//console.log("partner is",partner);

var patients = [];
var doctors = [];
app.use(bodyParser.urlencoded({extended:false}));
app.set('port',this.port);
app.use(bodyParser.json());
app.use(express.static(__dirname));


var pendingInfo;
var partnerServers = [];
var data = [];
partnerServers.push(partner);
app.get("/patientLogin",(req,res)=>{
  var email = req.query.email;
  var patient = getPatient(email);
  var pass = req.query.password;

  if(patient&&cypher.decrypt(patient.password,""+patient.phone+patient.seed).toString(decrypt)==pass){
    res.send(true);
  }else{
    res.send("E-mail or password incorrect");
  }
});
var getDoctor = function(email){
  var final;
  for(var i =0; i<doctors.length;i++){
    doctor= doctors[i];
    if(doctor.email === email){
      final = doctor;
    }}
    return final;
}
app.get("/doctorLogin",(req,res)=>{
  //console.log(req.query,"IS TRYING TO ENTER");
  var email = req.query.email;
  var doctor = getDoctor(email);
  var pass = req.query.password;
  if(doctor&&cypher.decrypt(doctor.password,doctor.name+doctor.seed).toString(decrypt)==pass){
    res.send(true);
  }else{
    res.send("E-mail or password incorrect");
  }
});
app.get("/getPatients",(req,res)=>{
  var query = Object.keys(req.query);
   //console.log(req.query);
  let queryInfo = [];
  data = patients;
  var possibleBlocks = data;
  var workingBlocks = [];
  if(query.length == 0){
    workingBlocks = data;
  }
  query.forEach(queryKey =>{
    possibleBlocks.forEach((element)=>{
      if(element&&element[queryKey]&&element[queryKey] === req.query[queryKey]){
        workingBlocks.push(element);
      }
    })
  });
  if(workingBlocks.length === 0){
  res.sendStatus(404);
  //console.log("EMPTY");
  res.send("");
}
  else{
    //console.log("SENDING",JSON.parse(CircularJSON.stringify( workingBlocks)));
    res.send(JSON.parse(CircularJSON.stringify( workingBlocks)));
  }

});
app.get("/getDoctors",(req,res)=>{
  var query = Object.keys(req.query);
   //console.log(req.query);
  let queryInfo = [];
  data = doctors;
  var possibleBlocks = data;
  var workingBlocks = [];
 
  if(query.length == 0){
    workingBlocks = data;
  }
  query.forEach(queryKey =>{
    possibleBlocks.forEach((element)=>{
      if(element&&element[queryKey]&&element[queryKey] === req.query[queryKey]){
        workingBlocks.push(element);
      }
    })
  });
  if(workingBlocks.length === 0)
  res.sendStatus(404);
  else{
    res.send(JSON.parse(CircularJSON.stringify( workingBlocks))); 
    }

});
app.get("/uptodate",(req,res)=>{
  res.send(blockchain.chain.length>0);
});

var server =  http.listen(port,(err)=>{
  //console.log("Connected",server.address().port);
  
  syncServer();
  
});




app.post(`/updateInfo`,(req,res)=>{  //ONLY BETWEEN SERVERS!!
  //console.log(req.body,"added to blockchain");
  //data.push(req.body);
  blockchain.addBlock(req.body);
  res.sendStatus(200);

})

app.post(`/updatePatient`,(req,res)=>{  //ONLY BETWEEN SERVERS!!
  
  //data.push(req.body);
  blockchain.addBlock(req.body);
  patients.push(req.body);
  res.sendStatus(200);

})
app.post(`/updateDoc`,(req,res)=>{  //ONLY BETWEEN SERVERS!!
  
  //data.push(req.body);
  blockchain.addBlock(req.body);
  doctors.push(req.body);
  res.sendStatus(200);

})

ioClient.on("New Update",(socket)=>{
  //console.log("New update Incoming");
});

ioClient.on("Updated", (socket)=>{
  //console.log("Server is up-to-date");
  //console.log("Data added:");
});
var getContracts = function(){
  var final = [];
  blockchain.chain.forEach(block=>{
    console.log(block);
    block = block.info;
    if(block.type==="Contract")
    final.push(block);
  })
    return final;
}
app.get("/myPatients",(req,res)=>{
  console.log("Checking my patients");
  var docMail = req.query.email;
  console.log(docMail);
  var contracts = getContracts();
  console.log(contracts);
  var patientList = [];
  var contractList = [];
  contracts.forEach(contract=>{
    console.log(contract);
    if(contract.docAddress === docMail){
      contractList.push(contract);
    }
  });
  contractList.forEach(contract =>{
    patientList.push(getPatient(contract.patientAddress));
  })

  console.log(patientList);
  if(patientList.length >0)
  res.send(JSON.parse(CircularJSON.stringify(patientList)));
  else
  res.send(`No patients for doctor with email ${docMail}`);
});
app.post("/patientSignUp",(req,res)=>{
  //console.log("Patient sign up");
  var info = req.body;
  let pat = new Patient(info.name,info.surname,info.middleInitial,info.phone,info.address,info.password,info.email);
  client.signUp(`${info.name} ${info.middleInit} ${info.surname}`,pat.hashAddress,info.phone,pat.email,info.password);
  patients.push(pat);
  blockchain.addBlock(pat);
  request.post({
    url:`http://localhost:${partner}/updatePatient`,
    body:pat,
    json:true
  });
  res.sendStatus(200);
});
app.post("/addDoc",(req,res)=>{
  var docFound = false;
    var docAddress = req.body.docAddress;
  doctors.forEach(doctor =>{
      console.log(doctor.email);
      if(doctor.email === docAddress){
        console.log(`FOUND ${doctor.email}`);
        docFound = true;
        blockchain.addBlock({
          type:"Contract",
          beginDate:Date.now(),
          patientAddress:req.body.patientAddress,
          docAddress:req.body.docAddress
        });
      }
  });
  if(!docFound){
    res.sendStatus(500);
  }
  else{
  addRelation(req.body.patientAddress,req.body.docAddress,true); 
  res.sendStatus(200);
  }
});
var addRelation = function(pat,doc,rpt){
  var doctor;
  
  doctors.forEach(docto=>{
    if(docto.email === doc){
      doctor = docto;
    }
  });
  var patient
  patients.forEach(patiente=>{
    if(patiente.email === pat){
      patient = patiente;
    }})
    doctor.patients.push(patient);
    patient.doctors.push(doctor);
    if(rpt){
    request.post({
      url:`http://localhost:${partner}/addRelation`,
      body:{doc:doc,pat:pat,rpt:false},
      json:true
    });
  }
  
}
app.post("/addRelation",(req,res)=>{
  //console.log("hewlhfcldjhfcldshcdnhkihnkihn",req.body.pat,req.body.doc);
  addRelation(req.body.pat,req.body.doc,false);
})
var getPatient = function(address){
  var final;
  for(var i =0; i<patients.length;i++){
    patiente= patients[i];
    if(patiente.email === address){
      final = patiente;
    }}
    return final;
}

app.post("/dropContract",(req,res)=>{
  
  var docAddress =req.body.docAddress;
  var patientAddress = req.body.patientAddress;
 
  if(getPatient(patientAddress)){
    var patient = getPatient(patientAddress);
    //console.log("BEFORE",patient.doctors);
    patient.doctors.forEach(doc =>{
      if(doc.email === docAddress){
        patient.doctors.splice(patient.doctors.indexOf(doc),1);
        doc.patients.splice(doc.patients.indexOf(patient),1);
        //console.log("Contract with",docAddress,"terminated");
        //console.log("AFTER",patient.doctors);

        blockchain.addBlock({
          type:"Contract Drop",
          terminationDate:Date.now(),
          docAddress:docAddress,
          patientAddress:patientAddress
        });
      }
    });
  }else{
    //console.log("No contract to remove");
  }
  res.sendStatus(200);
});
app.post("/docSignUp",(req,res)=>{
  //console.log("Doc sign up");
  var info = req.body;
  let pat = new Doctor(info.name,info.surname,info.middleInitial,info.phone,info.organisation,info.password,info.email);
  client.signUp(`${info.name} ${info.middleInit} ${info.surname}`,pat.hashAddress,info.phone,pat.email,info.password);
  doctors.push(pat);
  blockchain.addBlock(pat);
  request.post({
    url:`http://localhost:${partner}/updateDoc`,
    body:pat,
    json:true
  });

  res.sendStatus(200);

});


app.get("/fullChain",(req,res)=>{
  res.send(JSON.parse(CircularJSON.stringify( blockchain.chain)));
});






var update =  function(partners){  
  blockchain.addBlock(pendingInfo);
    partners.forEach(element => {
      //console.log("Sending:",pendingInfo)
      request.post({
        url:`http://localhost:${element}/updateInfo`,
        body:pendingInfo,
        json: true
      });
    });
}
  
   

process.on('uncaughtException', err => {
    //console.log("Could not contact partner server");
    
  });
 
function getPosition(string, subString, index) {
  return string.split(subString, index).join(subString).length;
}
var getAllPatients = function(){
  var pats = [];
  blockchain.chain.forEach(block=>{
    if(block.info.type&& block.info.type=== "Patient"){
      pats.push(block.info);
    }
  })
  return pats;
}
var getAlldocs = function(){
  var docs = [];
  blockchain.chain.forEach(block=>{
    
    if(block.info.type&& block.info.type === "Doctor"){
      docs.push(block.info);
    }
  })
  return docs;
}
var syncServer = function(){
  
    //console.log("Syncronising servers...")
    request(`http://localhost:${partner}/uptodate`,(err,resp,body)=>{
        if(body === "true"){
          request(`http://localhost:${partner}/fullChain`,(err,resp,body)=>{
            blockchain.chain = JSON.parse(body);
                

          doctors = getAlldocs();

             patients = getAllPatients();
             //console.log("Syncronised");
            });
        }else{
            //console.log("Done");
        }
    })
}





/*
////console.log(db.blockChain);

////console.log(db.queryData(org.address,"data"));
//module.exports.Database = db;
var doc = new Doctor("Gerardo",org); //Set Password then hash = pass+seed+address
var patient =  new Patient("Danilo",doc);
doc.patients.push(patient);
doc.addInformation(patient,"Bad state");
////console.log(db.blockChain);
//console.log(patient.getInfo("Observations"));
*/
