var SHA256 = require("crypto-js/sha256");

class Block{
    constructor(info,previousHash){
    
        this.info = info;

        this.nounce = 0;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }
    calculateHash(){
        return SHA256(this.info+this.nounce+this.previousHash).toString();
    }

}

 class BlockChain{
    constructor(){
       this.chain = [];
       this.createGenesisBlock();
        
    }
    
    createGenesisBlock(){
        this.chain.push( new Block({
            address:"",data:""},null));
    }
    getLastBlock(){
        return this.chain[this.chain.length-1];
    }
    getBlock(i){
        return this.chain[i];
    }
   
    addBlock(data){
       // if(!this.isChainValid()){
         //   console.log("Chain not Valid");
           // return;
        //}
       // console.log("PREVIOUS HASH: "+this.getLastBlock);
        this.chain.push(new Block(data,this.getLastBlock().hash,false));
     
    }
    setRaw(set){
        this.chain = [];
        set.forEach(element=>{
           this.chain.push(new Block(element.info,element.previousHash));
        });
    }
    isChainValid(){
        for (let i = 1; i< this.chain.length;i++){   
        if(this.chain[i].hash !== this.chain[i].calculateHash()){
            console.log("ERROR AT "+i);
            console.log(this.chain[i].hash );
            console.log(this.chain[i].calculateHash() );
            return false;
        }
        if(this.chain[i].previousHash !== this.chain[i-1].calculateHash()){
        console.log("ERROR 2 AT "+i);
            return false;
        }
        }
    return true;
    }

}       
module.exports = BlockChain;

/*
dbChain = new BlockChain();
console.log("Adding block 1:");
dbChain.addBlock(Date.now(),{ data:btoa("Hello ^^")});
console.log("Block Added");
console.log(dbChain);
console.log(dbChain.getLastBlock().transferInfo.data);
console.log(atob(dbChain.getLastBlock().transferInfo.data));
dbChain.getBlock(0).transferInfo = {data:"Bye"};
console.log(dbChain);
dbChain.addBlock(Date.now(),{data:"heyyy"});
*/