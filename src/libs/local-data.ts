import localforage from 'localforage';
import {Subject,concat,from, Observable} from 'rxjs';
import { take, map, tap } from 'rxjs/operators';

const fetchLocalData = (() => {
  const stores = {} as { [key: string]: LocalForage };
  const streams = {} as { [key: string]: Observable<any> };

  return <T>(storeName: string) => {
    stores[storeName] = stores[storeName] || localforage.createInstance({ name: storeName });
    const dataSubject = new Subject<{ [key: string]: T }>();
    const getStoreData = async () => {
      const dict = {} as { [key: string]: T }
      await stores[storeName].iterate((value, key) => {
        dict[key] = value as T;
      })
      return dict;
    };
    streams[storeName] = streams[storeName] || concat(from(getStoreData()), dataSubject);
    const data$ = streams[storeName] as Observable<{[key:string]:T}>
    const getData = async ()=> await data$.pipe(take(1)).toPromise() as { [key: string]:T}; 
    const getItem = async (key:string) => (await getData())[key];
    const getItem$ = (key:string) => data$.pipe(map(data=>data[key]));
    const setItem = async (key: string, value: T) => {
      const data = await getData();
      data[key] = value;
      await stores[storeName].setItem(key, value);
      dataSubject.next(data)
      return data;
    }
    return {data$,getItem$,setItem,getItem,getData}
  }
})();

const fetchLocalDataItem = <T>(storeName: string) => {
    const {getItem$,setItem} = fetchLocalData<T>(storeName);
    const itemStreams = {} as {[key:string]:Observable<T>}
    return (key:string,defaultValue:T)=>{
      let prev = defaultValue;
      itemStreams[key] = itemStreams[key] || getItem$(key).pipe(
        tap(v=>{prev=v}),
        map(v=>v===undefined ? defaultValue : v),
        );
      const update = (v:T|((prev:T)=>T)) => {
        if(typeof v ==='function') setItem(key,(v as (prev:T)=>T)(prev));
        setItem(key,v as T);
      }
      return {
        data$:itemStreams[key],
        set:update,
        update,
        subscribe:()=>itemStreams[key].subscribe(),
        getCurrent: async ()=> await itemStreams[key].pipe(take(1)).toPromise(),
      }
    }
  }

const localData = <T>(key:string,defaultValue:T) => fetchLocalDataItem<T>('DefaultLocalStore')(key,defaultValue);

export {localData,fetchLocalData,fetchLocalDataItem}