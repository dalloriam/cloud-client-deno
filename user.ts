import { ezconf } from './dep.ts';

export class RawCredentials {
    type: 'raw' = 'raw';

    email: string;
    password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }

    header(): string {
        return `UPW ${this.email} ${this.password}`;
    }
}

export class TokenCredentials {
    type: 'token' = 'token';
    token: string;

    constructor(token: string) {
        this.token = token;
    }

    header(): string {
        return `Bearer ${this.token}`;
    }
}

export type Credentials = TokenCredentials | RawCredentials;

export function parseAuthHeader(header: string): Credentials {
    if (header.startsWith('Bearer ')) {
        return new TokenCredentials(header.replace('Bearer ', ''));
    } else if (header.startsWith('UPW ')) {
        const stripped = header.replace('UPW ', '');
        const split = stripped.split(' ');
        if (split.length != 2) {
            throw Error('invalid UPW token');
        }
        return new RawCredentials(split[0], split[1]);
    }
    throw Error('unknown token format');
}

export async function getSystemCredentials(): Promise<Credentials> {
    const credsRaw = await ezconf.loadConfig<{ email: string; password: string }>(
        'dalloriam',
        'cloud',
    );

    return new RawCredentials(credsRaw.email, credsRaw.password);
}

export interface User {
    id: string;
    permissions: string[];
    services: Map<string, any>;
}

export class AuthService {
    private readonly host: string;

    constructor(host: string) {
        this.host = host;
    }

    async get(credentials: Credentials): Promise<User> {
        const resp = await fetch(`${this.host}/info`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': credentials.header() },
        });

        if (!(resp.status >= 200 && resp.status < 300)) {
            throw Error(`unexpected status: ${resp.status}`);
        }

        return resp.json();
    }
}
