import crypto from 'crypto';
import express from 'express';
import pgp from 'pg-promise';
import { validate } from './validateCpf';

const URI_DB = `postgres://${process.env.DB_APP_USERNAME}:${process.env.DB_APP_PASSWORD}@${process.env.DB_APP_HOST}:${process.env.DB_APP_PORT}/${process.env.DB_APP_NAME}`;

const app = express();
app.use(express.json());

app.post('/signup', async function (req, res) {
  let result;

  const connection = pgp()(URI_DB);
  try {
    const id = crypto.randomUUID();

    const [acc] = await connection.query(
      'select * from cccat16.account where email = $1',
      [req.body.email],
    );
    if (!acc) {
      if (req.body.name.match(/[a-zA-Z] [a-zA-Z]+/)) {
        if (req.body.email.match(/^(.+)@(.+)$/)) {
          if (validate(req.body.cpf)) {
            if (req.body.isDriver) {
              if (req.body.carPlate.match(/[A-Z]{3}[0-9]{4}/)) {
                await connection.query(
                  'insert into cccat16.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)',
                  [
                    id,
                    req.body.name,
                    req.body.email,
                    req.body.cpf,
                    req.body.carPlate,
                    !!req.body.isPassenger,
                    !!req.body.isDriver,
                  ],
                );

                const obj = {
                  accountId: id,
                };
                result = obj;
              } else {
                // invalid car plate
                result = -5;
              }
            } else {
              await connection.query(
                'insert into cccat16.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)',
                [
                  id,
                  req.body.name,
                  req.body.email,
                  req.body.cpf,
                  req.body.carPlate,
                  !!req.body.isPassenger,
                  !!req.body.isDriver,
                ],
              );

              const obj = {
                accountId: id,
              };
              result = obj;
            }
          } else {
            // invalid cpf
            result = -1;
          }
        } else {
          // invalid email
          result = -2;
        }
      } else {
        // invalid name
        result = -3;
      }
    } else {
      // already exists
      result = -4;
    }
    if (typeof result === 'number') {
      res.status(422).send(result + '');
    } else {
      res.json(result);
    }
  } finally {
    await connection.$pool.end();
  }
});

const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, () =>
  console.log(`
	Server is running on port http://localhost:${PORT}
	`),
);
