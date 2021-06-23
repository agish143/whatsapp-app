const venom = require('venom-bot');

(()=>{
    const a=["agish","lisho"];
    a.forEach(d=>{
        venom
        .create(d)
        .then((client,a) => start(client,a))
        .catch((erro) => {
          console.log(erro);
        });
    })

})()
function start(client,d) {
    console.log(d)
    

}
client.onMessage((message) => {
    if (message.body === 'Hi' && message.isGroupMsg === false) {
      client
        .sendText(message.from, 'Welcome Venom 🕷')
        .then((result) => {
         // console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }
  });