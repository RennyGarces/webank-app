'use strict';
const account1 = {
  owner: 'renny garces',
  movements: [-200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-11-18T21:31:17.178Z',
    '2022-12-23T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2023-05-08T14:11:59.604Z',
    '2022-07-26T17:01:17.194Z',
    '2022-07-28T23:36:17.929Z',
    '2022-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Ulises Garces',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-06-01T13:15:33.035Z',
    '2023-06-30T09:48:16.867Z',
    '2023-06-25T06:04:23.907Z',
    '2023-05-25T14:18:46.235Z',
    '2023-06-05T16:33:06.386Z',
    '2023-06-10T14:43:26.374Z',
    '2023-06-25T18:49:59.371Z',
    '2022-12-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelUsername = document.querySelector('.username');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const labelLogTimer = document.querySelector('.logout-timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
const errorUser = () =>
  alert('This request can not be completed, please try again!');
////////////////////////////////////////////////////////////
///////create variables at the global scope//////////////////
let currentAccount;
let timer;
containerMovements.innerHTML = '';
//create username and insert into the accounts
const createUserName = accs =>
  accs.map(el => {
    el.username = el.owner
      .toLowerCase()
      .split(' ')
      .map(el => el[0])
      .join('');
  });
////////////////////show balance/////////////////////////////////////
const displayBalance = function (acc) {
  acc.balance = acc.movements.reduce((accu, element) => accu + element, 0);
  labelBalance.textContent = formatUser(acc.balance, acc.locale, acc.currency);
};

////////////////////////////////////////////////////////////////////

//////////passing accounts////////////////////////////////////
createUserName(accounts);
////////////////////name title/////////////////////////////////////////
const userTitle = acc => {
  let newName = acc.owner
    .split(' ')
    .map(el => (el = [el[0].toUpperCase(), el.slice(1)]));
  return newName.join(' ').replace(/,/g, '');
};
///////////////////format time///////////////////////////////
const formatTime = (local, date) => {
  const calcDaysPassed = (rightNow, dateUser) =>
    Math.round(Math.abs(dateUser - rightNow) / (1000 * 60 * 60 * 24));
  const dayPassed = calcDaysPassed(new Date(), date);

  if (dayPassed === 0) return 'today';
  if (dayPassed === 1) return 'Yesterday';
  if (dayPassed > 2) return ` ${dayPassed} days ago`;
  return new Intl.DateTimeFormat(local).format(date);
};
///////////////////////format currency///////////////////////////
const formatUser = function (movs, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(movs);
};
///////////////////////display all movements /////////////////////////////////

const displayMovement = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  let movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
  let userDates = sort
    ? acc.movementsDates.slice().reverse()
    : acc.movementsDates;
  movs.forEach(function (el, i) {
    const type = el > 0 ? 'deposit' : 'withdrawal';
    const userDate = new Date(userDates[i]);
    //important to update the account with the transfer date
    //once we tranfer to ohter account!
    const DisplayDate = formatTime(acc.locale, userDate);

    const formatMov = formatUser(el, acc.locale, acc.currency);
    let html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">
     ${type}</div>
          <div class="movements__date">${DisplayDate}</div>
          <div class="movements__value">${formatMov}</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
//////////////////button sort////////////////////////////////
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovement(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////Bar IN OUT INTEREST/////////////////////////
const displaySummary = function (acc) {
  const filter0 = acc.movements.filter(ele => ele > 0);
  const income = filter0.reduce((accu, el) => accu + el, 0);

  labelSumIn.textContent = formatUser(income, acc.locale, acc.currency);
  const filter1 = acc.movements.filter(ele => ele < 0);
  const outCome = filter1.reduce((accu, el) => accu + el, 0);

  labelSumOut.textContent = formatUser(
    Math.abs(outCome),
    acc.locale,
    acc.currency
  );
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatUser(interest, acc.locale, acc.currency);
};
///////////////////////////////////////////////////////

/////////////////////timer log out/////////////////////////////

const starLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60));
    const sec = String(time % 60).padStart(2, 0);
    //if the value is already two digits or more, padStart() will
    //not add any additional padding.
    labelTimer.textContent = `${min}:${sec}`;
    time--;
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelLogTimer.style.opacity = 0;
    }
  };
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};
/////////////////updating web page////////////////////////////////////
const upDateUi = function (acc) {
  displayMovement(acc);
  displayBalance(acc);
  displaySummary(acc);
};
////////////////////button login///////////////////////////////

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  //////return if the user input is iqual to username else undefined///////
  //////find only return one element of the array////////////////

  currentAccount = accounts.find(
    ele => ele.username === inputLoginUsername.value
  );
  ///////chaining operator check of pin exist and if iqual to the input value///////
  if (currentAccount?.pin === +inputLoginPin.value) {
    labelUsername.textContent = `Welcome ${userTitle(currentAccount)}`;
    containerApp.style.opacity = 100;
    labelLogTimer.style.opacity = 100;
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    if (timer) clearInterval(timer);
    timer = starLogOutTimer();
    // ID value of the timer created by the setInterval()
    //method inside the starLogOutTimer()
    //function will be stored in the timer variable.
    //You can then use this ID value to cancel the timer later
    //using the clearInterval()
    upDateUi(currentAccount);
  } else {
    alert("Sorry, we don't recognize this account.");
    inputLoginUsername.value = inputLoginPin.value = '';
  } //close if statement
});

/////////////////transfer money//////////////

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiveACC = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiveACC &&
    currentAccount?.username !== receiveACC.username &&
    currentAccount.balance >= amount
  ) {
    currentAccount.movements.push(-amount);
    receiveACC.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiveACC.movementsDates.push(new Date().toISOString());
    //adding date to the accounts to be able to use displayMovements function!!
    upDateUi(currentAccount);
    if (timer) clearInterval(timer);
    timer = starLogOutTimer();
  } else {
    errorUser();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amountLoan = Math.floor(inputLoanAmount.value);
  console.log(amountLoan);
  //Some method tests whether at least one element
  //in the array passes the given condition
  //It returns — true or false
  if (
    amountLoan > 0 &&
    currentAccount.movements.some(mov => mov >= amountLoan * 0.1)
  ) {
    setTimeout(function () {
      //setTimeout executes the function once,
      //while setInterval executes the function repeatedly
      currentAccount.movements.push(amountLoan);
      currentAccount.movementsDates.push(new Date().toISOString());
      upDateUi(currentAccount);
      if (timer) clearInterval(timer);
      timer = starLogOutTimer();
    }, 5000);
  } else {
    errorUser();
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const indexUsername = accounts.findIndex(
      user => user.username === currentAccount.username
    );
    console.log(accounts[indexUsername]);
    accounts.splice(indexUsername, 1);
    containerApp.style.opacity = 0;
  } else {
    errorUser();
  }
  inputCloseUsername.value = inputClosePin.value = '';
});
