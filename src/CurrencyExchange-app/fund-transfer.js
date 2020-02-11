import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/app-route/app-location.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';

/**
* @customElement
* @polymer
*/
class FundTransfer extends PolymerElement {
  static get template() {
    return html`
<style>
  :host {
    display: block;
    
  }
#buttons{
  position:absolute;
  top:50px;
  left:1000px;
}
  #form {
    border: 1px solid black;
    width: 500px;
    border-radius:20px;
    padding:18px;
    margin-top: 30px;
    margin-left: 400px;
    background-color:white;
  }
  h2{
    text-align: center;
  }
  paper-button {
    text-align: center;
    background-color:black;
    color:white;
  }
  h1{
      text-align:center;
      color:white;
      position:absolute;
      top:19px;
      left:300px;
  
  }
  paper-toast {
    --paper-toast-background-color: black;
    --paper-toast-color: white;
  }
a{
  text-decoration:none;
  color:white;
}
</style>
<app-location route={{route}}></app-location>
<h1>Welcome, {{userName}}</h1>
<div id="buttons">
<paper-button raised class="custom indigo" on-click="_handleDashboard">Dashboard</paper-button>
<paper-button raised class="custom indigo" on-click="_handleLogout"><a name="login-page" href="[[rootPath]]login-page">Logout</a></paper-button>
</div>
<iron-form id="form">
  <form>
  <paper-input label="To Account" type="text" id="toAccount" name="toAccount" maxlength="12" required error-message="Please Enter To account Number"></paper-input>
  <h3>Default Currency : INR </h3>
  <paper-dropdown-menu label="To Currency" required id="currency" on-blur="_handleChange">
  <paper-listbox slot="dropdown-content" selected="0">
  <template is="dom-repeat" items={{currencies}}>
    <paper-item>{{item.code}}</paper-item>
</template>
  </paper-listbox>
</paper-dropdown-menu>
<paper-input label="Amount in INR" type="number"  on-blur="_handleChange" id="amount" name="amount" required error-message="Please Enter Amount"></paper-input>
<h2>Amount in Converted Currency : <br>{{convertedAmount.convertedAmount}} {{currency}}</h2><br>
<h2>Service Tax: {{convertedAmount.serviceTax}} INR</h2><br>
<h2>Total Amount deducted from your Account: {{convertedAmount.totalAmount}} INR</h2><br>
<paper-button raised class="custom indigo" on-click="_handleTransfer">Transfer</paper-button>
</form>
</iron-form>
<iron-ajax id="ajax" handle-as="json" on-response="_handleResponse" 
content-type="application/json" on-error="_handleError"></iron-ajax>
<paper-toast text="Amount Transferred"  class="fit-bottom" id="succesfull"></paper-toast>
<paper-toast text="Enter Details"  class="fit-bottom" id="error"></paper-toast>
<paper-toast text="Transaction Failed"  class="fit-bottom" id="fail"></paper-toast>

`;
  }
  static get properties() {
    return {
      currencies: Array,
      action: {
        type: String,
        value: 'List'
      },
      userName: {
        type: String,
        value: sessionStorage.getItem('userName')
      },
      convertedAmount: {
        type: Object
      }
      ,
      currency: {
        type: String
      },
      data: {
        type: Array
      }
    };
  }
  // getting the values of the currencies list from the API
  connectedCallback() {
    super.connectedCallback();
    this.userName = sessionStorage.getItem('userName');
    this._makeAjax(`http://10.117.189.177:9090/forexpay/currencies`, 'get', null)
  }
  //transfering the amount with all the validation and showing all the details fetched from API
  _handleTransfer() {
    if(parseInt(this.shadowRoot.querySelector('#toAccount').value)==''||parseInt(this.shadowRoot.querySelector('#amount').value)==''|| this.shadowRoot.querySelector('#currency').value==''){
      this.$.error.open();
      return false;
    }else{
    if (this.$.form.validate()) {
      let userId = sessionStorage.getItem('userId')
      let destinationAccountNumber = parseInt(this.shadowRoot.querySelector('#toAccount').value);
      let obj = {
        userId: parseInt(userId),
        destinationAccountNumber: destinationAccountNumber,
        transactionAmount: parseInt(this.shadowRoot.querySelector('#amount').value),
      }
      this._makeAjax(`http://10.117.189.177:9090/forexpay/accounts/transactions`, 'post', obj);
      this.action = 'post'
      this.set('route.path', './dashboard-page')
    }else{
      this.$.error.open();
    }
  }
  }
  //if session storage is clear then it will be redirected to login page
  ready() {
    super.ready();
    let name = sessionStorage.getItem('userName');
    console.log(name)
    if (name === null) {
      this.set('route.path', './login-page')
    }
  }
  // to move to dashboard page
  _handleDashboard() {
    
    this.set('route.path', './dashboard-page')

  }
  // getting response from server and storing user name and id in session storage
  _handleResponse(event) {
    switch (this.action) {
      case 'List':
        this.currencies = event.detail.response;
        break;
      case 'Converted':
        this.convertedAmount = event.detail.response;
        break;
      case 'post':
        this.data = event.detail.response;
        this.$.succesfull.open();
        break;
    }

  }
  // If transaction api throws an error
  _handleError() {
    this.$.fail.open();
  }
  //updating fields when values are change in amount or currency field
  _handleChange() {
    let amount = parseInt(this.shadowRoot.querySelector('#amount').value);
    this.currency = this.shadowRoot.querySelector('#currency').value;
    console.log(amount, this.currency)
    this._makeAjax(`http://10.117.189.177:9090/forexpay/currencies/exchange?from=INR&to=${this.currency}&amount=${amount}`, 'get', null)
    this.action = 'Converted';
  }

  // calling main ajax call method 
  _makeAjax(url, method, postObj) {
    let ajax = this.$.ajax;
    ajax.method = method;
    ajax.url = url;
    ajax.body = postObj ? JSON.stringify(postObj) : undefined;
    ajax.generateRequest();
  }
 // handling the Logout
  _handleLogout() {
    sessionStorage.clear();
  }

}

window.customElements.define('fund-transfer', FundTransfer);