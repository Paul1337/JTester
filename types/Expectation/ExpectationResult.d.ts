export type TState = Promise<boolean | ExpectationResult> | boolean | ExpectationResult;
export default class ExpectationResult {
    state: TState;
    recieved: any;
    expected: any;
    expectAction: string;
    isInversed: boolean;
    description: string | null;
    constructor(state: TState, received: any, expectAction: string, expected?: any);
    solve(): Promise<boolean>;
    private solveValue;
    get stateStr(): "OK" | "FAILED";
    get recievedFormatted(): string;
    get expectedFormatted(): string;
    formatValue(value: any): string;
    get resultTxt(): string;
    described(description: string): this;
    inversed(): ExpectationResult;
}
