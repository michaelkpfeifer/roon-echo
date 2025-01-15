const Result = {
  Ok: (value) => ({ type: 'Ok', value }),
  Err: (error) => ({ type: 'Err', error }),

  isOk: (result) => result.type === 'Ok',
  isErr: (result) => result.type === 'Err',

  map: (result, fn) =>
    Result.isOk(result) ? Result.Ok(fn(result.value)) : result,

  mapErr: (result, fn) =>
    Result.isErr(result) ? Result.Err(fn(result.error)) : result,

  unwrap: (result) => {
    if (Result.isOk(result)) return result.value;
    throw new Error('Error: Called unwrap on an Err result.');
  },

  unwrapErr: (result) => {
    if (Result.isErr(result)) return result.error;
    throw new Error('Error: Called unwrapErr on an Ok result.');
  },
};

export default Result;
