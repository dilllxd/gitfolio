const { getConfig } = require("./utils");
const { updateHTML } = require("./populate");

async function updateCommand() {
  const data = await getConfig();
  const { username } = data[0];
  if (username === null) {
    console.log(
      "username not found in config.json, please run build command before using update"
    );
    return;
  }

  const opts = {
    sort: data[0].sort,
    order: data[0].order,
    includeFork: data[0].includeFork,
    types: data[0].types,
    codepen: data[0].codepen,
    dev: data[0].dev,
    dribbble: data[0].dribbble,
    email: data[0].email,
    facebook: data[0].facebook,
    instagram: data[0].instagram,
    keybase: data[0].keybase,
    medium: data[0].medium,
    reddit: data[0].reddit,
    stackexchange: data[0].stackexchange,
    steam: data[0].steam,
    telegram: data[0].telegram,
    twitter: data[0].twitter,
    xda: data[0].xda,
    youtube: data[0].youtube
  };
  updateHTML(username, opts);
}

module.exports = {
  updateCommand
};
