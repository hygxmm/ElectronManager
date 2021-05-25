import Dexie from 'dexie';
const db = new Dexie('Manager');
db.version(6).stores({
  project: '++id,name,path',
  page: '++id,*aid,name,path,*type',
  package: '++id,*aid,namevent,path,*type',
})
db.open();

export default db;