const SHA256 = require("./node_modules/crypto-js/sha256");
const Doctor = require("./Doctor");
const cipher = require("./node_modules/crypto-js/aes"); 
const decrypt = require("./node_modules/crypto-js/enc-utf8");

class Patient{
    constructor(name,surname,middleInit,phone,address,pass,email){
        this.doctors = [];
        this.name = name;
        this.surname = surname;
        this.middleInit = middleInit;
        this.type = "Patient";
        this.phone = phone;
        this.address = address;
        this.email = email;
        this.seed = Math.random()*100;
        this.password = cipher.encrypt(pass,""+this.phone+this.seed);
        //Put password diurectly in blockchain, hashed by address, doctor address and seed of patient.
        this.hashAddress = SHA256(this.name+this.seed+this.password).toString();
       
    }
    
    getInfo(type){
      return  (cipher.decrypt(this.doctor.getInfo(this,type),""+this.address+this.seed)).toString(decrypt);
    }

}
module.exports = Patient;