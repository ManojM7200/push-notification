import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule, SwRegistrationOptions } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })

  ],
  providers: [ {
    provide: SwRegistrationOptions,
    useFactory: () => ({ enabled: environment.production }),
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
