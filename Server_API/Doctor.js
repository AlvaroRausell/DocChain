const cipher = require("./node_modules/crypto-js/aes"); 
const SHA256 = require("./node_modules/crypto-js/sha256");
const arrays = require("./node_modules/underscore/underscore");
class Doctor{
    constructor(name,surname,middleInit,phone,organisation,pass,email){
        this.name = name;
      //  console.log(organisation);
        this.organisation = organisation;
        this.type = "Doctor";
        this.surname = surname;
        this.middleInit = middleInit;
        this.phone = phone;
        this.email = email;
      //  console.log(this.organisation);
        this.patients = [];
        this.seed = Math.random()*100;
        this.password = cipher.encrypt(pass,""+this.name+this.seed);
        this.hashAddress = SHA256(this.name+this.organisation+this.seed).toString();
    }
    addInformation(patient,info){
        this.organisation.addInfo(this,patient,info);
    }
    getInfo(patient,type){
        if(arrays.contains(this.patients,patient)){
         return   this.organisation.getInfo(patient,type);
        }
    }

}
module.exports = Doctor;