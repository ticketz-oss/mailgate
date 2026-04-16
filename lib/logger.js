'use strict';

if (!process.env.EE_ENV_LOADED) {
    require('dotenv').config(); // eslint-disable-line global-require
    process.env.EE_ENV_LOADED = 'true';
}

const config = require('wild-config');
const pino = require('pino');
const { Writable } = require('stream');

config.log = config.log || {
    level: 'trace'
};

config.log.level = config.log.level || 'trace';

function getBoolean(value) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value > 0;
    }

    if (typeof value !== 'string') {
        return false;
    }

    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function toLogLevel(levelValue) {
    switch (Number(levelValue)) {
        case 10:
            return 'TRACE';
        case 20:
            return 'DEBUG';
        case 30:
            return 'INFO';
        case 40:
            return 'WARN';
        case 50:
            return 'ERROR';
        case 60:
            return 'FATAL';
        default:
            return String(levelValue || 'INFO').toUpperCase();
    }
}

function colorize(level, value, enabled) {
    if (!enabled) {
        return value;
    }

    const reset = '\x1b[0m';
    const palette = {
        TRACE: '\x1b[90m',
        DEBUG: '\x1b[36m',
        INFO: '\x1b[32m',
        WARN: '\x1b[33m',
        ERROR: '\x1b[31m',
        FATAL: '\x1b[35m'
    };

    const color = palette[level] || '\x1b[37m';
    return `${color}${value}${reset}`;
}

function shortTime(value) {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) {
        return new Date().toISOString();
    }

    return date.toISOString().slice(11, 23);
}

function escapeString(value) {
    return JSON.stringify(String(value));
}

function formatContext(entry) {
    const parts = [];
    for (let key of ['worker', 'component', 'sub', 'account', 'source', 'code', 'method', 'path', 'tid']) {
        if (entry[key] === undefined || entry[key] === null || entry[key] === '') {
            continue;
        }
        parts.push(`${key}=${String(entry[key])}`);
    }

    if (!parts.length) {
        return '';
    }

    return ` [${parts.join(' ')}]`;
}

function formatLogLine(entry, opts) {
    const level = toLogLevel(entry.level);
    const msg = entry.msg || entry.message || 'Log entry';
    const context = formatContext(entry);
    const line = `${shortTime(entry.time)} ${colorize(level, level, opts.useColors)}${context} ${msg}`;

    const knownKeys = new Set([
        'level',
        'time',
        'pid',
        'hostname',
        'msg',
        'message',
        'worker',
        'component',
        'sub',
        'account',
        'source',
        'code',
        'method',
        'path',
        'tid',
        'err'
    ]);

    let rest = {};
    for (let key of Object.keys(entry)) {
        if (!knownKeys.has(key)) {
            rest[key] = entry[key];
        }
    }

    let chunks = [line];

    if (entry.err) {
        if (typeof entry.err === 'string') {
            chunks.push(`  err=${escapeString(entry.err)}`);
        } else if (entry.err.stack) {
            chunks.push(`  ${String(entry.err.stack).replace(/\n/g, '\n  ')}`);
        } else {
            chunks.push(`  err=${JSON.stringify(entry.err)}`);
        }
    }

    if (Object.keys(rest).length) {
        chunks.push(`  data=${JSON.stringify(rest)}`);
    }

    return `${chunks.join('\n')}\n`;
}

function createPrettyStream(useColorsEnabled) {
    let rowBuffer = '';

    return new Writable({
        write(chunk, encoding, callback) {
            const lineChunk = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
            rowBuffer += lineChunk;

            const rows = rowBuffer.split(/\r?\n/);
            rowBuffer = rows.pop() || '';

            for (let rawRow of rows) {
                if (!rawRow.trim()) {
                    continue;
                }

                try {
                    const entry = JSON.parse(rawRow);
                    process.stdout.write(formatLogLine(entry, { useColors: useColorsEnabled }));
                } catch (err) {
                    // Fallback: if the row is not valid JSON, write as-is.
                    process.stdout.write(`${rawRow}\n`);
                }
            }

            callback();
        }
    });
}

function isInteractiveTerminal() {
    if (process.stdout.isTTY) {
        return true;
    }

    // VS Code tasks/debug terminals may not always expose stdout as TTY.
    if ((process.env.TERM_PROGRAM || '').toLowerCase() === 'vscode') {
        return true;
    }

    return false;
}

const terminalInteractive = isInteractiveTerminal();

const prettyConfig =
    process.env.EENGINE_LOG_PRETTY !== undefined
        ? getBoolean(process.env.EENGINE_LOG_PRETTY)
        : config.log.pretty !== undefined
          ? getBoolean(config.log.pretty)
          : terminalInteractive;

const colorsConfig =
    process.env.EENGINE_LOG_COLORS !== undefined
        ? getBoolean(process.env.EENGINE_LOG_COLORS)
        : config.log.colors !== undefined
          ? getBoolean(config.log.colors)
          : terminalInteractive;

const useColors = colorsConfig && process.env.NO_COLOR === undefined;

const usePretty = prettyConfig && !getBoolean(config.log.raw);

let logger = usePretty ? pino({}, createPrettyStream(useColors)) : pino();
logger.level = process.env.EENGINE_LOG_LEVEL || config.log.level;

const { threadId } = require('worker_threads');

if (threadId) {
    logger = logger.child({ tid: threadId });
}

process.on('uncaughtException', err => {
    logger.fatal({
        msg: 'uncaughtException',
        err
    });
    setTimeout(() => process.exit(1), 10);
});

process.on('unhandledRejection', err => {
    logger.fatal({
        msg: 'unhandledRejection',
        err
    });
    setTimeout(() => process.exit(2), 10);
});

module.exports = logger;
