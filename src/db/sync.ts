import PouchDB from 'pouchdb';
import { RxDatabase } from 'rxdb';

import { WorkoutDatabaseCollections } from '../types';

const asciiToHex = (str: string) => {
  var arr1 = [];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join('');
};

export async function setupSync(db: RxDatabase<WorkoutDatabaseCollections>) {
  try {
    const dbName = `https://couch.gabrielpoca.com/userdb-${asciiToHex(
      'gabasdfasd@test.com'
    )}`;
    const remoteDB = new PouchDB(dbName, {
      fetch: function(url, opts) {
        // @ts-ignore
        opts.headers!['X-Auth-CouchDB-UserName'] = 'gabriel@test.com';
        // @ts-ignore
        opts.headers!['X-Auth-CouchDB-Token'] = localStorage.getItem(
          'couchToken'
        );
        return PouchDB.fetch(url, opts);
      },
    });

    try {
      await remoteDB.put({
        _id: '_design/gym',
        filters: {
          workouts: `function(doc) {
              return (doc._id === '_design/gym' || doc.modelType === 'workout');
            }`,
        },
      });
    } catch (e) {}
    db.workouts.sync({
      remote: remoteDB,
      // @ts-ignore
      options: {
        live: true,
        retry: true,
        filter: 'gym/workouts',
      },
    });
  } catch (e) {
    console.error(e);
  }
}
