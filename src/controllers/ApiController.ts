import { WebSocketController } from "./WebSocketController"
import { useLocalStorage } from "@/composables"

import { shallowRef } from "vue"

const { setLocalStorage, getLocalStorage } = useLocalStorage()

interface Ilogin {
  Token: string
  Username: string
}

interface ISubscribe {
  Action: number,
  Items: LogItem[]
}

type LogItemLevel = "FATAL" | "ERROR" | "DEBUG" | 'INFO' | 'TRACE'
export interface LogItem {
  Timestamp: string,
  Level: LogItemLevel,
  Message: string,
  Source: string
}

interface ICall {
  uri: string,
  typeMessage: number,
  callID?: string | null
}

enum MessageEvents {
  Call = 2,
  CallResult = 3,
  CallError = 4,
  Subscribe = 5,
  Unsubscribe = 6,
  Event = 8,
  HeartBeat = 20
}

const URL = 'http://enter.local'

export class ApiController extends WebSocketController {

  public logs = shallowRef<LogItem[]>([])
  private pendingCalls = new Map()

  constructor(url: string) {
    super(url)

    this.socket.onopen = () => {
      this.authorization('enter', 'A505a').then(() => {
        this.setupPing()
        this.onSubscribe()
      })
      
    }

    this.socket.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      this.onMessage(message)
    }
  }

  async authorization (username: string, password: string): Promise<Ilogin> {
    const token = getLocalStorage('Token')
    if (token) {
      return this.loginByToken(token)
    } else {
      return this.login(username, password)
    }
  }

  login(username: string, password: string): Promise<Ilogin> {
    return new Promise((resolve, reject) => {
      this.call({uri: '/login', typeMessage: MessageEvents.Call}, username, password)
        .then((result: Ilogin) => {
          setLocalStorage('Token', result.Token)
          resolve(result)
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  }

  loginByToken(token: string): Promise<Ilogin> {
    return new Promise((resolve, reject) => {
      this.call({uri: '/loginByToken', typeMessage: MessageEvents.Call}, token)
        .then((result: Ilogin) => {
          setLocalStorage('Token', result.Token)
          resolve(result)
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  }

  logout (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.call({uri: URL + '/logout', typeMessage: MessageEvents.Call})
        .then(() => {
          resolve()
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  }

  randomCallID(count: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    while (result.length < count) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
  }

  call({uri, typeMessage, callID}: ICall, ...args: any[]): Promise<any> {

    const message = [typeMessage, `${URL}${uri}`, ...args];

    if (callID === undefined) {
      callID = this.randomCallID(16);
      message.splice(1, 0, callID)
    }

    this.send(message);
    return new Promise((resolve, reject) => {
      this.pendingCalls.set(callID, { resolve, reject });
    });
  }

  callResult(message: any[]) {
    const callback = this.pendingCalls.get(message[1]);
    if (callback) {
      callback.resolve(message[2]);
      this.pendingCalls.delete(message[1]);
    }
  }

  callError(message: any[]) {
    const errorCallback = this.pendingCalls.get(message[1]);
    if (errorCallback) {
      errorCallback.reject(new Error(message[3]), message[4]);
      this.pendingCalls.delete(message[1]);
    }
  }

  updateItems (message: ISubscribe) {
    switch (message.Action) {
      case 0:
        this.logs.value.push(...message.Items)
        break;
      case 3:
        this.logs.value = message.Items
        break;
      default:
        break;
    }
  }

  private onMessage(message: any[]) {
    switch (message[0]) {
      case 0:
        console.log('ID:', message[1]);
        break;
      case 3:
        this.callResult(message)
        break;
      case 4:
        this.callError(message)
        break;
      case 8:
        if (message[2].SubscribeError) {
          return
        }
        this.updateItems(message[2])
        break;
      case 20:
        console.log('Ping')
        break;
      default:
        console.error('Не найденный тип', message[0]);
    };
  }

  onSubscribe(): void {
    this.call({uri: '/subscription/logs/list', typeMessage: MessageEvents.Subscribe, callID: null})
  }

  onUnSubscribe () {
    this.call({uri: '/subscription/logs/list', typeMessage: MessageEvents.Unsubscribe, callID: null})
  }
}
