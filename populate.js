const fs = require("fs");
const emoji = require("github-emoji");
const jsdom = require("jsdom").JSDOM,
  options = {
    resources: "usable"
  };
const { getConfig, outDir } = require("./utils");
const { getRepos, getUser } = require("./api");

function convertToEmoji(text) {
  if (text == null) return;
  text = text.toString();
  var pattern = /(?<=:\s*).*?(?=\s*:)/gs;
  if (text.match(pattern) != null) {
    var str = text.match(pattern);
    str = str.filter(function(arr) {
      return /\S/.test(arr);
    });
    for (i = 0; i < str.length; i++) {
      if (emoji.URLS[str[i]] != undefined) {
        text = text.replace(
          `:${str[i]}:`,
          `<img src="${emoji.URLS[str[i]]}" class="emoji">`
        );
      }
    }
    return text;
  } else {
    return text;
  }
}

module.exports.updateHTML = (username, opts) => {
  const {
    includeFork,
    codepen,
    dev,
    dribbble,
    email,
    facebook,
    instagram,
    keybase,
    medium,
    reddit,
    stackexchange,
    steam,
    telegram,
    twitter,
    xda,
    youtube
  } = opts;
  //add data to assets/index.html
  jsdom
    .fromFile(`${__dirname}/assets/index.html`, options)
    .then(function(dom) {
      let window = dom.window,
        document = window.document;
      (async () => {
        try {
          console.log("Building HTML/CSS...");
          const repos = await getRepos(username, opts);

          for (var i = 0; i < repos.length; i++) {
            let element;
            if (repos[i].fork == false) {
              element = document.getElementById("work_section");
            } else if (includeFork == true) {
              document.getElementById("forks").style.display = "block";
              element = document.getElementById("forks_section");
            } else {
              continue;
            }
            element.innerHTML += `
                        <a href="${repos[i].html_url}" target="_blank">
                        <section>
                            <div class="section_title">${repos[i].name}</div>
                            <div class="about_section">
                            <span style="display:${
                              repos[i].description == undefined
                                ? "none"
                                : "block"
                            };">${convertToEmoji(repos[i].description)}</span>
                            </div>
                            <div class="bottom_section">
                                <span style="display:${
                                  repos[i].language == null
                                    ? "none"
                                    : "inline-block"
                                };"><span class="iconify" data-icon="mdi-code-tags"></span>&nbsp; ${
              repos[i].language
            }</span>
                                <span><span class="iconify" data-icon="mdi-star"></span>&nbsp; ${
                                  repos[i].stargazers_count
                                }</span>
                                <span><span class="iconify" data-icon="mdi-source-fork"></span>&nbsp; ${
                                  repos[i].forks_count
                                }</span>
                            </div>
                        </section>
                        </a>`;
          }
          const user = await getUser(username);
          document.title = user.login;
          var icon = document.createElement("link");
          icon.setAttribute("rel", "icon");
          icon.setAttribute("href", user.avatar_url);
          icon.setAttribute("type", "image/png");

          document.getElementsByTagName("head")[0].appendChild(icon);
          document.getElementById(
            "profile_img"
          ).style.background = `url('${user.avatar_url}') center center`;
          document.getElementsByTagName("head")[0].innerHTML += `
          <meta name="description" content="${user.bio}" />
          <meta property="og:image" content="${user.avatar_url}" />
          <meta property="og:type" content="profile" />
          <meta property="og:title" content="${user.login}" />
          <meta property="og:url" content="${user.html_url}" />
          <meta property="og:description" content="${user.bio}" />
          <meta property="profile:username" content="${user.login}" />
          <meta name="twitter:image:src" content="${user.avatar_url}" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="${user.login}" />
          <meta name="twitter:description" content="${user.bio}" />`;
          //Socials
          document.getElementById(
            "username"
          ).innerHTML = `<span id="text" style="display:${
            user.name == null || !user.name ? "none" : "block"
          };"></span><div class='console-underscore' id='console'>&#95;</div>`;
          document.getElementById("about").innerHTML = `
                <span style="display:${
                  user.company == null || !user.company ? "none" : "block"
                };"><span class="iconify" data-icon="mdi-face"></span> &nbsp; ${
            user.company
          }</span>
                <span style="display:block;"><a href="${
                  user.html_url
                }"><span class="iconify" data-icon="mdi-github-circle"></span>&nbsp;&nbsp;@${
            user.login
          }</a></span>
                <span style="display:${
                  email == null ? "none !important" : "block"
                };"><a href="mailto:${email}" target="_blank" class="socials"><span class="iconify" data-icon="mdi-email"></span>&nbsp;&nbsp;${email}</a></span>
                <span style="display:${
                  user.location == null || !user.location ? "none" : "block"
                };"><a href="https://www.google.com/maps/search/?api=1&query=${
            user.location
          }"><span class="iconify" data-icon="mdi-map-marker"></span>&nbsp;&nbsp;${
            user.location
          }</a></span>
                <span style="display:${
                  user.hireable == false || !user.hireable ? "none" : "block"
                };"><span class="iconify" data-icon="mdi-account-tie"></span> &nbsp;&nbsp; Available for hire</span>
                <div class="socials">
                <span style="display:${
                  codepen == null ? "none !important" : "block"
                };"><a href="https://codepen.io/${codepen}" target="_blank" class="socials"><span class="iconify" data-icon="simple-icons:codepen"></span></a></span>
                <span style="display:${
                  dev == null ? "none !important" : "block"
                };"><a href="https://dev.to/${dev}" target="_blank" class="socials"><span class="iconify" data-icon="mdi-dev-to"></span></a></span>
                <span style="display:${
                  dribbble == null ? "none !important" : "block"
                };"><a href="https://www.dribbble.com/${dribbble}" target="_blank" class="socials"><span class="iconify" data-icon="mdi-dribbble"></span></a></span>
                <span style="display:${
                  facebook == null ? "none !important" : "block"
                };"><a href="https://facebook.com/${facebook}" target="_blank" class="socials"><span class="iconify" data-icon="mdi-facebook-box"></span></a></span>
                <span style="display:${
                  instagram == null ? "none !important" : "block"
                };"><a href="https://www.instagram.com/${instagram}" target="_blank" class="socials"><span class="iconify" data-icon="mdi-instagram"></span></a></span>
                <span style="display:${
                  keybase == null ? "none !important" : "block"
                };"><a href="https://keybase.io/${keybase}" target="_blank" class="socials"><span class="iconify" data-icon="simple-icons:keybase"></span></a></span>
                <span style="display:${
                  medium == null ? "none !important" : "block"
                };"><a href="https://medium.com/@${medium}" target="_blank" class="socials"><span class="iconify" data-icon="fa-brands:medium-m"></span></a></span>
                <span style="display:${
                  reddit == null ? "none !important" : "block"
                };"><a href="https://www.reddit.com/u/${reddit}" target="_blank" class="socials"><span class="iconify" data-icon="fa:reddit-alien"></span></a></span>
                <span style="display:${
                  stackexchange == null ? "none !important" : "block"
                };"><a href="https://stackexchange.com/users/${stackexchange}" target="_blank" class="socials"><span class="iconify" data-icon="mdi:stack-exchange"></span></a></span>
                <span style="display:${
                  steam == null ? "none !important" : "block"
                };"><a href="https://steamcommunity.com/id/${steam}" target="_blank" class="socials"><span class="iconify" data-icon="mdi:steam"></span></a></span>
                <span style="display:${
                  telegram == null ? "none !important" : "block"
                };"><a href="https://t.me/${telegram}" target="_blank" class="socials"><span class="iconify" data-icon="mdi-telegram"></span></a></span>
                <span style="display:${
                  twitter == null ? "none !important" : "block"
                };"><a href="https://www.twitter.com/${twitter}" target="_blank" class="socials"><span class="iconify" data-icon="mdi-twitter"></span></a></span>
                <span style="display:${
                  xda == null ? "none !important" : "block"
                };"><a href="https://forum.xda-developers.com/member.php?u=${xda}" target="_blank" class="socials"><span class="iconify" data-icon="mdi-xda"></span></a></span>
                <span style="display:${
                  youtube == null ? "none !important" : "block"
                };"><a href="https://www.youtube.com/channel/${youtube}" target="_blank" class="socials"><span class="iconify" data-icon="mdi-youtube"></span></a></span>
                </div>
                `;
          //Script
          document.getElementById("script").innerHTML = `<script>
            const magicProjectsGrid = new MagicGrid({
              container: "#work_section",
              animate: false,
              gutter: 30, // default gutter size
              static: true,
              useMin: false,
              maxColumns: 2,
              useTransform: true
            });

            const magicForksGrid = new MagicGrid({
              container: "#forks_section",
              animate: false,
              gutter: 30, // default gutter size
              static: true,
              useMin: false,
              maxColumns: 2,
              useTransform: true
            });

            $("document").ready(() => {
              magicProjectsGrid.listen();
              magicForksGrid.listen();
            });

            // function([string1, string2],target id,[color1,color2])
            consoleText(["${user.name}", "${user.bio}"], "text", [
              "white",
              "white"
            ]);

            function consoleText(words, id, colors) {
              if (colors === undefined) colors = ["#fff"];
              var visible = true;
              var con = document.getElementById("console");
              var letterCount = 1;
              var x = 1;
              var waiting = false;
              var target = document.getElementById(id);
              target.setAttribute("style", "color:" + colors[0]);
              window.setInterval(function() {
                if (letterCount === 0 && waiting === false) {
                  waiting = true;
                  target.innerHTML = words[0].substring(0, letterCount);
                  window.setTimeout(function() {
                    var usedColor = colors.shift();
                    colors.push(usedColor);
                    var usedWord = words.shift();
                    words.push(usedWord);
                    x = 1;
                    target.setAttribute("style", "color:" + colors[0]);
                    letterCount += x;
                    waiting = false;
                  }, 1000);
                } else if (letterCount === words[0].length + 1 && waiting === false) {
                  waiting = true;
                  window.setTimeout(function() {
                    x = -1;
                    letterCount += x;
                    waiting = false;
                  }, 1000);
                } else if (waiting === false) {
                  target.innerHTML = words[0].substring(0, letterCount);
                  letterCount += x;
                }
              }, 120);
              window.setInterval(function() {
                if (visible === true) {
                  con.className = "console-underscore hidden";
                  visible = false;
                } else {
                  con.className = "console-underscore";

                  visible = true;
                }
              }, 400);
            }
          </script>`;
          //add data to config.json
          const data = await getConfig();
          data[0].username = user.login;
          data[0].name = user.name;
          data[0].userimg = user.avatar_url;

          await fs.writeFile(
            `${outDir}/config.json`,
            JSON.stringify(data, null, " "),
            function(err) {
              if (err) throw err;
              console.log("Config file updated.");
            }
          );
		  
          await fs.writeFile(
            `${outDir}/gamer.html`,
            `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="7; url='https://www.youtube.com/playlist?list=UUp0gATorETNZ6ttOTMeV7jA'" />
  </head>
  <body>
    <p>Please follow <a href="https://www.youtube.com/playlist?list=UUp0gATorETNZ6ttOTMeV7jA">this link</a>.</p>
  </body>
</html>`,
            function(error) {
              if (error) throw error;
              console.log("Wrote gamer.html");
            }
          );
		  
          await fs.writeFile(
            `${outDir}/keybase.txt`,
            `==================================================================
https://keybase.io/dilll
--------------------------------------------------------------------

I hereby claim:

  * I am an admin of https://dylanh.dev
  * I am dilll (https://keybase.io/dilll) on keybase.
  * I have a public key with fingerprint 9D2F 65D5 8FE7 5DED 1B8E  3B12 E58D 4317 E154 D022

To do so, I am signing this object:

{
  "body": {
    "key": {
      "eldest_kid": "0120390f95b82550aa978d217eeac984e667e5b39cf01f64dadcd4899090a19919780a",
      "fingerprint": "9d2f65d58fe75ded1b8e3b12e58d4317e154d022",
      "host": "keybase.io",
      "key_id": "e58d4317e154d022",
      "kid": "0101b1f37fc0a6e762d2f16c51c2cc86129d89630638017cb71f17f23a082b1820130a",
      "uid": "9432f8a7178f663cc1f70c77cbe51319",
      "username": "dilll"
    },
    "service": {
      "hostname": "dylanh.dev",
      "protocol": "https:"
    },
    "type": "web_service_binding",
    "version": 1
  },
  "ctime": 1556653778,
  "expire_in": 157680000,
  "prev": "6311ea796c2fdce63368d0422d2cd6fd5382355c793a82d8c50cac59ed6f147f",
  "seqno": 26,
  "tag": "signature"
}

which yields the signature:

-----BEGIN PGP MESSAGE-----
Version: Keybase OpenPGP v2.1.0
Comment: https://keybase.io/crypto

yMNxAnicbVJtUFRlFAZpS0AUauJjotQLihEf970f7713Z2oCtGITRpNVK2q5H++F
22676+6ygMCUjSPCxFqSDaPgqINAipKjw4BWG+Q0KCqfDkIwBoOiwAoj1DBE0V0m
/vX+OfOe8zzPec6Zcz3IzyfA90F5SthIRhfm29FakeuT2V7bU4gJFqkA0xZiRrQc
kElCdofBqEiYFsMBgZMcLnO0wBI0jfM8x7ASARiEeJFjKQQhg2iB5EQZBzKkJF4S
JYrlOJzDecBxQIXjPBaHyYo5G9msNsXsUGU5iZAhLdGsjBhaQhIQWEQKgEA0K1Gk
qg5oSsIJQiXmWOxehmpO4O0oQbGoOfVjWLb3P/gV3zgQgEwysojzEDGQUDsCKNJA
JESRhYDgJJaDJA5JFgeMKDBABoxMkDzOEgJgCRyQy75zl+U4iiRklmcAw8oQkqII
ZAYXGZWHaEACzgu0I5uZ/xSpaEkxmUxYcRymppyKiLxb9Y6xUi4w8eacBAk5VZrV
ZnFYRItJzec4HFa71stzFFi9wDwkGP6TMAiKWVJXqDKcyGZXLGZMC1Sk6FC8moCm
IaRJhmHjMJRvVWzIoHgRNANZXH3ePmo7LQZJABDPcFAkZElEkCQhK+EUoa5HlKAs
0SRLkDQtMhzJs4TEijQu8iLNIbUIKEbGvEPtM1swLQFVn3y2qmlXss28I9eGsOK2
1sxnfHwDfJ7VrPLelk+Af/DKxcHxdUtZ60cTy8I+GvAbWVNwMI9yRHy8uOmRoc2K
QpdSTsWk1/1eenx39EL96raLMzvwYHdaTs/8wzPRERvHX+0ypZ7YNFdOkUMD5rPj
o9/de9zx2/PG/ceOFR8Kjvk65OUrT+c2t/j3x1T1pg00zZPV+ANNyJDw1qz+WkYg
MPZf5ks0h3cc8CTWvH+k4AvLlSRqMcov0zV8acyjzD4patr+bnXClsNJoS80Hj0d
OxOyt7b8Ubv4yerPS92N+oCUssLMoSeBMc4+c0lo5OWUquRQrqHZHXFPhy8wkXtE
EGQbvqjv1FygqwbWoG/qg+/3Di7+IGnC83RX689sPbnubtbA3mt/uuZhVHL06+Q/
Ve6asZjm6Bc9+w52x16PG+zVVfU6dRp+MPL4H+vZ3dUHnvvQuHPL3/517+gGO9eW
xt9udr3nE7BQCdomw99ugNuoyl+J/TcnUk/0k41Jr3kmPuvKmtXnRuQU6q6eh3u2
vZQ/fGM67efNp2am6jzdjoyghkuj20/fPxm466nLuatlJL+nqOjQnYo7qypu596t
qfsxrc9Y/W3ThkrPdGJHi7vol4mptUnp02UftCaFT2rcM+c6Y/v0qXrrzvYvsRGb
K8/zV2vD0e/HiKGH3c1zG155I95zpCK+5M3Kc1FNG13O2NopA7t4czI5+6v0YPns
LeW8cuPxraW6n9wwLO/Cv16Pxg0=
=wUqU
-----END PGP MESSAGE-----

And finally, I am proving ownership of this host by posting or
appending to this document.

View my publicly-auditable identity here: https://keybase.io/dilll

==================================================================`,
            function(error) {
              if (error) throw error;
              console.log(`wrote keybase.txt`);
            }
          );
		  
          await fs.writeFile(
            `${outDir}/index.html`,
            "<!DOCTYPE html>" + window.document.documentElement.outerHTML,
            function(error) {
              if (error) throw error;
              console.log(`Build Complete, Files can be Found @ ${outDir}\n`);
            }
          );
        } catch (error) {
          console.log(error);
        }
      })();
    })
    .catch(function(error) {
      console.log(error);
    });
};
