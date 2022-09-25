export enum LoggerLevel {
  TRACE=0,
  DEBUG=1,
  INFO=2,
  WARN=3,
  ERROR=4,
}

export type Logger = {
  setLevel: (level:LoggerLevel) => void

  trace: (...args: any[]) => void
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
}

export const defaultLogger:Logger = {
  setLevel(level:LoggerLevel) {
    this.level = level;
  },
  trace() {
    if(this.level >= LoggerLevel.TRACE) {
      console.trace()
    }
  },
  debug() {
    if(this.level >= LoggerLevel.DEBUG) {
      console.debug()
    }
  },
  info() {
    if(this.level >= LoggerLevel.INFO) {
      console.info()
    }
  },
  warn() {
    if(this.level >= LoggerLevel.WARN) {
      console.warn()
    }
  },
  error() {
    if(this.level >= LoggerLevel.ERROR) {
      console.error()
    }
  }
}
