
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import fileUpload from 'express-fileupload';
import webpush from 'web-push';

const app = express();


// helmet for security
app.use(helmet());
app.use(fileUpload());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// cors
app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});



app.get('/', (req, res) => {
  res.send('footer');
});
const vapidKeys = {
  "publicKey":"BAno0BSz-siJxw60t6Fnu6li5-AOdWbxq_MYenLXnHjRV97YBIApkq2yzcsSfWSOpLtZ1wz7APxGAf-SKZgY8ww",
  "privateKey":"f9FGyfuc3SqrTOSNPAohMeJ3fKBksZ_SQt9W9HCnUnE"
};


let subscribes = [];
app.post('/subscribe', (req, res)=>{
  //get push subscription object from the request
  const subscription = req.body;
  console.log(req.body)
  //send status 201 for the request
  res.status(201).json({})
  
  //create paylod: specified the detals of the push notification
  const payload = JSON.stringify({title: 'Section.io Push Notification' });
  subscribes.push(subscription);
  /
})


app.post('/message',function(req,res){
  webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
  );

  let promiseChain = Promise.resolve();
  let subscriptions = subscribes;


  let iterable=[];
  for(let i=0; i< subscriptions.length;i++){
    const subscription = subscriptions[i];
    promiseChain=promiseChain.then(() => {
      return triggerNotification(subscription, req.body)
    });
    iterable.push(promiseChain);
  }

  Promise.all(iterable).then((e) =>{
    console.log("itere",e)
    triggerNotification(subscriptions[0], req.body)
    return res.send({message: 'Notification sent successfully to all subscribers.'});

  })
  .catch(function(err) {
    console.log(err)
    res.status(500).send({message:'We were unable to send messages to all subscriptions'})
  });
  function triggerNotification(subscription,data){
    console.log("return", subscription)
    return webpush.sendNotification(subscription, JSON.stringify(data))
    .catch(err => {
    console.error("Error sending notification, reason: ", err);
      // res.status(500).send({message:'Error sending notification'});
    });
  }

});



export default app;
