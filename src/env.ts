/* eslint-disable */
import * as process from 'process';
import { z } from 'zod';

// Campaign API endpoints
export const NEXT_PUBLIC_CAMPAIGN_ENDPOINT = process.env.NEXT_PUBLIC_CAMPAIGN_ENDPOINT;
export const NEXT_PUBLIC_STATUS_ENDPOINT = process.env.NEXT_PUBLIC_STATUS_ENDPOINT;
export const NEXT_PUBLIC_UPLOAD_ENDPOINT = process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT;
export const NEXT_PUBLIC_TOKEN_ENDPOINT = process.env.NEXT_PUBLIC_TOKEN_ENDPOINT;

// Logging configuration
export const LOG_LEVEL_SCHEMA = z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info');

export const LOG_LEVEL = LOG_LEVEL_SCHEMA.parse(
    process.env.LOG_LEVEL ?? 'info'
);

// Environment flags
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

// Config getter function
export const getConfigs = () => {
    return {
        api: {
            campaign: NEXT_PUBLIC_CAMPAIGN_ENDPOINT || 'https://prepump-stg-api.fundplus.org/v1/campaign',
            status: NEXT_PUBLIC_STATUS_ENDPOINT || 'https://prepump-stg-api.fundplus.org/v1/campaign/status',
            upload: NEXT_PUBLIC_UPLOAD_ENDPOINT || 'https://prepump-stg-api.fundplus.org/v1/campaign/upload',
            token: NEXT_PUBLIC_TOKEN_ENDPOINT || 'https://prepump-stg-api.fundplus.org/v1/campaign/token-status'
        },
        environment: {
            isDev,
            isProd
        }
    };
};

// Export default config
export const configs = getConfigs();