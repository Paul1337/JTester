import Expectation from '../Expectation/Expectation';
export default class MicroTest {
    value: Expectation<any>;
    meta: Record<string, any>;
    constructor(value: Expectation<any>, meta?: {});
}
