const promisify = (value: any) => (value instanceof Promise ? value : Promise.resolve(value));

export type TState = Promise<boolean | ExpectationResult> | boolean | ExpectationResult;

export default class ExpectationResult {
    state: TState;
    recieved: any;
    expected: any;
    expectAction: string;
    isInversed: boolean = false;
    description: string | null = null;

    constructor(state: TState, received: any, expectAction: string, expected?: any) {
        this.state = promisify(state);
        this.recieved = received;
        this.expected = expected;
        this.expectAction = expectAction;
    }

    async solve(): Promise<boolean> {
        if (this.state instanceof Promise) {
            return this.state.then((value: TState) => {
                return this.solveValue(value);
            });
        } else {
            return this.solveValue(this.state);
        }
    }

    private solveValue(value: TState) {
        if (value instanceof ExpectationResult) {
            return value.solve().then((result) => {
                console.log('inner', result);
                this.state = result;

                this.recieved = value.recieved;
                this.expected = value.expected;
                this.expectAction = value.expectAction;
                this.isInversed = value.isInversed;

                return result;
            });
        } else if (typeof value === 'boolean') {
            this.state = value;
            return value;
        } else {
            throw new Error('State is resolved in unknown format');
        }
    }

    get stateStr() {
        return this.state === true ? 'OK' : 'FAILED';
    }

    get recievedFormatted() {
        if (this.recieved == undefined) return JSON.stringify(this.recieved);
        return this.formatValue(this.recieved);
    }

    get expectedFormatted() {
        return this.formatValue(this.expected);
    }

    formatValue(value: any) {
        if (value == undefined) return '';
        if (value instanceof Promise) {
            return '<Promise>';
        }
        return JSON.stringify(value);
    }

    get resultTxt() {
        if (this.state === true) {
            return this.stateStr;
        } else {
            const inv = this.isInversed ? 'not ' : '';
            return `${this.stateStr} - Expected ${this.recievedFormatted} ${inv}${this.expectAction} ${this.expectedFormatted}`;
        }
    }

    described(description: string) {
        this.description = description;
        return this;
    }

    inversed() {
        const res = new ExpectationResult(!this.state, this.recieved, this.expectAction, this.expected);
        res.isInversed = !res.isInversed;
        return res;
    }
}
