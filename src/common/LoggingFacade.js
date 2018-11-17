function LoggingFacade() {

  const DEBUG = 'DEBUG';
  const INFO = 'INFO';
  const WARN = 'WARN';
  const ERROR = 'ERROR';
  const OFF = 'OFF';

  const LOG_LEVELS = [
    DEBUG,
    INFO,
    WARN,
    ERROR,
    OFF
  ];

  const LOG_VALUES = {
    DEBUG: 4,
    INFO: 3,
    WARN: 2,
    ERROR: 1,
    OFF: 0
  };

  this.setLogLevel = (level) => {
    if (level && LOG_LEVELS.includes(level.toUpperCase())) {
      this.logLevel = level.toUpperCase();
    } else {
      this.logLevel = INFO;
    }
    this.logValue = LOG_VALUES[this.logLevel];
  };

  this.setLogLevel(INFO);

  this.debug = (message, ...args) => {
    if (this.logValue >= LOG_VALUES[DEBUG]) {
      console.debug(message, ...args);
    }
  };

  this.info = (message, ...args) => {
    if (this.logValue >= LOG_VALUES[INFO]) {
      console.info(message, ...args);
    }
  };

  this.log = (message, ...args) => {
    if (this.logValue >= LOG_VALUES[INFO]) {
      console.log(message, ...args);
    }
  };

  this.warn = (message, ...args) => {
    if (this.logValue >= LOG_VALUES[WARN]) {
      console.warn(message, ...args);
    }
  };

  this.error = (message, ...args) => {
    if (this.logValue >= LOG_VALUES[ERROR]) {
      console.error(message, ...args);
    }
  };

}

const instance = new LoggingFacade();

// instance.setLogLevel('WARN');

instance.setLogLevel('DEBUG');

export {
  instance as log
};
