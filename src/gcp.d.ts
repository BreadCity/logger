declare module 'get-cursor-position' {
  export const sync: ()=>{
    row:number,
    col:number,
  }
  export const async: (...param: Parameters<typeof sync>)=>Promise<ReturnType<typeof sync>>
}