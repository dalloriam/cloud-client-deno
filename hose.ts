import { Credentials } from './user.ts';

export interface DatahoseMessage {
    key: string;
    body: { [key: string]: string | number | boolean };
    time: number;
}

export class Hose {
    private host: string;
    private credentials: Credentials;

    constructor(host: string, creds: Credentials) {
        this.host = host;
        this.credentials = creds;
    }

    async dispatch(msg: DatahoseMessage) {
        const postRequest = await fetch(`${this.host}/dispatch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.credentials.header(),
            },
            body: JSON.stringify(msg),
        });

        const resp = await postRequest.json();
        if (resp.message != 'OK') {
            throw Error(`unexpected reply: ${resp}`);
        }
    }

    async batch(msgs: DatahoseMessage[]) {
        const postRequest = await fetch(`${this.host}/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.credentials.header(),
            },
            body: JSON.stringify({ messages: msgs }),
        });

        const resp = await postRequest.json();
        if (resp.message != 'OK') {
            throw Error(`unexpected reply: `, resp);
        }
    }
}
