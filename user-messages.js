const { readdirSync, readFileSync } = require("fs");

const args = process.argv.slice(2);

const folder = args[0];
const userId = args[1];

if (!folder || !userId) {
  console.log("Usage: node ./user-messages.js log_folder_path userId");
  console.log("Example: node ./user-messages.js ./../slack-export/ U01S2A5PAHH");
  process.exit();
}

const users = JSON.parse(readFileSync(`${folder}/users.json`.replace("//", "/"), "utf8")).reduce(
  (acc, user) => ({ ...acc, [user.id]: user }),
  {}
);

const dms = JSON.parse(readFileSync(`${folder}/dms.json`.replace("//", "/"), "utf8")).reduce(
  (acc, dm) => ({ ...acc, [dm.id]: dm }),
  {}
);

const directories = readdirSync(folder.replace("//", "/"), { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const processText = text =>
  text
    .split(" ")
    .map(word =>
      word[0] == "<" && word[1] == "@" && word[word.length - 1] == ">"
        ? users[word.replace("<", "").replace("@", "").replace(">", "")].real_name
        : word
    )
    .join(" ");

const findUserInDiscussion = messages =>
  messages.reduce((acc, message) => {
    if (acc === true) return true;
    if (message.user == userId) return true;
    return false;
  }, false);

let messages = {};

directories.forEach(subdirectory => {
  readdirSync(`${folder.replace("//", "/")}${subdirectory}`, { withFileTypes: true }).forEach(file => {
    const messagesToScan = JSON.parse(readFileSync(`${folder.replace("//", "/")}${subdirectory}/${file.name}`));
    const isDiscussion = subdirectory in dms ? true : false;
    const isParticipant = isDiscussion && findUserInDiscussion(messagesToScan);
    messagesToScan.forEach(message => {
      if (!message.user) return;
      if (message.user === "USLACKBOT") return;
      if (isParticipant === false && message.user != userId) return;

      let heading = `Channel: ${subdirectory}`;
      if (subdirectory in dms) {
        heading = `Discussion: ${dms[subdirectory].members.map(memberId => users[memberId].real_name).join(", ")}`;
      }
      messages[message.ts] = {
        heading: heading,
        date: new Date(parseFloat(message.ts) * 1000),
        text: processText(message.text),
        user: users[message.user].real_name
      };
    });
  });
});

Object.keys(messages)
  .sort()
  .forEach(key => {
    console.log(messages[key]["heading"]);
    console.log(
      `${messages[key]["date"].toLocaleDateString("en-US")} ${messages[key]["date"].toLocaleTimeString("en-US")}`
    );
    console.log(`${messages[key]["user"]}: ${messages[key]["text"]}`);
    console.log("\n");
  });
