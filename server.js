require("dotenv").config();
const port = process.env.PORT || 3000;

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
// this "FileSystem" is used to read and write from the json file (mimicking a fake database)
const fs = require("fs");

const app = express();

app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const readFromDatabase = () => {
  // read the json file
  const mailingListsJsonData = fs.readFileSync("mailing-lists.json");
  // parse the json file to javascript
  const mailingListsParsedData = JSON.parse(mailingListsJsonData);
  return mailingListsParsedData;
};

const writeToDatabase = (data) => {
  // overwrite the JSON file with the updated version of the data
  fs.writeFileSync("mailing-lists.json", JSON.stringify(data));
};

app.get("/", (req, res) => {
  const mailingList = readFromDatabase();

  // return the parsed data with a status of 200
  return res.status(200).send(mailingList);
});

app.get("/lists", (req, res) => {
  const mailingList = readFromDatabase();

  // filter all objects that have a "name" property
  const filteredMailingLists = mailingList.filter((element) => element.name);

  // if the result is empty, return an empty array
  if (!filteredMailingLists.length) {
    return res.status(200).send([]);
  }

  // create a new array of just the mailing list "name" properties
  const mailingListNames = filteredMailingLists.map((element) => element.name);

  // return that new array with a status of 200
  return res.status(200).send(mailingListNames);
});

app.get("/lists/:name", (req, res) => {
  // get the "name" parameter from the url
  const nameParameter = req.params.name;

  const mailingList = readFromDatabase();

  // find the object in the array of mailing lists that matches that "name"
  const specificName = mailingList.find(
    (element) => element.name === nameParameter
  );

  // if there is no object in the array of mailing lists that matches that "name" then return an error message with a status of 404
  if (!specificName) {
    return res
      .status(404)
      .send(`A Mailing List named "${nameParameter}" was not found`);
  }

  // return that specific mailing list with a status of 200
  return res.status(200).send(specificName);
});

app.get("/lists/:name/members", (req, res) => {
  // get the "name" parameter from the url
  const nameParameter = req.params.name;

  const mailingList = readFromDatabase();

  // find the object in the array of mailing lists that matches that "name"
  const specificName = mailingList.find(
    (element) => element.name === nameParameter
  );

  // if there is no object in the array of mailing lists that matches that "name" then return an error message with a status of 404
  if (!specificName) {
    return res
      .status(404)
      .send(`A Mailing List named "${nameParameter}" was not found`);
  }

  // return that specific mailing list members with a status of 200
  return res.status(200).send(specificName.members);
});

app.delete("/lists/:name", (req, res) => {
  // get the "name" parameter from the url
  const nameParameter = req.params.name;

  const mailingList = readFromDatabase();

  // find the index of the object whose "name" matches the "nameParameter"
  const indexOfSpecificName = mailingList.findIndex(
    (element) => element.name === nameParameter
  );

  // if that object does not exist return an error message with a status of 404
  if (indexOfSpecificName === -1) {
    return res
      .status(404)
      .send(`A Mailing List named "${nameParameter}" does not exist to delete`);
  }

  // remove that specific object from the array
  mailingList.splice(indexOfSpecificName, 1);

  writeToDatabase(mailingList);

  // return a success message with a status of 200
  return res
    .status(200)
    .send(`A Mailing List named "${nameParameter}" was successfully deleted`);
});

app.delete("/lists/:name/members/:email", (req, res) => {
  const nameParameter = req.params.name;
  const emailParameter = req.params.email;

  const mailingList = readFromDatabase();

  // find the index of the object whose "name" matches the "nameParameter"
  const indexOfSpecificName = mailingList.findIndex(
    (element) => element.name === nameParameter
  );

  // if the specific name does not exist in the "members" array
  // return an error message with a status of 404
  if (indexOfSpecificName === -1) {
    return res
      .status(404)
      .send(`There is no Mailing List named "${nameParameter}"`);
  }

  // if the specific name exists but the email does not exist in the "members" array
  // return an error message with a status of 404
  if (
    indexOfSpecificName > -1 &&
    !mailingList[indexOfSpecificName].members.includes(emailParameter)
  ) {
    return res
      .status(404)
      .send(
        `There is no email "${emailParameter}" in the Mailing List named "${nameParameter}" to delete.`
      );
  }

  // find the index of the email in the "members" array
  const indexOfSpecificEmail = mailingList[
    indexOfSpecificName
  ].members.findIndex((element) => element === emailParameter);

  // remove the email from the "members" array
  mailingList[indexOfSpecificName].members.splice(indexOfSpecificEmail, 1);

  writeToDatabase(mailingList);

  // return a success message with a status of 200
  return res
    .status(200)
    .send(
      `The email ${emailParameter} from the Mailing List named "${nameParameter}" was successfully deleted`
    );
});

app.put("/lists/:name", (req, res) => {
  // get the "name" parameter from the url
  const nameParameter = req.params.name;

  const mailingList = readFromDatabase();

  // get (and destructure) the name and members properties from the request body
  const { name: nameFromBody, members: membersFromBody } = req.body;

  // if the nameParameter does not match the "name" property on the request body
  // return an Error Message with a status of 404
  if (nameParameter !== nameFromBody) {
    return res
      .status(404)
      .send(
        `The URL parameter "name": "${nameParameter}" does not match the PUT body "name": "${nameFromBody}"`
      );
  }

  // find the index of the object whose "name" matches the "nameParameter"
  const indexOfSpecificName = mailingList.findIndex(
    (element) => element.name === nameParameter
  );

  // if the object was not found in the existing array
  if (indexOfSpecificName === -1) {
    // push a new object with the "name" and "members" property into the existing array
    mailingList.push({
      name: nameFromBody,
      members: membersFromBody,
    });

    writeToDatabase(mailingList);

    // return the updated array with a status of 200
    return res.status(200).send(mailingList);
  }

  // if the object was found in the existing array
  if (indexOfSpecificName > -1) {
    // create an array of new members (ones that do not already exist in the members array)
    const newMemberEntries = membersFromBody.filter(
      (element) => !mailingList[indexOfSpecificName].members.includes(element)
    );

    // spread and then push those new members into the existing members array
    mailingList[indexOfSpecificName].members.push(...newMemberEntries);

    writeToDatabase(mailingList);

    // return the updated array with a status of 200
    return res.status(201).send(mailingList);
  }
});

app.put("/lists/:name/members/:email", (req, res) => {
  const nameParameter = req.params.name;
  const emailParameter = req.params.email;

  const mailingList = readFromDatabase();

  // find the index of the object whose "name" matches the "nameParameter"
  const indexOfSpecificName = mailingList.findIndex(
    (element) => element.name === nameParameter
  );

  // if the object was not found in the existing array
  if (indexOfSpecificName === -1) {
    return res
      .status(404)
      .send(`A Mailing List named "${nameParameter}" does not exist`);
  }

  // find the index of the members array element that matches the "emailParameter"
  const indexOfSpecificEmail = mailingList[
    indexOfSpecificName
  ].members.findIndex((element) => element === emailParameter);

  // if the object exists but already includes that email address
  // return an error message with a status of 404
  if (indexOfSpecificName > -1 && indexOfSpecificEmail > -1) {
    return res
      .status(404)
      .send(
        `The email "${emailParameter}" already exists in the members of the Mailing List "${nameParameter}"`
      );
  }

  // push push the new email address into the existing members array
  mailingList[indexOfSpecificName].members.push(emailParameter);

  writeToDatabase(mailingList);

  // return the updated array with a status of 200
  return res.status(201).send(mailingListsParsedData);
});

app.listen(port, () => {
  console.log(`Server listening on Port ${port}`);
});
