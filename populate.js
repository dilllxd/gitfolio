const fs = require("fs");
const emoji = require("github-emoji");
const jsdom = require("jsdom").JSDOM,
  options = {
    resources: "usable"
  };
const
{
  getConfig,
  outDir
} = require("./utils");
const
{
  getRepos,
  getUser
} = require("./api");

function convertToEmoji(text)
{
  if (text == null) return;
  text = text.toString();
  var pattern = /(?<=:\s*).*?(?=\s*:)/gs;
  if (text.match(pattern) != null)
  {
    var str = text.match(pattern);
    str = str.filter(function(arr)
    {
      return /\S/.test(arr);
    });
    for (i = 0; i < str.length; i++)
    {
      if (emoji.URLS[str[i]] != undefined)
      {
        text = text.replace(
          `:${str[i]}:`,
          `<img src="${emoji.URLS[str[i]]}" class="emoji">`
        );
      }
    }
    return text;
  }
  else
  {
    return text;
  }
}

module.exports.updateHTML = (username, opts) =>
{
  const
  {
    includeFork,
    codepen,
    dev,
    dribbble,
    email,
    instagram,
    twitter
  } = opts;
  //add data to assets/index.html
  jsdom
    .fromFile(`${__dirname}/assets/index.html`, options)
    .then(function(dom)
    {
      let window = dom.window,
        document = window.document;
      (async () =>
      {
        try
        {
          console.log("Building HTML/CSS...");
          const repos = await getRepos(username, opts);

          for (var i = 0; i < repos.length; i++)
          {
            let element;
            if (repos[i].fork == false)
            {
              element = document.getElementById("work_section");
            }
            else if (includeFork == true)
            {
              document.getElementById("forks").style.display = "block";
              element = document.getElementById("forks_section");
            }
            else
            {
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
                                };"><i class="mdi mdi-code-tags"></i>&nbsp; ${
              repos[i].language
            }</span>
                                <span><i class="mdi mdi-star"></i>&nbsp; ${
                                  repos[i].stargazers_count
                                }</span>
                                <span><i class="mdi mdi-source-branch"></i>&nbsp; ${
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
          document.getElementById(
            "profile_img"
          ).style.background = `url('${user.avatar_url}') center center`;
          document.getElementById(
            "username"
          ).innerHTML = `<span style="display:${
            user.name == null || !user.name ? "none" : "block"
          };">${user.name}</span><a href="${user.html_url}">@${user.login}</a>`;
          //document.getElementById("github_link").href = `https://github.com/${user.login}`;
          document.getElementById("userbio").innerHTML = convertToEmoji(
            user.bio
          );
          document.getElementById("userbio").style.display =
            user.bio == null || !user.bio ? "none" : "block";
          document.getElementById("about").innerHTML = `
                <span style="display:${
                  user.company == null || !user.company ? "none" : "block"
                };"><i class="mdi-face"></i> &nbsp; ${user.company}</span>
                <span style="display:${
                  user.email == null || !user.email ? "none" : "block"
                };"><i class="mdi mdi-email"></i> &nbsp; ${user.email}</span>
                <span style="display:${
                  user.location == null || !user.location ? "none" : "block"
                };"><i class="mdi mdi-map-marker"></i> &nbsp;&nbsp; ${
            user.location
          }</span>
                <span style="display:${
                  user.hireable == false || !user.hireable ? "none" : "block"
                };"><i class="mdi mdi-account-tie"></i> &nbsp;&nbsp; Available for hire</span>
                <div class="socials">
                <span style="display:${
                  codepen == null ? "none !important" : "block"
                };"><a href="https://codepen.io/${codepen}" target="_blank" class="socials"><i class="mdi mdi-codepen"></i></a></span>
                <span style="display:${
                  dev == null ? "none !important" : "block"
                };"><a href="https://dev.to/${dev}" target="_blank" class="socials"><i class="mdi mdi-dev-to"></i></a></span>
                <span style="display:${
                  dribbble == null ? "none !important" : "block"
                };"><a href="https://www.dribbble.com/${dribbble}" target="_blank" class="socials"><i class="mdi mdi-dribbble"></i></a></span>
                <span style="display:${
                email == null ? "none !important" : "block"
                };"><a href="mailto:${email}" target="_blank" class="socials"><i class="mdi mdi-email"></i></a></span>
                <span style="display:${
                  instagram == null ? "none !important" : "block"
                };"><a href="https://www.instagram.com/${instagram}" target="_blank" class="socials"><i class="mdi mdi-instagram"></i></a></span>
                <span style="display:${
                  twitter == null ? "none !important" : "block"
                };"><a href="https://www.twitter.com/${twitter}" target="_blank" class="socials"><i class="mdi mdi-twitter"></i></a></span>
                </div>
                `;
          //add data to config.json
          const data = await getConfig();
          data[0].username = user.login;
          data[0].name = user.name;
          data[0].userimg = user.avatar_url;

          await fs.writeFile(
            `${outDir}/config.json`,
            JSON.stringify(data, null, " "),
            function(err)
            {
              if (err) throw err;
              console.log("Config file updated.");
            }
          );
          await fs.writeFile(
            `${outDir}/index.html`,
            "<!DOCTYPE html>" + window.document.documentElement.outerHTML,
            function(error)
            {
              if (error) throw error;
              console.log(`Build Complete, Files can be Found @ ${outDir}\n`);
            }
          );
        }
        catch (error)
        {
          console.log(error);
        }
      })();
    })
    .catch(function(error)
    {
      console.log(error);
    });
};