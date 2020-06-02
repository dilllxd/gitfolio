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
