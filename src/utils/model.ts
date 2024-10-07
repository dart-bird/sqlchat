const gpt35turbo = {
  name: "gpt-3.5-turbo",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 4000,
  cost_per_call: 1,
};

const gpt4 = {
  name: "gpt-4",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 8000,
  cost_per_call: 60,
};

const gpt4turbo = {
  name: "gpt-4-turbo",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 4000,
  cost_per_call: 20,
};

const gpt4ho = {
  name: "gpt-4o",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 4000,
  cost_per_call: 10,
};

const gpt4homini = {
  name: "gpt-4o-mini",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 4000,
  cost_per_call: 1,
};

const qwen2_5_32b = {
  name: "qwen2.5:32b",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 10000,
  cost_per_call: 1,
};

const qwen2_5_coder_7b = {
  name: "sammcj/qwen2.5-coder-7b-instruct:q8_0",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 10000,
  cost_per_call: 1,
};

export const models = [gpt35turbo, gpt4, gpt4turbo, gpt4ho, gpt4homini, qwen2_5_32b, qwen2_5_coder_7b];

export const getModel = (name: string) => {
  for (const model of models) {
    if (model.name === name) {
      return model;
    }
  }
  return gpt35turbo;
};
