const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const qrcode = require('qrcode');
const session = require('express-session')
const venom = require('venom-bot');
const MongoClient = require('mongodb').MongoClient;
const MongoClient1 = require('mongodb').MongoClient;
const { Console, count } = require('console');
const bodyParser = require('body-parser');
const { connect, Logger } = require('mongodb');
const FileStore = require('session-file-store')(session);
const ObjectID = require('mongodb').ObjectID;
const dburl = "mongodb+srv://agish:agish@first.jxgwd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var crypto = require('crypto');
var multer = require('multer');
var upload = multer();
require('events').EventEmitter.defaultMaxListeners = 100;

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./Images");
  },
  filename: function (req, file, callback) {
    callback(null, req.body.id + "_" + file.fieldname + ".jpg");
  }
});

var upload = multer({
  storage: Storage
}); //Field name and max count


app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({

  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));
function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}
const clientd = {};
MongoClient.connect(dburl, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    const db = client.db('user-data');
    const collect = db.collection('users');
    const bot_db = db.collection('bot');
    const account_db = db.collection('account');
    const reports = db.collection('reports');
    const agent = db.collection('agent');
    const add_client = db.collection('client')






    app.post('/quotes', (req, res) => {
      var data = req.body;
      data.client = 'free';
      data.credit = 100;
      data.agent = false;

      collect.insertOne(data)
        .then(result => {
          console.log(result);
          res.redirect('/' + result.insertedId + '/payment');
          res.end();
        })
        .catch(error => console.error(error))
    });

    app.post('/:id/:type/addnumber', (req, res) => {
      console.log(req.body)
      account_db.insertOne(req.body)
        .then(result => {
          console.log(result);
          res.redirect('/' + req.params.id + '/dashboard');

        })
        .catch(error => console.error(error))
    })

    app.post('/activate', async(req, res) => {
      console.log(req.body);
      req.session.count = 0;
      console.log("1st check")
      try {
        venom.create((req.body.user_id + "-" + req.body.acc_id),
          (base64Qrimg, asciiQR, attempts, urlCode) => {
            console.log('Number of attempts to read the qrcode: ', attempts);
            console.log('Terminal qrcode: ', asciiQR);
            console.log('base64 image string qrcode: ', base64Qrimg);
            console.log('urlCode (data-ref): ', urlCode);
            if (req.session.count < 1) {
              res.send(base64Qrimg); req.session.count++;
            }
            else {
              return;
            }






          },
          (statusSession, session) => {
            console.log('Status Session: ', statusSession);
            //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser
            //Create session wss return "serverClose" case server for close
            if (statusSession == "qrReadSuccess" && statusSession != "browserClose") {
             
              account_db.findOneAndUpdate({ _id: new ObjectID(req.body.acc_id) }, { $set: { status: "Yes" } }, { upsert: true })
                .then(result => {
                  console.log(result);

                })
                .catch(error => console.log("error"))
              // /res.redirect('/'+req.params.id+'/dashboard');
            }
const a;
          },
          { headless: true, useChrome: false })
        } catch (e) {
          console.log("error")
        }
          finally{((client) => {
            console.log(client)
            clientd[req.body.user_id + "-" + req.body.acc_id] = client;

            console.log(clientd)

            clientbot(client)
          })}
      

    })

    app.post('/:id/updatebot', (req, res) => {
      console.log(req.body)


      if (req.body.request != "" && req.body.response != "") {
        bot_db.insertOne(req.body)
          .then(result => {
            console.log(result);
            res.redirect('/' + req.params.id + '/bot');
            res.end();
          })
          .catch(error => console.error(error))
      }
    })



    app.get("/:id/message", (req, res) => {
      var data = req.params.id;
      res.render('message', { id: data });
      res.end();
    })
    app.get("/:id/agent", (req, res) => {
      agent.find({}).toArray(function (err, data) {
        if (err) throw err;

        res.render('agent', { id: req.params.id, data, data1: "" });
        res.end();
      })
    })
    app.get("/:id/payment", (req, res) => {
      var data = req.params.id;
      res.render('payment', { id: data });
      res.end();
    })
    app.get("/:id/report", (req, res) => {
      reports.find({ clientid: req.params.id }).toArray(function (err, result) {
        if (err) throw err;


        res.render('reports', { id: req.params.id, data: result });
      })



    })
    app.get("/:id/bot", (req, res) => {
      bot_db.find({ clientid: req.params.id }).toArray(function (err, result) {
        if (err) throw err;
        console.log(result);


        res.render('bot', { id: req.params.id, data: result });
        res.end();

      })
    })

    app.post('/removeqr', (req, res) => {
      console.log(req.body.acc_id)
      account_db.find({ _id: new ObjectID(req.body.acc_id) }).toArray(function (err, result) {
        if (err) throw err;
        console.log(result[0].status == "Yes");
        if (result[0].status === "Yes") {
          res.send("true");
        } else {
          res.send("false");
        }


      });
    })
    app.post('/getstatus', (req, res) => {
      console.log(req.body.user_id)
      account_db.find({ id: req.body.user_id }).toArray(function (err, result1) {
        if (err) throw err;
        console.log(result1)
        res.send(result1);

      });


    })
    // get campaign list
    app.post('/getcampaign', (req, res) => {



      reports.find({ clientid: req.body.user_id }).toArray(function (err, result) {
        if (err) throw err;


        res.send(result)
      })


    })
    app.get('/:id/add_agent', (req, res) => {
      res.render('add_agent', { id: req.params.id })

    })
    app.post('/deleteacc', (req, res) => {
      console.log("yes")
      try {
        account_db.deleteOne({ _id: new ObjectID(req.body.acc_id) });
        let path = "./tokens/" + req.body.user_id + "-" + req.body.acc_id + ".data.json";
        let path1 = "./client/" + req.body.user_id + "-" + req.body.acc_id + ".json";
        try {
          fs.unlinkSync(path)
          fs.unlinkSync(path1)
          //file removed
        } catch (err) {
          console.error("err")
        }
        res.send("true")
      }
      catch (e) {
        console.log("error")
      }

    })
    app.post('/:id/deletebot', (req, res) => {
      console.log("yes:"+req.params.id);
    
      try {
        bot_db.findOneAndDelete({_id: new ObjectID(req.body.id.trim())});
       
      
      }
      catch (e) {
        console.log("error")
      }
      
    })

    app.get("/:id/dashboard", async (req, res) => {
      collect.find({ _id: new ObjectID(req.params.id) }).toArray(function (err, result) {
        if (err) {
          Console.log("err")
        } else {
          console.log(result[0])
          res.render('dashboard', { id: req.params.id, type: result[0].client });//need to remove account
        }
      });
    })


    app.post('/pay', function (req, res) {
      console.log(req.body)
      var ord = JSON.stringify(Math.random() * 1000);
      var i = ord.indexOf('.');
      ord = 'ORD' + ord.substr(0, i);
      var key = 'oDUxJstD';
      var salt = "pjrBeYEc01";
      collect.find({ _id: new ObjectID(req.body.id) }).toArray(function (err, result) {
        if (err) { Console.log("err") };
        console.log(result)
        var cryp = crypto.createHash('sha512');
        var text = 'oDUxJstD' + '|' + ord + '|' + req.body.amount + '|' + req.body.pinfo + '|' + result[0].User + '|' + result[0].email + '|||||' + result[0]._id + '||||||' + salt;
        cryp.update(text);
        var hash = cryp.digest('hex');
        res.setHeader("Content-Type", "text/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        var ret_value = {
          key: key,
          hash: hash,
          id: result[0]._id,
          ord: ord,
          amount: req.body.amount,
          pinfo: req.body.pinfo,
          user: result[0].User,
          email: result[0].email,
          phone: result[0].number

        }
        res.end(JSON.stringify(ret_value));

      })

    });

    app.post('/response', function (req, res) {
      var key = req.body.key;
      var salt = "pjrBeYEc01";
      var txnid = req.body.txnid;
      var amount = req.body.amount;
      var productinfo = req.body.productinfo;
      var firstname = req.body.firstname;
      var email = req.body.email;
      var udf5 = req.body.udf5;
      var mihpayid = req.body.mihpayid;
      var status = req.body.status;
      var resphash = req.body.hash;

      var keyString = key + '|' + txnid + '|' + amount + '|' + productinfo + '|' + firstname + '|' + email + '|||||' + udf5 + '|||||';
      var keyArray = keyString.split('|');
      var reverseKeyArray = keyArray.reverse();
      var reverseKeyString = salt + '|' + status + '|' + reverseKeyArray.join('|');

      var cryp = crypto.createHash('sha512');
      cryp.update(reverseKeyString);
      var calchash = cryp.digest('hex');

      var msg = 'Payment failed for Hash not verified...';
      if (calchash == resphash) {
        msg = 'Transaction Successful and Hash Verified...';


        if (parseInt(amount) == 2999) { var credit = 10000; }
        if (parseInt(amount) == 9999.00) {
          var credit = 50000;
          console.log("sssss")
        }
        if (parseInt(amount) == 29999.00) { var credit = 300000; }

        collect.find({ _id: new ObjectID(udf5) }).toArray(function (err, result) {
          if (err) {
            Console.log("err")
          } else {

            var credit1 = credit + result[0].credit;
            console.log(amount)
            collect.findOneAndUpdate({ _id: new ObjectID(udf5) }, { $set: { credit: credit1, client: productinfo } }, { upsert: true })
              .then(result => {
                console.log(result);


              })
          }
        }).then(
          res.redirect('/' + udf5 + '/' + productinfo + '/dashboard')
        )

      }


    });

    app.post('/quoteslogin', (req, res) => {

      req.session.email = req.body.email;
      collect.find({ email: req.session.email }).toArray(function (err, result) {
        if (err) throw err;
        console.log((result[0].pass) === req.body.pass)
        if ((result[0].pass) === req.body.pass) {
          req.session.ind = result[0]._id;
          console.log(req.session.ind);
          res.redirect('/' + req.session.ind + '/dashboard')
        } else {
          res.render('login');
          res.end();
        }
      })
    });



    app.post("/getcreditstatus", (req, res) => {
      collect.find({ _id: new ObjectID(req.body.id) }).toArray(function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result[0].credit));
      })
    })

    app.post("/agent_add", upload.fields([{ name: 'photo' }, { name: 'address' }, { name: 'bank' }]), (req, res) => {
      if (req.files) {
        console.log(req.files);
        console.log(req.body.id);
        //res.redirect('/'+req.body.id+'/add_agent') 
        var data =
        {
          "client_id": req.body.id,
          "name": req.body.name,
          "description": req.body.description,
          "address": req.body.address_value,
          "account_number": req.body.account_number,
          "ifsc": req.body.ifsc,
          "photo": req.files.photo[0].filename,
          "address_path": req.files.address[0].filename,
          "bank": req.files.bank[0].filename,
          "status": "pending approval"
        }

        agent.insertOne(data)
          .then(result4 => {
            console.log(result4);


          })

      }

    })

    app.get("/", (req, res) => {
      res.render('index');
      res.end();
    })

    app.get("/login", (req, res) => {
      res.render('login');
      res.end();
    })

    app.get("/register", (req, res) => {
      res.render('register');
      res.end();
    })
    app.get("/contact", (req, res) => {
      res.render('contact');
      res.end();
    })

    app.post("/send",  async(req, res) => {
      res.redirect("/" + req.body["user-id"] + "/report")
      console.log(req.body.acc_i)
      var acc_sel = req.body.acc_i.split(",");
      console.log(acc_sel)

      var delaygroup = 0;
      if ((req.body.num).includes(",")) {
        var number = req.body.num.split(",");
      } else {
        var number = [];
        number.push(req.body.num);

      }

      for (var i = 0; i < number.length; i = i + acc_sel.length) {
        for (var j = 0; j < acc_sel.length; j++) {
          if (number[i + j].includes(" `$` ")) {
            var number1 = number[i + j].split(" `$` ");
            var message = req.body.mess.replace("{c1}", number1[1]).replace("{c2}", number1[2]).replace("{c3}", number1[3])
            var fin_num = number1[0];
          }
          else {
            var number1 = number[i + j];
            var message = req.body.mess
            var fin_num = number1;

          }

          if (number1[0] != null) {

          check_send((req.body["user-id"] + "-" + acc_sel[j]), "91" + fin_num + "@c.us", message, req.body["user-id"], req.body.campaign, false)
            console.log((req.body["user-id"] + "-" + acc_sel[j]))
          }

        }
       await sleep(req.body.buffertime * 1000)
        delaygroup++;
        if (delaygroup == req.body.delaygrouptotal) {
          delaygroup = 0;
        await  sleep(req.body.groupdelaytime * 1000)
        }

      }



    });

    function sleep(millis) {
      return new Promise(resolve => setTimeout(resolve, millis));
    }

    async function clientbot(client) {

      
      client.onMessage((message) => {
        let check = false;
        console.log(message.to.split("@")[0])
        account_db.find({}).toArray(function (err, result) {
          if (err) throw err;

          result.forEach(data => {
            if (message.to.split("@")[0] == data.code + data.number) {

              bot_db.find({ clientid: data.id }).toArray(function (err, result) {
                if (err) throw err;
                console.log(result)
                result.forEach(val => {
                  if (message.body === val.request && message.isGroupMsg === false) {
                    check_send(client, message.from, val.response, data.id, "Auto-reply",true)
                    check = true;

                  }
                });
                if (check == false) {
                  result.forEach(val => {
                    if ("default" === val.request && message.isGroupMsg === false) {
                      check_send(client, message.from, val.response, data.id, "Auto-reply",true)
                      check = true;

                    }
                  });
                }

              });

            }

          })



        })

      });


    }

   async function initiat() {
      account_db.find({status:'Yes'}).toArray(async function (err, result) {
        if (err) { console.log("errror") }
        else {
          console.log(result)
          try{
            result.forEach(  async function(data){
              try {
                await venom.create(data.id + "-" + data["_id"])
              } catch (error) {
                console.log("error1") ;
              }
             finally{(client => {
                     clientd[data.id + "-" + data["_id"]] = client; clientbot(client);
       
                   });}
       
       
                 })
          }catch{
            console.log("error")
          }finally{app.listen(8000);console.log("done")}
     
        
        }
      })
    }
   initiat();
   function check_send(client, to, text, id, campaign,bot) {
      if(bot==true)
      {   collect.find({ _id: new ObjectID(id) }).toArray(async function (err, result) {
        if (err) throw err;
        console.log(result[0].credit)
        if (result[0].credit > 0) {
    
        client.sendText(to,text).then((result1)=>
        {
          session.file = result1;
              // console.log('Result: ', result1); //return object success
              collect.findOneAndUpdate({ _id: new ObjectID(id) }, { $set: { credit: result[0].credit - 1 } }, { upsert: true })
              reports.insertOne({ clientid: id, time: new Date(), sendto: to.split("@")[0], status: result1.status, campaign })
                .then(result4 => {
                  console.log(result4);


                })
                .catch(error => console.error(error))
        });
      }})
      }else
      {
        console.log(client)
      session.file = {};
      collect.find({ _id: new ObjectID(id) }).toArray(async function (err, result) {
        if (err) throw err;
        console.log(result[0].credit)
        if (result[0].credit > 0) {
          console.log()
          if (clientd[client]) {
            console.log("yes")
            clientd[client].sendText(to, text).then((result1) => {
              session.file = result1;
              // console.log('Result: ', result1); //return object success
              collect.findOneAndUpdate({ _id: new ObjectID(id) }, { $set: { credit: result[0].credit - 1 } }, { upsert: true })
              reports.insertOne({ clientid: id, time: new Date(), sendto: to.split("@")[0], status: result1.status, campaign })
                .then(result4 => {
                  console.log(result4);


                })
                .catch(error => console.error(error))
            })
              .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
              });


          } else {
            console.log("no"); const name = client
            await venom.create(name).then((client1) => {
              
              clientd[client] = client1;
              
              client1.sendText(to, text).then((result1) => {
                session.file = result1;
                // console.log('Result: ', result1); //return object success
                collect.findOneAndUpdate({ _id: new ObjectID(id) }, { $set: { credit: result[0].credit - 1 } }, { upsert: true })
                reports.insertOne({ clientid: id, time: new Date(), sendto: to.split("@")[0], status: result1.status, campaign })
                  .then(result4 => {
                    console.log(result4);
                  

                  })
                  .catch(error => console.error(error));
                  clientbot(client1);
              })
                .catch((erro) => {
                  console.error('Error when sending: ', erro); //return object error
                });
                
            })
          }



          console.log(session.file.status)
          if (session.file.status == "OK") {
            return (true);
          }
          else {
            return (false)
          }

        }
        else {
          return ("no-credit");// redirect to payment
        }
      })
      }
      


    }
  })
