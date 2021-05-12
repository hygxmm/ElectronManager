import Dexie from 'dexie';
const db = new Dexie('Manager');
db.version(5).stores({
  project: '++id,name,path',
  page: '++id,*aid,name,path,*type',
})
db.open();

export default db;