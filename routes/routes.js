const express =require('express');
const fs = require('fs');
const path =require('path');
const fetch = require('node-fetch');
const qrcode = require('qrcode');
const session =require('express-session')
const venom = require('venom-bot');
const  MongoClient = require('mongodb').MongoClient;
const  MongoClient1 = require('mongodb').MongoClient;
const { Console, count } = require('console');
const bodyParser =require('body-parser');
const { connect, Logger } = require('mongodb');
const FileStore = require('session-file-store')(session);
const ObjectID = require('mongodb').ObjectID;
const dburl = "mongodb+srv://agish:agish@first.jxgwd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var crypto = require('crypto');
var router = express.Router();
var url = require('url');



MongoClient.connect(dburl, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    const db = client.db('user-data');
    const collect = db.collection('users');
    const bot_db = db.collection('bot');
    const account_db =db.collection('account');
    const reports = db.collection('reports');
 const client_obj = db.collection('client')

 router.use(function(req, res){
    //Routes for get function
 if(req.method=="GET")
 {
     switch(req.url){
         //add agent
         case '/:id/add_agent':res.render('add_agent',{id:req.params.id});
                       break;
                       
         //goto dashboard
         case '/:id/dashboard': collect.find({ _id:new ObjectID(req.params.id) }).toArray(function(err, result) {
                            if (err){
                                  Console.log("err")
                                    }else
                                    { console.log(result[0])
                                     res.render('dashboard',{id:req.params.id,type:result[0].client});//need to remove account
                                    }
                             });
                             break;
              //login               
           case '/login':res.render('login');
           break; 
           //register
           case '/register':res.render('register');
           break;  
           //conact
           case '/contact':res.render('contact');
           break;  
           //bot
           case '/:id/bot': bot_db.find({ clientid: req.params.id}).toArray(function(err, result) {
                           if (err) throw err;
                          console.log(result);
                          res.render('bot',{id:req.params.id,data:result});
                          res.end();
                          })
           break; 
           //reports 
           case '/:id/report':res.render('reports',{id:req.params.id});
           break;  
           //payment
           case '/:id/payment': var data = req.params.id;
           res.render('payment',{id:data});
           break;  
           //agent page
           case '/:id/agent': var data = req.params.id;
           res.render('agent',{id:data});
           break; 
           //messages
           case '/:id/message':var data = req.params.id;
           res.render('message',{id:data});
           break;  
           //home
           case '/': res.render('index');break;               
              default: res.render('404');break;
                         }
 }
 
 
 
 
 
 
 //Routes for post function
 if(req.method=="POST")
 {
     switch(req.url){
         //check login
         case '/quoteslogin':req.session.email = req.body.email;
                            collect.find({ email: req.session.email}).toArray(function(err, result) {
                                                                if (err) throw err;   
                                                                console.log((result[0].pass)===req.body.pass)
                                                                if((result[0].pass)===req.body.pass)
                                                                {
                                                                 req.session.ind=result[0]._id;
                                                                 console.log(req.session.ind);
                                                                 res.redirect('/'+req.session.ind+'/dashboard')
                                                                }else{
                                                                 res.render('login');
                                                                 res.end();
                                                                     }
                                                                  });break;
          //check and update credit status                                                        
         case '/getcreditstatus': collect.find({ _id: new ObjectID( req.body.id)}).toArray(function(err, result) {
                                                                 if (err) throw err;
                                                                 res.send(JSON.stringify(result[0].credit));
                                                                 });break;
         //sending message --------------------------------------------------------------------------------need some fixing                                                        
         case '/send':  client =[];
                          try
                             {
                                 session.text=""
                                 collect.find({ _id: new ObjectID( req.body.cln_id)}).toArray(async function(err, result) {
                                  if (err){console.log("error")};
                                  console.log(result[0])
                                if(result[0].client=="free")
                                {
                                  session.text = req.body.text + ".                                                                  PS : Milkywaay loves you 😍😍.   This message is sent by bulk whatsapp marketing platform Milkywaay.com. Claim your free Whatsapp credits today by signing up on Milkywaay.com "
                                }else{
                                  session.text = req.body.text
                                      }
                                client_obj.find({id:req.body.id}).toArray((err,result)=>{
                                client=result[0].obj;
                                check_send(client, req.body.num, session.text, req.body.cln_id, req.body.campaign);
                                })
       
                                console.log(status)//not working
                                res.send(status)
                              })
          
                              }
                              catch(e)
                             {console.log(e)};
                              break;
         //payumoney integration                     
         case '/pay':  console.log(req.body)
                       var ord = JSON.stringify(Math.random()*1000);
                       var i = ord.indexOf('.');
                       ord = 'ORD'+ ord.substr(0,i);	
                       var key ='oDUxJstD';
                       var salt ="pjrBeYEc01";
                       collect.find({ _id:new ObjectID(req.body.id) }).toArray(function(err, result) {
                                  if (err){Console.log("err")};  
                                   console.log(result)      
                                   var cryp = crypto.createHash('sha512');
                                   var text = 'oDUxJstD'+'|'+ord+'|'+req.body.amount+'|'+req.body.pinfo+'|'+result[0].User+'|'+result[0].email+'|||||'+result[0]._id+'||||||'+salt;
                                   cryp.update(text);
                                   var hash = cryp.digest('hex');		
                                   res.setHeader("Content-Type", "text/json");
                                   res.setHeader("Access-Control-Allow-Origin", "*");
                                   var ret_value = {
                                                    key:key,
                                                    hash:hash,
                                                    id:result[0]._id,
                                                    ord:ord,
                                                    amount:req.body.amount,
                                                    pinfo:req.body.pinfo,
                                                    user:result[0].User,
                                                    email:result[0].email,
                                                    phone:result[0].number           
                                                    }
                                   res.end(JSON.stringify(ret_value));
           
                                  });break;
         //payment response                         
         case '/response.html':  var key = req.body.key;
                                 var salt ="pjrBeYEc01";
                                 var txnid = req.body.txnid;
                                 var amount = req.body.amount;
                                 var productinfo = req.body.productinfo;
                                 var firstname = req.body.firstname;
                                 var email = req.body.email;
                                 var udf5 = req.body.udf5;
                                 var mihpayid = req.body.mihpayid;
                                 var status = req.body.status;
                                 var resphash = req.body.hash;
                                 
                                 var keyString 		=  	key+'|'+txnid+'|'+amount+'|'+productinfo+'|'+firstname+'|'+email+'|||||'+udf5+'|||||';
                                 var keyArray 		= 	keyString.split('|');
                                 var reverseKeyArray	= 	keyArray.reverse();
                                 var reverseKeyString=	salt+'|'+status+'|'+reverseKeyArray.join('|');
                                 
                                 var cryp = crypto.createHash('sha512');	
                                 cryp.update(reverseKeyString);
                                 var calchash = cryp.digest('hex');
                                 
                                 var msg = 'Payment failed for Hash not verified...';
                                 if(calchash == resphash)
                                 { msg = 'Transaction Successful and Hash Verified...';
                         
                                 
                                 if(parseInt(amount)==2999)
                                 {var credit = 10000;}
                                 if(parseInt(amount)==9999.00)
                                 {var credit = 50000;
                                console.log("sssss")}
                                 if(parseInt(amount)==29999.00)
                                 {var credit = 300000;}
                         
                                 collect.find({ _id:new ObjectID(udf5) }).toArray(function(err, result) {
                                 if (err){
                                     Console.log("err")
                                 }else
                                 { 
                                 
                                 var credit1=credit+result[0].credit;  
                                 console.log(amount)
                                 collect.findOneAndUpdate({_id: new ObjectID(udf5)}, { $set:{credit:credit1,client:productinfo}},{ upsert: true })
                                 .then(result => {
                                     console.log(result);
                             
                                 
                                 })
                                 }
                                 }).then(
                                 res.redirect('/'+udf5+'/'+productinfo+'/dashboard')
                                 )
                             
                                 };break;
          //delete whatsapp account                       
         case '/deleteacc':  console.log("yes")
                             try
                             {
                             account_db.deleteOne({_id:new ObjectID(req.body.acc_id)});
                             let path="./tokens/"+req.body.user_id+"-"+req.body.acc_id+".data.json";
                             let path1="./client/"+req.body.user_id+"-"+req.body.acc_id+".json";
                             try {
                             fs.unlinkSync(path)
                             fs.unlinkSync(path1)
                             //file removed
                             } catch(err) {
                             console.error("err")
                             }
                             res.send("true")
                         }
                             catch(e)
                             {
                             console.log("error")
                             };break;
          //get campaign list details-----------check                   
         case '/getcampaign': reports.find({ clientid: req.body.user_id }).toArray(function (err, result) {
                             if (err) throw err;
                             res.send(result)
                             });break;
         //
         case '/getstatus':  console.log(req.body.user_id)
                             account_db.find({id:req.body.user_id}).toArray(function(err, result1) {
                             if (err) throw err; 
                             console.log(result1)
                             res.send(result1);
                             });break;
         //
         case '/removeqr':   console.log(req.body.acc_id)
                             account_db.find({_id:new ObjectID(req.body.acc_id)}).toArray(function(err, result) {
                             if (err) throw err; 
                             console.log(result[0].status=="Yes");
                             if(result[0].status==="Yes")
                             {
                             res.send("true");
                             }else
                             {
                             res.send("false");
                             }
                             });break;
         //update bot
         case '/:id/updatebot':  console.log(req.body)
                                 if(req.body.request!=""&&req.body.response!="")
                                 {
                                 bot_db.insertOne(req.body)
                                 .then(result => {
                                 console.log(result);
                                 res.redirect('/'+req.params.id+'/bot');
                                 res.end();
                                 })
                                 .catch(error => console.error(error))
                                 };break;
         //add login data to db      
         case '/quotes':var data= req.body;
                         data.client='free';
                         data.credit=100;
                         data.agent=false;
                         collect.insertOne(data)
                         .then(result => {
                         console.log(result);
                         res.redirect('/'+result.insertedId+'/payment');
                         res.end();
                         })
                         .catch(error => console.error(error));break;
         //add whatsapp number
         case '/:id/:type/addnumber':   console.log(req.body)
                                         account_db.insertOne(req.body)
                                         .then(result => {
                                         console.log(result);
                                         res.redirect('/'+req.params.id+'/'+req.params.type+'/dashboard');
                                         })
                                         .catch(error => console.error(error));break;
         //activate whatsapp
         case '/activate': console.log(req.body);
                             req.session.count=0;
                             console.log("1st check")
                     try{
                         venom.create((req.body.user_id+"-"+req.body.acc_id),
                         (base64Qrimg, asciiQR, attempts, urlCode) => {
                             console.log('Number of attempts to read the qrcode: ', attempts);
                             console.log('Terminal qrcode: ', asciiQR);
                             console.log('base64 image string qrcode: ', base64Qrimg);
                             console.log('urlCode (data-ref): ', urlCode);
                             res.send(base64Qrimg)
                         
                             },
                             (statusSession, session) => {
                             console.log('Status Session: ', statusSession);
                             //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser
                             //Create session wss return "serverClose" case server for close
                             if(statusSession=="qrReadSuccess")
                             {
                             let alert = require('alert');  
                             alert("Qr authentication successful");
                             account_db.findOneAndUpdate({_id: new ObjectID(req.body.acc_id)}, { $set:{status:"Yes"}},{ upsert: true })
                             .then(result => {
                                 console.log(result);
                         
                             
                             })
                             .catch(error => console.error(error))
                             // res.redirect('/'+req.params.id+'/dashboard');
                             }
                     
                             },
                             {   headless: true ,useChrome: true})
                             .then((client)=>{ 
                             console.log(client)
                             const client_path="./client/"+req.body.user_id+"-"+req.body.acc_id+".json";
                             //fs.write(client_path,JSON.stringify(client.toString()))
                             fs.open(client_path, 'w+', function(err, data) {
                                 if (err) {
                                     console.log("ERROR !! " + err);
                                 } else {
                                     fs.write(data, JSON.stringify(client.toString()), 0, JSON.stringify(client.toString()).length, null, function(err) {
                                         if (err)
                                             console.log("ERROR !! " + err);
                                         fs.close(data, function() {
                                             console.log('written success');
                                         })
                                     });
                                 }
                             });
                         
                             clientbot(client)
                         })
                         }catch(e)
                         {
                         console.log("error")
                         };break;
              default: res.render('404');break;
                         }
 }
 });


 function clientbot(client,id,aid)
 {
 

     let check=false;
        client.onMessage((message) => {
          console.log(message.to.split("@")[0])
    account_db.find({ }).toArray(function(err, result) {
            if (err) throw err;
            
            result.forEach(data=>
              {
              if(message.to.split("@")[0]==data.code+data.number){
              
              bot_db.find({clientid:data.id }).toArray(function(err, result) {
                if (err) throw err;
                console.log(result)
                result.forEach(val=>{
                  if (message.body === val.request && message.isGroupMsg === false) {
                    check_send(client,message.from,  val.response,data.id ,"Auto-reply")
                      check=true;               
                      
                  }
                });
                if(check==false)
                {
                  result.forEach(val=>{
                    if ("default" === val.request && message.isGroupMsg === false) {
                      check_send(client,message.from,  val.response,data.id ,"Auto-reply")
                        check=true;               
                        
                    }
                  });
                }

              });
            
            }
          
          })
            
            
           
        })
       
       });
           
      
 }
 function check_send(client,from,text,id,campaign)
{
 session.file = {};
 collect.find({_id: new ObjectID(id)}).toArray(async function(err, result) {
    if (err) throw err;
    console.log(result[0].credit)
if(result[0].credit>0)

{
  console.log()
  if (await client.getConnectionState()=='CONFLICT'){ client.useHere();}
 await client
  .sendText(from,  text)
  .then((result1) => {
    session.file= result1;
 // console.log('Result: ', result1); //return object success
  collect.findOneAndUpdate({_id: new ObjectID(id)}, { $set:{credit:result[0].credit-1}},{ upsert: true })
  reports.insertOne({clientid:id,time:new Date(),sendto:from.split("@")[0],status:result1.status,campaign:campaign})
  .then(result4 => {
    console.log(result4);
    

  })
  .catch(error => console.error(error))     
  })
  .catch((erro) => {
    console.error('Error when sending: ', erro); //return object error
  });
console.log(session.file.status)
if(session.file.status=="OK")
{
  return(true);
}
else
{
return(false)
}

}
else
{
return("no-credit");// redirect to payment
}
  })
 

}
})
module.exports = router;