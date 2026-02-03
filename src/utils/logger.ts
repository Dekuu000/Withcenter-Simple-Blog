type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
}

const config: LoggerConfig = {
    enabled: import.meta.env.DEV,
    level: 'debug',
};

class Logger {
    private log(level: LogLevel, message: string, ...args: unknown[]): void {
        if (!config.enabled) return;

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case 'info':
                console.log(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'error':
                console.error(prefix, message, ...args);
                break;
            case 'debug':
                console.log(prefix, message, ...args);
                break;
        }
    }

    info(message: string, ...args: unknown[]): void {
        this.log('info', message, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        this.log('warn', message, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        this.log('error', message, ...args);
    }

    debug(message: string, ...args: unknown[]): void {
        this.log('debug', message, ...args);
    }
}

export const logger = new Logger();
