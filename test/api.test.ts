import axios from 'axios';

axios.defaults.validateStatus = function () {
  return true;
};

const urlSignup = 'http://localhost:3000/signup';

test('Deve criar uma conta para o passageiro', async function () {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '87748248800',
    isPassenger: true,
  };
  const output = await axios.post(urlSignup, input);
  expect(output.status).toBe(200);
  expect(output.data).toHaveProperty('accountId');
});

test.each([
  {
    key: 'cpf',
    value: '87748248801',
    result: -1,
  },
  {
    key: 'email',
    value: 'john.doe',
    result: -2,
  },
  {
    key: 'name',
    value: 'John',
    result: -3,
  },
])(
  'Não deve criar uma conta para o passageiro, se o $key for inválido',
  async function ({ key, value, result }) {
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '87748248800',
      isPassenger: true,
    };
    const output = await axios.post(urlSignup, {
      ...input,
      [key]: value,
    });
    expect(output.status).toBe(422);
    expect(output.data).toEqual(result);
  },
);

test('Não deve criar uma conta para o passageiro, se o $key for inválido', async function () {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '87748248800',
    isPassenger: true,
  };
  await axios.post(urlSignup, input);

  const output = await axios.post(urlSignup, input);
  expect(output.status).toBe(422);
  expect(output.data).toEqual(-4);
});
