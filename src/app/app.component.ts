import { Component } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';
import { ServiceWorkerModule, SwRegistrationOptions } from '@angular/service-worker';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  title = 'Jehovah Nissi';
  private readonly publicKey = 'BIMWgO5hQ8iXGq4hhzneneB-PxTnWSHKu5aCg5VsEFLZMNbuswbfXBhGVCPcD5PHyIK4tCIsJGDq873IkGZJIME';


  // {"publicKey":"BAlFDfyxJlQqd6fbW6lNeKAXA3CIBtykh4QeT8PgNmxZGJMYYB6iZzddv76KKVnKZbE3jdcWIKqYlkM2lyvhVvc","privateKey":"8F4cbaU-J4xjG-TICJef0hGPiCSnc-yVZHJ4Mn2KWqc"}

  constructor(private swUpdate: SwUpdate, private swPush: SwPush, private newsletterService:NotificationService) {
  }

  ngOnInit(): void {
    this.subscribeNotification();
  }

  getSubscription() {

   

    console.log(Notification.permission);
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log(permission);
        // this.requestSubscription();
        this.subscribeUser()
      }).catch(() => {
        // show permission denied error
      });
    }
    else if (Notification.permission === 'denied') {
      // show permission is denied, please allow it error
    } else {
      // this.requestSubscription();
      this.subscribeUser();
    }
  }

  async requestSubscription() {

    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/ngsw-worker.js').then(function (registration) {
    //     console.log('service worker registration succeeded:', registration);
    //   },
    //     function (error) {
    //       console.log('service worker registration failed:', error);
    //     });
    // }
    // else {
    //   console.log('service workers are not supported.');
    // }
    try {

      if ('serviceWorker' in navigator ) {

        this.swPush.requestSubscription({
          serverPublicKey: this.publicKey
        })
        .then(sub => this.newsletterService.subscribe(sub).subscribe())
        .catch(err => console.error("Could not subscribe to notifications", err));
        // navigator.serviceWorker.register('/ngsw-worker.js').then((sub) => {
        //   console.log("one",sub)
        //   if (sub) {

           
        //     this.swPush.requestSubscription({ serverPublicKey: this.publicKey })
        //     .then(sub => this.newsletterService.subscribe(sub).subscribe())
        //     .catch(err => console.error("Could not subscribe to notifications", err));
        //   }
        // });
      }
      console.log("subscription object ");
      // await this.swPush.requestSubscription({ serverPublicKey: this.publicKey }).then(sub => {
      //   console.log('subscribed', sub)
      //   console.log('subscribed')
      // });
      // this.swPush.requestSubscription({
      //   serverPublicKey: this.publicKey,
      // }).then(sub => {
      //   console.log('subscribed')
      // }).catch(err => console.log)
      if (('PushManager' in window)) {
        // Push isn't supported on this browser, disable or hide UI.
        console.log('push working')
        console.log(this.swPush.requestSubscription({ serverPublicKey: this.publicKey }));
        return;
      }
    } catch (e) {
      // this._floatNotifications.makeToast.next({header: "Task failed", text: "failed to get subscription object"+e, DurationsEnum: DurationsEnum.MEDIUM, type: "danger"});
    }
  }


  subscribeUser(){
    navigator.serviceWorker.ready
    .then(registration => {
        registration.pushManager.getSubscription()
        .then(pushSubscription => {
            if(!pushSubscription){
                //the user was never subscribed
                this.subscribe(registration);
            }
            else{
                //check if user was subscribed with a different key
                let json = pushSubscription.toJSON();
                let public_key = json.keys?.p256dh;
                
                console.log(public_key);
                
                if(public_key != this.publicKey){
                    pushSubscription.unsubscribe().then(successful => {
                        // You've successfully unsubscribed
                        this.subscribe(registration);
                    }).catch(e => {
                        // Unsubscription failed
                    })
                }
            }
        });
    })
  }


  subscribe(registration:any){
    registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicKey)
    })
    .then((pushSubscription: any) => {
      console.log(pushSubscription);
      console.log("successfully subscribed to push")
        //successfully subscribed to push
        //save it to your DB etc....

        registration.showNotification('Vibration Sample', {
          body: 'Buzz! Buzz!',
       
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: 'vibration-sample'
        });
    });
  }

  urlBase64ToUint8Array(base64String:any) {
      var padding = '='.repeat((4 - base64String.length % 4) % 4);
      var base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');

      var rawData = window.atob(base64);
      var outputArray = new Uint8Array(rawData.length);

      for (var i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
  }


  vapidKeys:string=`BAno0BSz-siJxw60t6Fnu6li5-AOdWbxq_MYenLXnHjRV97YBIApkq2yzcsSfWSOpLtZ1wz7APxGAf-SKZgY8ww`;
  payload=JSON.stringify({
    "notification": {
    "title": "Web Mail Notification",
    "body": "New Mail Received!",
    "icon": "images/bell.jpg",
    "vibrate": [100, 50, 100], //will cause the device to vibrate for 100 ms, be still for 50 ms, and then vibrate for 100 ms
    "requireInteraction":true,
    "data": {"dateOfArrival": Date.now(),},
    "actions": [{"action": "inbox","title": "Go to Web Mail",}]
  }});

  subscribeNotification(bybutton=false){
  //  if(this.swPush.isEnabled){
    if(bybutton){
      this.swPush.unsubscribe();

    }
    this.swPush.subscription.subscribe((pushSubscription) =>{
      console.log(pushSubscription)
    });
      this.swPush.notificationClicks.subscribe(x=>console.log("one",x)); 
      this.swPush.requestSubscription({
        serverPublicKey: this.vapidKeys
      }).then(sub =>{this.newsletterService.subscribe(sub).subscribe(x=>console.log("t2",x),err=>console.log(err))})
      .catch(err => console.error("Could not subscribe to notifications", err));
  //  }
  }

  triggerMessage(){
    this.newsletterService.triggerMessage(this.payload).subscribe(x=>console.log(x),err=>console.log(err));
  }
}
