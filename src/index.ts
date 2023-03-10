import chalk from 'chalk'
import { sync as getCursorPos } from 'get-cursor-position'
type RGB = {
  r: number,
  g: number,
  b: number,
}
const pendingOperationSymbols = [
  // '●',
  // '◕',
  // '◑',
  // '◔',
  // '○',
  // '◒'
  '◜',
  '◟',
  '◡',
  '◞',
  '◝',
  '◠'
]
export default class Logger {
  static format(status: string, colour: RGB, loggerName: string | undefined, prestatus: string | undefined, post: boolean, bold: boolean = true) {
    return (loggerName?(chalk.grey(`${loggerName} › `)):'') + (bold?chalk.bold:chalk).rgb(colour.r,colour.g,colour.b)(status) + (prestatus ? (chalk.bold(' ' + prestatus) + ((this.postGuillemet && post) ? chalk.grey(' ›') : '')) : '')
  }
  loggerName: string | undefined;
  static postGuillemet = false;
  success(msg: string, postmsg?:string) {
    console.log(Logger.format('✔', {
      r: 122,
      g: 255,
      b: 122,
    },this.loggerName,msg, !!postmsg,false),postmsg??'');
  }
  question(msg: string,postmsg?:string) {
    console.log(Logger.format('?', {
      r: 122,
      g: 122,
      b: 255,
    },this.loggerName,msg, !!postmsg),postmsg??'');
  }
  info(msg: string,postmsg?:string) {
    console.log(Logger.format('i', {
      r: 122,
      g: 122,
      b: 255,
    },this.loggerName,msg, !!postmsg),postmsg??'');
  }
  warn(msg: string,postmsg?:string) {
    console.log(Logger.format('⚠', {
      r: 255,
      g: 255,
      b: 122,
    },this.loggerName,msg, !!postmsg),postmsg??'');
  }
  error(msg: string,postmsg?:string) {
    console.log(Logger.format('✖', {
      r: 255,
      g: 122,
      b: 122,
    },this.loggerName,msg, !!postmsg),postmsg??'');
  }
  log(msg: string,postmsg?:string) {
    console.log(Logger.format('🗎', {
      r: 180,
      g: 180,
      b: 180,
    },this.loggerName,msg, !!postmsg),postmsg??'');
  }
  status(msg: string, postmsg?: string) {
    let cursorPos = getCursorPos()
    let i=0;
    let char:string;
    let rgb: RGB = {
      r: 122,
      g: 122,
      b: 255,
    }
    const writeMessage = ()=>console.log(Logger.format(char ?? pendingOperationSymbols[i], rgb,this.loggerName,msg, !!postmsg),postmsg??'');
    writeMessage()
    const rerenderMessage = ()=>{
      i=i+1;
      if (i >= pendingOperationSymbols.length) i=0
      const cursorPos2 = getCursorPos()
      process.stdout.cursorTo(cursorPos.col-1,cursorPos.row-2)
      process.stdout.clearLine(1)
      writeMessage()
      process.stdout.cursorTo(cursorPos2.col-1,cursorPos2.row-1)
    }
    rerenderMessage()
    let interval = setInterval(rerenderMessage,50).unref()
    const updateStatus = (newMsg?:string, newPostMsg?:string)=>{
      msg=newMsg ?? msg;
      postmsg=postmsg??newPostMsg
      rerenderMessage();
    }
    return {
      updateStatus,
      done: (success: boolean = true, newMsg?:string, newPostMsg?:string)=>{
        rgb = {
          r: success ? 122 : 255,
          g: success ? 255 : 122,
          b: 122
        }
        char=success?'✔':'✖'
        updateStatus(newMsg,newPostMsg)
        clearInterval(interval)
      },
      done_removeLog: ()=>{
        process.stdout.cursorTo(cursorPos.col-1,cursorPos.row-2)
        process.stdout.clearLine(1)
        clearInterval(interval)
      },
      pause: ()=>{
        process.stdout.cursorTo(cursorPos.col-1,cursorPos.row-2)
        process.stdout.clearLine(1)
        clearInterval(interval)
      },
      /** Pause for when pausing an operation, can be resumed with resume() - Not designed to work with more logs; for that, use regular pause() */
      _pause: ()=>{
        let oldChar = char;
        char='⏸︎'
        updateStatus()
        clearInterval(interval)
        char=oldChar;
      },
      resume: ()=>{
        process.stdout.moveCursor(0,1)
        interval = setInterval(rerenderMessage,50).unref()
        cursorPos = getCursorPos()
        updateStatus();
      }
    }
  }
  constructor(name?: string | undefined) {
    this.loggerName=name
  }
}