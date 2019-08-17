import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
//import PouchDB from 'pouchdb';

//import * as api from './api';

//const asciiToHex = (str: string) => {
//var arr1 = [];
//for (var n = 0, l = str.length; n < l; n++) {
//var hex = Number(str.charCodeAt(n)).toString(16);
//arr1.push(hex);
//}
//return arr1.join('');
//};

//if (!localStorage.getItem('couchToken'))
//api
//.signIn({ session: { email: 'gabriel@test.com', password: 'random' } })
//.catch(() =>
//api.signUp({ user: { email: 'gabriel@test.com', password: 'random' } })
//)
//.then(({ data }) => {
//localStorage.setItem('couchToken', data.couch_token);
//});

//async function runPouch() {
//try {
//const dbName = `https://couch.gabrielpoca.com/userdb-${asciiToHex(
//'gabriel@test'
//)}`;

//const localDB = new PouchDB('workouts');
//const db = new PouchDB(dbName, {
//fetch: function(url, opts) {
//// @ts-ignore
//opts.headers!['X-Auth-CouchDB-UserName'] = 'gabriel@test.com';
//// @ts-ignore
//opts.headers!['X-Auth-CouchDB-Token'] = localStorage.getItem(
//'couchToken'
//);
//return PouchDB.fetch(url, opts);
//},
//});

//try {
//await localDB.put({
//_id: '_design/workouts',
//views: {
//workouts: {
//// @ts-ignore
//map: function(doc) {
//// @ts-ignore
//if (doc.type == 'workout') emit(doc);
//}.toString(),
//},
//},
//});
////await db.put({
////_id: '_design/workouts',
////views: {
////workouts: {
////// @ts-ignore
////map: function(doc) {
////// @ts-ignore
////if (doc.type == 'workout') emit(doc);
////}.toString(),
////},
////},
////});
//} catch (e) {}

//await db.replicate.to(localDB, {
//filter: '_view',
//view: 'workouts/workouts',
//});

//await db.replicate.from(localDB, {});

//console.log(await db.query('workouts'));
//console.log(await localDB.query('workouts'));

//await localDB.put({ _id: 'asdfaskdjfaasdfjsl', type: 'workoutsfasd' });
//} catch (e) {
//console.error(e);
//}
//}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
