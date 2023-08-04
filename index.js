const Expectation = require('./src/Expectation/Expectation.js');
const testModule = require('./src/Test.js');

const expect = (value) => new Expectation(value);

module.exports = {
    expect,
    ...testModule,
};

console.log('testing..');

const a = {
    b: 2,
    b12: {
        some: 'some',
    },
};

const a_ = {
    b: '2',
};

testModule.test('some', [
    expect(a).toEqual(a_),
    expect(a).toEqualStrict(a_),
    expect(a).toBeDefined(),
    expect(a).toBeNull(),
    expect(a).toBeUndefined(),
    expect(123).toBeNaN(),
    expect(a).toHaveProperty('b12.some'),
]);

testModule.afterAll(testModule.printResult);
