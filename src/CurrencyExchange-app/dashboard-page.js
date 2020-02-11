import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-form/iron-form.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/app-route/app-location.js';

/**
* @customElement
* @polymer
*/
class Dashboard extends PolymerElement {
    static get template() {
        return html`
<style>
  :host {
    display: block; 
  }
  table, td, th {  
    border: 1px solid rgb(0, 0, 0);
    text-align: left;
    border-style: dashed;
  }
  
  table {
    border-collapse: collapse;
    margin-top:50px;
    width: 90%;
  }
  
  th, td {
    padding: 15px;
  }
  #form {
    border: 2px solid black;
    width: 500px;
    margin-left: 400px;
  }

  form {
    margin-left: 20px;
    margin-right: 20px;
  }
  h2{
    text-align: center;
  }
  #buttons{
    position:absolute;
    top:50px;
    left:1000px;
  }
  h2{
    text-align:center;
    color:white;
    position:absolute;
    top:22px;
    left:300px;

}
  paper-button {
    text-align: center;
    background-color:black;
    color:white;
  }
  h1{
      text-align:center;
      padding-bottom:20px;
      padding-top:20px;
  }
  a{
    text-decoration:none;
    color:white;
  }
</style>
<app-location route={{route}}></app-location>
<iron-ajax id="ajax" handle-as="json" on-response="_handleResponse" 
content-type="application/json" on-error="_handleError"></iron-ajax>
<h2>Welcome, {{userName}}</h2>
<div id="buttons">
<paper-button raised class="custom indigo" on-click="_handleTransfer">Transfer</paper-button>
<paper-button raised class="custom indigo" on-click="_handleLogout"><a name="login-page" href="[[rootPath]]login-page">Logout</a></paper-button>
</div>
<h1>Transaction History</h1>
<table>
  <tr>
    <th>To Account</th>
    <th>From Account</th>
    <th>Type</th>
    <th>Date</th>
    <th>Amount</th>
    <th>Balance</th>
    <th>Currency</th>
    <th>Status</th>
    </tr>
    <template is="dom-repeat" items={{data}}>
  <tr>
    <td>{{data.sourceAccountNumber}}</td>
    <td>{{data.destinationAccountNumber}}</td>
    <td>{{data.transactionType}}}}</td>
    <td>{{data.transactionDate}}}}</td>
    <td>{{data.transactionAmount}}}}</td>
    <td>{{data.availableBalance}}}}</td>
    <td>{{data.currency}}}}</td>
    <td>{{data.status}}}}</td>
  </tr>
  </template>
</table>


`;
    }
    static get properties() {
        return {
            prop1: {
                type: String,
                value: 'Forex Transfer'
            },
            userName: {
              type: String,
              value: sessionStorage.getItem('userName')
            }, action: {
              type: String, 
              value: 'List'
            },
            data: Array,
        };
    }
    //getting list of all the transasctions
    connectedCallback() {
      super.connectedCallback();
    let userId = sessionStorage.getItem('userId');
    this.userName = sessionStorage.getItem('userName');
      this._makeAjax(`http://10.117.189.177:9090/forexpay/users/${userId}/transactions`, 'get', null)
    }
     // calling main ajax call method 
  _makeAjax(url, method, postObj) {
    let ajax = this.$.ajax;
    ajax.method = method;
    ajax.url = url;
    ajax.body = postObj ? JSON.stringify(postObj) : undefined;
    ajax.generateRequest();
  }
  //routing to the fund transfer section
  _handleTransfer(){
    this.set('route.path', './fund-transfer')
  }
  //handling the responses from the API call
  _handleResponse(event) {
    switch (this.action) {
      case 'List':
        this.data = event.detail.response;
        console.log(this.data)
        break;
    }
  }
    //if session storage is clear then it will be redirected to login page
    ready(){
      super.ready();
      let name =sessionStorage.getItem('userName');
      if(name === null) {
        this.set('route.path', './login-page')
      }
    }

}

window.customElements.define('dashboard-page', Dashboard);